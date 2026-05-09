/**
 * One-off: set password + course-staff role for an existing user (or create user + team).
 *
 * Usage (PowerShell):
 *   $env:STAFF_EMAIL="you@example.com"; $env:STAFF_PASSWORD="..."; npx tsx scripts/ensure-staff-user.ts
 *
 * Optional: STAFF_ROLE=owner|admin|editor (default owner)
 */
import '../lib/env/register-dotenv';
import { eq } from 'drizzle-orm';
import { hashPassword } from '../lib/auth/session';
import { db, client } from '../lib/db/drizzle';
import {
  users,
  teams,
  teamMembers,
  type NewUser,
  type NewTeam,
  type NewTeamMember,
} from '../lib/db/schema';

const email = process.env.STAFF_EMAIL?.trim().toLowerCase();
const password = process.env.STAFF_PASSWORD ?? '';
const roleEnv = process.env.STAFF_ROLE?.trim().toLowerCase();
const staffRole =
  roleEnv === 'admin' || roleEnv === 'editor' ? roleEnv : 'owner';

async function main() {
  if (!email) {
    console.error('Set STAFF_EMAIL.');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('STAFF_PASSWORD must be at least 8 characters.');
    process.exit(1);
  }

  const rawUrl = process.env.POSTGRES_URL?.trim();
  if (!rawUrl || rawUrl.includes('placeholder')) {
    console.error(
      'POSTGRES_URL must point at your database (local or hosted). Check .env.'
    );
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    await db
      .update(users)
      .set({
        passwordHash,
        role: staffRole,
        deletedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, existing.id));

    console.log(`Updated user ${email}: role=${staffRole}, password rotated.`);
    return;
  }

  const newUser: NewUser = {
    email,
    passwordHash,
    role: staffRole,
  };

  const [createdUser] = await db.insert(users).values(newUser).returning();
  if (!createdUser) {
    console.error('Insert user failed.');
    process.exit(1);
  }

  const newTeam: NewTeam = { name: `${email}'s Team` };
  const [createdTeam] = await db.insert(teams).values(newTeam).returning();
  if (!createdTeam) {
    console.error('Insert team failed.');
    process.exit(1);
  }

  const member: NewTeamMember = {
    userId: createdUser.id,
    teamId: createdTeam.id,
    role: 'owner',
  };
  await db.insert(teamMembers).values(member);

  console.log(
    `Created user ${email} with role=${staffRole}, team id=${createdTeam.id}.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await client.end({ timeout: 5 }).catch(() => {});
  });

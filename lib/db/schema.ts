import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  uniqueIndex,
  uuid,
  jsonb,
  index,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import type { KnowledgeQuizData } from '@/lib/courses/knowledge-quiz';

export const courseLifecycleStatuses = [
  'draft',
  'review',
  'scheduled',
  'published',
  'archived',
] as const;
export type CourseLifecycleStatus = (typeof courseLifecycleStatuses)[number];

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  /** member | owner | admin | editor — staff roles may access /admin CMS */
  role: varchar('role', { length: 30 }).notNull().default('member'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripeProductId: text('stripe_product_id'),
  planName: varchar('plan_name', { length: 50 }),
  subscriptionStatus: varchar('subscription_status', { length: 20 }),
});

export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  role: varchar('role', { length: 50 }).notNull(),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
});

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  invitedBy: integer('invited_by')
    .notNull()
    .references(() => users.id),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
});

export const courses = pgTable(
  'courses',
  {
    id: serial('id').primaryKey(),
    publicId: uuid('public_id').defaultRandom().notNull(),
    slug: varchar('slug', { length: 120 }).notNull().unique(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    lifecycleStatus: varchar('lifecycle_status', { length: 20 })
      .notNull()
      .default('draft'),
    previewModuleCount: integer('preview_module_count'),
    previewLessonCount: integer('preview_lesson_count'),
    previewEstMinutes: integer('preview_est_minutes'),
    heroImagePath: varchar('hero_image_path', { length: 512 }),
    primaryLocale: varchar('primary_locale', { length: 10 })
      .notNull()
      .default('en'),
    accessMode: varchar('access_mode', { length: 30 })
      .notNull()
      .default('subscription'),
    stripePriceId: text('stripe_price_id'),
    deletedAt: timestamp('deleted_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    coursesPublicIdUidx: uniqueIndex('courses_public_id_uidx').on(
      table.publicId
    ),
  })
);

export const courseModules = pgTable(
  'course_modules',
  {
    id: serial('id').primaryKey(),
    publicId: uuid('public_id').defaultRandom().notNull(),
    courseId: integer('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    slug: varchar('slug', { length: 120 }).notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    titleEs: varchar('title_es', { length: 255 }).notNull(),
    titleEn: varchar('title_en', { length: 255 }).notNull(),
    descriptionEs: text('description_es'),
    descriptionEn: text('description_en'),
    legacyFolder: varchar('legacy_folder', { length: 120 }),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => ({
    courseModuleSlugUnique: uniqueIndex('course_modules_course_slug_uidx').on(
      table.courseId,
      table.slug
    ),
    courseModulesPublicIdUidx: uniqueIndex(
      'course_modules_public_id_uidx'
    ).on(table.publicId),
  })
);

export type LessonContentBlock = Record<string, unknown>;
export type LessonContentBlocks = LessonContentBlock[];

export const lessons = pgTable(
  'lessons',
  {
    id: serial('id').primaryKey(),
    publicId: uuid('public_id').defaultRandom().notNull(),
    moduleId: integer('module_id')
      .notNull()
      .references(() => courseModules.id, { onDelete: 'cascade' }),
    lessonKey: varchar('lesson_key', { length: 120 }).notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    titleEs: varchar('title_es', { length: 255 }).notNull(),
    titleEn: varchar('title_en', { length: 255 }).notNull(),
    /** Relative to /legacy/course/ when using iframe fallback */
    legacyHtmlPath: varchar('legacy_html_path', { length: 512 }),
    draftBodyMarkdown: text('draft_body_markdown'),
    publishedBodyMarkdown: text('published_body_markdown'),
    draftBodyBlocks: jsonb('draft_body_blocks').$type<LessonContentBlocks>(),
    publishedBodyBlocks: jsonb('published_body_blocks').$type<LessonContentBlocks>(),
    lessonPublishedAt: timestamp('lesson_published_at'),
    summaryEn: text('summary_en'),
    summaryEs: text('summary_es'),
    reflectionPromptEn: text('reflection_prompt_en'),
    reflectionPromptEs: text('reflection_prompt_es'),
    actionStepsEn: text('action_steps_en'),
    actionStepsEs: text('action_steps_es'),
    /** Multiple-choice "Check your understanding" (legacy + studio). */
    knowledgeQuizJson: jsonb('knowledge_quiz_json').$type<KnowledgeQuizData | null>(),
    estimatedMinutes: integer('estimated_minutes'),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => ({
    moduleLessonOrderIdx: uniqueIndex('lessons_module_sort_uidx').on(
      table.moduleId,
      table.sortOrder
    ),
    moduleLessonKeyUnique: uniqueIndex('lessons_module_lesson_key_uidx').on(
      table.moduleId,
      table.lessonKey
    ),
    lessonsPublicIdUidx: uniqueIndex('lessons_public_id_uidx').on(
      table.publicId
    ),
  })
);

export const MEDIA_ASSET_KINDS = [
  'image',
  'pdf',
  'video',
  'audio',
  'attachment',
] as const;
export type MediaAssetKind = (typeof MEDIA_ASSET_KINDS)[number];

export const MEDIA_ASSET_SOURCES = ['upload', 'ai'] as const;
export type MediaAssetSource = (typeof MEDIA_ASSET_SOURCES)[number];

/** Canonical uploaded/generated file; placements live in course_assets / lesson_assets */
export const mediaAssets = pgTable(
  'media_assets',
  {
    id: serial('id').primaryKey(),
    publicId: uuid('public_id').defaultRandom().notNull(),
    storageBucket: varchar('storage_bucket', { length: 120 }).notNull(),
    storageKey: text('storage_key').notNull(),
    publicUrl: text('public_url').notNull(),
    mimeType: varchar('mime_type', { length: 255 }).notNull(),
    byteSize: integer('byte_size').notNull(),
    kind: varchar('kind', { length: 30 }).notNull(),
    originalFilename: varchar('original_filename', { length: 512 }),
    metadata: jsonb('metadata')
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    source: varchar('source', { length: 30 }).notNull().default('upload'),
    uploadedByUserId: integer('uploaded_by_user_id').references(
      () => users.id,
      { onDelete: 'set null' }
    ),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => ({
    mediaAssetsPublicIdUidx: uniqueIndex('media_assets_public_id_uidx').on(
      table.publicId
    ),
    mediaAssetsBucketKeyUidx: uniqueIndex('media_assets_bucket_key_uidx').on(
      table.storageBucket,
      table.storageKey
    ),
    mediaAssetsUploadedByIdx: index('media_assets_uploaded_by_idx').on(
      table.uploadedByUserId
    ),
  })
);

export const courseAssets = pgTable(
  'course_assets',
  {
    id: serial('id').primaryKey(),
    publicId: uuid('public_id').defaultRandom().notNull(),
    courseId: integer('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    kind: varchar('kind', { length: 30 }).notNull(),
    locale: varchar('locale', { length: 10 }),
    storageKey: text('storage_key').notNull(),
    publicUrl: text('public_url').notNull(),
    mimeType: varchar('mime_type', { length: 255 }),
    byteSize: integer('byte_size'),
    sortOrder: integer('sort_order').notNull().default(0),
    deletedAt: timestamp('deleted_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    mediaAssetId: integer('media_asset_id').references(() => mediaAssets.id, {
      onDelete: 'restrict',
    }),
    uploadedByUserId: integer('uploaded_by_user_id').references(
      () => users.id,
      { onDelete: 'set null' }
    ),
    metadata: jsonb('metadata')
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    courseAssetsPublicIdUidx: uniqueIndex('course_assets_public_id_uidx').on(
      table.publicId
    ),
    courseAssetsMediaAssetIdIdx: index('course_assets_media_asset_id_idx').on(
      table.mediaAssetId
    ),
  })
);

export const lessonAssets = pgTable(
  'lesson_assets',
  {
    id: serial('id').primaryKey(),
    publicId: uuid('public_id').defaultRandom().notNull(),
    lessonId: integer('lesson_id')
      .notNull()
      .references(() => lessons.id, { onDelete: 'cascade' }),
    kind: varchar('kind', { length: 30 }).notNull(),
    locale: varchar('locale', { length: 10 }),
    /** Present for uploads; null when embed_url is used */
    storageKey: text('storage_key'),
    publicUrl: text('public_url'),
    /** YouTube/Vimeo/etc. watch URL for kind embed */
    embedUrl: text('embed_url'),
    mimeType: varchar('mime_type', { length: 255 }),
    byteSize: integer('byte_size'),
    sortOrder: integer('sort_order').notNull().default(0),
    deletedAt: timestamp('deleted_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    mediaAssetId: integer('media_asset_id').references(() => mediaAssets.id, {
      onDelete: 'restrict',
    }),
    uploadedByUserId: integer('uploaded_by_user_id').references(
      () => users.id,
      { onDelete: 'set null' }
    ),
    metadata: jsonb('metadata')
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    lessonAssetsPublicIdUidx: uniqueIndex('lesson_assets_public_id_uidx').on(
      table.publicId
    ),
    lessonAssetsMediaAssetIdIdx: index('lesson_assets_media_asset_id_idx').on(
      table.mediaAssetId
    ),
  })
);

export const lessonProgress = pgTable(
  'lesson_progress',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    lessonId: integer('lesson_id')
      .notNull()
      .references(() => lessons.id, { onDelete: 'cascade' }),
    completedAt: timestamp('completed_at'),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    userLessonUnique: uniqueIndex('lesson_progress_user_lesson_uidx').on(
      table.userId,
      table.lessonId
    ),
  })
);

/** Append-only lesson snapshots for studio history / restore (draft + metadata only in snapshot JSON). */
export const lessonVersions = pgTable(
  'lesson_versions',
  {
    id: serial('id').primaryKey(),
    lessonId: integer('lesson_id')
      .notNull()
      .references(() => lessons.id, { onDelete: 'cascade' }),
    snapshot: jsonb('snapshot').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    createdByUserId: integer('created_by_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    versionNote: varchar('version_note', { length: 500 }),
    restoreSourceVersionId: integer('restore_source_version_id').references(
      (): AnyPgColumn => lessonVersions.id,
      { onDelete: 'set null' }
    ),
  },
  (table) => ({
    lessonVersionsLessonIdIdx: index('lesson_versions_lesson_id_idx').on(
      table.lessonId
    ),
    lessonVersionsLessonCreatedIdx: index(
      'lesson_versions_lesson_created_idx'
    ).on(table.lessonId, table.createdAt),
  })
);

/** Append-only course settings snapshots. */
export const courseVersions = pgTable(
  'course_versions',
  {
    id: serial('id').primaryKey(),
    courseId: integer('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    snapshot: jsonb('snapshot').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    createdByUserId: integer('created_by_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    versionNote: varchar('version_note', { length: 500 }),
    restoreSourceVersionId: integer('restore_source_version_id').references(
      (): AnyPgColumn => courseVersions.id,
      { onDelete: 'set null' }
    ),
  },
  (table) => ({
    courseVersionsCourseIdIdx: index('course_versions_course_id_idx').on(
      table.courseId
    ),
    courseVersionsCourseCreatedIdx: index(
      'course_versions_course_created_idx'
    ).on(table.courseId, table.createdAt),
  })
);

export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
}));

export const usersRelations = relations(users, ({ many }) => ({
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations),
  lessonProgress: many(lessonProgress),
  uploadedMediaAssets: many(mediaAssets),
}));

export const coursesRelations = relations(courses, ({ many }) => ({
  modules: many(courseModules),
  assets: many(courseAssets),
  versions: many(courseVersions),
}));

export const courseModulesRelations = relations(
  courseModules,
  ({ one, many }) => ({
    course: one(courses, {
      fields: [courseModules.courseId],
      references: [courses.id],
    }),
    lessons: many(lessons),
  })
);

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  module: one(courseModules, {
    fields: [lessons.moduleId],
    references: [courseModules.id],
  }),
  progress: many(lessonProgress),
  assets: many(lessonAssets),
  versions: many(lessonVersions),
}));

export const lessonVersionsRelations = relations(lessonVersions, ({ one }) => ({
  lesson: one(lessons, {
    fields: [lessonVersions.lessonId],
    references: [lessons.id],
  }),
  createdBy: one(users, {
    fields: [lessonVersions.createdByUserId],
    references: [users.id],
  }),
}));

export const courseVersionsRelations = relations(courseVersions, ({ one }) => ({
  course: one(courses, {
    fields: [courseVersions.courseId],
    references: [courses.id],
  }),
  createdBy: one(users, {
    fields: [courseVersions.createdByUserId],
    references: [users.id],
  }),
}));

export const mediaAssetsRelations = relations(mediaAssets, ({ one, many }) => ({
  uploadedBy: one(users, {
    fields: [mediaAssets.uploadedByUserId],
    references: [users.id],
  }),
  coursePlacements: many(courseAssets),
  lessonPlacements: many(lessonAssets),
}));

export const courseAssetsRelations = relations(courseAssets, ({ one }) => ({
  course: one(courses, {
    fields: [courseAssets.courseId],
    references: [courses.id],
  }),
  mediaAsset: one(mediaAssets, {
    fields: [courseAssets.mediaAssetId],
    references: [mediaAssets.id],
  }),
}));

export const lessonAssetsRelations = relations(lessonAssets, ({ one }) => ({
  lesson: one(lessons, {
    fields: [lessonAssets.lessonId],
    references: [lessons.id],
  }),
  mediaAsset: one(mediaAssets, {
    fields: [lessonAssets.mediaAssetId],
    references: [mediaAssets.id],
  }),
}));

export const lessonProgressRelations = relations(lessonProgress, ({ one }) => ({
  user: one(users, {
    fields: [lessonProgress.userId],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [lessonProgress.lessonId],
    references: [lessons.id],
  }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
  invitedBy: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
  }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  team: one(teams, {
    fields: [activityLogs.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
export type Course = typeof courses.$inferSelect;
export type CourseModule = typeof courseModules.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
export type LessonVersion = typeof lessonVersions.$inferSelect;
export type CourseVersion = typeof courseVersions.$inferSelect;
export type LessonProgress = typeof lessonProgress.$inferSelect;
export type CourseAsset = typeof courseAssets.$inferSelect;
export type LessonAsset = typeof lessonAssets.$inferSelect;
export type MediaAsset = typeof mediaAssets.$inferSelect;
export type NewMediaAsset = typeof mediaAssets.$inferInsert;
export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, 'id' | 'name' | 'email'>;
  })[];
};

export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_TEAM = 'CREATE_TEAM',
  REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',
  INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
  ACCEPT_INVITATION = 'ACCEPT_INVITATION',
}

/** Roles that may access /admin CMS routes */
export const COURSE_STAFF_ROLES = ['owner', 'admin', 'editor'] as const;
export type CourseStaffRole = (typeof COURSE_STAFF_ROLES)[number];

export function isCourseStaffRole(
  role: string | null | undefined
): role is CourseStaffRole {
  return (
    role === 'owner' ||
    role === 'admin' ||
    role === 'editor'
  );
}

/**
 * Future extension points (no runtime exports required).
 *
 * TODO(coach-ai): Insight generators — feed `CoachServerSnapshot` + optional journal snippets into
 *   curated prompt builders; return cards for Coach feed / Daily Focus; never mutate billing or lessons.
 *
 * TODO(openai): Model calls behind feature flag + rate limits; redact PII; structured JSON output only.
 *
 * TODO(coach-memory): Postgres tables for tone preset, weekly goals, journal entries (user_id scoped);
 *   encryption/export hooks; migrate off localStorage when policy allows.
 */

export {};

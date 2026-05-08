export type LegacyImportLessonResult = {
  lessonKey: string;
  legacyPath: string | null;
  status: 'updated' | 'skipped' | 'error' | 'missing_file';
  appliedFields: string[];
  message?: string;
};

export type LegacyCourseImportSummary = {
  ok: boolean;
  courseSlug: string;
  results: LegacyImportLessonResult[];
  /** Human-readable lines for logging UI */
  logLines: string[];
};

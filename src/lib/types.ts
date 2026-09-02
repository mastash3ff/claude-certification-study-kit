export type TrackId = "ccao-f" | "ccdv-f" | "ccar-f" | "ccar-p";

export interface Source {
  label: string;
  url: string;
  tier: 1 | 2 | 3;
}

export interface Objective {
  id: string;
  name: string;
  weight?: number;
}

export interface Domain {
  id: string;
  slug: string;
  name: string;
  weight: number;
  objectives: Objective[];
}

export interface Track {
  id: TrackId;
  code: string;
  slug: string;
  shortName: string;
  role: "Associate" | "Developer" | "Architect";
  level: "Foundations" | "Professional";
  summary: string;
  examItems: number;
  durationMinutes: number;
  priceUsd: number;
  validityMonths: number;
  countsForPartnerTier: boolean;
  expectedQuestions: number;
  calibrationSource: string;
  domains: Domain[];
}

export interface Catalog {
  verifiedAt: string;
  guideVersion: string;
  sources: Record<string, Source>;
  tracks: Track[];
}

export interface QuestionOption {
  id: string;
  text: string;
  rationale: string;
}

export interface Question {
  id: string;
  track: TrackId;
  domain: string;
  objective: string;
  select: number;
  stem: string;
  options: QuestionOption[];
  correct: string[];
  tags: string[];
  sources: string[];
}

export type PracticeMode = "diagnostic" | "drill";

export interface ProgressRecordV2 {
  schemaVersion: 2;
  track: TrackId;
  mode: PracticeMode;
  domain: string | null;
  questionOrder: string[];
  optionOrder: Record<string, string[]>;
  answers: Record<string, string[]>;
  flagged: string[];
  revealed: string[];
  startedAt: string;
  elapsedSeconds: number;
  completedAt: string | null;
}

export interface ExportPayloadV2 {
  schemaVersion: 2;
  exportedAt: string;
  records: ProgressRecordV2[];
}

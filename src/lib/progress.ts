import { isTrackId } from "./catalog";
import { validateProgress } from "./core";
import type { ExportPayloadV2, ProgressRecordV2, Question, TrackId } from "./types";

export const storageKey = (track: TrackId, mode: "diagnostic" | "drill" = "diagnostic", domain: string | null = null) =>
  `claude-cert-study:v2:${track}:${mode}:${domain ?? "all"}`;
const interimKey = (track: TrackId) => `claude-cert-study:v2:${track}`;
const legacyKey = (track: TrackId) => `claude-architect-study:${track}:v1`;

function storage(): Storage | null {
  try {
    const key = "claude-cert-study:probe";
    localStorage.setItem(key, "1");
    localStorage.removeItem(key);
    return localStorage;
  } catch {
    return null;
  }
}

export function saveProgress(progress: ProgressRecordV2): boolean {
  const target = storage();
  if (!target) return false;
  target.setItem(storageKey(progress.track, progress.mode, progress.domain), JSON.stringify(progress));
  return true;
}

export function removeProgress(track: TrackId, mode: "diagnostic" | "drill" = "diagnostic", domain: string | null = null): boolean {
  const target = storage();
  if (!target) return false;
  target.removeItem(storageKey(track, mode, domain));
  return true;
}

function migrateLegacy(track: TrackId, raw: string): ProgressRecordV2 | null {
  if (track !== "ccar-f" && track !== "ccar-p") return null;
  try {
    const legacy = JSON.parse(raw) as Record<string, unknown>;
    if (legacy.version !== 1 || legacy.track !== track) return null;
    const completedAt = typeof legacy.completedAt === "string" ? legacy.completedAt : null;
    const elapsedSeconds = completedAt && typeof legacy.startedAt === "string"
      ? Math.max(0, Math.floor((Date.parse(completedAt) - Date.parse(legacy.startedAt)) / 1000))
      : 0;
    return {
      schemaVersion: 2,
      track,
      mode: "diagnostic",
      domain: null,
      questionOrder: legacy.questionOrder as string[],
      optionOrder: legacy.optionOrder as Record<string, string[]>,
      answers: legacy.answers as Record<string, string[]>,
      flagged: legacy.flagged as string[],
      revealed: [],
      startedAt: legacy.startedAt as string,
      elapsedSeconds,
      completedAt,
    };
  } catch {
    return null;
  }
}

export function loadProgress(track: TrackId, questions: Question[], mode: "diagnostic" | "drill" = "diagnostic", domain: string | null = null): ProgressRecordV2 | null {
  const target = storage();
  if (!target) return null;
  let raw = target.getItem(storageKey(track, mode, domain));
  let migrated = false;
  if (!raw) {
    const interim = target.getItem(interimKey(track));
    let interimRecord: ProgressRecordV2 | null = null;
    try { interimRecord = interim ? JSON.parse(interim) as ProgressRecordV2 : null; } catch { /* Fall through to the v1 migration. */ }
    const legacy = mode === "diagnostic" && domain === null ? target.getItem(legacyKey(track)) : null;
    const record = interimRecord?.mode === mode && interimRecord.domain === domain ? interimRecord : legacy ? migrateLegacy(track, legacy) : null;
    if (record) {
      raw = JSON.stringify(record);
      migrated = true;
    }
  }
  if (!raw) return null;
  try {
    const progress = validateProgress(JSON.parse(raw) as ProgressRecordV2, questions);
    if (migrated) target.setItem(storageKey(track, mode, domain), JSON.stringify(progress));
    return progress;
  } catch {
    return null;
  }
}

export function exportProgress(): ExportPayloadV2 {
  const target = storage();
  const records: ProgressRecordV2[] = [];
  if (target) {
    for (let index = 0; index < target.length; index += 1) {
      const key = target.key(index);
      if (!key?.startsWith("claude-cert-study:v2:") || key.split(":").length < 5) continue;
      const raw = target.getItem(key);
      try { if (raw) records.push(JSON.parse(raw) as ProgressRecordV2); } catch { /* Keep other valid records. */ }
    }
  }
  return { schemaVersion: 2, exportedAt: new Date().toISOString(), records };
}

export function validateImport(payload: unknown, banks: Record<TrackId, Question[]>): ExportPayloadV2 {
  if (!payload || typeof payload !== "object") throw new Error("Import must be a JSON object.");
  const candidate = payload as Partial<ExportPayloadV2>;
  if (candidate.schemaVersion !== 2 || !Array.isArray(candidate.records) || !candidate.records.length) {
    throw new Error("Import must contain version 2 progress records.");
  }
  const seen = new Set<string>();
  const records = candidate.records.map((record) => {
    if (!record || !isTrackId(record.track)) throw new Error("Import contains an unknown track.");
    const identity = `${record.track}:${record.mode}:${record.domain ?? "all"}`;
    if (seen.has(identity)) throw new Error("Import contains duplicate session records.");
    seen.add(identity);
    return validateProgress(record, banks[record.track]);
  });
  return { schemaVersion: 2, exportedAt: typeof candidate.exportedAt === "string" ? candidate.exportedAt : new Date().toISOString(), records };
}

export function applyImport(payload: ExportPayloadV2): boolean {
  const target = storage();
  if (!target) return false;
  for (const record of payload.records) target.setItem(storageKey(record.track, record.mode, record.domain), JSON.stringify(record));
  return true;
}

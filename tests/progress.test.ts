import { beforeEach, describe, expect, it } from "vitest";
import { createProgress } from "../src/lib/core";
import { applyImport, exportProgress, loadProgress, saveProgress, storageKey, validateImport } from "../src/lib/progress";
import { getQuestions } from "../src/lib/questions";
import type { Question, TrackId } from "../src/lib/types";

const tracks: TrackId[] = ["ccao-f", "ccdv-f", "ccar-f", "ccar-p"];
const banks = Object.fromEntries(tracks.map((track) => [track, getQuestions(track)])) as Record<TrackId, Question[]>;

describe("browser progress", () => {
  beforeEach(() => localStorage.clear());
  it("round-trips a version 2 export", () => {
    const record = createProgress("ccdv-f", "diagnostic", null, banks["ccdv-f"]);
    expect(saveProgress(record)).toBe(true);
    const payload = validateImport(exportProgress(), banks);
    localStorage.clear();
    expect(applyImport(payload)).toBe(true);
    expect(loadProgress("ccdv-f", banks["ccdv-f"])).toEqual(record);
  });
  it("keeps a diagnostic and domain drill independently", () => {
    const diagnostic = createProgress("ccao-f", "diagnostic", null, banks["ccao-f"]);
    const domain = banks["ccao-f"][0].domain;
    const drillQuestions = banks["ccao-f"].filter((question) => question.domain === domain);
    const drill = createProgress("ccao-f", "drill", domain, drillQuestions);
    saveProgress(diagnostic);
    saveProgress(drill);
    expect(loadProgress("ccao-f", banks["ccao-f"])).toEqual(diagnostic);
    expect(loadProgress("ccao-f", drillQuestions, "drill", domain)).toEqual(drill);
    expect(exportProgress().records).toHaveLength(2);
  });
  it("migrates an architect version 1 session", () => {
    const record = createProgress("ccar-f", "diagnostic", null, banks["ccar-f"]);
    localStorage.setItem("claude-architect-study:ccar-f:v1", JSON.stringify({ version: 1, ...record, schemaVersion: undefined }));
    expect(loadProgress("ccar-f", banks["ccar-f"])?.schemaVersion).toBe(2);
    expect(localStorage.getItem(storageKey("ccar-f"))).not.toBeNull();
  });
  it("rejects the whole import when one record is invalid", () => {
    const record = createProgress("ccao-f", "diagnostic", null, banks["ccao-f"]);
    expect(() => validateImport({ schemaVersion: 2, records: [record, { ...record, track: "bogus" }] }, banks)).toThrow(/unknown track/);
  });
});

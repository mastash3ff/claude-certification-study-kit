import { useRef, useState } from "preact/hooks";
import { allQuestions } from "../lib/questions";
import { applyImport, exportProgress, validateImport } from "../lib/progress";
import type { Question, TrackId } from "../lib/types";

export default function ProgressTools() {
  const input = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const download = () => {
    const blob = new Blob([JSON.stringify(exportProgress(), null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "claude-certification-progress.json";
    link.click();
    URL.revokeObjectURL(link.href);
    setMessage("Progress exported.");
  };
  const upload = async (file?: File) => {
    if (!file) return;
    try {
      const banks = Object.fromEntries((["ccao-f", "ccdv-f", "ccar-f", "ccar-p"] as TrackId[]).map((track) => [track, allQuestions.filter((q) => q.track === track)])) as Record<TrackId, Question[]>;
      const payload = validateImport(JSON.parse(await file.text()), banks);
      if (!applyImport(payload)) throw new Error("Browser storage is unavailable.");
      setMessage(`Imported ${payload.records.length} progress record${payload.records.length === 1 ? "" : "s"}.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Import failed."); }
  };
  return <div class="progress-tools">
    <button class="button secondary" onClick={download}>Export progress</button>
    <button class="button secondary" onClick={() => input.current?.click()}>Import progress</button>
    <input ref={input} class="visually-hidden" type="file" accept="application/json" onChange={(event) => upload(event.currentTarget.files?.[0])} />
    <span role="status">{message}</span>
  </div>;
}

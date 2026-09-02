import { useEffect, useMemo, useState } from "preact/hooks";
import { calculateResults, createProgress, isCorrect } from "../lib/core";
import { loadProgress, removeProgress, saveProgress } from "../lib/progress";
import type { Domain, ProgressRecordV2, Question, Track, TrackId } from "../lib/types";

interface Props { track: Track; questions: Question[]; mode: "diagnostic" | "drill"; domain?: Domain; }

function orderedQuestions(progress: ProgressRecordV2, questions: Question[]) {
  const bank = new Map(questions.map((question) => [question.id, question]));
  return progress.questionOrder.map((id) => bank.get(id)!).filter(Boolean);
}

export default function Quiz({ track, questions, mode, domain }: Props) {
  const [progress, setProgress] = useState<ProgressRecordV2 | null>(null);
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = loadProgress(track.id as TrackId, questions, mode, domain?.id ?? null);
    setProgress(saved ?? createProgress(track.id, mode, domain?.id ?? null, questions));
    setReady(true);
  }, []);

  useEffect(() => { if (ready && progress) saveProgress(progress); }, [progress, ready]);
  const ordered = useMemo(() => progress ? orderedQuestions(progress, questions) : [], [progress, questions]);
  if (!ready || !progress) return <p class="notice">Loading practice session...</p>;

  if (progress.completedAt) {
    const result = calculateResults(ordered, track.domains, progress.answers);
    return <section class="results" aria-live="polite">
      <p class="eyebrow">Session complete</p>
      <h2>{result.percent}% correct</h2>
      <p>{result.correct} of {result.total} questions. This is a study score, not an Anthropic scaled score or pass prediction.</p>
      <div class="result-domains">
        {result.domains.map((item) => <div class="result-row" key={item.id}>
          <div><strong>{item.name}</strong><span>{item.correct}/{item.total} correct</span></div>
          <meter min="0" max="100" value={item.percent}>{item.percent}%</meter>
          <span>{item.percent}%</span>
        </div>)}
      </div>
      <button class="button" onClick={() => { removeProgress(track.id, mode, domain?.id ?? null); setProgress(createProgress(track.id, mode, domain?.id ?? null, questions)); setIndex(0); }}>Start a fresh session</button>
    </section>;
  }

  const question = ordered[index];
  const selected = progress.answers[question.id] ?? [];
  const revealed = progress.revealed.includes(question.id);
  const optionMap = new Map(question.options.map((option) => [option.id, option]));
  const options = progress.optionOrder[question.id].map((id) => optionMap.get(id)!);
  const update = (next: ProgressRecordV2) => setProgress({ ...next });
  const toggle = (optionId: string) => {
    if (revealed) return;
    const next = selected.includes(optionId) ? selected.filter((id) => id !== optionId) : [...selected, optionId].slice(-question.select);
    update({ ...progress, answers: { ...progress.answers, [question.id]: next } });
  };
  const submit = () => {
    if (!selected.length) return;
    if (mode === "drill" && !revealed) {
      update({ ...progress, revealed: [...progress.revealed, question.id] });
      return;
    }
    if (index < ordered.length - 1) setIndex(index + 1);
    else update({ ...progress, completedAt: new Date().toISOString() });
  };

  return <section class="quiz" data-pagefind-ignore>
    <div class="quiz-head">
      <div><span>{mode === "diagnostic" ? "Diagnostic" : "Domain drill"}</span><strong>Question {index + 1} of {ordered.length}</strong></div>
      <progress max={ordered.length} value={index + 1}>{index + 1}/{ordered.length}</progress>
    </div>
    <article class="question-card">
      <p class="question-meta">{track.domains.find((item) => item.id === question.domain)?.name} · Select {question.select}</p>
      <h2>{question.stem}</h2>
      <div class="options" role="group" aria-label="Answer options">
        {options.map((option) => {
          const checked = selected.includes(option.id);
          const correct = question.correct.includes(option.id);
          const state = revealed ? (correct ? " correct" : checked ? " incorrect" : "") : "";
          return <label class={`option${state}`} key={option.id}>
            <input type={question.select > 1 ? "checkbox" : "radio"} name={question.id} checked={checked} disabled={revealed} onChange={() => toggle(option.id)} />
            <span>{option.text}</span>
          </label>;
        })}
      </div>
      {revealed && <div class={`feedback ${isCorrect(question, selected) ? "success" : "needs-work"}`}>
        <strong>{isCorrect(question, selected) ? "Correct." : "Not quite."}</strong>
        {options.map((option) => <p key={option.id}><b>{question.correct.includes(option.id) ? "Why it fits:" : "Why it does not:"}</b> {option.rationale}</p>)}
      </div>}
      <div class="quiz-actions">
        <button class="button secondary" disabled={index === 0} onClick={() => setIndex(index - 1)}>Previous</button>
        <button class="button" disabled={!selected.length} onClick={submit}>{mode === "drill" && !revealed ? "Check answer" : index === ordered.length - 1 ? "Finish" : "Next"}</button>
      </div>
    </article>
    {mode === "diagnostic" && <p class="privacy-note">Answers remain hidden until you finish. Progress is saved only in this browser.</p>}
  </section>;
}

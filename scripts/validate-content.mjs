import { readFile, readdir } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const catalog = JSON.parse(await readFile(new URL("src/data/tracks.json", root), "utf8"));
const errors = [];
const sourceIds = new Set(Object.keys(catalog.sources));
const trackIds = new Set(catalog.tracks.map(({ id }) => id));

for (const track of catalog.tracks) {
  const domainIds = new Set(track.domains.map(({ id }) => id));
  const objectiveIds = new Set(track.domains.flatMap(({ objectives }) => objectives.map(({ id }) => id)));
  const weight = track.domains.reduce((sum, domain) => sum + domain.weight, 0);
  if (Math.abs(weight - 100) > 0.11) errors.push(`${track.id}: domain weights total ${weight}, expected 100`);
  const bank = JSON.parse(await readFile(new URL(`src/data/questions/${track.id}.json`, root), "utf8"));
  if (bank.questions.length !== track.expectedQuestions) errors.push(`${track.id}: expected ${track.expectedQuestions} questions, found ${bank.questions.length}`);
  const ids = new Set();
  for (const question of bank.questions) {
    const prefix = `${track.id}/${question.id}`;
    if (ids.has(question.id)) errors.push(`${prefix}: duplicate question id`);
    ids.add(question.id);
    if (question.track !== track.id) errors.push(`${prefix}: track mismatch`);
    if (!domainIds.has(question.domain)) errors.push(`${prefix}: unknown domain ${question.domain}`);
    if (!objectiveIds.has(question.objective)) errors.push(`${prefix}: unknown objective ${question.objective}`);
    if (!question.stem?.trim()) errors.push(`${prefix}: empty stem`);
    if (!Array.isArray(question.options) || question.options.length < 3) errors.push(`${prefix}: fewer than three options`);
    if (!Number.isInteger(question.select) || question.select < 1 || question.correct.length !== question.select) errors.push(`${prefix}: select/correct mismatch`);
    const optionIds = new Set(question.options.map(({ id }) => id));
    if (optionIds.size !== question.options.length) errors.push(`${prefix}: duplicate option id`);
    if (question.correct.some((id) => !optionIds.has(id))) errors.push(`${prefix}: correct answer is not an option`);
    if (question.options.some(({ text, rationale }) => !text?.trim() || !rationale?.trim())) errors.push(`${prefix}: option text or rationale is empty`);
    if (!question.sources?.length || question.sources.some((id) => !sourceIds.has(id))) errors.push(`${prefix}: missing or unknown source`);
  }
  const domainDir = new URL(`src/content/certifications/${track.id}/domains/`, root);
  const files = (await readdir(domainDir)).filter((file) => file.endsWith(".md"));
  if (files.length !== track.domains.length) errors.push(`${track.id}: expected ${track.domains.length} domain notes, found ${files.length}`);
}

if (trackIds.size !== 4) errors.push(`expected 4 tracks, found ${trackIds.size}`);
if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}
console.log(`Validated ${catalog.tracks.length} tracks and ${catalog.tracks.reduce((sum, track) => sum + track.expectedQuestions, 0)} questions.`);

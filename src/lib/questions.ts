import ccao from "../data/questions/ccao-f.json";
import ccdv from "../data/questions/ccdv-f.json";
import ccarf from "../data/questions/ccar-f.json";
import ccarp from "../data/questions/ccar-p.json";
import type { Question, TrackId } from "./types";

const banks: Record<TrackId, Question[]> = {
  "ccao-f": ccao.questions as Question[],
  "ccdv-f": ccdv.questions as Question[],
  "ccar-f": ccarf.questions as Question[],
  "ccar-p": ccarp.questions as Question[],
};

export function getQuestions(track: TrackId): Question[] {
  return banks[track];
}

export const allQuestions = Object.values(banks).flat();

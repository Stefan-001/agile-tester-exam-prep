import { Question } from './types';

/** Grade selection vs question's correct indices */
export function gradeQuestion(question: Question, selected: number[]) {
  const correctSet = new Set(question.correct);
  const selSet = new Set(selected);
  let correct = true;
  if (correctSet.size !== selSet.size) correct = false;
  for (const i of selSet) {
    if (!correctSet.has(i)) {
      correct = false;
      break;
    }
  }
  return correct;
}
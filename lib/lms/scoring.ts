// lib/lms/scoring.ts
// Fixed 7-competency rubric used across all teaching programs, matching the
// "Inggris Go" student progress report template (1-5 per competency).

export const COMPETENCY_FIELDS = [
  { key: "grammarAccuracy", label: "Grammar Accuracy" },
  { key: "pronunciation", label: "Pronunciation" },
  { key: "vocabulary", label: "Vocabulary" },
  { key: "fluency", label: "Fluency" },
  { key: "confidence", label: "Confidence" },
  { key: "listening", label: "Listening" },
  { key: "participation", label: "Participation" },
] as const;

export type CompetencyKey = (typeof COMPETENCY_FIELDS)[number]["key"];

export type CompetencyScores = Record<CompetencyKey, number>;

export const COMPETENCY_SCORE_LABELS: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "Beginning",
  2: "Needs Support",
  3: "Developing",
  4: "Good",
  5: "Excellent",
};

export function getCompetencyLabel(score: number): string {
  const clamped = Math.min(5, Math.max(1, Math.round(score))) as
    | 1
    | 2
    | 3
    | 4
    | 5;

  return COMPETENCY_SCORE_LABELS[clamped];
}

export function computeAverageScore(scores: CompetencyScores): number {
  const values = COMPETENCY_FIELDS.map((field) => scores[field.key]);
  const total = values.reduce((sum, value) => sum + value, 0);

  return total / values.length;
}

// Thresholds inferred from the sample report data (4.1/4.0/4.3 -> "Very Good
// Progress", 3.6/3.4 -> "Good Progress"); tune here if the business defines
// different bands later.
export function getProgressLabel(average: number): string {
  if (average >= 4.5) return "Excellent Progress";
  if (average >= 4.0) return "Very Good Progress";
  if (average >= 3.0) return "Good Progress";
  if (average >= 2.0) return "Developing Progress";
  return "Needs Support";
}

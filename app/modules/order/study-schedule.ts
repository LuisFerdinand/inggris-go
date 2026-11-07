// app/modules/order/study-schedule.ts
//
// Shared (client + server) helpers for the kids registration form:
// the preferred study day/time picker used by Private classes, and small
// parsing helpers for the child's age/grade field.

export const STUDY_DAYS = [
  { value: "senin", label: "Senin", short: "Sen" },
  { value: "selasa", label: "Selasa", short: "Sel" },
  { value: "rabu", label: "Rabu", short: "Rab" },
  { value: "kamis", label: "Kamis", short: "Kam" },
  { value: "jumat", label: "Jumat", short: "Jum" },
  { value: "sabtu", label: "Sabtu", short: "Sab" },
  { value: "minggu", label: "Minggu", short: "Min" },
] as const;

export const STUDY_TIME_SLOTS = [
  { value: "pagi", label: "Pagi", hours: "08.00 – 11.00" },
  { value: "siang", label: "Siang", hours: "11.00 – 14.00" },
  { value: "sore", label: "Sore", hours: "14.00 – 17.00" },
  { value: "malam", label: "Malam", hours: "17.00 – 20.00" },
] as const;

export type StudyDay = (typeof STUDY_DAYS)[number]["value"];
export type StudyTimeSlot = (typeof STUDY_TIME_SLOTS)[number]["value"];

export type StudySchedule = {
  days: StudyDay[];
  timeSlot: StudyTimeSlot;
};

export const STUDY_DAY_VALUES = STUDY_DAYS.map((d) => d.value) as [
  StudyDay,
  ...StudyDay[],
];
export const STUDY_TIME_SLOT_VALUES = STUDY_TIME_SLOTS.map((t) => t.value) as [
  StudyTimeSlot,
  ...StudyTimeSlot[],
];

/**
 * Private (1-on-1) programs have no fixed batch, so the parent picks the days
 * and time that suit the family. There is no dedicated flag in the CMS, so a
 * program counts as Private when its slug, title or tags say so.
 */
export function isPrivateProgram(program: {
  slug: string;
  title: string;
  tags?: string[] | null;
}): boolean {
  const haystack = [program.slug, program.title, ...(program.tags ?? [])];
  return haystack.some((s) => /private|1[-\s]?on[-\s]?1/i.test(s));
}

/** "Senin, Rabu, Jumat · Sore (14.00 – 17.00)" */
export function formatStudySchedule(schedule: StudySchedule): string {
  const days = STUDY_DAYS.filter((d) => schedule.days.includes(d.value))
    .map((d) => d.label)
    .join(", ");
  const slot = STUDY_TIME_SLOTS.find((t) => t.value === schedule.timeSlot);
  return slot ? `${days} · ${slot.label} (${slot.hours})` : days;
}

/**
 * The age/grade field is free text ("8", "8 tahun", "Kelas 3 SD"). When it is
 * a plain number we also keep it in the numeric `age` column of the enrollment.
 */
export function parseChildAge(value: string): number | null {
  const match = value.trim().match(/^(\d{1,2})(\s*(tahun|thn|th))?$/i);
  if (!match) return null;
  const age = Number(match[1]);
  return age > 0 ? age : null;
}

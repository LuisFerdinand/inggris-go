// .../[classId]/_modules/tabs/ScoresTab.tsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import {
  BookOpenText,
  ChevronDown,
  ClipboardCheck,
  Clock,
  Ear,
  Loader2,
  Lock,
  Mic2,
  MessagesSquare,
  PartyPopper,
  ShieldCheck,
  Sparkles,
  SpellCheck,
  Users2,
  XCircle,
} from "lucide-react";

import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  COMPETENCY_FIELDS,
  computeAverageScore,
  getCompetencyLabel,
  getProgressLabel,
  type CompetencyKey,
} from "@/lib/lms/scoring";
import type { ClassStatus, ScoreStatus } from "@/lib/enums/enums";

type RosterRow = {
  id: string;
  studentName: string;
  score?: {
    status: ScoreStatus;
    finalizedAt: string | Date | null;
    [key: string]: unknown;
  } | null;
};

type ScoreDraft = Record<CompetencyKey, number> & {
  summary: string;
  strengths: string;
  areasToImprove: string;
  tutorNotes: string;
  parentRecommendation: string;
  tutorCoordinatorName: string;
};

/* ─────────────────────────────────────────────────────────────
   VISUAL LANGUAGE — friendly color/icon accents
───────────────────────────────────────────────────────────── */

const COMPETENCY_STYLE: Record<
  CompetencyKey,
  { icon: React.ElementType; color: string; bg: string }
> = {
  grammarAccuracy: { icon: SpellCheck, color: "#0284c7", bg: "#e0f2fe" },
  pronunciation: { icon: Mic2, color: "#9333ea", bg: "#f3e8ff" },
  vocabulary: { icon: BookOpenText, color: "#d97706", bg: "#fef3c7" },
  fluency: { icon: MessagesSquare, color: "#0d9488", bg: "#ccfbf1" },
  confidence: { icon: Sparkles, color: "#db2777", bg: "#fce7f3" },
  listening: { icon: Ear, color: "#4f46e5", bg: "#e0e7ff" },
  participation: { icon: Users2, color: "#059669", bg: "#d1fae5" },
};

const SCORE_LEVEL_COLOR: Record<number, string> = {
  1: "#94a3b8",
  2: "#f43f5e",
  3: "#f59e0b",
  4: "#0ea5e9",
  5: "#10b981",
};

function progressColor(average: number) {
  if (average >= 4.5) return "#10b981";
  if (average >= 4.0) return "#0ea5e9";
  if (average >= 3.0) return "#f59e0b";
  if (average >= 2.0) return "#f97316";
  return "#f43f5e";
}

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg,#6366f1,#a855f7)",
  "linear-gradient(135deg,#f59e0b,#f97316)",
  "linear-gradient(135deg,#10b981,#0d9488)",
  "linear-gradient(135deg,#f43f5e,#ec4899)",
  "linear-gradient(135deg,#0ea5e9,#3b82f6)",
];

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function StudentAvatar({ name, size = 36 }: { name: string; size?: number }) {
  const gradient = AVATAR_GRADIENTS[name.charCodeAt(0) % AVATAR_GRADIENTS.length];

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.36, background: gradient }}
    >
      {getInitials(name)}
    </div>
  );
}

function ProgressRing({ average }: { average: number }) {
  const percent = Math.min(100, Math.max(0, (average / 5) * 100));
  const color = progressColor(average);

  return (
    <div
      className="relative flex size-16 shrink-0 items-center justify-center rounded-full"
      style={{
        background: `conic-gradient(${color} ${percent}%, #e2e8f0 ${percent}%)`,
      }}
    >
      <div className="flex size-[52px] flex-col items-center justify-center rounded-full bg-white">
        <span className="text-[15px] font-extrabold" style={{ color }}>
          {average.toFixed(1)}
        </span>
        <span className="text-[8px] font-semibold text-slate-400">/ 5.0</span>
      </div>
    </div>
  );
}

function emptyDraft(): ScoreDraft {
  const base = {} as ScoreDraft;
  for (const field of COMPETENCY_FIELDS) base[field.key] = 3;
  base.summary = "";
  base.strengths = "";
  base.areasToImprove = "";
  base.tutorNotes = "";
  base.parentRecommendation = "";
  base.tutorCoordinatorName = "";
  return base;
}

type ExistingScore = {
  status: ScoreStatus;
  finalizedAt: string | Date | null;
  reviewNote: string | null;
  grammarAccuracy: number;
  pronunciation: number;
  vocabulary: number;
  fluency: number;
  confidence: number;
  listening: number;
  participation: number;
  summary: string | null;
  strengths: string | null;
  areasToImprove: string | null;
  tutorNotes: string | null;
  parentRecommendation: string | null;
  tutorCoordinatorName: string | null;
};

function draftFromScore(existing: ExistingScore | null): ScoreDraft {
  if (!existing) return emptyDraft();

  return {
    grammarAccuracy: existing.grammarAccuracy,
    pronunciation: existing.pronunciation,
    vocabulary: existing.vocabulary,
    fluency: existing.fluency,
    confidence: existing.confidence,
    listening: existing.listening,
    participation: existing.participation,
    summary: existing.summary ?? "",
    strengths: existing.strengths ?? "",
    areasToImprove: existing.areasToImprove ?? "",
    tutorNotes: existing.tutorNotes ?? "",
    parentRecommendation: existing.parentRecommendation ?? "",
    tutorCoordinatorName: existing.tutorCoordinatorName ?? "",
  };
}

function StudentScoreFormInner({
  classId,
  classEnrollmentId,
  studentName,
  existingScore,
  canApprove,
  onClose,
}: {
  classId: string;
  classEnrollmentId: string;
  studentName: string;
  existingScore: ExistingScore | null;
  canApprove: boolean;
  onClose: () => void;
}) {
  const utils = trpc.useUtils();

  const [draft, setDraft] = useState<ScoreDraft>(() =>
    draftFromScore(existingScore),
  );
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectNote, setRejectNote] = useState("");

  const status = existingScore?.status ?? "draft";
  const isApproved = status === "approved";
  const isPendingReview = status === "pending_review";
  const isRejected = status === "rejected";
  // Once submitted for review (or approved), only an oversight role
  // (author/admin/super_admin) can still edit — everyone else is locked out.
  const isLocked = (isPendingReview || isApproved) && !canApprove;

  function invalidateScore() {
    return Promise.all([
      utils.classScores.listByClass.invalidate({ classId }),
      utils.classScores.getByClassEnrollment.invalidate({
        classEnrollmentId,
      }),
    ]);
  }

  const saveMutation = trpc.classScores.save.useMutation({
    onSuccess: async () => {
      await invalidateScore();
      toast.success("Nilai tersimpan");
    },
    onError: (err) => toast.error(err.message || "Gagal menyimpan nilai"),
  });

  const submitMutation = trpc.classScores.submitForApproval.useMutation({
    onSuccess: async () => {
      await invalidateScore();
      toast.success(
        canApprove
          ? `Nilai ${studentName} disetujui`
          : `Nilai ${studentName} diajukan untuk persetujuan`,
      );
      onClose();
    },
    onError: (err) => toast.error(err.message || "Gagal mengajukan nilai"),
  });

  const reviewMutation = trpc.classScores.review.useMutation({
    onSuccess: async () => {
      await invalidateScore();
      setShowRejectForm(false);
      setRejectNote("");
      toast.success("Keputusan tersimpan");
      onClose();
    },
    onError: (err) => toast.error(err.message || "Gagal memproses persetujuan"),
  });

  const average = computeAverageScore(draft);
  const ringColor = progressColor(average);

  function handleSave() {
    saveMutation.mutate({ classEnrollmentId, ...draft });
  }

  function handleSubmit() {
    saveMutation.mutate(
      { classEnrollmentId, ...draft },
      { onSuccess: () => submitMutation.mutate({ classEnrollmentId }) },
    );
  }

  function handleApprove() {
    reviewMutation.mutate({ classEnrollmentId, decision: "approve" });
  }

  function handleReject() {
    if (!rejectNote.trim()) {
      toast.error("Alasan penolakan wajib diisi");
      return;
    }
    reviewMutation.mutate({
      classEnrollmentId,
      decision: "reject",
      reviewNote: rejectNote.trim(),
    });
  }

  return (
    <div
      className="flex flex-col gap-5 border-t p-5"
      style={{ borderColor: "#f1f5f9", background: "#fafbff" }}
    >
      {isApproved && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3.5 py-2.5 text-[12px] font-semibold text-emerald-700">
          <Lock className="size-3.5" />
          {canApprove
            ? "Nilai sudah disetujui. Anda dapat mengedit sebagai atasan."
            : "Nilai sudah disetujui dan terkunci."}
        </div>
      )}

      {isPendingReview && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3.5 py-2.5 text-[12px] font-semibold text-amber-700">
          <Clock className="size-3.5" />
          {canApprove
            ? "Menunggu keputusan Anda — setujui atau tolak di bawah."
            : "Menunggu persetujuan author, admin, atau super admin."}
        </div>
      )}

      {isRejected && (
        <div className="flex flex-col gap-1 rounded-xl bg-red-50 px-3.5 py-2.5 text-[12px] font-semibold text-red-700">
          <span className="inline-flex items-center gap-2">
            <XCircle className="size-3.5" /> Nilai ditolak, silakan perbaiki dan ajukan ulang.
          </span>
          {existingScore?.reviewNote && (
            <p className="font-normal text-red-600">
              &ldquo;{existingScore.reviewNote}&rdquo;
            </p>
          )}
        </div>
      )}

      {/* Average summary hero */}
      <div
        className="flex items-center gap-4 rounded-2xl p-4"
        style={{ background: `${ringColor}0f`, border: `1px solid ${ringColor}22` }}
      >
        <ProgressRing average={average} />
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
            Rata-rata kompetensi
          </p>
          <p className="mt-0.5 text-[15px] font-extrabold" style={{ color: ringColor }}>
            {getProgressLabel(average)}
          </p>
          <p className="mt-0.5 text-[11.5px] text-slate-400">
            Geser skor tiap kompetensi di bawah untuk memperbarui.
          </p>
        </div>
      </div>

      {/* Competency selectors */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {COMPETENCY_FIELDS.map((field) => {
          const style = COMPETENCY_STYLE[field.key];
          const Icon = style.icon;
          const value = draft[field.key];

          return (
            <div
              key={field.key}
              className="rounded-xl border border-slate-200 bg-white p-3"
            >
              <div className="mb-2 flex items-center gap-2">
                <div
                  className="flex size-7 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: style.bg }}
                >
                  <Icon className="size-3.5" style={{ color: style.color }} />
                </div>
                <span className="flex-1 text-[12.5px] font-semibold text-slate-700">
                  {field.label}
                </span>
                <span
                  className="text-[11px] font-bold"
                  style={{ color: SCORE_LEVEL_COLOR[value] }}
                >
                  {getCompetencyLabel(value)}
                </span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => {
                  const active = value === n;
                  return (
                    <button
                      key={n}
                      type="button"
                      disabled={isLocked}
                      onClick={() =>
                        setDraft((prev) => ({ ...prev, [field.key]: n }))
                      }
                      title={getCompetencyLabel(n)}
                      className="h-8 flex-1 rounded-lg text-[12px] font-bold transition-all disabled:opacity-50"
                      style={{
                        background: active ? SCORE_LEVEL_COLOR[n] : "#f1f5f9",
                        color: active ? "white" : "#94a3b8",
                        transform: active ? "scale(1.05)" : undefined,
                      }}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {[
        { key: "summary", label: "Ringkasan Perkembangan" },
        { key: "strengths", label: "Kekuatan Ananda" },
        { key: "areasToImprove", label: "Area yang Perlu Dikembangkan" },
        { key: "tutorNotes", label: "Catatan Tutor" },
        { key: "parentRecommendation", label: "Rekomendasi Orang Tua" },
      ].map(({ key, label }) => (
        <div key={key}>
          <label className="mb-1.5 block text-[12px] font-semibold text-slate-700">
            {label}
          </label>
          <Textarea
            rows={2}
            disabled={isLocked}
            value={draft[key as keyof ScoreDraft] as string}
            onChange={(e) =>
              setDraft((prev) => ({ ...prev, [key]: e.target.value }))
            }
          />
        </div>
      ))}

      <div>
        <label className="mb-1.5 block text-[12px] font-semibold text-slate-700">
          Nama Tutor Coordinator
        </label>
        <Input
          disabled={isLocked}
          value={draft.tutorCoordinatorName}
          onChange={(e) =>
            setDraft((prev) => ({
              ...prev,
              tutorCoordinatorName: e.target.value,
            }))
          }
        />
      </div>

      {!isLocked && !showRejectForm && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={saveMutation.isPending}
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-white px-4 py-2 text-[12.5px] font-bold text-indigo-700 transition-colors hover:bg-indigo-50 disabled:opacity-50"
          >
            {saveMutation.isPending && (
              <Loader2 className="size-3.5 animate-spin" />
            )}
            Simpan
          </button>

          {isPendingReview && canApprove && (
            <>
              <button
                type="button"
                disabled={reviewMutation.isPending}
                onClick={handleApprove}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-[12.5px] font-bold text-white shadow-sm shadow-emerald-200 transition-colors hover:bg-emerald-700 disabled:opacity-50"
              >
                {reviewMutation.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <ShieldCheck className="size-3.5" />
                )}
                Setujui
              </button>
              <button
                type="button"
                disabled={reviewMutation.isPending}
                onClick={() => setShowRejectForm(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-[12.5px] font-bold text-white shadow-sm shadow-red-200 transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                <XCircle className="size-3.5" />
                Tolak
              </button>
            </>
          )}

          {(status === "draft" || status === "rejected") && (
            <button
              type="button"
              disabled={saveMutation.isPending || submitMutation.isPending}
              onClick={handleSubmit}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-[12.5px] font-bold text-white shadow-sm shadow-emerald-200 transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              {submitMutation.isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <PartyPopper className="size-3.5" />
              )}
              {canApprove ? "Simpan & Setujui" : "Ajukan Persetujuan"}
            </button>
          )}
        </div>
      )}

      {showRejectForm && (
        <div className="flex flex-col gap-2 rounded-xl border border-red-200 bg-red-50 p-3">
          <label className="text-[12px] font-semibold text-red-700">
            Alasan penolakan
          </label>
          <Textarea
            rows={3}
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="Jelaskan apa yang perlu diperbaiki…"
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={reviewMutation.isPending}
              onClick={handleReject}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-[12px] font-bold text-white hover:bg-red-700 disabled:opacity-60"
            >
              {reviewMutation.isPending && (
                <Loader2 className="size-3.5 animate-spin" />
              )}
              Kirim Penolakan
            </button>
            <button
              type="button"
              onClick={() => {
                setShowRejectForm(false);
                setRejectNote("");
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] font-bold text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StudentScoreForm({
  classId,
  classEnrollmentId,
  studentName,
  canApprove,
  onClose,
}: {
  classId: string;
  classEnrollmentId: string;
  studentName: string;
  canApprove: boolean;
  onClose: () => void;
}) {
  const scoreQuery = trpc.classScores.getByClassEnrollment.useQuery({
    classEnrollmentId,
  });

  if (scoreQuery.isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 border-t border-slate-100 bg-slate-50/60 py-6 text-slate-400">
        <Loader2 className="size-4 animate-spin" />
      </div>
    );
  }

  return (
    <StudentScoreFormInner
      classId={classId}
      classEnrollmentId={classEnrollmentId}
      studentName={studentName}
      existingScore={scoreQuery.data ?? null}
      canApprove={canApprove}
      onClose={onClose}
    />
  );
}

const SCORE_OVERSIGHT_ROLES = new Set(["author", "admin", "super_admin"]);

export function ScoresTab({
  classId,
  classStatus,
  roster,
}: {
  classId: string;
  classStatus: ClassStatus;
  roster: RosterRow[];
}) {
  const { data: session } = useSession();
  const canApprove = SCORE_OVERSIGHT_ROLES.has(session?.user.role ?? "");
  const [openId, setOpenId] = useState<string | null>(null);

  if (classStatus !== "completed") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/40 px-6 py-16 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-white shadow-sm">
          <ClipboardCheck className="size-6 text-indigo-400" />
        </div>
        <p className="text-[14px] font-bold text-slate-700">
          Hampir sampai! Selesaikan kelas dulu, ya
        </p>
        <p className="max-w-xs text-[12.5px] leading-relaxed text-slate-400">
          Klik &ldquo;Selesaikan Kelas&rdquo; di bagian atas halaman untuk membuka form
          penilaian setiap siswa.
        </p>
      </div>
    );
  }

  if (roster.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-14 text-center text-[12.5px] text-slate-400">
        Belum ada siswa di kelas ini.
      </div>
    );
  }

  const finalizedCount = roster.filter((s) => s.score?.status === "approved").length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-3">
        <p className="text-[12.5px] font-semibold text-indigo-700">
          {finalizedCount} dari {roster.length} siswa sudah dinilai
        </p>
        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/70">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all"
            style={{ width: `${(finalizedCount / roster.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {roster.map((student) => {
          const isOpen = openId === student.id;
          const scoreStatus = student.score?.status;

          return (
            <div
              key={student.id}
              className={cn(
                "overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow",
                isOpen ? "border-indigo-200 shadow-md" : "border-slate-200",
              )}
            >
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : student.id)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
              >
                <StudentAvatar name={student.studentName} />
                <p className="flex-1 truncate text-[13.5px] font-bold text-slate-800">
                  {student.studentName}
                </p>
                <div className="flex shrink-0 items-center gap-2">
                  {scoreStatus === "approved" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10.5px] font-bold text-emerald-600">
                      <Sparkles className="size-3" /> Selesai
                    </span>
                  ) : scoreStatus === "pending_review" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10.5px] font-bold text-amber-600">
                      <Clock className="size-3" /> Menunggu Persetujuan
                    </span>
                  ) : scoreStatus === "rejected" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[10.5px] font-bold text-red-600">
                      <XCircle className="size-3" /> Ditolak
                    </span>
                  ) : student.score ? (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10.5px] font-bold text-slate-500">
                      Draf
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10.5px] font-bold text-slate-400">
                      Belum dinilai
                    </span>
                  )}
                  <ChevronDown
                    className={cn(
                      "size-4 text-slate-400 transition-transform",
                      isOpen && "rotate-180",
                    )}
                  />
                </div>
              </button>

              {isOpen && (
                <StudentScoreForm
                  classId={classId}
                  classEnrollmentId={student.id}
                  studentName={student.studentName}
                  canApprove={canApprove}
                  onClose={() => setOpenId(null)}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

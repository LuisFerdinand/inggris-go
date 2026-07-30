// app/(dashboard)/dashboard/merchant/_modules/MerchantRegistrationView.tsx
"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  AlertCircle,
  Banknote,
  Building2,
  CheckCircle2,
  Clock,
  Loader2,
  Save,
  Store,
  XCircle,
} from "lucide-react";

import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { PageHeader, PageNav } from "@/components/PageHeader";

/* ─────────────────────────────────────────────────────────────
 * TYPES
 * ───────────────────────────────────────────────────────────── */
type FormState = {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  businessCategory: string;
  description: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
};

const EMPTY_FORM: FormState = {
  businessName: "",
  ownerName: "",
  email: "",
  phone: "",
  businessCategory: "",
  description: "",
  bankName: "",
  bankAccountNumber: "",
  bankAccountName: "",
};

/* ─────────────────────────────────────────────────────────────
 * PRIMITIVES
 * ───────────────────────────────────────────────────────────── */
function Field({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div>
        <p className="text-[12.5px] font-black text-slate-800">{label}</p>
        {description && (
          <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-500">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  disabled,
  type = "text",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      disabled={disabled}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] font-medium text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
    />
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  disabled,
  rows = 3,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      disabled={disabled}
      rows={rows}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] font-medium text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
    />
  );
}

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-slate-100 p-5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <Icon className="size-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-[14px] font-black text-slate-900">{title}</h2>
          <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-500">
            {description}
          </p>
        </div>
      </div>
      <div className="grid gap-4 p-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

const STATUS_META = {
  pending: {
    label: "Menunggu Review",
    icon: Clock,
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  approved: {
    label: "Disetujui",
    icon: CheckCircle2,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  rejected: {
    label: "Ditolak",
    icon: XCircle,
    className: "bg-red-50 text-red-700 border-red-200",
  },
} as const;

/* ─────────────────────────────────────────────────────────────
 * MAIN VIEW
 * ───────────────────────────────────────────────────────────── */
export function MerchantRegistrationView() {
  const utils = trpc.useUtils();

  const myRegistrationQuery = trpc.merchant.getMine.useQuery();

  const submit = trpc.merchant.submit.useMutation({
    onSuccess: () => {
      toast.success("Pendaftaran merchant berhasil dikirim!");
      void utils.merchant.getMine.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Gagal mengirim pendaftaran merchant");
    },
  });

  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  useEffect(() => {
    const d = myRegistrationQuery.data;
    if (!d) return;

    setForm({
      businessName: d.businessName,
      ownerName: d.ownerName,
      email: d.email,
      phone: d.phone,
      businessCategory: d.businessCategory ?? "",
      description: d.description ?? "",
      bankName: d.bankName,
      bankAccountNumber: d.bankAccountNumber,
      bankAccountName: d.bankAccountName,
    });
  }, [myRegistrationQuery.data]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const status = myRegistrationQuery.data?.status;
  const isApproved = status === "approved";
  const isSaving = submit.isPending;

  function handleSubmit() {
    submit.mutate({
      businessName: form.businessName.trim(),
      ownerName: form.ownerName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      businessCategory: form.businessCategory.trim() || undefined,
      description: form.description.trim() || undefined,
      bankName: form.bankName.trim(),
      bankAccountNumber: form.bankAccountNumber.trim(),
      bankAccountName: form.bankAccountName.trim(),
    });
  }

  if (myRegistrationQuery.isLoading) {
    return (
      <div className="flex flex-col gap-y-4 pt-2.5">
        <PageNav sticky>
          <PageHeader
            breadcrumbs={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Daftar Merchant", icon: <Store /> },
            ]}
            title="Daftar Merchant"
            description="Daftarkan bisnismu untuk menerima pembayaran sendiri."
          />
        </PageNav>
        <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-slate-200 bg-white mx-4 lg:mx-6 shadow-sm">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <Loader2 className="size-7 animate-spin" />
            <p className="text-[13px] font-black">Memuat data…</p>
          </div>
        </div>
      </div>
    );
  }

  const meta = status ? STATUS_META[status] : null;
  const StatusIcon = meta?.icon;

  return (
    <div className="flex flex-col gap-y-4 pt-2.5">
      <PageNav sticky>
        <PageHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Daftar Merchant", icon: <Store /> },
          ]}
          title="Daftar Merchant"
          description="Daftarkan bisnismu untuk menerima pembayaran sendiri lewat Tripay."
        />
      </PageNav>

      <div className="flex flex-col gap-4 px-4 pb-10 lg:px-6">
        {meta && StatusIcon && (
          <div
            className={cn(
              "flex items-center gap-3 rounded-3xl border p-4 shadow-sm",
              meta.className,
            )}
          >
            <StatusIcon className="size-5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-black">Status: {meta.label}</p>
              {status === "rejected" && myRegistrationQuery.data?.reviewNote && (
                <p className="mt-0.5 text-[11.5px] font-medium">
                  Catatan admin: {myRegistrationQuery.data.reviewNote}
                </p>
              )}
              {status === "pending" && (
                <p className="mt-0.5 text-[11.5px] font-medium">
                  Tim kami akan meninjau data yang kamu kirim. Kamu masih bisa mengubah data
                  selama status ini menunggu.
                </p>
              )}
              {status === "approved" && (
                <p className="mt-0.5 text-[11.5px] font-medium">
                  Merchant kamu sudah aktif. Hubungi admin jika ada perubahan data.
                </p>
              )}
            </div>
          </div>
        )}

        {!meta && (
          <div className="flex items-center gap-3 rounded-3xl border border-indigo-200 bg-indigo-50 p-4 text-indigo-700 shadow-sm">
            <AlertCircle className="size-5 shrink-0" />
            <p className="text-[12.5px] font-semibold">
              Lengkapi data di bawah untuk mengajukan pendaftaran sebagai merchant.
            </p>
          </div>
        )}

        <Section
          icon={Building2}
          title="Informasi Bisnis"
          description="Data dasar tentang bisnis yang kamu daftarkan."
        >
          <Field label="Nama Usaha">
            <TextInput
              value={form.businessName}
              onChange={(v) => set("businessName", v)}
              placeholder="Contoh: Kelas Bahasa Inggris Budi"
              disabled={isApproved}
            />
          </Field>
          <Field label="Nama Pemilik">
            <TextInput
              value={form.ownerName}
              onChange={(v) => set("ownerName", v)}
              placeholder="Nama lengkap"
              disabled={isApproved}
            />
          </Field>
          <Field label="Email">
            <TextInput
              type="email"
              value={form.email}
              onChange={(v) => set("email", v)}
              placeholder="email@domain.com"
              disabled={isApproved}
            />
          </Field>
          <Field label="Nomor Telepon">
            <TextInput
              value={form.phone}
              onChange={(v) => set("phone", v)}
              placeholder="08xxxxxxxxxx"
              disabled={isApproved}
            />
          </Field>
          <Field label="Kategori Bisnis" description="Opsional">
            <TextInput
              value={form.businessCategory}
              onChange={(v) => set("businessCategory", v)}
              placeholder="Contoh: Kursus & Pendidikan"
              disabled={isApproved}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Deskripsi Singkat" description="Opsional">
              <TextArea
                value={form.description}
                onChange={(v) => set("description", v)}
                placeholder="Ceritakan sedikit tentang bisnismu"
                disabled={isApproved}
              />
            </Field>
          </div>
        </Section>

        <Section
          icon={Banknote}
          title="Informasi Rekening"
          description="Rekening tujuan pencairan dana pembayaran."
        >
          <Field label="Nama Bank">
            <TextInput
              value={form.bankName}
              onChange={(v) => set("bankName", v)}
              placeholder="Contoh: BCA"
              disabled={isApproved}
            />
          </Field>
          <Field label="Nomor Rekening">
            <TextInput
              value={form.bankAccountNumber}
              onChange={(v) => set("bankAccountNumber", v)}
              placeholder="1234567890"
              disabled={isApproved}
            />
          </Field>
          <Field label="Nama Pemilik Rekening">
            <TextInput
              value={form.bankAccountName}
              onChange={(v) => set("bankAccountName", v)}
              placeholder="Sesuai buku tabungan"
              disabled={isApproved}
            />
          </Field>
        </Section>

        {!isApproved && (
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSubmit}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 text-[13.5px] font-black text-white transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Mengirim…
              </>
            ) : (
              <>
                <Save className="size-4" />
                {status ? "Kirim Ulang Pendaftaran" : "Kirim Pendaftaran"}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

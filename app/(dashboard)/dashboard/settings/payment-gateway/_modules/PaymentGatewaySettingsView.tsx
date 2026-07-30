// app/(dashboard)/dashboard/settings/payment-gateway/_modules/PaymentGatewaySettingsView.tsx
"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  RefreshCcw,
  Save,
  ShieldCheck,
  Wallet,
  Webhook,
} from "lucide-react";

import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { PageHeader, PageNav } from "@/components/PageHeader";

/* ─────────────────────────────────────────────────────────────
 * TYPES
 * ───────────────────────────────────────────────────────────── */
type FormState = {
  merchantCode: string;
  apiKey: string;
  privateKey: string;
  mode: "sandbox" | "production";
  callbackUrl: string;
  returnUrl: string;
  isActive: boolean;
};

const EMPTY_FORM: FormState = {
  merchantCode: "",
  apiKey: "",
  privateKey: "",
  mode: "sandbox",
  callbackUrl: "",
  returnUrl: "",
  isActive: false,
};

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

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
  type = "text",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] font-medium text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
    />
  );
}

function SecretInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 pr-10 text-[13px] font-medium text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
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
      <div className="grid gap-4 p-5">{children}</div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
 * MAIN VIEW
 * ───────────────────────────────────────────────────────────── */
export function PaymentGatewaySettingsView() {
  const utils = trpc.useUtils();

  const settingsQuery = trpc.paymentSettings.getTripaySettings.useQuery();

  const updateSettings = trpc.paymentSettings.updateTripaySettings.useMutation({
    onSuccess: () => {
      toast.success("Pengaturan Tripay berhasil disimpan!");
      void utils.paymentSettings.getTripaySettings.invalidate();
      setForm((f) => ({ ...f, apiKey: "", privateKey: "" }));
    },
    onError: (error) => {
      toast.error(error.message || "Gagal menyimpan pengaturan Tripay");
    },
  });

  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  useEffect(() => {
    if (!settingsQuery.data) return;
    const d = settingsQuery.data;
    setForm({
      merchantCode: d.merchantCode ?? "",
      apiKey: "",
      privateKey: "",
      mode: d.mode,
      callbackUrl: d.callbackUrl ?? "",
      returnUrl: d.returnUrl ?? "",
      isActive: d.isActive,
    });
  }, [settingsQuery.data]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSave() {
    if (!form.merchantCode.trim()) {
      toast.error("Merchant code wajib diisi.");
      return;
    }

    if (!settingsQuery.data?.hasApiKey && !form.apiKey.trim()) {
      toast.error("API Key wajib diisi.");
      return;
    }

    if (!settingsQuery.data?.hasPrivateKey && !form.privateKey.trim()) {
      toast.error("Private Key wajib diisi.");
      return;
    }

    updateSettings.mutate({
      merchantCode: form.merchantCode.trim(),
      apiKey: form.apiKey.trim() || undefined,
      privateKey: form.privateKey.trim() || undefined,
      mode: form.mode,
      callbackUrl: emptyToNull(form.callbackUrl),
      returnUrl: emptyToNull(form.returnUrl),
      isActive: form.isActive,
    });
  }

  const isSaving = updateSettings.isPending;

  if (settingsQuery.isLoading) {
    return (
      <div className="flex flex-col gap-y-4 pt-2.5">
        <PageNav sticky>
          <PageHeader
            breadcrumbs={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Bisnis", href: "/dashboard" },
              { label: "Payment Gateway", icon: <Wallet /> },
            ]}
            title="Payment Gateway"
            description="Kelola kredensial Tripay untuk menerima pembayaran online."
          />
        </PageNav>
        <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-slate-200 bg-white mx-4 lg:mx-6 shadow-sm">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <Loader2 className="size-7 animate-spin" />
            <p className="text-[13px] font-black">Memuat pengaturan…</p>
          </div>
        </div>
      </div>
    );
  }

  if (settingsQuery.isError) {
    return (
      <div className="flex flex-col gap-y-4 pt-2.5">
        <PageNav sticky>
          <PageHeader
            breadcrumbs={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Bisnis", href: "/dashboard" },
              { label: "Payment Gateway", icon: <Wallet /> },
            ]}
            title="Payment Gateway"
            description="Kelola kredensial Tripay untuk menerima pembayaran online."
          />
        </PageNav>
        <div className="mx-4 lg:mx-6 flex min-h-[420px] flex-col items-center justify-center gap-4 rounded-3xl border border-red-200 bg-red-50">
          <div className="flex size-14 items-center justify-center rounded-3xl bg-red-100">
            <AlertCircle className="size-7 text-red-500" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-black text-red-700">Gagal memuat pengaturan</p>
            <p className="mt-1 max-w-md text-[12px] font-medium text-red-500">
              {settingsQuery.error.message}
            </p>
          </div>
          <button
            type="button"
            onClick={() => settingsQuery.refetch()}
            className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-2.5 text-[13px] font-black text-white transition-colors hover:bg-red-700"
          >
            <RefreshCcw className="size-4" />
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-4 pt-2.5">
      <PageNav sticky>
        <PageHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Bisnis", href: "/dashboard" },
            { label: "Payment Gateway", icon: <Wallet /> },
          ]}
          title="Payment Gateway"
          description="Kelola kredensial Tripay untuk menerima pembayaran online. Hanya Super Admin yang dapat mengubah halaman ini."
        />
      </PageNav>

      <div className="flex flex-col gap-4 px-4 pb-10 lg:px-6">
        {/* Status bar */}
        <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-2xl transition-colors",
                form.isActive ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500",
              )}
            >
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[13.5px] font-black text-slate-900">Tripay</p>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10.5px] font-black",
                    form.isActive
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-500",
                  )}
                >
                  {form.isActive ? "Aktif" : "Nonaktif"}
                </span>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10.5px] font-black text-amber-700 uppercase">
                  {form.mode}
                </span>
              </div>
              <p className="text-[11.5px] text-slate-500">
                Saat aktif, checkout program baru akan diproses lewat Tripay.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => set("isActive", !form.isActive)}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-[12.5px] font-black transition-colors",
              form.isActive
                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200",
            )}
          >
            <CheckCircle2 className="size-3.5" />
            {form.isActive ? "Nonaktifkan" : "Aktifkan"}
          </button>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex flex-col gap-4">
            <Section
              icon={KeyRound}
              title="Kredensial Tripay"
              description="Didapat dari dashboard merchant Tripay (Menu > Merchant Information / API Configuration)."
            >
              <Field label="Merchant Code">
                <TextInput
                  value={form.merchantCode}
                  onChange={(v) => set("merchantCode", v)}
                  placeholder="T11714"
                />
              </Field>

              <Field
                label="API Key"
                description={
                  settingsQuery.data?.hasApiKey
                    ? "Sudah tersimpan. Isi hanya jika ingin menggantinya."
                    : "Belum diisi."
                }
              >
                <SecretInput
                  value={form.apiKey}
                  onChange={(v) => set("apiKey", v)}
                  placeholder={settingsQuery.data?.hasApiKey ? "••••••••••••" : "API Key"}
                />
              </Field>

              <Field
                label="Private Key"
                description={
                  settingsQuery.data?.hasPrivateKey
                    ? "Sudah tersimpan. Isi hanya jika ingin menggantinya."
                    : "Belum diisi."
                }
              >
                <SecretInput
                  value={form.privateKey}
                  onChange={(v) => set("privateKey", v)}
                  placeholder={settingsQuery.data?.hasPrivateKey ? "••••••••••••" : "Private Key"}
                />
              </Field>

              <Field label="Mode">
                <div className="flex gap-2">
                  {(["sandbox", "production"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => set("mode", m)}
                      className={cn(
                        "flex-1 rounded-xl border px-3 py-2.5 text-[12.5px] font-black capitalize transition-colors",
                        form.mode === m
                          ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50",
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </Field>
            </Section>

            <Section
              icon={Webhook}
              title="Callback & Redirect"
              description="URL yang dikirim ke Tripay saat membuat transaksi."
            >
              <Field
                label="Callback URL"
                description="URL webhook Tripay. Daftarkan URL yang sama di dashboard merchant Tripay."
              >
                <TextInput
                  value={form.callbackUrl}
                  onChange={(v) => set("callbackUrl", v)}
                  placeholder="https://domainmu.com/api/payments/tripay/callback"
                />
              </Field>

              <Field label="Return URL" description="Tempat user diarahkan setelah membayar.">
                <TextInput
                  value={form.returnUrl}
                  onChange={(v) => set("returnUrl", v)}
                  placeholder="https://domainmu.com/registrasi/sukses"
                />
              </Field>
            </Section>
          </div>

          <aside className="space-y-4">
            <div className="sticky top-20 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSave}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 text-[13.5px] font-black text-white transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Menyimpan…
                  </>
                ) : (
                  <>
                    <Save className="size-4" />
                    Simpan Perubahan
                  </>
                )}
              </button>
              <p className="mt-3 text-center text-[11px] text-slate-400">
                API Key dan Private Key dienkripsi sebelum disimpan ke database.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

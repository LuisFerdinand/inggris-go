// app/(dashboard)/dashboard/programs/[programId]/_modules/tabs/RegistrationMethodCard.tsx
"use client";

import { useEffect, useState } from "react";
import { ExternalLink, FileText, Link2, Loader2, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/config";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { normalizeWhatsappNumber } from "@/lib/whatsapp";
import type { RegistrationMethod } from "@/app/db/schema/programs";

import type { DetailData } from "./detail";

const METHODS: {
  value: RegistrationMethod;
  title: string;
  desc: string;
  icon: typeof FileText;
}[] = [
  {
    value: "form",
    title: "Formulir Website",
    desc: "Peserta mengisi formulir lalu membuat akun & pesanan di website.",
    icon: FileText,
  },
  {
    value: "whatsapp",
    title: "Formulir → WhatsApp",
    desc: "Peserta mengisi formulir singkat, pesan otomatis terkirim ke WhatsApp admin.",
    icon: MessageCircle,
  },
  {
    value: "link",
    title: "Link Eksternal",
    desc: "Arahkan ke Google Form, website lain, atau halaman pendaftaran khusus.",
    icon: Link2,
  },
];

const LINK_PRESETS = [
  { label: "Daftar Sekarang", hint: "Umum" },
  { label: "Isi Google Form", hint: "Google Form" },
  { label: "Daftar Online", hint: "Website lain" },
];

type Props = {
  programId: string;
  data: DetailData;
};

export function RegistrationMethodCard({ programId, data }: Props) {
  const utils = trpc.useUtils();

  const savedMethod = (data.registrationMethod ?? "form") as RegistrationMethod;
  const savedWhatsapp = data.registrationWhatsapp ?? "";
  const savedLinkUrl = data.registrationLinkUrl ?? "";
  const savedLinkLabel = data.registrationLinkLabel ?? "";

  const [method, setMethod] = useState<RegistrationMethod>(savedMethod);
  const [whatsapp, setWhatsapp] = useState(savedWhatsapp);
  const [linkUrl, setLinkUrl] = useState(savedLinkUrl);
  const [linkLabel, setLinkLabel] = useState(savedLinkLabel);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Re-sync when the saved values change (after save / refetch).
  useEffect(() => {
    setMethod(savedMethod);
    setWhatsapp(savedWhatsapp);
    setLinkUrl(savedLinkUrl);
    setLinkLabel(savedLinkLabel);
    setErrors({});
  }, [savedMethod, savedWhatsapp, savedLinkUrl, savedLinkLabel]);

  const mutation = trpc.programs.updateRegistration.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.programs.getDetail.invalidate({ id: programId }),
        utils.programs.getFiltered.invalidate(),
      ]);
      toast.success("Cara pendaftaran disimpan");
    },
    onError: (err) => {
      const fieldErrors = (err.data as any)?.zodError?.fieldErrors as
        | Record<string, string[] | undefined>
        | undefined;
      if (fieldErrors) {
        const next: Record<string, string> = {};
        for (const [key, msgs] of Object.entries(fieldErrors)) {
          if (msgs?.[0]) next[key] = msgs[0];
        }
        if (Object.keys(next).length) {
          setErrors(next);
          toast.error("Periksa kembali isian yang ditandai");
          return;
        }
      }
      toast.error(err.message ?? "Gagal menyimpan cara pendaftaran");
    },
  });

  const dirty =
    method !== savedMethod ||
    (method === "whatsapp" && whatsapp.trim() !== savedWhatsapp) ||
    (method === "link" &&
      (linkUrl.trim() !== savedLinkUrl || linkLabel.trim() !== savedLinkLabel));

  function validate() {
    const next: Record<string, string> = {};
    if (method === "whatsapp" && whatsapp.trim()) {
      if (!normalizeWhatsappNumber(whatsapp)) {
        next.registrationWhatsapp = "Nomor tidak valid. Contoh: 0813 5311 6000";
      }
    }
    if (method === "link") {
      let ok = false;
      try {
        const u = new URL(linkUrl.trim());
        ok = u.protocol === "https:" || u.protocol === "http:";
      } catch {
        ok = false;
      }
      if (!ok) next.registrationLinkUrl = "Isi link lengkap yang diawali https://";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function save() {
    if (!validate()) return;
    mutation.mutate({
      id: programId,
      registrationMethod: method,
      registrationWhatsapp: method === "whatsapp" ? whatsapp.trim() || null : null,
      registrationLinkUrl: method === "link" ? linkUrl.trim() : null,
      registrationLinkLabel: method === "link" ? linkLabel.trim() || null : null,
    });
  }

  const effectiveWhatsapp =
    normalizeWhatsappNumber(whatsapp) ?? siteConfig.whatsapp;

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-neutral-100 bg-neutral-50/40 px-5 py-4">
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600 shadow-sm">
          <FileText className="size-4" />
        </div>
        <div className="min-w-0">
          <h3 className="text-[13px] font-bold tracking-tight text-neutral-800">
            Cara Pendaftaran
          </h3>
          <p className="mt-0.5 text-[12px] leading-relaxed text-neutral-400">
            Pilih ke mana tombol “Daftar” di halaman program mengarah.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-5">
        <div className="grid gap-2 sm:grid-cols-3">
          {METHODS.map((m) => {
            const active = method === m.value;
            const Icon = m.icon;
            return (
              <button
                key={m.value}
                type="button"
                onClick={() => {
                  setMethod(m.value);
                  setErrors({});
                }}
                className={cn(
                  "flex flex-col items-start gap-1.5 rounded-xl border px-3.5 py-3 text-left transition",
                  active
                    ? "border-blue-300 bg-blue-50 ring-1 ring-blue-200"
                    : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50",
                )}
              >
                <span
                  className={cn(
                    "flex items-center gap-1.5 text-[12.5px] font-semibold",
                    active ? "text-blue-700" : "text-neutral-700",
                  )}
                >
                  <Icon className="size-3.5" />
                  {m.title}
                </span>
                <span className="text-[11.5px] leading-snug text-neutral-500">
                  {m.desc}
                </span>
              </button>
            );
          })}
        </div>

        {method === "whatsapp" && (
          <div className="flex flex-col gap-2 rounded-xl border border-neutral-200 bg-neutral-50/60 p-4">
            <label className="text-[12px] font-semibold text-neutral-700">
              Nomor WhatsApp tujuan
            </label>
            <input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="0813 5311 6000"
              inputMode="tel"
              className="h-10 rounded-lg border border-neutral-200 bg-white px-3 text-[13px] outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
            {errors.registrationWhatsapp ? (
              <p className="text-[11.5px] text-red-600">
                {errors.registrationWhatsapp}
              </p>
            ) : (
              <p className="text-[11.5px] leading-relaxed text-neutral-500">
                {whatsapp.trim()
                  ? `Pesan akan dikirim ke wa.me/${effectiveWhatsapp}.`
                  : `Dikosongkan = memakai nomor admin utama (${siteConfig.whatsapp}). Isi jika program ini punya admin WhatsApp sendiri.`}
              </p>
            )}
          </div>
        )}

        {method === "link" && (
          <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-neutral-50/60 p-4">
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-semibold text-neutral-700">
                Link tujuan
              </label>
              <input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://forms.gle/xxxx atau https://situs-lain.com"
                inputMode="url"
                className="h-10 rounded-lg border border-neutral-200 bg-white px-3 text-[13px] outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
              {errors.registrationLinkUrl && (
                <p className="text-[11.5px] text-red-600">
                  {errors.registrationLinkUrl}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-semibold text-neutral-700">
                Teks tombol
              </label>
              <input
                value={linkLabel}
                onChange={(e) => setLinkLabel(e.target.value)}
                placeholder="Daftar Sekarang"
                maxLength={60}
                className="h-10 rounded-lg border border-neutral-200 bg-white px-3 text-[13px] outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
              <div className="flex flex-wrap gap-1.5">
                {LINK_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setLinkLabel(p.label)}
                    className="rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-medium text-neutral-600 transition hover:border-blue-300 hover:text-blue-700"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {linkUrl.trim() && !errors.registrationLinkUrl && (
              <a
                href={linkUrl.trim()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-1.5 text-[11.5px] font-medium text-blue-600 hover:underline"
              >
                <ExternalLink className="size-3" />
                Coba buka link
              </a>
            )}
          </div>
        )}

        {method === "form" && (
          <p className="rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-2.5 text-[12px] leading-relaxed text-blue-700">
            Peserta mengisi formulir di website, lalu pesanan masuk otomatis ke
            tab Pendaftar.
          </p>
        )}

        <div className="flex items-center justify-end gap-2">
          {dirty && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setMethod(savedMethod);
                setWhatsapp(savedWhatsapp);
                setLinkUrl(savedLinkUrl);
                setLinkLabel(savedLinkLabel);
                setErrors({});
              }}
              disabled={mutation.isPending}
            >
              Batalkan
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            onClick={save}
            disabled={!dirty || mutation.isPending}
          >
            {mutation.isPending && (
              <Loader2 className="mr-1.5 size-3.5 animate-spin" />
            )}
            Simpan
          </Button>
        </div>
      </div>
    </div>
  );
}

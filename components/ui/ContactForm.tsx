"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { buildWhatsAppUrl } from "@/lib/config";

type FormValues = {
  name: string;
  email: string;
  phone: string;
  program: string;
  message: string;
};

const programs = [
  "Speaking Challenge",
  "GoPrivate / Online Class",
  "VIP English Camp for Kids",
  "English Camp for Schools",
  "Belum tahu, ingin konsultasi",
];

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    // Build WA message from form data
    const msg = encodeURIComponent(
      `Halo Inggris Go! 👋\n\nSaya ingin bertanya tentang program Anda.\n\n` +
        `*Nama:* ${data.name}\n` +
        `*Email:* ${data.email}\n` +
        `*No. HP:* ${data.phone || "-"}\n` +
        `*Program:* ${data.program}\n\n` +
        `*Pesan:*\n${data.message}`,
    );
    const waUrl = `https://wa.me/6281234567890?text=${msg}`;

    // Small artificial delay for UX
    await new Promise((r) => setTimeout(r, 600));

    setSubmitted(true);
    reset();

    // Open WA in new tab
    window.open(waUrl, "_blank");
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-green-100 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="font-display font-700 text-brand-navy text-2xl mb-3">
          Pesan Terkirim!
        </h3>
        <p className="text-brand-charcoal/60 mb-6 max-w-sm mx-auto">
          Kami telah membuka WhatsApp untuk kamu. Admin kami akan membalas
          sesegera mungkin!
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="btn-outline px-6 py-2.5 text-sm"
        >
          Kirim Pesan Lain
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* Name */}
      <div>
        <label className="form-label" htmlFor="name">
          Nama Lengkap <span className="text-brand-orange">*</span>
        </label>
        <input
          id="name"
          type="text"
          placeholder="Contoh: Rina Amelia"
          className={`form-input ${errors.name ? "border-red-400 focus:border-red-400" : ""}`}
          {...register("name", {
            required: "Nama lengkap wajib diisi",
            minLength: { value: 2, message: "Nama minimal 2 karakter" },
          })}
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1.5">{errors.name.message}</p>
        )}
      </div>

      {/* Email + Phone row */}
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="form-label" htmlFor="email">
            Email <span className="text-brand-orange">*</span>
          </label>
          <input
            id="email"
            type="email"
            placeholder="nama@email.com"
            className={`form-input ${errors.email ? "border-red-400" : ""}`}
            {...register("email", {
              required: "Email wajib diisi",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Format email tidak valid",
              },
            })}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1.5">
              {errors.email.message}
            </p>
          )}
        </div>
        <div>
          <label className="form-label" htmlFor="phone">
            No. WhatsApp
          </label>
          <input
            id="phone"
            type="tel"
            placeholder="08xx-xxxx-xxxx"
            className="form-input"
            {...register("phone")}
          />
        </div>
      </div>

      {/* Program select */}
      <div>
        <label className="form-label" htmlFor="program">
          Program yang Diminati <span className="text-brand-orange">*</span>
        </label>
        <select
          id="program"
          className={`form-input appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")] bg-no-repeat bg-[right_1rem_center] bg-[length:1.25rem] pr-10 ${errors.program ? "border-red-400" : ""}`}
          {...register("program", { required: "Pilih program yang diminati" })}
          defaultValue=""
        >
          <option value="" disabled>
            -- Pilih Program --
          </option>
          {programs.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        {errors.program && (
          <p className="text-red-500 text-xs mt-1.5">
            {errors.program.message}
          </p>
        )}
      </div>

      {/* Message */}
      <div>
        <label className="form-label" htmlFor="message">
          Pesan / Pertanyaan <span className="text-brand-orange">*</span>
        </label>
        <textarea
          id="message"
          rows={4}
          placeholder="Tuliskan pertanyaan atau hal yang ingin kamu ketahui..."
          className={`form-input resize-none ${errors.message ? "border-red-400" : ""}`}
          {...register("message", {
            required: "Pesan wajib diisi",
            minLength: { value: 10, message: "Pesan minimal 10 karakter" },
          })}
        />
        {errors.message && (
          <p className="text-red-500 text-xs mt-1.5">
            {errors.message.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full justify-center px-8 py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <svg
              className="w-5 h-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Mengirim...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Kirim via WhatsApp
          </>
        )}
      </button>

      <p className="text-center text-brand-charcoal/40 text-xs">
        Formulir ini akan membuka WhatsApp dengan pesan yang sudah terisi
        otomatis.
      </p>
    </form>
  );
}

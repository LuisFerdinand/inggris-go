"use client";

import React, { useState, useCallback, useRef } from "react";
import {
  Zap,
  Shield,
  Globe,
  Home,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Upload,
  X,
  AlertCircle,
  MessageCircle,
  Send,
  User,
  Users,
  Phone,
  Mail,
  MapPin,
  School,
  Calendar,
  Info,
  Shirt,
  Camera,
  Star,
  Check,
  Loader2,
} from "lucide-react";

interface FormData {
  batch: string;
  batchLabel: string;
  // Child
  nama: string;
  panggilan: string;
  jenisKelamin: "L" | "P" | "";
  tempatLahir: string;
  tanggalLahir: string;
  usia: string;
  kelas: string;
  sekolah: string;
  kotaAsal: string;
  // Parent
  namaOrtu: string;
  hpOrtu: string;
  hpAnak: string;
  email: string;
  // Extra
  alumni: "yes" | "no" | "";
  sumberInfo: string;
  alergi: "yes" | "no" | "";
  detailAlergi: string;
  catatan: string;
  harapan: string;
  // Upload
  ukuranKaos: string;
  fotoFile: File | null;
  fotoPreview: string;
}

type StepId = 0 | 1 | 2 | 3 | 4 | 5;

// ─── Constants ───────────────────────────────────────────────────────────────

const PRIMARY = "#4da3ff";
const PRIMARY_DARK = "#2186f0";
const NAVY = "#0a2d87";

const BATCHES = [
  {
    id: "batch-june-1",
    dur: "Program 1 Minggu",
    date: "21 – 28 Juni 2026",
    rec: false,
  },
  {
    id: "batch-june-2",
    dur: "Program 1 Minggu",
    date: "28 Juni – 5 Juli 2026",
    rec: false,
  },
  {
    id: "batch-june-full",
    dur: "Program 2 Minggu",
    date: "21 Juni – 5 Juli 2026",
    rec: true,
  },
];

const SHIRT_SIZES = [
  { val: "S", hint: "SD kls 1–2", ld: "74 cm", pj: "58 cm" },
  { val: "M", hint: "SD kls 3–4", ld: "80 cm", pj: "63 cm" },
  { val: "L", hint: "SD kls 5–6", ld: "86 cm", pj: "67 cm" },
  { val: "XL", hint: "SMP kls 7–8", ld: "92 cm", pj: "71 cm" },
  { val: "XXL", hint: "SMP kls 9+", ld: "98 cm", pj: "75 cm" },
  { val: "XXXL", hint: "Besar", ld: "104 cm", pj: "79 cm" },
];

const STEP_LABELS = [
  "Program",
  "Data Anak",
  "Orang Tua",
  "Tambahan",
  "Kaos & Foto",
  "Konfirmasi",
];
const STEP_PROGRESS = [8, 24, 42, 60, 78, 95];

const INITIAL: FormData = {
  batch: "",
  batchLabel: "",
  nama: "",
  panggilan: "",
  jenisKelamin: "",
  tempatLahir: "",
  tanggalLahir: "",
  usia: "",
  kelas: "",
  sekolah: "",
  kotaAsal: "",
  namaOrtu: "",
  hpOrtu: "",
  hpAnak: "",
  email: "",
  alumni: "",
  sumberInfo: "",
  alergi: "",
  detailAlergi: "",
  catatan: "",
  harapan: "",
  ukuranKaos: "",
  fotoFile: null,
  fotoPreview: "",
};

function isEmail(v: string) {
  return /^[^@]+@[^@]+\.[^@]+$/.test(v);
}

// ─── Sub-components ──────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}
function Field({ label, required, optional, error, children }: FieldProps) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label
        style={{
          display: "block",
          fontSize: 13,
          fontWeight: 700,
          color: NAVY,
          marginBottom: 6,
        }}
      >
        {label}
        {required && <span style={{ color: PRIMARY, marginLeft: 2 }}>*</span>}
        {optional && (
          <span
            style={{
              color: "#7a90b8",
              fontWeight: 400,
              fontSize: 11,
              marginLeft: 6,
            }}
          >
            (opsional)
          </span>
        )}
      </label>
      {children}
      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            marginTop: 5,
            color: "#dc2626",
            fontSize: 11.5,
          }}
        >
          <AlertCircle size={12} />
          {error}
        </div>
      )}
    </div>
  );
}

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}
function TextInput({ hasError, style, ...props }: TextInputProps) {
  return (
    <input
      {...props}
      style={{
        width: "100%",
        padding: "11px 14px",
        border: `1.5px solid ${hasError ? "#dc2626" : "#dbe7fb"}`,
        borderRadius: 12,
        fontSize: 14.5,
        color: "#0f172a",
        background: "#fff",
        outline: "none",
        fontFamily: "inherit",
        transition: "border-color .2s, box-shadow .2s",
        ...style,
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = PRIMARY;
        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(77,163,255,.12)";
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = hasError ? "#dc2626" : "#dbe7fb";
        e.currentTarget.style.boxShadow = "none";
      }}
    />
  );
}

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
}
function SelectInput({ hasError, children, ...props }: SelectInputProps) {
  return (
    <select
      {...props}
      style={{
        width: "100%",
        padding: "11px 14px",
        border: `1.5px solid ${hasError ? "#dc2626" : "#dbe7fb"}`,
        borderRadius: 12,
        fontSize: 14.5,
        color: "#0f172a",
        background: "#fff",
        outline: "none",
        fontFamily: "inherit",
        cursor: "pointer",
      }}
    >
      {children}
    </select>
  );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}
function TextArea({ hasError, ...props }: TextAreaProps) {
  return (
    <textarea
      {...props}
      style={{
        width: "100%",
        padding: "11px 14px",
        minHeight: 88,
        resize: "vertical",
        border: `1.5px solid ${hasError ? "#dc2626" : "#dbe7fb"}`,
        borderRadius: 12,
        fontSize: 14.5,
        color: "#0f172a",
        background: "#fff",
        outline: "none",
        fontFamily: "inherit",
      }}
    />
  );
}

interface RadioCardProps {
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}
function RadioCard({ name, value, label, checked, onChange }: RadioCardProps) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 16px",
        border: `1.5px solid ${checked ? PRIMARY : "#dbe7fb"}`,
        borderRadius: 12,
        fontSize: 13.5,
        fontWeight: 600,
        cursor: "pointer",
        color: checked ? PRIMARY_DARK : "#3a5080",
        background: checked ? "rgba(77,163,255,.08)" : "#fff",
        transition: "all .2s",
        flex: 1,
      }}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        style={{ display: "none" }}
      />
      <div
        style={{
          width: 16,
          height: 16,
          borderRadius: "50%",
          border: `2px solid ${checked ? PRIMARY : "#c2d3f2"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {checked && (
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: PRIMARY,
            }}
          />
        )}
      </div>
      {label}
    </label>
  );
}

interface YNProps {
  name: string;
  value: "yes" | "no" | "";
  onChange: (v: "yes" | "no") => void;
  yesLabel?: string;
  noLabel?: string;
}
function YNGroup({
  name,
  value,
  onChange,
  yesLabel = "Ya",
  noLabel = "Tidak",
}: YNProps) {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      {(["yes", "no"] as const).map((opt) => (
        <label
          key={opt}
          style={{
            padding: "9px 24px",
            border: `1.5px solid ${value === opt ? (opt === "yes" ? "#16a34a" : PRIMARY) : "#dbe7fb"}`,
            borderRadius: 10,
            fontSize: 13.5,
            fontWeight: 700,
            cursor: "pointer",
            color:
              value === opt
                ? opt === "yes"
                  ? "#15803d"
                  : PRIMARY_DARK
                : "#7a90b8",
            background:
              value === opt
                ? opt === "yes"
                  ? "rgba(22,163,74,.08)"
                  : "rgba(77,163,255,.08)"
                : "#fff",
            transition: "all .2s",
          }}
        >
          <input
            type="radio"
            name={name}
            value={opt}
            checked={value === opt}
            onChange={() => onChange(opt)}
            style={{ display: "none" }}
          />
          {opt === "yes" ? yesLabel : noLabel}
        </label>
      ))}
    </div>
  );
}

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "back" | "submit" | "wa";
  icon?: React.ReactNode;
}
function Btn({
  variant = "primary",
  icon,
  children,
  style,
  ...props
}: BtnProps) {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "12px 28px",
    borderRadius: 14,
    fontSize: 14.5,
    fontWeight: 800,
    border: "none",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all .25s",
  };
  const variants: Record<string, React.CSSProperties> = {
    primary: {
      background: PRIMARY,
      color: "#fff",
      boxShadow: "0 6px 24px rgba(77,163,255,.35)",
      flex: 1,
      maxWidth: 280,
      justifyContent: "center",
    },
    back: {
      background: "#f4f8ff",
      border: "1.5px solid #dbe7fb",
      color: "#7a90b8",
    },
    submit: {
      background: `linear-gradient(135deg,${PRIMARY},#1e6eee)`,
      color: "#fff",
      boxShadow: "0 8px 28px rgba(77,163,255,.4)",
      width: "100%",
      padding: "16px",
      fontSize: 16,
      borderRadius: 16,
    },
    wa: {
      background: "#fff",
      border: "1.5px solid #25d366",
      color: "#16a34a",
      width: "100%",
      padding: "13px",
      borderRadius: 14,
      fontSize: 14,
    },
  };
  return (
    <button {...props} style={{ ...base, ...variants[variant], ...style }}>
      {icon && icon}
      {children}
    </button>
  );
}

// ─── Step Components ──────────────────────────────────────────────────────────

interface StepProps {
  data: FormData;
  setData: React.Dispatch<React.SetStateAction<FormData>>;
  errors: Partial<Record<string, string>>;
  onNext: () => void;
  onBack: () => void;
}

function Step0Program({ data, setData, errors, onNext }: StepProps) {
  return (
    <div>
      <p
        style={{
          fontSize: 13.5,
          color: "#3a5080",
          marginBottom: 22,
          lineHeight: 1.65,
        }}
      >
        Pilih batch yang sesuai dengan rencana Anda. Program 2 minggu memberikan
        transformasi yang lebih mendalam.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {BATCHES.map((b, i) => (
          <label
            key={b.id}
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "16px 18px",
              border: `1.5px solid ${data.batch === b.id ? PRIMARY : "#dbe7fb"}`,
              borderRadius: 14,
              cursor: "pointer",
              background: data.batch === b.id ? "rgba(77,163,255,.07)" : "#fff",
              boxShadow:
                data.batch === b.id
                  ? "0 6px 24px rgba(77,163,255,.18)"
                  : "none",
              transition: "all .25s",
            }}
          >
            {b.rec && (
              <div
                style={{
                  position: "absolute",
                  top: -9,
                  right: 14,
                  background: `linear-gradient(90deg,${PRIMARY},#74c0fc)`,
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 800,
                  padding: "3px 10px",
                  borderRadius: 99,
                  letterSpacing: ".04em",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Star size={9} fill="#fff" /> Rekomendasi
              </div>
            )}
            <input
              type="radio"
              name="batch"
              value={b.id}
              checked={data.batch === b.id}
              onChange={() =>
                setData((d) => ({
                  ...d,
                  batch: b.id,
                  batchLabel: `${b.dur} (${b.date})`,
                }))
              }
              style={{ display: "none" }}
            />
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                border: `2px solid ${data.batch === b.id ? PRIMARY : "#c2d3f2"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {data.batch === b.id && (
                <div
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    background: PRIMARY,
                  }}
                />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: NAVY }}>
                {b.dur}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 13,
                  color: "#3a5080",
                  marginTop: 2,
                }}
              >
                <Calendar size={13} /> {b.date}
              </div>
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: b.rec ? PRIMARY_DARK : "#7a90b8",
                background: b.rec ? "rgba(77,163,255,.1)" : "#f4f8ff",
                border: `1px solid ${b.rec ? "rgba(77,163,255,.2)" : "#dbe7fb"}`,
                padding: "3px 10px",
                borderRadius: 99,
              }}
            >
              {b.rec ? "Terbaik" : "Tersedia"}
            </span>
          </label>
        ))}
      </div>
      {errors.batch && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            marginTop: 8,
            color: "#dc2626",
            fontSize: 11.5,
          }}
        >
          <AlertCircle size={12} /> {errors.batch}
        </div>
      )}
      <NavRow onNext={onNext} nextLabel="Lanjut — Data Anak" />
    </div>
  );
}

function Step1DataAnak({ data, setData, errors, onNext, onBack }: StepProps) {
  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setData((d) => ({ ...d, [k]: e.target.value }));
  return (
    <div>
      <p
        style={{
          fontSize: 13.5,
          color: "#3a5080",
          marginBottom: 22,
          lineHeight: 1.65,
        }}
      >
        Isi data anak Anda dengan lengkap dan benar sesuai dengan dokumen resmi.
      </p>
      <Field label="Nama Siswa" required error={errors.nama}>
        <div style={{ position: "relative" }}>
          <User
            size={15}
            style={{
              position: "absolute",
              left: 13,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#7a90b8",
            }}
          />
          <TextInput
            hasError={!!errors.nama}
            placeholder="Nama lengkap anak"
            value={data.nama}
            onChange={set("nama")}
            style={{ paddingLeft: 36 }}
          />
        </div>
      </Field>
      <Field label="Nama Panggilan" required error={errors.panggilan}>
        <TextInput
          hasError={!!errors.panggilan}
          placeholder="Nama yang biasa dipanggil"
          value={data.panggilan}
          onChange={set("panggilan")}
        />
      </Field>
      <Field label="Jenis Kelamin" required error={errors.jenisKelamin}>
        <div style={{ display: "flex", gap: 10 }}>
          <RadioCard
            name="jk"
            value="L"
            label="Laki-laki"
            checked={data.jenisKelamin === "L"}
            onChange={() => setData((d) => ({ ...d, jenisKelamin: "L" }))}
          />
          <RadioCard
            name="jk"
            value="P"
            label="Perempuan"
            checked={data.jenisKelamin === "P"}
            onChange={() => setData((d) => ({ ...d, jenisKelamin: "P" }))}
          />
        </div>
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="Tempat Lahir" required error={errors.tempatLahir}>
          <div style={{ position: "relative" }}>
            <MapPin
              size={14}
              style={{
                position: "absolute",
                left: 13,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#7a90b8",
              }}
            />
            <TextInput
              hasError={!!errors.tempatLahir}
              placeholder="Kota"
              value={data.tempatLahir}
              onChange={set("tempatLahir")}
              style={{ paddingLeft: 34 }}
            />
          </div>
        </Field>
        <Field label="Tanggal Lahir" required error={errors.tanggalLahir}>
          <TextInput
            hasError={!!errors.tanggalLahir}
            type="date"
            value={data.tanggalLahir}
            onChange={set("tanggalLahir")}
          />
        </Field>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="Usia" required error={errors.usia}>
          <TextInput
            hasError={!!errors.usia}
            placeholder="Contoh: 11 tahun"
            value={data.usia}
            onChange={set("usia")}
          />
        </Field>
        <Field label="Kelas" required error={errors.kelas}>
          <TextInput
            hasError={!!errors.kelas}
            placeholder="Contoh: 5 SD"
            value={data.kelas}
            onChange={set("kelas")}
          />
        </Field>
      </div>
      <Field label="Nama Sekolah" required error={errors.sekolah}>
        <div style={{ position: "relative" }}>
          <School
            size={14}
            style={{
              position: "absolute",
              left: 13,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#7a90b8",
            }}
          />
          <TextInput
            hasError={!!errors.sekolah}
            placeholder="Nama sekolah saat ini"
            value={data.sekolah}
            onChange={set("sekolah")}
            style={{ paddingLeft: 34 }}
          />
        </div>
      </Field>
      <Field label="Kota Asal" required error={errors.kotaAsal}>
        <div style={{ position: "relative" }}>
          <MapPin
            size={14}
            style={{
              position: "absolute",
              left: 13,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#7a90b8",
            }}
          />
          <TextInput
            hasError={!!errors.kotaAsal}
            placeholder="Kota tempat tinggal"
            value={data.kotaAsal}
            onChange={set("kotaAsal")}
            style={{ paddingLeft: 34 }}
          />
        </div>
      </Field>
      <NavRow
        onNext={onNext}
        onBack={onBack}
        nextLabel="Lanjut — Data Orang Tua"
      />
    </div>
  );
}

function Step2OrangTua({ data, setData, errors, onNext, onBack }: StepProps) {
  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setData((d) => ({ ...d, [k]: e.target.value }));
  return (
    <div>
      <p
        style={{
          fontSize: 13.5,
          color: "#3a5080",
          marginBottom: 22,
          lineHeight: 1.65,
        }}
      >
        Tim kami akan menghubungi nomor yang terdaftar untuk konfirmasi
        pendaftaran dalam 1x24 jam.
      </p>
      <Field label="Nama Orang Tua / Wali" required error={errors.namaOrtu}>
        <div style={{ position: "relative" }}>
          <Users
            size={14}
            style={{
              position: "absolute",
              left: 13,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#7a90b8",
            }}
          />
          <TextInput
            hasError={!!errors.namaOrtu}
            placeholder="Nama lengkap orang tua"
            value={data.namaOrtu}
            onChange={set("namaOrtu")}
            style={{ paddingLeft: 34 }}
          />
        </div>
      </Field>
      <Field label="Nomor HP Orang Tua" required error={errors.hpOrtu}>
        <div style={{ position: "relative" }}>
          <Phone
            size={14}
            style={{
              position: "absolute",
              left: 13,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#7a90b8",
            }}
          />
          <TextInput
            hasError={!!errors.hpOrtu}
            type="tel"
            placeholder="08xx-xxxx-xxxx"
            value={data.hpOrtu}
            onChange={set("hpOrtu")}
            style={{ paddingLeft: 34 }}
          />
        </div>
      </Field>
      <Field label="Nomor HP Anak" optional>
        <div style={{ position: "relative" }}>
          <Phone
            size={14}
            style={{
              position: "absolute",
              left: 13,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#7a90b8",
            }}
          />
          <TextInput
            type="tel"
            placeholder="Jika anak memiliki HP sendiri"
            value={data.hpAnak}
            onChange={set("hpAnak")}
            style={{ paddingLeft: 34 }}
          />
        </div>
      </Field>
      <Field label="Email" required error={errors.email}>
        <div style={{ position: "relative" }}>
          <Mail
            size={14}
            style={{
              position: "absolute",
              left: 13,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#7a90b8",
            }}
          />
          <TextInput
            hasError={!!errors.email}
            type="email"
            placeholder="email@gmail.com"
            value={data.email}
            onChange={set("email")}
            style={{ paddingLeft: 34 }}
          />
        </div>
      </Field>
      <NavRow
        onNext={onNext}
        onBack={onBack}
        nextLabel="Lanjut — Info Tambahan"
      />
    </div>
  );
}

function Step3Tambahan({ data, setData, errors, onNext, onBack }: StepProps) {
  return (
    <div>
      <p
        style={{
          fontSize: 13.5,
          color: "#3a5080",
          marginBottom: 22,
          lineHeight: 1.65,
        }}
      >
        Informasi ini membantu kami memberikan pelayanan terbaik yang aman dan
        nyaman untuk anak Anda.
      </p>
      <Field
        label="Apakah anak pernah ikut program InggrisGo sebelumnya?"
        required
        error={errors.alumni}
      >
        <YNGroup
          name="alumni"
          value={data.alumni}
          onChange={(v) => setData((d) => ({ ...d, alumni: v }))}
          yesLabel="Ya, Alumni"
          noLabel="Bukan Alumni"
        />
      </Field>
      <Field
        label="Darimana mengetahui program ini?"
        required
        error={errors.sumberInfo}
      >
        <SelectInput
          hasError={!!errors.sumberInfo}
          value={data.sumberInfo}
          onChange={(e) =>
            setData((d) => ({ ...d, sumberInfo: e.target.value }))
          }
        >
          <option value="">-- Pilih sumber informasi --</option>
          <option value="instagram">Instagram</option>
          <option value="tiktok">TikTok</option>
          <option value="facebook">Facebook</option>
          <option value="alumni">Rekomendasi Alumni</option>
          <option value="lainnya">Lainnya</option>
        </SelectInput>
      </Field>
      <Field
        label="Apakah anak memiliki alergi?"
        required
        error={errors.alergi}
      >
        <YNGroup
          name="alergi"
          value={data.alergi}
          onChange={(v) => setData((d) => ({ ...d, alergi: v }))}
          yesLabel="Ya, Ada Alergi"
          noLabel="Tidak Ada"
        />
        {data.alergi === "yes" && (
          <div style={{ marginTop: 10 }}>
            <TextArea
              placeholder="Jelaskan jenis alergi yang dimiliki anak..."
              value={data.detailAlergi}
              onChange={(e) =>
                setData((d) => ({ ...d, detailAlergi: e.target.value }))
              }
            />
          </div>
        )}
      </Field>
      <Field label="Catatan tentang anak" optional>
        <TextArea
          placeholder="Hal-hal penting yang perlu diketahui tim kami tentang anak Anda..."
          value={data.catatan}
          onChange={(e) => setData((d) => ({ ...d, catatan: e.target.value }))}
        />
      </Field>
      <Field label="Harapan Orang Tua" required error={errors.harapan}>
        <TextArea
          hasError={!!errors.harapan}
          placeholder="Apa yang Anda harapkan dari program ini untuk anak Anda?"
          value={data.harapan}
          onChange={(e) => setData((d) => ({ ...d, harapan: e.target.value }))}
        />
      </Field>
      <NavRow
        onNext={onNext}
        onBack={onBack}
        nextLabel="Lanjut — Kaos & Foto"
      />
    </div>
  );
}

function Step4KaosPhoto({ data, setData, errors, onNext, onBack }: StepProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) =>
        setData((d) => ({
          ...d,
          fotoFile: file,
          fotoPreview: e.target?.result as string,
        }));
      reader.readAsDataURL(file);
    },
    [setData],
  );

  return (
    <div>
      <p
        style={{
          fontSize: 13.5,
          color: "#3a5080",
          marginBottom: 22,
          lineHeight: 1.65,
        }}
      >
        Pastikan ukuran kaos sesuai postur anak. Foto name tag harus menampilkan
        wajah jelas dengan latar polos.
      </p>

      {/* Shirt Size */}
      <Field label="Ukuran Kaos" required error={errors.ukuranKaos}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 8,
          }}
        >
          {SHIRT_SIZES.map((s) => (
            <label
              key={s.val}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                padding: "12px 8px",
                border: `1.5px solid ${data.ukuranKaos === s.val ? PRIMARY : "#dbe7fb"}`,
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 800,
                color: data.ukuranKaos === s.val ? PRIMARY_DARK : "#3a5080",
                background:
                  data.ukuranKaos === s.val ? "rgba(77,163,255,.08)" : "#fff",
                cursor: "pointer",
                transition: "all .2s",
              }}
            >
              <input
                type="radio"
                name="kaos"
                value={s.val}
                checked={data.ukuranKaos === s.val}
                onChange={() => setData((d) => ({ ...d, ukuranKaos: s.val }))}
                style={{ display: "none" }}
              />
              {s.val}
              <span style={{ fontSize: 10, fontWeight: 400, color: "#7a90b8" }}>
                {s.hint}
              </span>
            </label>
          ))}
        </div>
      </Field>

      {/* Size Chart */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 8,
            fontSize: 13,
            fontWeight: 700,
            color: NAVY,
          }}
        >
          <Info size={13} /> Panduan Ukuran
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 4,
            background: "#f4f8ff",
            padding: 10,
            borderRadius: 12,
            border: "1px solid #dbe7fb",
          }}
        >
          {["Ukuran", "Lingkar Dada", "Panjang"].map((h) => (
            <div
              key={h}
              style={{
                padding: "6px 4px",
                textAlign: "center",
                fontSize: 10.5,
                fontWeight: 800,
                color: PRIMARY_DARK,
                background: "rgba(77,163,255,.1)",
                borderRadius: 6,
              }}
            >
              {h}
            </div>
          ))}
          {SHIRT_SIZES.map((s) => [
            <div
              key={`${s.val}-v`}
              style={{
                padding: "6px 4px",
                textAlign: "center",
                fontSize: 11,
                fontWeight: 700,
                color: NAVY,
              }}
            >
              {s.val}
            </div>,
            <div
              key={`${s.val}-ld`}
              style={{
                padding: "6px 4px",
                textAlign: "center",
                fontSize: 11,
                color: "#3a5080",
              }}
            >
              {s.ld}
            </div>,
            <div
              key={`${s.val}-pj`}
              style={{
                padding: "6px 4px",
                textAlign: "center",
                fontSize: 11,
                color: "#3a5080",
              }}
            >
              {s.pj}
            </div>,
          ])}
        </div>
      </div>

      {/* Upload */}
      <Field label="Foto untuk Name Tag" required error={errors.fotoFile}>
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
          }}
          style={{
            border: `2px dashed ${dragging ? PRIMARY : data.fotoPreview ? "#16a34a" : "#dbe7fb"}`,
            borderRadius: 14,
            padding: "28px 20px",
            textAlign: "center",
            cursor: "pointer",
            background: dragging
              ? "rgba(77,163,255,.05)"
              : data.fotoPreview
                ? "rgba(22,163,74,.04)"
                : "#fafcff",
            transition: "all .2s",
            position: "relative",
          }}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) =>
              e.target.files?.[0] && handleFile(e.target.files[0])
            }
          />
          {data.fotoPreview ? (
            <div>
              <img
                src={data.fotoPreview}
                alt="Preview"
                style={{
                  maxHeight: 160,
                  maxWidth: "100%",
                  objectFit: "contain",
                  borderRadius: 10,
                  border: "1px solid #dbe7fb",
                }}
              />
              <div
                style={{
                  marginTop: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#16a34a",
                }}
              >
                <CheckCircle2 size={15} /> Foto berhasil diunggah — klik untuk
                mengganti
              </div>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: "rgba(77,163,255,.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Upload size={22} color={PRIMARY} />
                </div>
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: NAVY,
                  marginBottom: 4,
                }}
              >
                Seret foto ke sini atau klik untuk memilih
              </div>
              <div style={{ fontSize: 12, color: "#7a90b8" }}>
                Format JPG, PNG — Maks 5 MB — Wajah jelas, latar polos
              </div>
            </>
          )}
        </div>
      </Field>
      <NavRow onNext={onNext} onBack={onBack} nextLabel="Lihat Ringkasan" />
    </div>
  );
}

function Step5Konfirmasi({
  data,
  onBack,
  onSubmit,
  submitting,
}: {
  data: FormData;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  const jkLabel =
    data.jenisKelamin === "L"
      ? "Laki-laki"
      : data.jenisKelamin === "P"
        ? "Perempuan"
        : "—";
  const alergiLabel =
    data.alergi === "yes"
      ? `Ada${data.detailAlergi ? ` (${data.detailAlergi})` : ""}`
      : "Tidak ada";
  const alumni = data.alumni === "yes" ? "Alumni InggrisGo" : "Bukan Alumni";

  const sections = [
    {
      title: "Program Dipilih",
      rows: [["Batch", data.batchLabel || "—"]],
    },
    {
      title: "Data Anak",
      rows: [
        ["Nama", data.nama],
        ["Panggilan", data.panggilan],
        ["Jenis Kelamin", jkLabel],
        ["Tempat, Tgl Lahir", `${data.tempatLahir}, ${data.tanggalLahir}`],
        ["Kelas", `${data.usia} / ${data.kelas}`],
        ["Sekolah", data.sekolah],
        ["Kota Asal", data.kotaAsal],
      ],
    },
    {
      title: "Data Orang Tua",
      rows: [
        ["Nama", data.namaOrtu],
        ["No. HP", data.hpOrtu],
        ["Email", data.email],
      ],
    },
    {
      title: "Info Tambahan",
      rows: [
        ["Status Alumni", alumni],
        ["Alergi", alergiLabel],
        ["Ukuran Kaos", data.ukuranKaos || "—"],
      ],
    },
  ];

  const wa = () => {
    const msg = `Halo kak InggrisGo! Saya ingin mendaftarkan anak saya ke VIP Kids English Camp.\n\nNama anak: ${data.nama}\nBatch: ${data.batchLabel}\nNama Orang Tua: ${data.namaOrtu}\nNo. HP: ${data.hpOrtu}\n\nMohon informasinya, terima kasih.`;
    window.open(
      `https://wa.me/6281234567890?text=${encodeURIComponent(msg)}`,
      "_blank",
    );
  };

  return (
    <div>
      <p
        style={{
          fontSize: 13.5,
          color: "#3a5080",
          marginBottom: 22,
          lineHeight: 1.65,
        }}
      >
        Periksa kembali seluruh data sebelum mengirimkan formulir pendaftaran.
      </p>
      {sections.map((sec) => (
        <div key={sec.title} style={{ marginBottom: 20 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#7a90b8",
              letterSpacing: ".07em",
              textTransform: "uppercase",
              marginBottom: 10,
              paddingBottom: 8,
              borderBottom: "1px solid #dbe7fb",
            }}
          >
            {sec.title}
          </div>
          {sec.rows.map(([k, v]) => (
            <div
              key={k}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                padding: "8px 0",
                borderBottom: "1px solid #f4f8ff",
              }}
            >
              <span style={{ fontSize: 13, color: "#7a90b8" }}>{k}</span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: NAVY,
                  textAlign: "right",
                  maxWidth: "60%",
                }}
              >
                {v || "—"}
              </span>
            </div>
          ))}
        </div>
      ))}

      <button
        onClick={onSubmit}
        disabled={submitting}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          width: "100%",
          padding: "16px",
          borderRadius: 16,
          fontSize: 16,
          fontWeight: 800,
          border: "none",
          cursor: submitting ? "not-allowed" : "pointer",
          background: submitting
            ? "#b0cff5"
            : `linear-gradient(135deg,${PRIMARY},#1e6eee)`,
          color: "#fff",
          boxShadow: submitting ? "none" : "0 8px 28px rgba(77,163,255,.4)",
          fontFamily: "inherit",
          transition: "all .25s",
        }}
      >
        {submitting ? (
          <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
        ) : (
          <Send size={17} />
        )}
        {submitting ? "Mengirim..." : "Daftar Sekarang"}
      </button>

      <button
        onClick={wa}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          width: "100%",
          padding: "13px",
          borderRadius: 14,
          fontSize: 14,
          fontWeight: 700,
          border: "1.5px solid #25d366",
          background: "#fff",
          color: "#16a34a",
          cursor: "pointer",
          fontFamily: "inherit",
          marginTop: 10,
        }}
      >
        <MessageCircle size={16} /> Daftar via WhatsApp
      </button>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 7,
          marginTop: 14,
        }}
      >
        {[
          "Data Anda aman dan tidak dibagikan ke pihak ketiga",
          "Tim kami akan menghubungi Anda dalam 1×24 jam",
        ].map((t) => (
          <div
            key={t}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12.5,
              color: "#3a5080",
            }}
          >
            <Check size={13} color="#16a34a" strokeWidth={3} /> {t}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20 }}>
        <button
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#7a90b8",
            fontSize: 13.5,
            fontWeight: 700,
            fontFamily: "inherit",
          }}
        >
          <ChevronLeft size={16} /> Edit Data
        </button>
      </div>
    </div>
  );
}

// ─── Nav Row ──────────────────────────────────────────────────────────────────

function NavRow({
  onNext,
  onBack,
  nextLabel = "Lanjut",
}: {
  onNext: () => void;
  onBack?: () => void;
  nextLabel?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        marginTop: 28,
      }}
    >
      {onBack ? (
        <button
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "12px 20px",
            borderRadius: 14,
            fontSize: 14,
            fontWeight: 700,
            background: "#f4f8ff",
            border: "1.5px solid #dbe7fb",
            color: "#7a90b8",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <ChevronLeft size={16} /> Kembali
        </button>
      ) : (
        <div />
      )}
      <button
        onClick={onNext}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "12px 24px",
          borderRadius: 14,
          fontSize: 14.5,
          fontWeight: 800,
          background: PRIMARY,
          color: "#fff",
          border: "none",
          cursor: "pointer",
          fontFamily: "inherit",
          boxShadow: "0 6px 24px rgba(77,163,255,.35)",
          flex: 1,
          maxWidth: 280,
          justifyContent: "center",
        }}
      >
        {nextLabel} <ChevronRight size={16} />
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProgramRegisterPage() {
  const [step, setStep] = useState<StepId>(0);
  const [data, setData] = useState<FormData>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const validate = useCallback(
    (s: StepId): boolean => {
      const e: typeof errors = {};
      if (s === 0) {
        if (!data.batch) e.batch = "Silakan pilih salah satu program";
      }
      if (s === 1) {
        if (!data.nama) e.nama = "Nama siswa wajib diisi";
        if (!data.panggilan) e.panggilan = "Nama panggilan wajib diisi";
        if (!data.jenisKelamin) e.jenisKelamin = "Jenis kelamin wajib dipilih";
        if (!data.tempatLahir) e.tempatLahir = "Wajib diisi";
        if (!data.tanggalLahir) e.tanggalLahir = "Wajib diisi";
        if (!data.usia) e.usia = "Wajib diisi";
        if (!data.kelas) e.kelas = "Wajib diisi";
        if (!data.sekolah) e.sekolah = "Nama sekolah wajib diisi";
        if (!data.kotaAsal) e.kotaAsal = "Kota asal wajib diisi";
      }
      if (s === 2) {
        if (!data.namaOrtu) e.namaOrtu = "Nama orang tua wajib diisi";
        if (!data.hpOrtu) e.hpOrtu = "Nomor HP wajib diisi";
        if (!data.email || !isEmail(data.email)) e.email = "Email tidak valid";
      }
      if (s === 3) {
        if (!data.alumni) e.alumni = "Silakan pilih salah satu";
        if (!data.sumberInfo) e.sumberInfo = "Wajib dipilih";
        if (!data.alergi) e.alergi = "Silakan pilih salah satu";
        if (!data.harapan) e.harapan = "Harapan orang tua wajib diisi";
      }
      if (s === 4) {
        if (!data.ukuranKaos) e.ukuranKaos = "Pilih ukuran kaos";
        if (!data.fotoFile) e.fotoFile = "Foto name tag wajib diunggah";
      }
      setErrors(e);
      return Object.keys(e).length === 0;
    },
    [data],
  );

  const goNext = useCallback(() => {
    if (!validate(step)) return;
    setStep((s) => (s + 1) as StepId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step, validate]);

  const goBack = useCallback(() => {
    setStep((s) => (s - 1) as StepId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    try {
      await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          programSlug: "vip-kids",
          ...data,
          fotoFile: undefined,
        }),
      });
    } catch (_) {}
    setSubmitting(false);
    setSubmitted(true);
  }, [data]);

  const pct = STEP_PROGRESS[step];

  // Success screen
  if (submitted) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f4f8ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 24,
            padding: "48px 32px",
            maxWidth: 480,
            width: "100%",
            textAlign: "center",
            boxShadow: "0 16px 64px rgba(77,163,255,.12)",
            border: "1.5px solid #dbe7fb",
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(22,163,74,.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <CheckCircle2 size={40} color="#16a34a" />
          </div>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: NAVY,
              marginBottom: 8,
            }}
          >
            Pendaftaran Berhasil!
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "#3a5080",
              lineHeight: 1.7,
              marginBottom: 24,
            }}
          >
            Terima kasih, <strong>{data.namaOrtu}</strong>!<br />
            Tim InggrisGo akan menghubungi <strong>{data.hpOrtu}</strong> dalam
            1x24 jam untuk konfirmasi.
          </p>
          <button
            onClick={() =>
              window.open(
                `https://wa.me/6281234567890?text=${encodeURIComponent(`Halo kak! Saya sudah mendaftar VIP Kids (${data.batchLabel}) atas nama ${data.nama}. Mohon konfirmasinya.`)}`,
                "_blank",
              )
            }
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              width: "100%",
              padding: "14px",
              borderRadius: 14,
              fontSize: 15,
              fontWeight: 800,
              border: "1.5px solid #25d366",
              background: "#fff",
              color: "#16a34a",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <MessageCircle size={17} /> Konfirmasi via WhatsApp
          </button>
        </div>
      </div>
    );
  }

  const stepProps: StepProps = {
    data,
    setData,
    errors,
    onNext: goNext,
    onBack: goBack,
  };

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        * { box-sizing: border-box; }
      `}</style>

      {/* Sticky Banner */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "linear-gradient(90deg,#ff6b35,#ff8c42)",
          color: "#fff",
          textAlign: "center",
          padding: "9px 16px",
          fontSize: 12.5,
          fontWeight: 600,
          letterSpacing: ".02em",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        <Zap size={13} fill="#fff" />
        Kuota terbatas — pendaftaran bisa ditutup sewaktu-waktu
        <Zap size={13} fill="#fff" />
      </div>

      <div
        style={{ maxWidth: 980, margin: "0 auto", padding: "32px 16px 80px" }}
      >
        {/* Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 24,
            alignItems: "start",
            marginBottom: 36,
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(77,163,255,.08)",
                border: "1px solid rgba(77,163,255,.2)",
                color: PRIMARY_DARK,
                borderRadius: 99,
                padding: "4px 12px",
                fontSize: 12,
                fontWeight: 700,
                marginBottom: 12,
                letterSpacing: ".04em",
              }}
            >
              <Shield size={11} /> Pendaftaran Resmi
            </div>
            <h1
              style={{
                fontSize: "clamp(1.6rem,4vw,2.4rem)",
                fontWeight: 800,
                color: NAVY,
                lineHeight: 1.15,
                letterSpacing: "-.03em",
                marginBottom: 8,
              }}
            >
              Form Pendaftaran
              <br />
              English Camp
            </h1>
            <p
              style={{
                fontSize: 15,
                color: "#3a5080",
                lineHeight: 1.65,
                maxWidth: 440,
              }}
            >
              Halo Ayah Bunda! Silakan isi data berikut untuk proses pendaftaran
              anak Anda ke program VIP Kids InggrisGo.
            </p>
          </div>
          <div
            style={{
              background: "#fff",
              border: "1.5px solid #dbe7fb",
              borderRadius: 20,
              padding: "18px 20px",
              minWidth: 220,
              boxShadow: "0 8px 32px rgba(77,163,255,.08)",
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#7a90b8",
                letterSpacing: ".08em",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              Program
            </div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: NAVY,
                marginBottom: 14,
              }}
            >
              VIP Kids English Camp
            </div>
            {[
              { icon: <Home size={11} />, label: "Full Service Camp" },
              { icon: <Shield size={11} />, label: "Pendampingan 24 Jam" },
              { icon: <Globe size={11} />, label: "Lingkungan English" },
            ].map((p) => (
              <div
                key={p.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "rgba(77,163,255,.08)",
                  border: "1px solid rgba(77,163,255,.18)",
                  borderRadius: 8,
                  padding: "5px 10px",
                  fontSize: 12,
                  fontWeight: 600,
                  color: PRIMARY_DARK,
                  marginBottom: 5,
                }}
              >
                {p.icon} {p.label}
              </div>
            ))}
          </div>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 10,
              overflowX: "auto",
              paddingBottom: 4,
            }}
          >
            {STEP_LABELS.map((label, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  flex: 1,
                  minWidth: 56,
                  position: "relative",
                }}
              >
                {i < STEP_LABELS.length - 1 && (
                  <div
                    style={{
                      position: "absolute",
                      top: 16,
                      left: "50%",
                      width: "100%",
                      height: 2,
                      background: i < step ? PRIMARY : "#dbe7fb",
                      transition: "background .4s",
                      zIndex: 0,
                    }}
                  />
                )}
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    zIndex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 800,
                    transition: "all .35s",
                    background:
                      i < step ? "#16a34a" : i === step ? PRIMARY : "#f4f8ff",
                    border: `2px solid ${i < step ? "#16a34a" : i === step ? PRIMARY : "#dbe7fb"}`,
                    color: i <= step ? "#fff" : "#7a90b8",
                    boxShadow:
                      i === step ? "0 4px 16px rgba(77,163,255,.35)" : "none",
                  }}
                >
                  {i < step ? <Check size={14} strokeWidth={3} /> : i + 1}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: i <= step ? PRIMARY_DARK : "#7a90b8",
                    marginTop: 5,
                    textAlign: "center",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              height: 3,
              background: "#dbe7fb",
              borderRadius: 99,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${pct}%`,
                background: `linear-gradient(90deg,${PRIMARY},#74c0fc)`,
                borderRadius: 99,
                transition: "width .5s cubic-bezier(.22,1,.36,1)",
              }}
            />
          </div>
        </div>

        {/* Form Card */}
        <div
          style={{
            background: "#fff",
            border: "1.5px solid #dbe7fb",
            borderRadius: 20,
            padding: 28,
            boxShadow: "0 8px 40px rgba(77,163,255,.07)",
            animation: "slideIn .4s cubic-bezier(.22,1,.36,1)",
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: NAVY,
              marginBottom: 2,
            }}
          >
            {STEP_LABELS[step]}
          </div>

          {step === 0 && <Step0Program {...stepProps} />}
          {step === 1 && <Step1DataAnak {...stepProps} />}
          {step === 2 && <Step2OrangTua {...stepProps} />}
          {step === 3 && <Step3Tambahan {...stepProps} />}
          {step === 4 && <Step4KaosPhoto {...stepProps} />}
          {step === 5 && (
            <Step5Konfirmasi
              data={data}
              onBack={goBack}
              onSubmit={handleSubmit}
              submitting={submitting}
            />
          )}
        </div>
      </div>
    </>
  );
}

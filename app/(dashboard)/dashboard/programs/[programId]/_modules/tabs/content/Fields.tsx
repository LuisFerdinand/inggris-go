// app/(dashboard)/dashboard/programs/[programId]/_modules/tabs/content/Fields.tsx
"use client";

import React, { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  GripVertical,
  ImageIcon,
  Loader2,
  Plus,
  Trash2,
  Upload,
  ArrowUp,
  ArrowDown,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/Icon";
import { IconPicker } from "@/components/Form";
import { useCloudinaryUpload } from "@/lib/hooks/useCloudinaryUpload";

import { FieldWrap, inputCls, textareaCls } from "../detail";

import {
  type Field,
  type ArrayField,
  type ObjectField,
  defaultForFields,
} from "./field-schema";

/* ─────────────────────────────────────────────────────────────
   IMMUTABLE HELPERS
───────────────────────────────────────────────────────────── */

type Obj = Record<string, unknown>;

function setKey(obj: Obj, key: string, value: unknown): Obj {
  return { ...obj, [key]: value };
}

function moveInArray<T>(arr: T[], index: number, dir: "up" | "down"): T[] {
  const target = dir === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= arr.length) return arr;
  const next = [...arr];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

/* ─────────────────────────────────────────────────────────────
   LEAF CONTROLS
───────────────────────────────────────────────────────────── */

const ACCEPTED_IMAGE_TYPES = "image/*";
const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // keep in sync with /api/upload

function ImageField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const { upload, isUploading, progress, error, reset } = useCloudinaryUpload();
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined | null) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Ukuran gambar maksimal 10 MB");
      return;
    }

    const url = await upload(file);
    if (url) {
      onChange(url);
    } else if (error) {
      toast.error(error);
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    void handleFile(file);
    // allow re-selecting the same file later
    e.target.value = "";
  }

  function onDrop(e: React.DragEvent<HTMLButtonElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    void handleFile(file);
  }

  function onDragOver(e: React.DragEvent<HTMLButtonElement>) {
    e.preventDefault();
  }

  function clearImage() {
    reset();
    onChange("");
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-stretch gap-2">
        {/* Preview / drop target */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={onDragOver}
          disabled={isUploading}
          className={cn(
            "group relative size-[52px] flex-shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 transition-colors",
            "hover:border-blue-300 hover:bg-blue-50/40",
            isUploading && "cursor-wait",
          )}
          title={value ? "Ganti gambar" : "Unggah gambar"}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageIcon className="size-4 text-neutral-300 group-hover:text-blue-400" />
            </div>
          )}

          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Loader2 className="size-4 animate-spin text-white" />
            </div>
          )}

          {!isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity group-hover:bg-black/30 group-hover:opacity-100">
              <Upload className="size-3.5 text-white" />
            </div>
          )}
        </button>

        {/* URL input — still editable manually */}
        <div className="relative flex-1">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://… atau unggah gambar"
            className={cn(inputCls, "w-full pr-8")}
          />
          {value && !isUploading && (
            <button
              type="button"
              onClick={clearImage}
              className="absolute right-2 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
              title="Hapus gambar"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES}
          onChange={onInputChange}
          className="hidden"
        />
      </div>

      {/* Upload progress */}
      {isUploading && (
        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{ width: `${progress ?? 0}%` }}
            />
          </div>
          <span className="text-[11px] font-medium text-neutral-400">
            {progress ?? 0}%
          </span>
        </div>
      )}

      {/* Inline error (in addition to toast) */}
      {error && !isUploading && (
        <p className="text-[11px] font-medium text-red-500">{error}</p>
      )}
    </div>
  );
}

function LeafField({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  switch (field.type) {
    case "textarea":
      return (
        <textarea
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={textareaCls}
        />
      );

    case "number":
      return (
        <input
          type="number"
          value={value === undefined || value === null ? "" : (value as number)}
          onChange={(e) =>
            onChange(e.target.value === "" ? undefined : Number(e.target.value))
          }
          placeholder={field.placeholder}
          className={inputCls}
        />
      );

    case "switch":
      return (
        <div className="flex h-[44px] items-center">
          <Switch
            checked={!!value}
            onCheckedChange={(checked) => onChange(checked)}
          />
        </div>
      );

    case "icon":
      return (
        <div className="flex items-center gap-3">
          <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Icon name={(value as string) || ""} className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <IconPicker
              value={(value as string) || undefined}
              onChange={onChange}
              placeholder="Pilih icon"
            />
          </div>
        </div>
      );

    case "image":
      return (
        <ImageField value={(value as string) ?? ""} onChange={onChange} />
      );

    case "select":
      return (
        <select
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls}
        >
          <option value="">— pilih —</option>
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );

    default: // text
      return (
        <input
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={inputCls}
        />
      );
  }
}

/* ─────────────────────────────────────────────────────────────
   STRING ARRAY
───────────────────────────────────────────────────────────── */

function StringArrayEditor({
  noun,
  value,
  onChange,
}: {
  noun: string;
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const list = Array.isArray(value) ? value : [];

  return (
    <div className="flex flex-col gap-2">
      {list.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            value={item}
            onChange={(e) => {
              const next = [...list];
              next[i] = e.target.value;
              onChange(next);
            }}
            className={cn(inputCls, "flex-1")}
          />
          <button
            type="button"
            onClick={() => onChange(list.filter((_, idx) => idx !== i))}
            className="flex size-8 flex-shrink-0 items-center justify-center rounded-lg border border-neutral-200 text-neutral-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...list, ""])}
        className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-dashed border-neutral-300 px-3 py-1.5 text-[11px] font-semibold text-neutral-500 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
      >
        <Plus className="size-3.5" /> Tambah {noun}
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ARRAY OF OBJECTS
───────────────────────────────────────────────────────────── */

function ArrayObjectEditor({
  field,
  value,
  onChange,
}: {
  field: ArrayField;
  value: Obj[];
  onChange: (v: Obj[]) => void;
}) {
  const list = Array.isArray(value) ? value : [];
  const [open, setOpen] = useState<number | null>(list.length ? 0 : null);

  function update(i: number, next: Obj) {
    const arr = [...list];
    arr[i] = next;
    onChange(arr);
  }

  function add() {
    onChange([...list, defaultForFields(field.fields)]);
    setOpen(list.length);
  }

  return (
    <div className="flex flex-col gap-2.5">
      {list.map((item, i) => {
        const isOpen = open === i;
        const headerText =
          (field.titleKey && (item?.[field.titleKey] as string)) ||
          `${field.itemNoun} ${i + 1}`;

        return (
          <div
            key={i}
            className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50/40"
          >
            <div className="flex items-center gap-2 px-3 py-2">
              <GripVertical className="size-3.5 flex-shrink-0 text-neutral-300" />
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
              >
                <span className="flex size-5 flex-shrink-0 items-center justify-center rounded-md bg-neutral-200/70 text-[10px] font-bold text-neutral-500">
                  {i + 1}
                </span>
                <span className="truncate text-[12px] font-semibold text-neutral-700">
                  {headerText}
                </span>
                <ChevronDown
                  className={cn(
                    "size-3.5 flex-shrink-0 text-neutral-400 transition-transform",
                    isOpen && "rotate-180",
                  )}
                />
              </button>

              <div className="flex flex-shrink-0 items-center gap-1">
                <IconBtn
                  disabled={i === 0}
                  onClick={() => onChange(moveInArray(list, i, "up"))}
                >
                  <ArrowUp className="size-3.5" />
                </IconBtn>
                <IconBtn
                  disabled={i === list.length - 1}
                  onClick={() => onChange(moveInArray(list, i, "down"))}
                >
                  <ArrowDown className="size-3.5" />
                </IconBtn>
                <IconBtn
                  danger
                  onClick={() => {
                    onChange(list.filter((_, idx) => idx !== i));
                    setOpen(null);
                  }}
                >
                  <Trash2 className="size-3.5" />
                </IconBtn>
              </div>
            </div>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-neutral-200 bg-white px-3.5 py-4">
                    <Fields
                      fields={field.fields}
                      value={item ?? {}}
                      onChange={(next) => update(i, next)}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      <button
        type="button"
        onClick={add}
        className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-dashed border-neutral-300 px-3 py-2 text-[12px] font-semibold text-neutral-500 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
      >
        <Plus className="size-3.5" /> Tambah {field.itemNoun}
      </button>
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex size-7 items-center justify-center rounded-lg border border-neutral-200 text-neutral-400 transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        danger
          ? "hover:border-red-200 hover:bg-red-50 hover:text-red-500"
          : "hover:border-neutral-300 hover:bg-white hover:text-neutral-600",
      )}
    >
      {children}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
   OBJECT (nested) FIELD
───────────────────────────────────────────────────────────── */

function ObjectFieldEditor({
  field,
  value,
  onChange,
}: {
  field: ObjectField;
  value: Obj;
  onChange: (v: Obj) => void;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50/40 p-3.5">
      <Fields
        fields={field.fields}
        value={value ?? {}}
        onChange={onChange}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ROOT RENDERER
───────────────────────────────────────────────────────────── */

export function Fields({
  fields,
  value,
  onChange,
}: {
  fields: Field[];
  value: Obj;
  onChange: (v: Obj) => void;
}) {
  const v = value ?? {};

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {fields.map((field) => {
        const isFull =
          !field.half ||
          field.type === "array" ||
          field.type === "object" ||
          field.type === "stringArray" ||
          field.type === "textarea";

        const set = (next: unknown) => onChange(setKey(v, field.name, next));

        let control: React.ReactNode;
        if (field.type === "array") {
          control = (
            <ArrayObjectEditor
              field={field}
              value={(v[field.name] as Obj[]) ?? []}
              onChange={set}
            />
          );
        } else if (field.type === "stringArray") {
          control = (
            <StringArrayEditor
              noun={field.itemNoun}
              value={(v[field.name] as string[]) ?? []}
              onChange={set}
            />
          );
        } else if (field.type === "object") {
          control = (
            <ObjectFieldEditor
              field={field}
              value={(v[field.name] as Obj) ?? {}}
              onChange={set}
            />
          );
        } else {
          control = (
            <LeafField field={field} value={v[field.name]} onChange={set} />
          );
        }

        return (
          <FieldWrap
            key={field.name}
            label={field.label}
            hint={field.hint}
            className={cn(isFull && "sm:col-span-2")}
          >
            {control}
          </FieldWrap>
        );
      })}
    </div>
  );
}
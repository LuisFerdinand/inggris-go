"use client";

import { useEffect } from "react";

import { EditorContent, useEditor } from "@tiptap/react";

import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";

import { Menubar } from "./Menubar";

import { cn } from "@/lib/utils";
import { InputCounterFooter } from "../Form";

const MAX_LENGTH = 5000;

export function RichTextEditor({ field }: { field: any }) {
  const editor = useEditor({
    immediatelyRender: false,

    extensions: [
      StarterKit,

      Underline,

      Link.configure({
        openOnClick: false,
        autolink: true,
      }),

      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),

      Placeholder.configure({
        placeholder:
          "Tulis deskripsi program secara lengkap. Jelaskan manfaat, materi, target peserta, dan hasil yang akan didapat...",
      }),

      CharacterCount.configure({
        limit: MAX_LENGTH,
      }),
    ],

    editorProps: {
      attributes: {
        class: cn(
          "tiptap min-h-[300px] px-4 py-4",
          "focus:outline-none",
          "prose prose-sm sm:prose-base",
          "max-w-none",
        ),
      },
    },

    content: (() => {
      try {
        return field.value ? JSON.parse(field.value) : "";
      } catch {
        return "";
      }
    })(),

    onUpdate: ({ editor }) => {
      field.onChange(JSON.stringify(editor.getJSON()));
    },
  });

  // Sync editor with RHF reset/default values
  useEffect(() => {
    if (!editor) return;

    try {
      const incoming = field.value ? JSON.parse(field.value) : "";

      if (JSON.stringify(editor.getJSON()) !== JSON.stringify(incoming)) {
        editor.commands.setContent(incoming);
      }
    } catch {}
  }, [editor, field.value]);

  if (!editor) return null;

  const characters = editor.storage.characterCount.characters();
  const words = editor.storage.characterCount.words();

  const pct = characters / MAX_LENGTH;
  const nearLimit = pct > 0.8;
  const atLimit = pct >= 1;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-background text-black transition-all",
        editor.isFocused
          ? "border-primary ring-4 ring-primary/10"
          : "border-border",
      )}
    >
      <Menubar editor={editor} />

      <EditorContent editor={editor} />

      <InputCounterFooter
        characters={characters}
        maxLength={MAX_LENGTH}
        words={words}
      />
    </div>
  );
}

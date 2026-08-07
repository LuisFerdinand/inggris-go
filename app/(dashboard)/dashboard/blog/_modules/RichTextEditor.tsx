// app/(dashboard)/dashboard/blog/_modules/RichTextEditor.tsx
"use client";

import { useEffect, useCallback, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import {
  Bold,
  Italic,
  UnderlineIcon,
  Strikethrough,
  Code,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link2,
  Link2Off,
  Image as ImageIcon,
  Loader2,
  Undo2,
  Redo2,
  Code2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCloudinaryUpload } from "@/lib/hooks/useCloudinaryUpload";

/* =========================================================
   TOOLBAR BUTTON
========================================================= */

function ToolBtn({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex size-7 items-center justify-center rounded-lg text-[12px] transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        active
          ? "bg-blue-100 text-blue-700"
          : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800",
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="mx-0.5 h-5 w-px bg-neutral-200" />;
}

/* =========================================================
   EDITOR COMPONENT
========================================================= */

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Mulai menulis artikel…",
  minHeight = 400,
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading } = useCloudinaryUpload();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        codeBlock: {
          HTMLAttributes: { class: "tiptap-code-block" },
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Image.configure({
        HTMLAttributes: { class: "tiptap-image" },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "tiptap outline-none min-h-[inherit] px-5 py-4 text-neutral-800",
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  // Sync external value changes (e.g. on edit mode load) without moving cursor
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (current !== value) {
      // { emitUpdate: false } prevents triggering onUpdate → no infinite loop
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL tautan:", prev ?? "https://");
    if (url === null) return; // cancelled
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  const insertImage = useCallback(
    (url: string, alt: string) => {
      if (!editor) return;
      editor.chain().focus().setImage({ src: url, alt }).run();
    },
    [editor],
  );

  const triggerImageUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleImageFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = ""; // allow re-selecting the same file
      if (!file) return;
      const url = await upload(file);
      if (!url) return; // useCloudinaryUpload already tracks the error
      const alt = file.name.replace(/\.[^/.]+$/, "");
      insertImage(url, alt);
    },
    [upload, insertImage],
  );

  if (!editor) return null;

  const wordCount = editor.getText().trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white transition-all focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20">
      {/* ── Toolbar ──────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-neutral-100 bg-neutral-50 px-2 py-1.5">
        {/* Undo / Redo */}
        <ToolBtn
          title="Undo"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo2 className="size-3.5" />
        </ToolBtn>
        <ToolBtn
          title="Redo"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo2 className="size-3.5" />
        </ToolBtn>

        <Divider />

        {/* Headings */}
        <ToolBtn
          title="Heading 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 className="size-3.5" />
        </ToolBtn>
        <ToolBtn
          title="Heading 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <Heading3 className="size-3.5" />
        </ToolBtn>

        <Divider />

        {/* Inline marks */}
        <ToolBtn
          title="Tebal"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="size-3.5" />
        </ToolBtn>
        <ToolBtn
          title="Miring"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="size-3.5" />
        </ToolBtn>
        <ToolBtn
          title="Garis bawah"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="size-3.5" />
        </ToolBtn>
        <ToolBtn
          title="Coret"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="size-3.5" />
        </ToolBtn>
        <ToolBtn
          title="Kode inline"
          active={editor.isActive("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <Code className="size-3.5" />
        </ToolBtn>

        <Divider />

        {/* Lists */}
        <ToolBtn
          title="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="size-3.5" />
        </ToolBtn>
        <ToolBtn
          title="Numbered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="size-3.5" />
        </ToolBtn>

        <Divider />

        {/* Block elements */}
        <ToolBtn
          title="Kutipan"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="size-3.5" />
        </ToolBtn>
        <ToolBtn
          title="Blok kode"
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <Code2 className="size-3.5" />
        </ToolBtn>
        <ToolBtn
          title="Garis pembatas"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus className="size-3.5" />
        </ToolBtn>

        <Divider />

        {/* Link */}
        <ToolBtn
          title="Tambah / ubah tautan"
          active={editor.isActive("link")}
          onClick={setLink}
        >
          <Link2 className="size-3.5" />
        </ToolBtn>
        {editor.isActive("link") && (
          <ToolBtn
            title="Hapus tautan"
            onClick={() => editor.chain().focus().unsetLink().run()}
          >
            <Link2Off className="size-3.5" />
          </ToolBtn>
        )}

        {/* Image upload */}
        <ToolBtn
          title="Unggah gambar"
          onClick={triggerImageUpload}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <ImageIcon className="size-3.5" />
          )}
        </ToolBtn>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageFileChange}
        />

        {/* Word count */}
        <span className="ml-auto text-[10px] text-neutral-400">
          {wordCount} kata
        </span>
      </div>

      {/* ── Editable area ──────────────────────────────── */}
      <div style={{ minHeight }}>
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
}
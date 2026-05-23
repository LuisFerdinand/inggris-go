"use client";

import React from "react";
import { type Editor, useEditorState } from "@tiptap/react";

import {
  Bold,
  Italic,
  Strikethrough,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo2,
  Redo2,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  UnderlineIcon,
} from "lucide-react";

import { Toggle } from "../ui/toggle";
import { Button } from "../ui/button";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { cn } from "@/lib/utils";

interface Props {
  editor: Editor | null;
}

type ToggleButtonProps = {
  pressed?: boolean;
  tooltip: string;
  onPressedChange: () => void;
  children: React.ReactNode;
};

function ToolbarToggle({
  pressed,
  tooltip,
  onPressedChange,
  children,
}: ToggleButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Toggle
          size="sm"
          pressed={pressed}
          onPressedChange={onPressedChange}
          className={cn(`
            h-8 w-8 p-0
            border border-transparent
            transition-all duration-150 cursor-pointer
            ${pressed ? "bg-muted border-border shadow-sm text-black" : "bg-white text-muted-foreground"}
            hover:bg-muted
            hover:text-foreground

           
          `)}
        >
          {children}
        </Toggle>
      </TooltipTrigger>

      <TooltipContent side="bottom">
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function Divider() {
  return <div className="mx-1 h-5 w-px bg-border" />;
}

export const Menubar = ({ editor }: Props) => {
  if (!editor) return null;

  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor.isActive("bold"),
      italic: editor.isActive("italic"),
      strike: editor.isActive("strike"),
      code: editor.isActive("code"),
      underline: editor.isActive("underline"),

      h1: editor.isActive("heading", { level: 1 }),
      h2: editor.isActive("heading", { level: 2 }),
      h3: editor.isActive("heading", { level: 3 }),

      bulletList: editor.isActive("bulletList"),
      orderedList: editor.isActive("orderedList"),
      blockquote: editor.isActive("blockquote"),

      leftAlign: editor.isActive({ textAlign: "left" }),
      centerAlign: editor.isActive({ textAlign: "center" }),
      rightAlign: editor.isActive({ textAlign: "right" }),

      canUndo: editor.can().undo(),
      canRedo: editor.can().redo(),
    }),
  });

  return (
    <TooltipProvider delayDuration={400}>
      <div
        className="
    sticky top-0 z-20
    flex items-center gap-1
    overflow-x-auto no-scrollbar
          border-b border-border rounded-t-lg
          bg-background/95
          backdrop-blur supports-[backdrop-filter]:bg-background/80
          p-2
        "
      >
        {/* Text Formatting */}
        <ToolbarToggle
          tooltip="Bold"
          pressed={state.bold}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="size-4" />
        </ToolbarToggle>
        <ToolbarToggle
          tooltip="Italic"
          pressed={state.italic}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="size-4" />
        </ToolbarToggle>
        <ToolbarToggle
          tooltip="Underline"
          pressed={state.underline}
          onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="size-4" />
        </ToolbarToggle>
        <ToolbarToggle
          tooltip="Strike"
          pressed={state.strike}
          onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="size-4" />
        </ToolbarToggle>
        <ToolbarToggle
          tooltip="Inline Code"
          pressed={state.code}
          onPressedChange={() => editor.chain().focus().toggleCode().run()}
        >
          <Code2 className="size-4" />
        </ToolbarToggle>
        <Divider />
        {/* Headings */}
        <ToolbarToggle
          tooltip="Heading 1"
          pressed={state.h1}
          onPressedChange={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          <Heading1 className="size-4" />
        </ToolbarToggle>
        <ToolbarToggle
          tooltip="Heading 2"
          pressed={state.h2}
          onPressedChange={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 className="size-4" />
        </ToolbarToggle>
        <ToolbarToggle
          tooltip="Heading 3"
          pressed={state.h3}
          onPressedChange={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <Heading3 className="size-4" />
        </ToolbarToggle>
        <Divider />
        {/* Lists */}
        <ToolbarToggle
          tooltip="Bullet List"
          pressed={state.bulletList}
          onPressedChange={() =>
            editor.chain().focus().toggleBulletList().run()
          }
        >
          <List className="size-4" />
        </ToolbarToggle>
        <ToolbarToggle
          tooltip="Ordered List"
          pressed={state.orderedList}
          onPressedChange={() =>
            editor.chain().focus().toggleOrderedList().run()
          }
        >
          <ListOrdered className="size-4" />
        </ToolbarToggle>
        <ToolbarToggle
          tooltip="Blockquote"
          pressed={state.blockquote}
          onPressedChange={() =>
            editor.chain().focus().toggleBlockquote().run()
          }
        >
          <Quote className="size-4" />
        </ToolbarToggle>
        <Divider />
        <ToolbarToggle
          tooltip="Align Left"
          pressed={state.leftAlign}
          onPressedChange={() =>
            editor.chain().focus().setTextAlign("left").run()
          }
        >
          <AlignLeft className="size-4" />
        </ToolbarToggle>
        <ToolbarToggle
          tooltip="Align Center"
          pressed={state.centerAlign}
          onPressedChange={() =>
            editor.chain().focus().setTextAlign("center").run()
          }
        >
          <AlignCenter className="size-4" />
        </ToolbarToggle>
        <ToolbarToggle
          tooltip="Align Right"
          pressed={state.rightAlign}
          onPressedChange={() =>
            editor.chain().focus().setTextAlign("right").run()
          }
        >
          <AlignRight className="size-4" />
        </ToolbarToggle>
        {/* Extras */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              disabled={!state.canUndo}
              onClick={() => editor.chain().focus().undo().run()}
              className="h-8 w-8 disabled:opacity-40 disabled:pointer-events-none"
            >
              <Undo2 className="size-4" />
            </Button>
          </TooltipTrigger>

          <TooltipContent side="bottom">
            <p>Undo</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              disabled={!state.canRedo}
              onClick={() => editor.chain().focus().redo().run()}
              className="h-8 w-8 disabled:opacity-40 disabled:pointer-events-none"
            >
              <Redo2 className="size-4" />
            </Button>
          </TooltipTrigger>

          <TooltipContent side="bottom">
            <p>Redo</p>
          </TooltipContent>
        </Tooltip>
        <Divider />
        {/* Horizontal Rule */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              className="h-8 w-8 disabled:opacity-40 disabled:pointer-events-none"
            >
              <Minus className="size-4" />
            </Button>
          </TooltipTrigger>

          <TooltipContent side="bottom">
            <p>Horizontal Rule</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

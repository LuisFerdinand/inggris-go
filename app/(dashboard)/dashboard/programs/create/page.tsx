// "use client";

// import { SiteHeader } from "@/components/sidebar/site-header";
// import { Button } from "@/components/ui/button";
// import { ProgramCreateInput, programCreateSchema } from "@/lib/zodSchemas";
// import {
//   ArrowLeft,
//   BookOpen,
//   Check,
//   ChevronRight,
//   Clock,
//   DollarSign,
//   Eye,
//   FileText,
//   Globe,
//   GraduationCap,
//   Image as ImageIcon,
//   Info,
//   Layers,
//   LayoutDashboard,
//   Plus,
//   Sparkles,
//   Tag,
//   Trash2,
//   TrendingUp,
//   Users,
//   Award,
//   Archive,
//   X,
//   Zap,
//   AlertCircle,
//   Loader2,
// } from "lucide-react";
// import Link from "next/link";
// import React, { useState, useCallback, useRef, useEffect } from "react";
// import { useForm, Controller, useFieldArray, Resolver } from "react-hook-form";
// import { cn } from "@/lib/utils";
// import * as z from "zod";

// /* ─── Custom Zod v4 Resolver ─────────────────────────── */
// // @hookform/resolvers/zod targets Zod v3. Zod v4 changed the error format,
// // so we build a minimal resolver ourselves that works with Zod v4's issue list.
// function zodV4Resolver<T extends z.ZodType>(schema: T): Resolver<z.infer<T>> {
//   return async (values) => {
//     const result = schema.safeParse(values);
//     if (result.success) {
//       return { values: result.data, errors: {} };
//     }

//     // Zod v4: result.error.issues is the array of ZodIssue objects
//     const errors: Record<string, { type: string; message: string }> = {};
//     for (const issue of result.error.issues) {
//       const path = issue.path.join(".");
//       if (path && !errors[path]) {
//         errors[path] = { type: issue.code, message: issue.message };
//       }
//     }

//     return { values: {}, errors };
//   };
// }

// /* ─── Types ──────────────────────────────────────────── */
// type SectionId = "basic" | "details" | "pricing" | "media";

// type Section = {
//   id: SectionId;
//   label: string;
//   icon: React.ReactNode;
//   description: string;
// };

// /* ─── Section Config ─────────────────────────────────── */
// const SECTIONS: Section[] = [
//   {
//     id: "basic",
//     label: "Basic Info",
//     icon: <FileText className="size-4" />,
//     description: "Title, description & category",
//   },
//   {
//     id: "details",
//     label: "Details",
//     icon: <Layers className="size-4" />,
//     description: "Format, level & duration",
//   },
//   {
//     id: "pricing",
//     label: "Pricing",
//     icon: <DollarSign className="size-4" />,
//     description: "Pricing model & tiers",
//   },
//   {
//     id: "media",
//     label: "Media & Tags",
//     icon: <ImageIcon className="size-4" />,
//     description: "Thumbnail, icon & tags",
//   },
// ];

// /* ─── Option Data ────────────────────────────────────── */
// const FORMAT_OPTIONS = [
//   {
//     value: "online",
//     label: "Online",
//     icon: <Globe className="size-5" />,
//     desc: "Fully remote, anytime access",
//   },
//   {
//     value: "offline",
//     label: "In-person",
//     icon: <BookOpen className="size-5" />,
//     desc: "Classroom based learning",
//   },
//   {
//     value: "hybrid",
//     label: "Hybrid",
//     icon: <Zap className="size-5" />,
//     desc: "Blended online & in-person",
//   },
// ];

// const LEVEL_OPTIONS = [
//   { value: "beginner", label: "Beginner", dot: "bg-emerald-500" },
//   { value: "intermediate", label: "Intermediate", dot: "bg-amber-500" },
//   { value: "advanced", label: "Advanced", dot: "bg-red-500" },
//   { value: "all", label: "All Levels", dot: "bg-blue-500" },
// ];

// const STATUS_OPTIONS = [
//   {
//     value: "draft",
//     label: "Draft",
//     icon: <LayoutDashboard className="size-4" />,
//     desc: "Only visible to you",
//   },
//   {
//     value: "published",
//     label: "Published",
//     icon: <Eye className="size-4" />,
//     desc: "Visible to all learners",
//   },
//   {
//     value: "archived",
//     label: "Archived",
//     icon: <Archive className="size-4" />,
//     desc: "Hidden from listings",
//   },
// ];

// const CATEGORIES = [
//   { id: "cat-1", label: "Web Development" },
//   { id: "cat-2", label: "Data Science" },
//   { id: "cat-3", label: "Design" },
//   { id: "cat-4", label: "Marketing" },
//   { id: "cat-5", label: "Business" },
//   { id: "cat-6", label: "Finance" },
// ];

// /* ─── Shared input class ─────────────────────────────── */
// const baseInput =
//   "h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm transition-all outline-none " +
//   "placeholder:text-neutral-400 " +
//   "border-neutral-200 hover:border-neutral-300 " +
//   "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 ";

// const errorInput = "border-red-400 focus:border-red-500 focus:ring-red-500/10 ";

// /* ─── Field wrapper ──────────────────────────────────── */
// function Field({
//   label,
//   htmlFor,
//   required,
//   hint,
//   error,
//   children,
//   className,
// }: {
//   label: string;
//   htmlFor?: string;
//   required?: boolean;
//   hint?: string;
//   error?: string;
//   children: React.ReactNode;
//   className?: string;
// }) {
//   return (
//     <div className={cn("flex flex-col gap-1.5", className)}>
//       <label
//         htmlFor={htmlFor}
//         className="text-sm font-medium text-neutral-700 leading-none"
//       >
//         {label}
//         {required && (
//           <span className="ml-1 text-red-500 font-normal" aria-hidden>
//             *
//           </span>
//         )}
//       </label>
//       {children}
//       {error ? (
//         <p className="flex items-center gap-1.5 text-xs text-red-600 animate-in fade-in slide-in-from-top-1 duration-200">
//           <AlertCircle className="size-3.5 shrink-0" />
//           {error}
//         </p>
//       ) : hint ? (
//         <p className="text-xs text-neutral-400">{hint}</p>
//       ) : null}
//     </div>
//   );
// }

// /* ─── Input ──────────────────────────────────────────── */
// function Input({
//   invalid,
//   className,
//   value,
//   onChange,
//   ...props
// }: React.ComponentProps<"input"> & { invalid?: boolean }) {
//   return (
//     <input
//       {...props}
//       aria-invalid={invalid}
//       value={value ?? ""}
//       onChange={onChange}
//       className={cn(baseInput, invalid && errorInput, className)}
//     />
//   );
// }

// /* ─── Textarea ───────────────────────────────────────── */
// function Textarea({
//   invalid,
//   className,
//   ...props
// }: React.ComponentProps<"textarea"> & { invalid?: boolean }) {
//   return (
//     <textarea
//       {...props}
//       aria-invalid={invalid}
//       className={cn(
//         "w-full rounded-lg border bg-white px-3 py-2.5 text-sm transition-all outline-none resize-none",
//         "placeholder:text-neutral-400 border-neutral-200 hover:border-neutral-300",
//         "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10",
//         invalid && errorInput,
//         className,
//       )}
//     />
//   );
// }

// /* ─── Currency input ─────────────────────────────────── */
// function CurrencyInput({
//   invalid,
//   value,
//   onChange,
//   name,
//   onBlur,
//   id,
//   ...rest
// }: React.ComponentProps<"input"> & { invalid?: boolean }) {
//   return (
//     <div className="relative">
//       <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-semibold text-neutral-400 select-none z-10">
//         Rp
//       </span>
//       <input
//         {...rest}
//         id={id}
//         name={name}
//         onBlur={onBlur}
//         type="number"
//         min="0"
//         aria-invalid={invalid}
//         value={value ?? ""}
//         onChange={onChange}
//         className={cn(
//           baseInput,
//           "pl-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
//           invalid && errorInput,
//         )}
//       />
//     </div>
//   );
// }

// /* ─── Tag input ──────────────────────────────────────── */
// function TagInput({
//   value = [],
//   onChange,
// }: {
//   value?: string[];
//   onChange: (v: string[]) => void;
// }) {
//   const [draft, setDraft] = useState("");
//   const commit = () => {
//     const t = draft.trim();
//     if (t && !value.includes(t)) {
//       onChange([...value, t]);
//       setDraft("");
//     }
//   };
//   return (
//     <div className="flex min-h-[2.5rem] w-full flex-wrap gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-2 text-sm transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10">
//       {value.map((tag) => (
//         <span
//           key={tag}
//           className="inline-flex items-center gap-1 rounded-md bg-blue-50 border border-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700"
//         >
//           <Tag className="size-2.5 shrink-0" />
//           {tag}
//           <button
//             type="button"
//             onClick={() => onChange(value.filter((t) => t !== tag))}
//             className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity"
//             aria-label={`Remove tag ${tag}`}
//           >
//             <X className="size-2.5" />
//           </button>
//         </span>
//       ))}
//       <input
//         value={draft}
//         onChange={(e) => setDraft(e.target.value)}
//         onKeyDown={(e) => {
//           if (e.key === "Enter" || e.key === ",") {
//             e.preventDefault();
//             commit();
//           } else if (e.key === "Backspace" && !draft && value.length) {
//             onChange(value.slice(0, -1));
//           }
//         }}
//         placeholder={value.length === 0 ? "Type a tag, then press Enter" : ""}
//         className="flex-1 min-w-28 bg-transparent outline-none placeholder:text-neutral-400 text-sm"
//       />
//     </div>
//   );
// }

// /* ─── Section divider ────────────────────────────────── */
// function SectionDivider({
//   id,
//   icon,
//   title,
//   description,
//   accentClass,
// }: {
//   id: SectionId;
//   icon: React.ReactNode;
//   title: string;
//   description: string;
//   accentClass: string;
// }) {
//   return (
//     <div
//       id={`section-${id}`}
//       className={cn(
//         "flex items-center gap-3 rounded-xl border px-5 py-4 scroll-mt-24",
//         accentClass,
//       )}
//     >
//       <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/80 shadow-sm">
//         {icon}
//       </div>
//       <div>
//         <h2 className="text-sm font-semibold text-neutral-800">{title}</h2>
//         <p className="text-xs text-neutral-500 mt-0.5">{description}</p>
//       </div>
//     </div>
//   );
// }

// /* ─── Sidebar nav ────────────────────────────────────── */
// function SideNav({
//   activeSection,
//   sectionErrors,
//   completedSections,
//   onNavigate,
// }: {
//   activeSection: SectionId;
//   sectionErrors: Record<SectionId, boolean>;
//   completedSections: Set<SectionId>;
//   onNavigate: (id: SectionId) => void;
// }) {
//   return (
//     <div className="flex flex-col gap-1">
//       {SECTIONS.map((s) => {
//         const isActive = activeSection === s.id;
//         const hasError = sectionErrors[s.id];
//         const isDone = completedSections.has(s.id) && !hasError;
//         return (
//           <button
//             key={s.id}
//             type="button"
//             onClick={() => onNavigate(s.id)}
//             className={cn(
//               "flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-150 w-full group",
//               isActive ? "bg-blue-50" : "hover:bg-neutral-50",
//             )}
//           >
//             <div
//               className={cn(
//                 "flex size-7 shrink-0 items-center justify-center rounded-md transition-all",
//                 isActive
//                   ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
//                   : hasError
//                     ? "bg-red-50 text-red-500"
//                     : isDone
//                       ? "bg-emerald-50 text-emerald-600"
//                       : "bg-neutral-100 text-neutral-400",
//               )}
//             >
//               {isDone && !isActive ? (
//                 <Check className="size-3.5" strokeWidth={2.5} />
//               ) : hasError && !isActive ? (
//                 <AlertCircle className="size-3.5" />
//               ) : (
//                 s.icon
//               )}
//             </div>
//             <div className="min-w-0 flex-1">
//               <p
//                 className={cn(
//                   "text-xs font-semibold leading-none",
//                   isActive
//                     ? "text-blue-700"
//                     : hasError
//                       ? "text-red-600"
//                       : "text-neutral-600",
//                 )}
//               >
//                 {s.label}
//               </p>
//               <p className="text-[10px] text-neutral-400 mt-0.5 leading-none">
//                 {s.description}
//               </p>
//             </div>
//             {isActive && (
//               <ChevronRight className="size-3.5 text-blue-400 shrink-0" />
//             )}
//           </button>
//         );
//       })}
//     </div>
//   );
// }

// /* ══════════════════════════════════════════════════════
//    SECTION COMPONENTS
// ══════════════════════════════════════════════════════ */

// /* ── Basic Info ── */
// function BasicSection({
//   form,
// }: {
//   form: ReturnType<typeof useForm<ProgramCreateInput>>;
// }) {
//   const title = (form.watch("title") ?? "") as string;
//   const desc = (form.watch("description") ?? "") as string;
//   const shortDesc = (form.watch("shortDesc") ?? "") as string;

//   return (
//     <div className="flex flex-col gap-5">
//       <SectionDivider
//         id="basic"
//         icon={<FileText className="size-4 text-blue-600" />}
//         title="Basic Information"
//         description="Name, describe, and categorise your program"
//         accentClass="bg-blue-50/60 border-blue-100"
//       />

//       {/* Title */}
//       <Controller
//         name="title"
//         control={form.control}
//         render={({ field, fieldState }) => (
//           <Field
//             label="Program Title"
//             htmlFor="f-title"
//             required
//             hint="3–120 characters. Be specific and outcome-focused."
//             error={fieldState.error?.message}
//           >
//             <div className="relative">
//               <Input
//                 {...field}
//                 id="f-title"
//                 placeholder="e.g. Full-Stack Web Development Bootcamp"
//                 invalid={fieldState.invalid}
//                 maxLength={120}
//               />
//               <span
//                 className={cn(
//                   "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs tabular-nums",
//                   title.length > 110
//                     ? "text-red-500 font-medium"
//                     : "text-neutral-300",
//                 )}
//               >
//                 {title.length}/120
//               </span>
//             </div>
//           </Field>
//         )}
//       />

//       {/* Full description */}
//       <Controller
//         name="description"
//         control={form.control}
//         render={({ field, fieldState }) => (
//           <Field
//             label="Full Description"
//             htmlFor="f-desc"
//             required
//             hint="Describe outcomes, prerequisites, and what makes this program unique."
//             error={fieldState.error?.message}
//           >
//             <div className="relative">
//               <Textarea
//                 {...field}
//                 id="f-desc"
//                 rows={5}
//                 placeholder="What will learners achieve? What do they need to get started? What sets this program apart?"
//                 invalid={fieldState.invalid}
//               />
//               <span className="pointer-events-none absolute right-3 bottom-3 text-xs text-neutral-300 tabular-nums">
//                 {desc.length} chars
//               </span>
//             </div>
//           </Field>
//         )}
//       />

//       {/* Short description */}
//       <Controller
//         name="shortDesc"
//         control={form.control}
//         render={({ field, fieldState }) => (
//           <Field
//             label="Short Description"
//             htmlFor="f-short"
//             hint="Shown on program cards — one punchy sentence (max 200 chars)."
//             error={fieldState.error?.message}
//           >
//             <div className="relative">
//               <Textarea
//                 {...field}
//                 id="f-short"
//                 rows={2}
//                 placeholder="One compelling sentence that makes learners want to enrol…"
//                 invalid={fieldState.invalid}
//                 maxLength={200}
//               />
//               <span
//                 className={cn(
//                   "pointer-events-none absolute right-3 bottom-3 text-xs tabular-nums",
//                   shortDesc.length > 180
//                     ? "text-amber-500 font-medium"
//                     : "text-neutral-300",
//                 )}
//               >
//                 {shortDesc.length}/200
//               </span>
//             </div>
//           </Field>
//         )}
//       />

//       {/* Category */}
//       <Controller
//         name="categoryId"
//         control={form.control}
//         render={({ field, fieldState }) => (
//           <Field label="Category" required error={fieldState.error?.message}>
//             <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
//               {CATEGORIES.map((cat) => {
//                 const sel = field.value === cat.id;
//                 return (
//                   <button
//                     key={cat.id}
//                     type="button"
//                     onClick={() => field.onChange(cat.id)}
//                     className={cn(
//                       "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm text-left transition-all duration-150",
//                       sel
//                         ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
//                         : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50 text-neutral-600",
//                       fieldState.invalid && !field.value && "border-red-300",
//                     )}
//                   >
//                     <span className="flex-1 truncate text-xs font-medium">
//                       {cat.label}
//                     </span>
//                     {sel && (
//                       <Check
//                         className="size-3.5 shrink-0 text-blue-600"
//                         strokeWidth={2.5}
//                       />
//                     )}
//                   </button>
//                 );
//               })}
//             </div>
//           </Field>
//         )}
//       />

//       {/* Status */}
//       <Controller
//         name="status"
//         control={form.control}
//         render={({ field }) => (
//           <Field
//             label="Publication Status"
//             hint="You can always change this later."
//           >
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
//               {STATUS_OPTIONS.map((opt) => {
//                 const sel = field.value === opt.value;
//                 const statusColors: Record<string, string> = {
//                   draft: sel ? "border-neutral-400 bg-neutral-50" : "",
//                   published: sel ? "border-emerald-400 bg-emerald-50" : "",
//                   archived: sel ? "border-orange-400 bg-orange-50" : "",
//                 };
//                 const iconColors: Record<string, string> = {
//                   draft: sel
//                     ? "bg-neutral-700 text-white"
//                     : "bg-neutral-100 text-neutral-500",
//                   published: sel
//                     ? "bg-emerald-600 text-white"
//                     : "bg-emerald-50 text-emerald-600",
//                   archived: sel
//                     ? "bg-orange-600 text-white"
//                     : "bg-orange-50 text-orange-600",
//                 };
//                 const labelColors: Record<string, string> = {
//                   draft: sel ? "text-neutral-800" : "text-neutral-600",
//                   published: sel ? "text-emerald-800" : "text-neutral-600",
//                   archived: sel ? "text-orange-800" : "text-neutral-600",
//                 };
//                 return (
//                   <button
//                     key={opt.value}
//                     type="button"
//                     onClick={() => field.onChange(opt.value)}
//                     className={cn(
//                       "relative flex items-center gap-3 rounded-lg border px-3.5 py-3 text-left transition-all duration-150",
//                       sel
//                         ? statusColors[opt.value]
//                         : "border-neutral-200 bg-white hover:bg-neutral-50",
//                     )}
//                   >
//                     <div
//                       className={cn(
//                         "flex size-8 shrink-0 items-center justify-center rounded-md transition-all",
//                         iconColors[opt.value],
//                       )}
//                     >
//                       {opt.icon}
//                     </div>
//                     <div>
//                       <p
//                         className={cn(
//                           "text-xs font-semibold",
//                           labelColors[opt.value],
//                         )}
//                       >
//                         {opt.label}
//                       </p>
//                       <p className="text-[10px] text-neutral-400 mt-0.5">
//                         {opt.desc}
//                       </p>
//                     </div>
//                     {sel && (
//                       <div className="absolute top-2 right-2 size-4 flex items-center justify-center rounded-full bg-current/10">
//                         <Check
//                           className="size-2.5 text-current"
//                           strokeWidth={3}
//                         />
//                       </div>
//                     )}
//                   </button>
//                 );
//               })}
//             </div>
//           </Field>
//         )}
//       />

//       {/* Badge + Highlight */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//         <Controller
//           name="badge"
//           control={form.control}
//           render={({ field, fieldState }) => (
//             <Field
//               label="Badge"
//               htmlFor="f-badge"
//               hint='Chip on the card, e.g. "Bestseller"'
//               error={fieldState.error?.message}
//             >
//               <div className="relative">
//                 <Award className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-neutral-400" />
//                 <Input
//                   {...field}
//                   id="f-badge"
//                   placeholder="Bestseller"
//                   maxLength={50}
//                   invalid={fieldState.invalid}
//                   className="pl-8"
//                 />
//               </div>
//             </Field>
//           )}
//         />
//         <Controller
//           name="highlight"
//           control={form.control}
//           render={({ field, fieldState }) => (
//             <Field
//               label="Highlight"
//               htmlFor="f-highlight"
//               hint="Short selling point below the title"
//               error={fieldState.error?.message}
//             >
//               <div className="relative">
//                 <TrendingUp className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-neutral-400" />
//                 <Input
//                   {...field}
//                   id="f-highlight"
//                   placeholder="Certificate included"
//                   maxLength={160}
//                   invalid={fieldState.invalid}
//                   className="pl-8"
//                 />
//               </div>
//             </Field>
//           )}
//         />
//       </div>
//     </div>
//   );
// }

// /* ── Details ── */
// function DetailsSection({
//   form,
// }: {
//   form: ReturnType<typeof useForm<ProgramCreateInput>>;
// }) {
//   return (
//     <div className="flex flex-col gap-5">
//       <SectionDivider
//         id="details"
//         icon={<Layers className="size-4 text-teal-600" />}
//         title="Program Details"
//         description="Format, difficulty level, and time commitment"
//         accentClass="bg-teal-50/60 border-teal-100"
//       />

//       {/* Format */}
//       <Controller
//         name="format"
//         control={form.control}
//         render={({ field, fieldState }) => (
//           <Field
//             label="Delivery Format"
//             required
//             error={fieldState.error?.message}
//           >
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
//               {FORMAT_OPTIONS.map((opt) => {
//                 const sel = field.value === opt.value;
//                 return (
//                   <button
//                     key={opt.value}
//                     type="button"
//                     onClick={() => field.onChange(opt.value)}
//                     className={cn(
//                       "relative flex flex-col gap-2.5 rounded-lg border px-4 py-3.5 text-left transition-all duration-150",
//                       sel
//                         ? "border-teal-500 bg-teal-50"
//                         : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50",
//                     )}
//                   >
//                     <div
//                       className={cn(
//                         "flex size-9 items-center justify-center rounded-lg transition-all",
//                         sel
//                           ? "bg-teal-100 text-teal-700"
//                           : "bg-neutral-100 text-neutral-400",
//                       )}
//                     >
//                       {opt.icon}
//                     </div>
//                     <div>
//                       <p
//                         className={cn(
//                           "text-sm font-semibold",
//                           sel ? "text-teal-800" : "text-neutral-700",
//                         )}
//                       >
//                         {opt.label}
//                       </p>
//                       <p className="text-xs text-neutral-400 mt-0.5">
//                         {opt.desc}
//                       </p>
//                     </div>
//                     {sel && (
//                       <Check
//                         className="absolute top-3 right-3 size-4 text-teal-600"
//                         strokeWidth={2.5}
//                       />
//                     )}
//                   </button>
//                 );
//               })}
//             </div>
//           </Field>
//         )}
//       />

//       {/* Level */}
//       <Controller
//         name="level"
//         control={form.control}
//         render={({ field, fieldState }) => (
//           <Field
//             label="Difficulty Level"
//             required
//             error={fieldState.error?.message}
//           >
//             <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
//               {LEVEL_OPTIONS.map((opt) => {
//                 const sel = field.value === opt.value;
//                 return (
//                   <button
//                     key={opt.value}
//                     type="button"
//                     onClick={() => field.onChange(opt.value)}
//                     className={cn(
//                       "relative flex items-center gap-2.5 rounded-lg border px-3 py-3 text-left transition-all duration-150",
//                       sel
//                         ? "border-blue-500 bg-blue-50"
//                         : "border-neutral-200 bg-white hover:border-neutral-300",
//                     )}
//                   >
//                     <span
//                       className={cn("size-2 shrink-0 rounded-full", opt.dot)}
//                     />
//                     <span
//                       className={cn(
//                         "text-xs font-semibold",
//                         sel ? "text-blue-700" : "text-neutral-600",
//                       )}
//                     >
//                       {opt.label}
//                     </span>
//                     {sel && (
//                       <Check
//                         className="absolute top-2 right-2 size-3 text-blue-500"
//                         strokeWidth={3}
//                       />
//                     )}
//                   </button>
//                 );
//               })}
//             </div>
//           </Field>
//         )}
//       />

//       {/* Duration + Sort Order */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//         <Controller
//           name="duration"
//           control={form.control}
//           render={({ field, fieldState }) => (
//             <Field
//               label="Duration"
//               htmlFor="f-dur"
//               hint="Total content hours (optional)"
//               error={fieldState.error?.message}
//             >
//               <div className="relative">
//                 <input
//                   id="f-dur"
//                   type="number"
//                   min="0"
//                   placeholder="0"
//                   name={field.name}
//                   ref={field.ref}
//                   value={field.value ?? ""}
//                   onChange={(e) =>
//                     field.onChange(e.target.value === "" ? "" : e.target.value)
//                   }
//                   onBlur={field.onBlur}
//                   aria-invalid={fieldState.invalid}
//                   className={cn(
//                     baseInput,
//                     "pr-16",
//                     fieldState.invalid && errorInput,
//                   )}
//                 />
//                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center gap-1 border-l border-neutral-200 px-3">
//                   <Clock className="size-3 text-neutral-400" />
//                   <span className="text-xs text-neutral-400">hrs</span>
//                 </div>
//               </div>
//             </Field>
//           )}
//         />

//         <Controller
//           name="order"
//           control={form.control}
//           render={({ field, fieldState }) => (
//             <Field
//               label="Sort Order"
//               htmlFor="f-ord"
//               hint="Lower number = appears first in listings"
//               error={fieldState.error?.message}
//             >
//               <input
//                 id="f-ord"
//                 type="number"
//                 min="0"
//                 placeholder="0"
//                 name={field.name}
//                 ref={field.ref}
//                 value={field.value ?? ""}
//                 onChange={(e) =>
//                   field.onChange(e.target.value === "" ? "" : e.target.value)
//                 }
//                 onBlur={field.onBlur}
//                 aria-invalid={fieldState.invalid}
//                 className={cn(baseInput, fieldState.invalid && errorInput)}
//               />
//             </Field>
//           )}
//         />
//       </div>
//     </div>
//   );
// }

// /* ── Pricing ── */
// function PricingSection({
//   form,
// }: {
//   form: ReturnType<typeof useForm<ProgramCreateInput>>;
// }) {
//   const { fields, append, remove } = useFieldArray({
//     control: form.control,
//     name: "priceTiers",
//   });
//   const [mode, setMode] = useState<"free" | "single" | "tiers">("single");

//   const rawBp = form.watch("basePrice");
//   const rawOp = form.watch("originalPrice");
//   const bp = rawBp !== undefined && rawBp !== "" ? Number(rawBp) : undefined;
//   const op = rawOp !== undefined && rawOp !== "" ? Number(rawOp) : undefined;
//   const discount =
//     bp !== undefined && op !== undefined && op > bp
//       ? Math.round(((op - bp) / op) * 100)
//       : null;

//   const modeOptions = [
//     {
//       id: "free" as const,
//       label: "Free",
//       sub: "No charge",
//       icon: <Users className="size-4" />,
//     },
//     {
//       id: "single" as const,
//       label: "Fixed Price",
//       sub: "One price",
//       icon: <DollarSign className="size-4" />,
//     },
//     {
//       id: "tiers" as const,
//       label: "Price Tiers",
//       sub: "Multiple tiers",
//       icon: <Layers className="size-4" />,
//     },
//   ];

//   return (
//     <div className="flex flex-col gap-5">
//       <SectionDivider
//         id="pricing"
//         icon={<DollarSign className="size-4 text-amber-600" />}
//         title="Pricing"
//         description="Choose a pricing model that works for your program"
//         accentClass="bg-amber-50/60 border-amber-100"
//       />

//       {/* Mode picker */}
//       <div className="grid grid-cols-3 gap-2">
//         {modeOptions.map((m) => {
//           const sel = mode === m.id;
//           return (
//             <button
//               key={m.id}
//               type="button"
//               onClick={() => setMode(m.id)}
//               className={cn(
//                 "flex flex-col items-center gap-2 rounded-lg border py-4 px-2 text-center transition-all duration-150",
//                 sel
//                   ? "border-amber-500 bg-amber-50"
//                   : "border-neutral-200 bg-white hover:bg-neutral-50",
//               )}
//             >
//               <div
//                 className={cn(
//                   "flex size-8 items-center justify-center rounded-md transition-all",
//                   sel
//                     ? "bg-amber-100 text-amber-700"
//                     : "bg-neutral-100 text-neutral-400",
//                 )}
//               >
//                 {m.icon}
//               </div>
//               <div>
//                 <p
//                   className={cn(
//                     "text-xs font-semibold",
//                     sel ? "text-amber-800" : "text-neutral-600",
//                   )}
//                 >
//                   {m.label}
//                 </p>
//                 <p className="text-[10px] text-neutral-400 mt-0.5">{m.sub}</p>
//               </div>
//             </button>
//           );
//         })}
//       </div>

//       {/* Free */}
//       {mode === "free" && (
//         <div className="flex items-center gap-4 rounded-xl bg-emerald-50 border border-emerald-200 px-5 py-4 animate-in fade-in duration-200">
//           <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
//             <GraduationCap className="size-5 text-emerald-600" />
//           </div>
//           <div>
//             <p className="text-sm font-semibold text-emerald-800">
//               Free Access
//             </p>
//             <p className="text-xs text-emerald-600 mt-0.5">
//               This program will be publicly available at no cost to all
//               learners.
//             </p>
//           </div>
//         </div>
//       )}

//       {/* Single price */}
//       {mode === "single" && (
//         <div className="flex flex-col gap-4 animate-in fade-in duration-200">
//           <div className="flex items-start gap-2.5 rounded-lg bg-blue-50 border border-blue-100 px-4 py-3">
//             <Info className="size-3.5 text-blue-500 shrink-0 mt-0.5" />
//             <p className="text-xs text-blue-700 leading-relaxed">
//               Set an <strong>Original Price</strong> and a lower{" "}
//               <strong>Sale Price</strong> to display a discount badge. Leave
//               both empty for free.
//             </p>
//           </div>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <Controller
//               name="originalPrice"
//               control={form.control}
//               render={({ field, fieldState }) => (
//                 <Field
//                   label="Original Price"
//                   htmlFor="f-op"
//                   hint="The regular crossed-out price"
//                   error={fieldState.error?.message}
//                 >
//                   <CurrencyInput
//                     id="f-op"
//                     placeholder="500,000"
//                     invalid={fieldState.invalid}
//                     name={field.name}
//                     ref={field.ref}
//                     value={field.value ?? ""}
//                     onChange={(e) =>
//                       field.onChange(
//                         e.target.value === "" ? "" : e.target.value,
//                       )
//                     }
//                     onBlur={field.onBlur}
//                   />
//                 </Field>
//               )}
//             />
//             <Controller
//               name="basePrice"
//               control={form.control}
//               render={({ field, fieldState }) => (
//                 <Field
//                   label="Sale Price"
//                   htmlFor="f-bp"
//                   hint="The actual price learners pay"
//                   error={fieldState.error?.message}
//                 >
//                   <CurrencyInput
//                     id="f-bp"
//                     placeholder="299,000"
//                     invalid={fieldState.invalid}
//                     name={field.name}
//                     ref={field.ref}
//                     value={field.value ?? ""}
//                     onChange={(e) =>
//                       field.onChange(
//                         e.target.value === "" ? "" : e.target.value,
//                       )
//                     }
//                     onBlur={field.onBlur}
//                   />
//                 </Field>
//               )}
//             />
//           </div>

//           {discount !== null && (
//             <div className="flex flex-wrap items-center gap-3 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 animate-in fade-in slide-in-from-bottom-1 duration-200">
//               <Sparkles className="size-3.5 text-emerald-600 shrink-0" />
//               <span className="text-sm font-bold text-emerald-700">
//                 {discount}% off
//               </span>
//               <span className="text-xs text-emerald-600">
//                 Rp {op!.toLocaleString("id-ID")}
//                 <span className="mx-1.5 font-semibold">→</span>
//                 Rp {bp!.toLocaleString("id-ID")}
//               </span>
//               <span className="ml-auto text-xs text-emerald-500">
//                 Saves Rp {(op! - bp!).toLocaleString("id-ID")}
//               </span>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Tiers */}
//       {mode === "tiers" && (
//         <div className="flex flex-col gap-3 animate-in fade-in duration-200">
//           <p className="text-xs text-neutral-500">
//             Create tiers for different access levels — Basic, Pro, Premium, etc.
//           </p>
//           {fields.map((f, idx) => (
//             <div
//               key={f.id}
//               className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-1 duration-200"
//             >
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <div className="flex size-5 items-center justify-center rounded-full bg-blue-600 text-white text-[10px] font-bold">
//                     {idx + 1}
//                   </div>
//                   <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
//                     Tier {idx + 1}
//                   </span>
//                 </div>
//                 <button
//                   type="button"
//                   onClick={() => remove(idx)}
//                   className="flex size-7 items-center justify-center rounded-md text-neutral-400 hover:bg-red-50 hover:text-red-500 transition-all"
//                 >
//                   <Trash2 className="size-3.5" />
//                 </button>
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                 <Controller
//                   name={`priceTiers.${idx}.label`}
//                   control={form.control}
//                   render={({ field, fieldState }) => (
//                     <Field label="Label" error={fieldState.error?.message}>
//                       <Input
//                         {...field}
//                         placeholder="Pro"
//                         invalid={fieldState.invalid}
//                       />
//                     </Field>
//                   )}
//                 />
//                 <Controller
//                   name={`priceTiers.${idx}.price`}
//                   control={form.control}
//                   render={({ field, fieldState }) => (
//                     <Field label="Price" error={fieldState.error?.message}>
//                       <CurrencyInput
//                         placeholder="299,000"
//                         invalid={fieldState.invalid}
//                         name={field.name}
//                         ref={field.ref}
//                         value={field.value ?? ""}
//                         onChange={(e) =>
//                           field.onChange(
//                             e.target.value === "" ? 0 : e.target.value,
//                           )
//                         }
//                         onBlur={field.onBlur}
//                       />
//                     </Field>
//                   )}
//                 />
//               </div>
//               <Controller
//                 name={`priceTiers.${idx}.description`}
//                 control={form.control}
//                 render={({ field }) => (
//                   <Field label="Included features (optional)">
//                     <Input
//                       {...field}
//                       placeholder="Full access, certificate, 1-on-1 mentoring…"
//                     />
//                   </Field>
//                 )}
//               />
//             </div>
//           ))}
//           <button
//             type="button"
//             onClick={() => append({ label: "", price: 0, description: "" })}
//             className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-200 p-4 text-sm font-medium text-neutral-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/50 transition-all duration-150 group"
//           >
//             <Plus className="size-4 group-hover:scale-110 transition-transform duration-150" />
//             Add Pricing Tier
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// /* ── Media & Tags ── */
// function MediaSection({
//   form,
// }: {
//   form: ReturnType<typeof useForm<ProgramCreateInput>>;
// }) {
//   const thumbnail = (form.watch("thumbnail") ?? "") as string;
//   const icon = (form.watch("icon") ?? "") as string;
//   const tags = form.watch("tags") ?? [];

//   return (
//     <div className="flex flex-col gap-5">
//       <SectionDivider
//         id="media"
//         icon={<ImageIcon className="size-4 text-purple-600" />}
//         title="Media & Tags"
//         description="Visuals and tags that help your program stand out in search"
//         accentClass="bg-purple-50/60 border-purple-100"
//       />

//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//         <Controller
//           name="thumbnail"
//           control={form.control}
//           render={({ field, fieldState }) => (
//             <Field
//               label="Thumbnail URL"
//               htmlFor="f-thumb"
//               hint="1280×720 (16:9) recommended"
//               error={fieldState.error?.message}
//             >
//               <Input
//                 {...field}
//                 id="f-thumb"
//                 type="url"
//                 placeholder="https://…/thumbnail.jpg"
//                 invalid={fieldState.invalid}
//               />
//               {thumbnail && !fieldState.invalid && (
//                 <div className="mt-2 overflow-hidden rounded-lg border border-neutral-200 aspect-video bg-neutral-100">
//                   {/* eslint-disable-next-line @next/next/no-img-element */}
//                   <img
//                     src={thumbnail}
//                     alt="Thumbnail preview"
//                     className="h-full w-full object-cover"
//                     onError={(e) => {
//                       (e.target as HTMLImageElement).style.display = "none";
//                     }}
//                   />
//                 </div>
//               )}
//             </Field>
//           )}
//         />

//         <Controller
//           name="icon"
//           control={form.control}
//           render={({ field, fieldState }) => (
//             <Field
//               label="Icon URL"
//               htmlFor="f-icon"
//               hint="Square, min 128×128px"
//               error={fieldState.error?.message}
//             >
//               <Input
//                 {...field}
//                 id="f-icon"
//                 type="url"
//                 placeholder="https://…/icon.png"
//                 invalid={fieldState.invalid}
//               />
//               {icon && !fieldState.invalid && (
//                 <div className="mt-2 flex items-center gap-2.5">
//                   {/* eslint-disable-next-line @next/next/no-img-element */}
//                   <img
//                     src={icon}
//                     alt="Icon preview"
//                     className="size-10 rounded-lg border border-neutral-200 object-cover bg-neutral-100"
//                     onError={(e) => {
//                       (e.target as HTMLImageElement).style.display = "none";
//                     }}
//                   />
//                   <span className="text-xs text-neutral-400">Icon preview</span>
//                 </div>
//               )}
//             </Field>
//           )}
//         />
//       </div>

//       <Controller
//         name="tags"
//         control={form.control}
//         render={({ field }) => (
//           <Field
//             label="Tags"
//             hint="Press Enter or comma to add. Helps learners find your program."
//           >
//             <TagInput value={field.value} onChange={field.onChange} />
//             {(tags.length ?? 0) > 0 && (
//               <p className="text-xs text-neutral-400">
//                 {tags.length} tag{tags.length !== 1 ? "s" : ""} added
//               </p>
//             )}
//           </Field>
//         )}
//       />
//     </div>
//   );
// }

// /* ══════════════════════════════════════════════════════
//    MAIN PAGE
// ══════════════════════════════════════════════════════ */
// const ProgramCreatePage = () => {
//   const [activeSection, setActiveSection] = useState<SectionId>("basic");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isSuccess, setIsSuccess] = useState(false);
//   const [completedSections, setCompletedSections] = useState<Set<SectionId>>(
//     new Set(),
//   );

//   const sectionRefs = useRef<Record<SectionId, HTMLDivElement | null>>({
//     basic: null,
//     details: null,
//     pricing: null,
//     media: null,
//   });

//   const form = useForm<ProgramCreateInput>({
//     // Use the custom Zod v4 resolver instead of @hookform/resolvers/zod
//     resolver: zodV4Resolver(programCreateSchema),
//     defaultValues: {
//       title: "",
//       description: "",
//       shortDesc: "",
//       categoryId: "",
//       status: "draft",
//       format: "online",
//       level: "beginner",
//       order: 0,
//       tags: [],
//       priceTiers: [],
//     },
//     mode: "onSubmit",
//     reValidateMode: "onChange",
//   });

//   const { formState } = form;

//   /* Compute which sections have errors after submission */
//   const sectionErrors: Record<SectionId, boolean> = {
//     basic: !!(
//       formState.errors.title ||
//       formState.errors.description ||
//       formState.errors.shortDesc ||
//       formState.errors.categoryId ||
//       formState.errors.badge ||
//       formState.errors.highlight
//     ),
//     details: !!(
//       formState.errors.format ||
//       formState.errors.level ||
//       formState.errors.duration ||
//       formState.errors.order
//     ),
//     pricing: !!(
//       formState.errors.basePrice ||
//       formState.errors.originalPrice ||
//       formState.errors.priceTiers
//     ),
//     media: !!(
//       formState.errors.thumbnail ||
//       formState.errors.icon ||
//       formState.errors.tags
//     ),
//   };

//   /* Scroll-spy */
//   useEffect(() => {
//     const handleScroll = () => {
//       const scrollY = window.scrollY + 120;
//       let current: SectionId = "basic";
//       for (const id of [
//         "basic",
//         "details",
//         "pricing",
//         "media",
//       ] as SectionId[]) {
//         const el = document.getElementById(`section-${id}`);
//         if (el && el.getBoundingClientRect().top + window.scrollY <= scrollY) {
//           current = id;
//         }
//       }
//       setActiveSection(current);
//     };
//     window.addEventListener("scroll", handleScroll, { passive: true });
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   const handleNavigate = useCallback((id: SectionId) => {
//     setActiveSection(id);
//     const el = document.getElementById(`section-${id}`);
//     if (el) {
//       const top = el.getBoundingClientRect().top + window.scrollY - 96;
//       window.scrollTo({ top, behavior: "smooth" });
//     }
//   }, []);

//   async function onSubmit(values: ProgramCreateInput) {
//     setIsSubmitting(true);
//     await new Promise((r) => setTimeout(r, 1800));
//     console.log(values);
//     setIsSubmitting(false);
//     setIsSuccess(true);
//   }

//   function onError() {
//     const order: SectionId[] = ["basic", "details", "pricing", "media"];
//     for (const id of order) {
//       if (sectionErrors[id]) {
//         handleNavigate(id);
//         break;
//       }
//     }
//   }

//   /* ── Success screen ── */
//   if (isSuccess) {
//     return (
//       <>
//         <SiteHeader
//           breadcrumbs={[
//             { label: "Dashboard", href: "/dashboard" },
//             { label: "Programs", href: "/dashboard/programs" },
//             { label: "Create" },
//           ]}
//         />
//         <div className="flex flex-1 items-center justify-center py-20">
//           <div className="text-center max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
//             <div className="relative mx-auto mb-6 flex size-16 items-center justify-center">
//               <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />
//               <div className="relative flex size-16 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200">
//                 <Check className="size-7 text-emerald-600" strokeWidth={2.5} />
//               </div>
//             </div>
//             <h2 className="text-xl font-bold mb-2 text-neutral-800">
//               Program Created
//             </h2>
//             <p className="text-sm text-neutral-500 mb-8 leading-relaxed">
//               Your program has been saved. Head to the dashboard to publish,
//               preview, or make edits.
//             </p>
//             <div className="flex gap-3 justify-center">
//               <Button variant="outline" asChild className="gap-2 rounded-lg">
//                 <Link href="/dashboard/programs">
//                   <ArrowLeft className="size-4" />
//                   View Programs
//                 </Link>
//               </Button>
//               <Button
//                 className="gap-2 rounded-lg"
//                 onClick={() => {
//                   setIsSuccess(false);
//                   setCompletedSections(new Set());
//                   form.reset();
//                   window.scrollTo({ top: 0 });
//                 }}
//               >
//                 <Plus className="size-4" />
//                 Create Another
//               </Button>
//             </div>
//           </div>
//         </div>
//       </>
//     );
//   }

//   /* Live preview items */
//   const previewItems = [
//     { label: "Title", value: form.watch("title") || null },
//     {
//       label: "Category",
//       value:
//         CATEGORIES.find((c) => c.id === form.watch("categoryId"))?.label ||
//         null,
//     },
//     { label: "Format", value: form.watch("format") || null },
//     { label: "Level", value: form.watch("level") || null },
//     {
//       label: "Duration",
//       value: form.watch("duration") ? `${form.watch("duration")} hrs` : null,
//     },
//     { label: "Status", value: form.watch("status") || null },
//   ];

//   const totalErrors = Object.values(sectionErrors).filter(Boolean).length;

//   return (
//     <>
//       <SiteHeader
//         breadcrumbs={[
//           { label: "Dashboard", href: "/dashboard" },
//           { label: "Programs", href: "/dashboard/programs" },
//           { label: "Create" },
//         ]}
//       />

//       <div className="flex flex-1 flex-col ">
//         <div className="mx-auto w-full max-w-6xl py-6 lg:py-8">
//           {/* Page header */}
//           <div className="mb-8 flex items-start gap-4">
//             <Button
//               asChild
//               variant="outline"
//               size="icon"
//               className="size-9 shrink-0 rounded-lg mt-0.5"
//             >
//               <Link href="/dashboard/programs">
//                 <ArrowLeft className="size-4" />
//               </Link>
//             </Button>
//             <div className="flex-1 min-w-0">
//               <h1 className="text-lg font-bold text-neutral-800">
//                 Create Program
//               </h1>
//               <p className="text-sm text-neutral-400 mt-0.5">
//                 Fill out all sections, then submit when ready.
//               </p>
//             </div>
//           </div>

//           {/* Validation error banner */}
//           {formState.submitCount > 0 && totalErrors > 0 && (
//             <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 animate-in fade-in slide-in-from-top-2 duration-200">
//               <AlertCircle className="size-4 text-red-500 shrink-0 mt-0.5" />
//               <div>
//                 <p className="text-sm font-medium text-red-700">
//                   Please fix the errors in {totalErrors} section
//                   {totalErrors > 1 ? "s" : ""} before submitting.
//                 </p>
//                 <div className="flex flex-wrap gap-2 mt-1.5">
//                   {(Object.entries(sectionErrors) as [SectionId, boolean][])
//                     .filter(([, hasError]) => hasError)
//                     .map(([id]) => (
//                       <button
//                         key={id}
//                         type="button"
//                         onClick={() => handleNavigate(id)}
//                         className="text-xs text-red-600 underline underline-offset-2 hover:text-red-800"
//                       >
//                         {SECTIONS.find((s) => s.id === id)?.label}
//                       </button>
//                     ))}
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Two-column layout */}
//           <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] xl:grid-cols-[240px_1fr] gap-4 items-start">
//             {/* ── Sticky sidebar ── */}
//             <aside className="hidden lg:flex flex-col gap-4 sticky top-6">
//               <div className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm">
//                 <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
//                   Sections
//                 </p>
//                 <SideNav
//                   activeSection={activeSection}
//                   sectionErrors={sectionErrors}
//                   completedSections={completedSections}
//                   onNavigate={handleNavigate}
//                 />
//               </div>

//               {/* Live preview */}
//               <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
//                 <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
//                   Preview
//                 </p>
//                 <div className="flex flex-col gap-2.5">
//                   {previewItems.map(({ label, value }) => (
//                     <div key={label} className="flex flex-col gap-0.5">
//                       <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
//                         {label}
//                       </span>
//                       <span
//                         className={cn(
//                           "text-xs font-medium truncate",
//                           value
//                             ? "text-neutral-700"
//                             : "text-neutral-300 italic",
//                         )}
//                       >
//                         {value ?? "Not set"}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Submit button in sidebar */}
//               <button
//                 type="submit"
//                 form="program-create-form"
//                 disabled={isSubmitting}
//                 className={cn(
//                   "flex items-center justify-center gap-2 w-full rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-150",
//                   "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/30",
//                   "disabled:opacity-50 disabled:cursor-not-allowed",
//                 )}
//               >
//                 {isSubmitting ? (
//                   <>
//                     <Loader2 className="size-4 animate-spin" />
//                     Saving…
//                   </>
//                 ) : (
//                   <>
//                     <Check className="size-4" />
//                     Create Program
//                   </>
//                 )}
//               </button>
//             </aside>

//             {/* ── Main form ── */}
//             <form
//               id="program-create-form"
//               onSubmit={form.handleSubmit(onSubmit, onError)}
//               noValidate
//             >
//               <div className="flex flex-col gap-8">
//                 {/* Basic Info */}
//                 <div
//                   ref={(el) => {
//                     sectionRefs.current.basic = el;
//                   }}
//                   className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden"
//                 >
//                   <div className="p-6 sm:p-8">
//                     <BasicSection form={form} />
//                   </div>
//                 </div>

//                 {/* Details */}
//                 <div
//                   ref={(el) => {
//                     sectionRefs.current.details = el;
//                   }}
//                   className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden"
//                 >
//                   <div className="p-6 sm:p-8">
//                     <DetailsSection form={form} />
//                   </div>
//                 </div>

//                 {/* Pricing */}
//                 <div
//                   ref={(el) => {
//                     sectionRefs.current.pricing = el;
//                   }}
//                   className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden"
//                 >
//                   <div className="p-6 sm:p-8">
//                     <PricingSection form={form} />
//                   </div>
//                 </div>

//                 {/* Media & Tags */}
//                 <div
//                   ref={(el) => {
//                     sectionRefs.current.media = el;
//                   }}
//                   className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden"
//                 >
//                   <div className="p-6 sm:p-8">
//                     <MediaSection form={form} />
//                   </div>
//                 </div>

//                 {/* Mobile submit */}
//                 <div className="lg:hidden flex flex-col gap-3">
//                   {formState.submitCount > 0 && totalErrors > 0 && (
//                     <p className="text-xs text-red-500 text-center">
//                       Fix errors in {totalErrors} section
//                       {totalErrors > 1 ? "s" : ""} above before submitting.
//                     </p>
//                   )}
//                   <button
//                     type="submit"
//                     disabled={isSubmitting}
//                     className={cn(
//                       "flex items-center justify-center gap-2 w-full rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-150",
//                       "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/30",
//                       "disabled:opacity-50 disabled:cursor-not-allowed",
//                     )}
//                   >
//                     {isSubmitting ? (
//                       <>
//                         <Loader2 className="size-4 animate-spin" />
//                         Saving…
//                       </>
//                     ) : (
//                       <>
//                         <Check className="size-4" />
//                         Create Program
//                       </>
//                     )}
//                   </button>
//                 </div>

//                 <p className="text-center text-xs text-neutral-400 pb-4">
//                   Fields marked{" "}
//                   <span className="text-red-500 font-semibold">*</span> are
//                   required
//                 </p>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default ProgramCreatePage;

import React from "react";

const page = () => {
  return <div>page</div>;
};

export default page;

// "use client";

// import { useState, forwardRef, useImperativeHandle, useRef } from "react";
// import { useForm, Controller } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { trpc } from "@/lib/trpc/client";
// import toast from "react-hot-toast";
// import {
//   Pencil,
//   X,
//   Check,
//   Loader2,
//   FileText,
//   Tag,
//   Layers,
//   Megaphone,
//   DollarSign,
//   Globe,
//   Hash,
//   Clock,
//   CalendarDays,
//   RefreshCw,
//   ExternalLink,
//   Copy,
//   ImageOff,
//   Upload,
//   AlertCircle,
//   BookOpen,
//   Repeat,
//   CalendarClock,
//   TrendingUp,
//   Award,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { cn, formatDuration } from "@/lib/utils";
// import { motion, AnimatePresence } from "framer-motion";

// import {
//   StyledInput,
//   StyledTextarea,
//   SelectInput,
//   FormField,
// } from "@/components/Form";
// import {
//   PROGRAM_FORMAT_OPTIONS,
//   PROGRAM_LEVEL_OPTIONS,
//   PROGRAM_STATUS_META,
//   PROGRAM_STATUS_OPTIONS,
// } from "@/lib/enums/enums";
// import { OverviewData } from "@/app/modules/program/server/program.router";
// import { TagInput } from "../../../../create/client";
// import { RichTextEditor } from "@/components/rich-text-editor/Editor";
// import DurationInput from "@/components/Form/DurationInput";

// /* ═══════════════════════════════════════════════════════════
//    SCHEMA
// ═══════════════════════════════════════════════════════════ */

// const schema = z.object({
//   title: z.string().min(1, "Title is required"),
//   shortDesc: z.string().optional(),
//   description: z.string().optional(),
//   level: z.string(),
//   format: z.string(),
//   status: z.string(),
//   scheduleType: z.string(),
//   registrationType: z.string(),
//   duration: z.number().optional(),
//   badge: z.string().optional(),
//   highlight: z.string().optional(),
//   tags: z.array(z.string()).optional(),
// });
// type FormValues = z.infer<typeof schema>;

// export interface OverviewInfoHandle {
//   startEditing: () => void;
// }

// /* ═══════════════════════════════════════════════════════════
//    SMALL PRIMITIVES
// ═══════════════════════════════════════════════════════════ */

// function SectionLabel({
//   icon,
//   label,
// }: {
//   icon: React.ReactNode;
//   label: string;
// }) {
//   return (
//     <div className="flex items-center gap-2 mb-4">
//       <span className="flex size-6 items-center justify-center rounded-md bg-neutral-100 text-neutral-500">
//         {icon}
//       </span>
//       <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">
//         {label}
//       </span>
//     </div>
//   );
// }

// function ReadField({
//   label,
//   children,
//   empty,
// }: {
//   label: string;
//   children?: React.ReactNode;
//   empty?: boolean;
// }) {
//   return (
//     <div className="group flex flex-col gap-0.5">
//       <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
//         {label}
//       </span>
//       <div
//         className={cn(
//           "text-sm leading-relaxed",
//           empty ? "text-neutral-300 italic" : "text-neutral-800",
//         )}
//       >
//         {children ?? "—"}
//       </div>
//     </div>
//   );
// }

// function Divider() {
//   return <div className="h-px bg-neutral-100 my-1" />;
// }

// function MetaPill({
//   children,
//   className,
// }: {
//   children: React.ReactNode;
//   className?: string;
// }) {
//   return (
//     <span
//       className={cn(
//         "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
//         className,
//       )}
//     >
//       {children}
//     </span>
//   );
// }

// function CopyButton({ text }: { text: string }) {
//   const [copied, setCopied] = useState(false);
//   return (
//     <button
//       onClick={() => {
//         navigator.clipboard.writeText(text);
//         setCopied(true);
//         setTimeout(() => setCopied(false), 1500);
//       }}
//       className="text-neutral-300 hover:text-neutral-600 transition-colors"
//       title="Copy"
//     >
//       {copied ? (
//         <Check className="size-3 text-emerald-500" />
//       ) : (
//         <Copy className="size-3" />
//       )}
//     </button>
//   );
// }

// /* ═══════════════════════════════════════════════════════════
//    FORMAT / LABEL HELPERS
// ═══════════════════════════════════════════════════════════ */

// const FORMAT_MAP: Record<string, string> = {
//   online: "Online",
//   offline: "Offline",
//   hybrid: "Hybrid",
// };
// const LEVEL_MAP: Record<string, string> = {
//   beginner: "Beginner",
//   intermediate: "Intermediate",
//   advanced: "Advanced",
// };

// function formatCurrency(value: number | null | undefined) {
//   if (value == null) return null;
//   return new Intl.NumberFormat("id-ID", {
//     style: "currency",
//     currency: "IDR",
//     minimumFractionDigits: 0,
//   }).format(value);
// }

// function formatDate(
//   d: Date | string | null | undefined,
//   opts?: Intl.DateTimeFormatOptions,
// ) {
//   if (!d) return null;
//   return new Intl.DateTimeFormat("en-GB", {
//     day: "numeric",
//     month: "short",
//     year: "numeric",
//     ...opts,
//   }).format(new Date(d));
// }

// /* ═══════════════════════════════════════════════════════════
//    READ MODE SECTIONS
// ═══════════════════════════════════════════════════════════ */

// function ReadBasicInfo({ data }: { data: OverviewData }) {
//   return (
//     <div className="flex flex-col gap-4">
//       <SectionLabel
//         icon={<FileText className="size-3.5" />}
//         label="Basic Information"
//       />
//       <ReadField label="Title">
//         <span className="font-semibold text-neutral-900">{data.title}</span>
//       </ReadField>
//       <ReadField label="Short Description" empty={!data.shortDesc}>
//         {data.shortDesc || "No short description"}
//       </ReadField>
//       <ReadField label="Full Description" empty={!data.description}>
//         {data.description ? (
//           <div
//             className="prose prose-sm prose-neutral max-w-none text-neutral-600 line-clamp-4"
//             dangerouslySetInnerHTML={{ __html: data.description }}
//           />
//         ) : (
//           "No description"
//         )}
//       </ReadField>
//     </div>
//   );
// }

// function ReadClassification({ data }: { data: OverviewData }) {
//   const statusStyle = PROGRAM_STATUS_META[data.identity.status].ui;

//   return (
//     <div className="flex flex-col gap-4">
//       <SectionLabel
//         icon={<Layers className="size-3.5" />}
//         label="Classification"
//       />
//       <div className="grid grid-cols-2 gap-x-6 gap-y-4">
//         <ReadField label="Category" empty={!data.category}>
//           {data.category && (
//             <MetaPill className="bg-neutral-50 border-neutral-200 text-neutral-700">
//               <BookOpen className="size-3" />
//               {data.category.label}
//             </MetaPill>
//           )}
//         </ReadField>
//         <ReadField label="Level">
//           <MetaPill className="bg-blue-50 border-blue-100 text-blue-700">
//             {LEVEL_MAP[data.level] ?? data.level}
//           </MetaPill>
//         </ReadField>
//         <ReadField label="Format">
//           <MetaPill className="bg-neutral-50 border-neutral-200 text-neutral-700">
//             {FORMAT_MAP[data.format] ?? data.format}
//           </MetaPill>
//         </ReadField>
//         <ReadField label="Schedule">
//           <MetaPill className="bg-neutral-50 border-neutral-200 text-neutral-700">
//             {data.scheduleType === "scheduled" ? (
//               <>
//                 <CalendarClock className="size-3" /> Scheduled
//               </>
//             ) : (
//               <>
//                 <Repeat className="size-3" /> Permanent
//               </>
//             )}
//           </MetaPill>
//         </ReadField>
//         <ReadField label="Registration">
//           <MetaPill className="bg-neutral-50 border-neutral-200 text-neutral-600">
//             {data.registrationType === "online" ? "Online" : "Offline"}
//           </MetaPill>
//         </ReadField>
//         <ReadField label="Duration" empty={!data.duration}>
//           {data.duration ? (
//             <span className="flex items-center gap-1.5 text-neutral-700">
//               <Clock className="size-3.5 text-neutral-400 shrink-0" />
//               {formatDuration(data.duration)}
//             </span>
//           ) : null}
//         </ReadField>
//       </div>
//     </div>
//   );
// }

// function ReadMarketing({ data }: { data: OverviewData }) {
//   const tags = (data.tags as string[]) ?? [];
//   return (
//     <div className="flex flex-col gap-4">
//       <SectionLabel
//         icon={<Megaphone className="size-3.5" />}
//         label="Marketing"
//       />
//       <div className="grid grid-cols-2 gap-x-6 gap-y-4">
//         <ReadField label="Badge" empty={!data.badge}>
//           {data.badge && (
//             <MetaPill className="bg-amber-50 border-amber-200 text-amber-800">
//               <Award className="size-3" />
//               {data.badge}
//             </MetaPill>
//           )}
//         </ReadField>
//         <ReadField label="Highlight" empty={!data.highlight}>
//           {data.highlight && (
//             <div className="inline-flex max-w-full items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
//               <TrendingUp className="size-3 shrink-0 text-emerald-500" />
//               <span className="">{data.highlight}</span>
//             </div>
//           )}
//         </ReadField>
//       </div>
//       <ReadField label="Tags" empty={tags.length === 0}>
//         {tags.length > 0 && (
//           <div className="flex flex-wrap gap-1.5 mt-0.5">
//             {tags.map((t) => (
//               <span
//                 key={t}
//                 className="inline-flex items-center gap-1 rounded-full bg-purple-50 border border-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700"
//               >
//                 <Tag className="size-3" />
//                 {t}
//               </span>
//             ))}
//           </div>
//         )}
//       </ReadField>
//     </div>
//   );
// }

// function ReadCommerce({ data }: { data: OverviewData }) {
//   const price = formatCurrency(data.startingPrice);
//   const original = formatCurrency(data.startingOriginalPrice);
//   return (
//     <div className="flex flex-col gap-4">
//       <SectionLabel
//         icon={<DollarSign className="size-3.5" />}
//         label="Commerce"
//       />
//       <div className="grid grid-cols-2 gap-x-6 gap-y-4">
//         <ReadField label="Starting Price" empty={!price}>
//           {price && (
//             <span className="text-base font-bold text-neutral-900">
//               {price}
//             </span>
//           )}
//         </ReadField>
//         <ReadField label="Original Price" empty={!original}>
//           {original && (
//             <span className="text-sm font-medium text-neutral-400 line-through">
//               {original}
//             </span>
//           )}
//         </ReadField>
//       </div>
//       <p className="text-[11px] text-neutral-400 bg-neutral-50 border border-neutral-100 rounded-lg px-3 py-2">
//         Display-only pricing for cards and listings. Actual purchasable prices
//         are managed per package.
//       </p>
//     </div>
//   );
// }

// /* ═══════════════════════════════════════════════════════════
//    READ MODE — SIDEBAR PANELS
// ═══════════════════════════════════════════════════════════ */

// function ThumbnailPanel({ data }: { data: OverviewData }) {
//   return (
//     <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
//       <div className="px-4 py-3 border-b border-neutral-100">
//         <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
//           Cover Image
//         </p>
//       </div>
//       <div className="p-4">
//         <div className="relative rounded-lg overflow-hidden bg-neutral-100 aspect-[3/4]">
//           {data.thumbnailUrl ? (
//             <img
//               src={data.thumbnailUrl}
//               alt={data.title}
//               className="w-full h-full object-cover"
//             />
//           ) : (
//             <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
//               <div className="rounded-lg bg-neutral-200/60 p-3">
//                 <ImageOff className="size-5 text-neutral-400" />
//               </div>
//               <span className="text-[11px] text-neutral-400 font-medium">
//                 No cover image
//               </span>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// function PublishingPanel({ data }: { data: OverviewData }) {
//   const statusStyle = PROGRAM_STATUS_META[data.status].ui;
//   return (
//     <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
//       <div className="px-4 py-3 border-b border-neutral-100">
//         <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
//           Publishing
//         </p>
//       </div>
//       <div className="p-4 flex flex-col gap-3">
//         {/* Status */}
//         <div className="flex items-center justify-between">
//           <span className="text-xs text-neutral-500 font-medium">Status</span>
//           <MetaPill
//             className={cn(statusStyle.bg, statusStyle.text, statusStyle.border)}
//           >
//             <span
//               className={cn("size-1.5 rounded-full shrink-0", statusStyle.dot)}
//             />
//             {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
//           </MetaPill>
//         </div>
//         <Divider />
//         <div className="flex flex-col gap-2.5 text-xs">
//           <div className="flex justify-between gap-2">
//             <span className="text-neutral-400 flex items-center gap-1.5">
//               <CalendarDays className="size-3" /> Created
//             </span>
//             <span className="text-neutral-700 font-medium">
//               {formatDate(data.createdAt)}
//             </span>
//           </div>
//           <div className="flex justify-between gap-2">
//             <span className="text-neutral-400 flex items-center gap-1.5">
//               <Globe className="size-3" /> Published
//             </span>
//             <span className="text-neutral-700 font-medium">
//               {formatDate(data.publishedAt) ?? "—"}
//             </span>
//           </div>
//           {data.contentMeta?.updatedAt && (
//             <div className="flex justify-between gap-2">
//               <span className="text-neutral-400 flex items-center gap-1.5">
//                 <RefreshCw className="size-3" /> Content
//               </span>
//               <span className="text-neutral-700 font-medium">
//                 {formatDate(data.contentMeta.updatedAt)}
//               </span>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// function WorkspaceMetaPanel({
//   data,
//   programId,
// }: {
//   data: OverviewData;
//   programId: string;
// }) {
//   return (
//     <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
//       <div className="px-4 py-3 border-b border-neutral-100">
//         <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
//           Workspace
//         </p>
//       </div>
//       <div className="p-4 flex flex-col gap-2">
//         {[
//           { label: "Program ID", value: programId },
//           { label: "Slug", value: data.slug },
//           {
//             label: "Live URL",
//             value: `/programs/${data.category.slug}/${data.slug}`,
//             isLink: true,
//           },
//         ].map(({ label, value, isLink }) => (
//           <div key={label} className="flex flex-col gap-0.5">
//             <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
//               {label}
//             </span>
//             <div className="flex items-center gap-1.5 group">
//               {isLink ? (
//                 <a
//                   href={value}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="text-xs text-blue-600 hover:underline font-mono truncate flex items-center gap-1"
//                 >
//                   <ExternalLink className="size-3 shrink-0" />
//                   {value}
//                 </a>
//               ) : (
//                 <span className="text-xs font-mono text-neutral-600 truncate">
//                   {value}
//                 </span>
//               )}
//               <CopyButton
//                 text={
//                   isLink
//                     ? `${typeof window !== "undefined" ? window.location.origin : ""}${value}`
//                     : value
//                 }
//               />
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// /* ═══════════════════════════════════════════════════════════
//    EDIT MODE — GROUPED FORM SECTIONS
// ═══════════════════════════════════════════════════════════ */

// function EditSection({
//   icon,
//   label,
//   children,
// }: {
//   icon: React.ReactNode;
//   label: string;
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
//       <div
//         className={cn(
//           "flex items-center gap-2.5 px-5 py-3.5 border-b border-neutral-100 bg-neutral-50/60",
//         )}
//       >
//         <span className="flex size-6 items-center justify-center rounded-md bg-neutral-200/60 text-neutral-500 shrink-0">
//           {icon}
//         </span>
//         <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
//           {label}
//         </span>
//       </div>
//       <div className="p-5 flex flex-col gap-4">{children}</div>
//     </div>
//   );
// }

// function EditBasicInfo({
//   form,
// }: {
//   form: ReturnType<typeof useForm<FormValues>>;
// }) {
//   const {
//     register,
//     formState: { errors },
//     control,
//   } = form;
//   return (
//     <EditSection
//       icon={<FileText className="size-3.5" />}
//       label="Basic Information"
//     >
//       <FormField label="Judul Program" required error={errors.title?.message}>
//         <StyledInput
//           {...register("title")}
//           placeholder="Contoh: Daily Conversation Intensif"
//           error={!!errors.title}
//           maxLength={100}
//         />
//       </FormField>
//       <FormField label="Deskripsi Singkat" error={errors.shortDesc?.message}>
//         <StyledTextarea
//           {...register("shortDesc")}
//           rows={2}
//           maxLength={200}
//           placeholder="Satu kalimat menarik yang membuat orang ingin mendaftar…"
//         />
//       </FormField>

//       <Controller
//         name="description"
//         control={form.control}
//         render={({ field }) => (
//           <FormField
//             label="Deskripsi Lengkap"
//             required
//             error={errors.description?.message}
//           >
//             <RichTextEditor field={field}></RichTextEditor>
//           </FormField>
//         )}
//       ></Controller>
//     </EditSection>
//   );
// }

// function EditClassification({
//   form,
// }: {
//   form: ReturnType<typeof useForm<FormValues>>;
// }) {
//   return (
//     <EditSection icon={<Layers className="size-3.5" />} label="Classification">
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//         <FormField label="Format" required>
//           <Controller
//             name="format"
//             control={form.control}
//             render={({ field }) => (
//               <SelectInput
//                 options={PROGRAM_FORMAT_OPTIONS}
//                 value={field.value}
//                 onChange={field.onChange}
//                 variant="dropdown"
//               />
//             )}
//           />
//         </FormField>
//         <FormField label="Level" required>
//           <Controller
//             name="level"
//             control={form.control}
//             render={({ field }) => (
//               <SelectInput
//                 options={PROGRAM_LEVEL_OPTIONS}
//                 value={field.value}
//                 onChange={field.onChange}
//                 variant="dropdown"
//               />
//             )}
//           />
//         </FormField>
//         <FormField label="Schedule Type" required>
//           <Controller
//             name="scheduleType"
//             control={form.control}
//             render={({ field }) => (
//               <SelectInput
//                 options={[
//                   { id: "permanent", label: "Permanent" },
//                   { id: "scheduled", label: "Scheduled" },
//                 ]}
//                 value={field.value}
//                 onChange={field.onChange}
//                 variant="dropdown"
//               />
//             )}
//           />
//         </FormField>
//         <FormField label="Registration Type" required>
//           <Controller
//             name="registrationType"
//             control={form.control}
//             render={({ field }) => (
//               <SelectInput
//                 options={[
//                   { id: "online", label: "Online" },
//                   { id: "offline", label: "Offline" },
//                 ]}
//                 value={field.value}
//                 onChange={field.onChange}
//                 variant="dropdown"
//               />
//             )}
//           />
//         </FormField>
//       </div>
//       <Controller
//         name="duration"
//         control={form.control}
//         render={({ field, fieldState }) => (
//           <FormField label="Estimasi Durasi" error={fieldState.error?.message}>
//             <DurationInput
//               value={field.value}
//               onChange={field.onChange}
//               onBlur={field.onBlur}
//               error={!!fieldState.error}
//             />
//           </FormField>
//         )}
//       />
//     </EditSection>
//   );
// }

// function EditMarketing({
//   form,
// }: {
//   form: ReturnType<typeof useForm<FormValues>>;
// }) {
//   return (
//     <EditSection icon={<Megaphone className="size-3.5" />} label="Marketing">
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//         <FormField label="Badge" hint="e.g. Bestseller, New, Hot">
//           <StyledInput {...form.register("badge")} placeholder="Bestseller" />
//         </FormField>
//         <FormField label="Highlight" hint="Short selling point shown on cards">
//           <StyledInput
//             {...form.register("highlight")}
//             placeholder="Certificate included"
//           />
//         </FormField>
//       </div>
//       <FormField label="Tags" hint="Press Enter or comma to add">
//         <Controller
//           name="tags"
//           control={form.control}
//           render={({ field }) => (
//             <TagInput value={field.value ?? []} onChange={field.onChange} />
//           )}
//         />
//       </FormField>
//     </EditSection>
//   );
// }

// function EditCommerce({ data }: { data: OverviewData }) {
//   const startingPrice = formatCurrency(data.startingPrice);
//   const originalPrice = formatCurrency(data.startingOriginalPrice);

//   return (
//     <EditSection icon={<DollarSign className="size-3.5" />} label="Commerce">
//       <p className="text-xs text-neutral-500 bg-neutral-50 border border-neutral-100 rounded-lg px-3 py-2 -mt-1">
//         Display-only pricing used for cards & listings. Actual prices are
//         managed per package.
//       </p>
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//         <FormField
//           label="Starting Price"
//           hint={"This field is auto-calculated based on cheapest package"}
//         >
//           <div className="relative">
//             <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400 font-mono pointer-events-none">
//               Rp
//             </span>
//             <StyledInput
//               disabled
//               value={startingPrice ?? "—"}
//               className="pl-7 cursor-not-allowed opacity-60 font-mono"
//             />
//           </div>
//         </FormField>

//         <FormField
//           label="Original Price"
//           hint={"This field is auto-calculated based on cheapest package"}
//         >
//           <div className="relative">
//             <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400 font-mono pointer-events-none">
//               Rp
//             </span>
//             <StyledInput
//               disabled
//               value={originalPrice ?? "—"}
//               className="pl-7 cursor-not-allowed opacity-60 font-mono"
//             />
//           </div>
//         </FormField>
//       </div>

//       <div className="flex items-center gap-2 px-3 py-2.5 bg-neutral-50 border border-neutral-100 rounded-lg">
//         <AlertCircle className="size-3.5 text-neutral-400 shrink-0" />
//         <p className="text-xs text-neutral-500">
//           To update pricing, modify
//           <a href="#packages" className="text-blue-600 hover:underline">
//             package configuration
//           </a>
//           . These values are auto-derived.
//         </p>
//       </div>
//     </EditSection>
//   );
// }

// function EditPublishingSidebar({
//   form,
// }: {
//   form: ReturnType<typeof useForm<FormValues>>;
// }) {
//   return (
//     <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
//       <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-neutral-100 bg-neutral-50/60">
//         <span className="flex size-6 items-center justify-center rounded-md bg-neutral-200/60 text-neutral-500 shrink-0">
//           <Globe className="size-3.5" />
//         </span>
//         <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
//           Publishing
//         </span>
//       </div>
//       <div className="p-4">
//         <FormField label="Status" required>
//           <Controller
//             name="status"
//             control={form.control}
//             render={({ field }) => (
//               <SelectInput
//                 options={PROGRAM_STATUS_OPTIONS}
//                 value={field.value}
//                 onChange={field.onChange}
//                 variant="dropdown"
//               />
//             )}
//           />
//         </FormField>
//       </div>
//     </div>
//   );
// }

// /* ═══════════════════════════════════════════════════════════
//    STICKY SAVE BAR
// ═══════════════════════════════════════════════════════════ */

// function StickySaveBar({
//   isDirty,
//   isSubmitting,
//   onCancel,
//   onSave,
// }: {
//   isDirty: boolean;
//   isSubmitting: boolean;
//   onCancel: () => void;
//   onSave: () => void;
// }) {
//   return (
//     <AnimatePresence>
//       {isDirty && (
//         <>
//           {/* Desktop: floating bottom-right */}
//           <motion.div
//             key="desktop-bar"
//             initial={{ opacity: 0, y: 16, scale: 0.97 }}
//             animate={{ opacity: 1, y: 0, scale: 1 }}
//             exit={{ opacity: 0, y: 16, scale: 0.97 }}
//             transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
//             className="hidden lg:flex fixed bottom-6 right-6 z-50 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 shadow-lg shadow-black/10"
//           >
//             <span className="flex items-center gap-1.5 text-xs text-amber-600 font-medium mr-2">
//               <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
//               Unsaved changes
//             </span>
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={onCancel}
//               disabled={isSubmitting}
//               className="h-7 text-xs"
//             >
//               Discard
//             </Button>
//             <Button
//               size="sm"
//               onClick={onSave}
//               disabled={isSubmitting}
//               className="h-7 text-xs gap-1.5"
//             >
//               {isSubmitting ? (
//                 <Loader2 className="size-3 animate-spin" />
//               ) : (
//                 <Check className="size-3" />
//               )}
//               Save changes
//             </Button>
//           </motion.div>

//           {/* Mobile: full-width bottom bar */}
//           <motion.div
//             key="mobile-bar"
//             initial={{ opacity: 0, y: 24 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: 24 }}
//             transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
//             className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center gap-2 border-t border-neutral-200 bg-white/95 backdrop-blur-sm px-4 py-3 shadow-[0_-4px_16px_0_rgba(0,0,0,0.06)]"
//           >
//             <span className="flex items-center gap-1.5 text-xs text-amber-600 font-medium flex-1">
//               <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
//               Unsaved changes
//             </span>
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={onCancel}
//               disabled={isSubmitting}
//               className="h-8 text-xs shrink-0"
//             >
//               Discard
//             </Button>
//             <Button
//               size="sm"
//               onClick={onSave}
//               disabled={isSubmitting}
//               className="h-8 text-xs gap-1.5 shrink-0"
//             >
//               {isSubmitting ? (
//                 <Loader2 className="size-3 animate-spin" />
//               ) : (
//                 <Check className="size-3" />
//               )}
//               Save
//             </Button>
//           </motion.div>
//         </>
//       )}
//     </AnimatePresence>
//   );
// }

// /* ═══════════════════════════════════════════════════════════
//    OVERVIEW INFO — ROOT
// ═══════════════════════════════════════════════════════════ */

// interface OverviewInfoProps {
//   data: OverviewData;
//   programId: string;
//   id?: string;
// }

// export const OverviewInfo = forwardRef<OverviewInfoHandle, OverviewInfoProps>(
//   function OverviewInfo({ data, programId, id }, ref) {
//     const [isEditing, setIsEditing] = useState(false);
//     const utils = trpc.useUtils();

//     useImperativeHandle(ref, () => ({
//       startEditing() {
//         setIsEditing(true);
//       },
//     }));

//     const form = useForm<FormValues>({
//       resolver: zodResolver(schema),
//       defaultValues: {
//         title: data.title,
//         shortDesc: data.shortDesc ?? "",
//         description: data.description ?? "",
//         level: data.level,
//         format: data.format,
//         status: data.status,
//         scheduleType: data.scheduleType,
//         registrationType: data.registrationType,
//         duration: data.duration ?? undefined,
//         badge: data.badge ?? "",
//         highlight: data.highlight ?? "",
//         tags: (data.tags as string[]) ?? [],
//       },
//     });

//     const isDirty = form.formState.isDirty;
//     const isSubmitting = form.formState.isSubmitting;

//     async function onSubmit(values: FormValues) {
//       try {
//         // await updateProgram.mutateAsync({ id: programId, ...values });
//         await new Promise((r) => setTimeout(r, 800));
//         utils.programs.getOverview.invalidate({ id: programId });
//         toast.success("Program updated");
//         setIsEditing(false);
//         form.reset(values); // reset dirty state with saved values
//       } catch {
//         toast.error("Failed to save changes");
//       }
//     }

//     function handleCancel() {
//       setIsEditing(false);
//       form.reset();
//     }

//     return (
//       <div id={id}>
//         {/* ── Header bar ── */}
//         <div className="flex items-center justify-between mb-4">
//           <div className="flex items-center gap-2">
//             <h2 className="text-sm font-semibold text-neutral-800">
//               Program Details
//             </h2>
//             {isEditing && isDirty && (
//               <motion.span
//                 initial={{ opacity: 0, scale: 0.9 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 className="text-[10px] font-semibold bg-amber-50 border border-amber-200 text-amber-600 rounded-full px-2 py-0.5"
//               >
//                 Unsaved
//               </motion.span>
//             )}
//           </div>
//           <AnimatePresence mode="wait">
//             {isEditing ? (
//               <motion.div
//                 key="edit-actions"
//                 initial={{ opacity: 0, x: 8 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 exit={{ opacity: 0, x: 8 }}
//                 className="flex items-center gap-2"
//               >
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   onClick={handleCancel}
//                   className="h-7 text-xs"
//                 >
//                   <X className="size-3.5" /> Cancel
//                 </Button>
//                 <Button
//                   size="sm"
//                   disabled={isSubmitting || !isDirty}
//                   onClick={form.handleSubmit(onSubmit)}
//                   className="h-7 text-xs gap-1.5"
//                 >
//                   {isSubmitting ? (
//                     <Loader2 className="size-3.5 animate-spin" />
//                   ) : (
//                     <Check className="size-3.5" />
//                   )}
//                   Save changes
//                 </Button>
//               </motion.div>
//             ) : (
//               <motion.div
//                 key="view-action"
//                 initial={{ opacity: 0, x: -8 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 exit={{ opacity: 0, x: -8 }}
//               >
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => setIsEditing(true)}
//                   className="h-7 text-xs"
//                 >
//                   <Pencil className="size-3.5" /> Edit details
//                 </Button>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>

//         {/* ── Two-column workspace layout ── */}
//         <AnimatePresence mode="wait">
//           {isEditing ? (
//             <motion.div
//               key="edit-mode"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               transition={{ duration: 0.15 }}
//               className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4 items-start"
//             >
//               {/* Left: content forms */}
//               <div className="flex flex-col gap-4">
//                 <EditBasicInfo form={form} />
//                 <EditClassification form={form} />
//                 <EditMarketing form={form} />
//                 <EditCommerce data={data} />
//               </div>

//               {/* Right: publishing + workspace meta */}
//               <div className="flex flex-col gap-3 lg:sticky lg:top-24">
//                 <EditPublishingSidebar form={form} />
//                 {/* Thumbnail placeholder — wire to actual upload in next pass */}
//                 <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
//                   <div className="px-4 py-3 border-b border-neutral-100">
//                     <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
//                       Cover Image
//                     </p>
//                   </div>
//                   <div className="p-4">
//                     <div className="relative rounded-lg overflow-hidden bg-neutral-100 aspect-[3/4] group cursor-pointer hover:bg-neutral-200/60 transition-colors">
//                       {data.thumbnailUrl ? (
//                         <img
//                           src={data.thumbnailUrl}
//                           alt={data.title}
//                           className="w-full h-full object-cover"
//                         />
//                       ) : (
//                         <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
//                           <div className="rounded-lg bg-neutral-200/60 p-3 group-hover:bg-neutral-300/60 transition-colors">
//                             <Upload className="size-5 text-neutral-400" />
//                           </div>
//                           <span className="text-[11px] text-neutral-400 font-medium">
//                             Upload cover
//                           </span>
//                         </div>
//                       )}
//                     </div>
//                     <p className="text-[11px] text-neutral-400 mt-2 text-center">
//                       Recommended 3:4 ratio
//                     </p>
//                   </div>
//                 </div>
//                 <WorkspaceMetaPanel data={data} programId={programId} />
//               </div>
//             </motion.div>
//           ) : (
//             <motion.div
//               key="read-mode"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               transition={{ duration: 0.15 }}
//               className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-4 items-start"
//             >
//               {/* Left: read sections */}
//               <div className="rounded-xl border border-neutral-200 bg-white divide-y divide-neutral-100 overflow-hidden">
//                 <div className="p-5">
//                   <ReadBasicInfo data={data} />
//                 </div>
//                 <div className="p-5">
//                   <ReadClassification data={data} />
//                 </div>
//                 <div className="p-5">
//                   <ReadMarketing data={data} />
//                 </div>
//                 <div className="p-5">
//                   <ReadCommerce data={data} />
//                 </div>
//               </div>

//               {/* Right: sidebar panels */}
//               <div className="flex flex-col gap-3 lg:sticky lg:top-24">
//                 <ThumbnailPanel data={data} />
//                 <PublishingPanel data={data} />
//                 <WorkspaceMetaPanel data={data} programId={programId} />
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {/* Sticky save bar — only in edit mode with dirty state */}
//         {isEditing && (
//           <StickySaveBar
//             isDirty={isDirty}
//             isSubmitting={isSubmitting}
//             onCancel={handleCancel}
//             onSave={form.handleSubmit(onSubmit)}
//           />
//         )}
//       </div>
//     );
//   },
// );

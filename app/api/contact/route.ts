import {
  buildAdminEmail,
  buildAutoReplyEmail,
  CATEGORY_LABELS,
  ContactBody,
} from "@/app/server/api/email/contact";
import { NextRequest, NextResponse } from "next/server";
import { resend } from "@/lib/resend";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "support@inggrisgo.com";
const FROM_EMAIL = process.env.FROM_EMAIL ?? "noreply@inggrisgo.com";
const FROM_NAME = "InggrisGo";

/* ─── Validation ─────────────────────────────────────── */
function validateBody(body: unknown): body is ContactBody {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  if (typeof b.name !== "string" || b.name.trim().length < 2) return false;
  if (
    typeof b.email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email)
  )
    return false;
  if (typeof b.message !== "string" || b.message.trim().length < 10)
    return false;
  return true;
}

/* ─── Handler ────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    // Parse body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
    }

    // Validate
    if (!validateBody(body)) {
      return NextResponse.json(
        { error: "Data tidak lengkap atau tidak valid" },
        { status: 422 },
      );
    }

    const data = body as ContactBody;
    const categoryLabel = data.category
      ? (CATEGORY_LABELS[data.category] ?? data.category)
      : "";
    const emailSubject = data.subject
      ? `[InggrisGo] ${data.subject}`
      : `[InggrisGo] Pesan dari ${data.name}${categoryLabel ? ` — ${categoryLabel}` : ""}`;

    // Send admin notification
    const adminResult = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [ADMIN_EMAIL],
      replyTo: data.email,
      subject: emailSubject,
      html: buildAdminEmail(data),
    });

    if (adminResult.error) {
      console.error("[contact] Admin email error:", adminResult.error);
      return NextResponse.json(
        { error: "Gagal mengirim pesan. Silakan coba lagi." },
        { status: 500 },
      );
    }

    // Send auto-reply (non-blocking — don't fail if this errors)
    resend.emails
      .send({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: [data.email],
        subject: "Terima kasih sudah menghubungi InggrisGo 🎉",
        html: buildAutoReplyEmail(data.name),
      })
      .catch((err) => {
        console.warn("[contact] Auto-reply error (non-fatal):", err);
      });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("[contact] Unexpected error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server. Coba lagi nanti." },
      { status: 500 },
    );
  }
}

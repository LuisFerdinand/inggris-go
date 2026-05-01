/* ─── Types ──────────────────────────────────────────── */
export type ContactBody = {
  name: string;
  email: string;
  subject?: string;
  category?: string;
  message: string;
};

/* ─── Category labels ────────────────────────────────── */
export const CATEGORY_LABELS: Record<string, string> = {
  general: "Pertanyaan Umum",
  speaking: "Kelas Speaking",
  camp: "English Camp",
  partnership: "Kerjasama",
};

/* ─── Email Templates ────────────────────────────────── */
export function buildAdminEmail(data: ContactBody) {
  const category = data.category
    ? (CATEGORY_LABELS[data.category] ?? data.category)
    : "—";
  const subject = data.subject || "—";

  return `
<!DOCTYPE html>
<html lang="id">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f4f8ff;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(10,45,135,0.1);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0a2d87,#1a52c8);padding:28px 32px;">
      <p style="color:rgba(255,255,255,0.6);font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 4px;">InggrisGo</p>
      <h1 style="color:#fff;font-size:20px;font-weight:800;margin:0;">📩 Pesan Kontak Baru</h1>
    </div>

    <!-- Body -->
    <div style="padding:32px;">
      <table style="width:100%;border-collapse:collapse;">
        ${[
          ["Nama", data.name],
          [
            "Email",
            `<a href="mailto:${data.email}" style="color:#1e6eee;">${data.email}</a>`,
          ],
          ["Kategori", category],
          ["Subjek", subject],
        ]
          .map(
            ([label, value]) => `
        <tr>
          <td style="padding:10px 0;font-size:12px;font-weight:700;color:#7a90b8;width:120px;vertical-align:top;">${label}</td>
          <td style="padding:10px 0;font-size:14px;color:#1a2744;">${value}</td>
        </tr>
        <tr><td colspan="2"><div style="height:1px;background:#e8f0fe;"></div></td></tr>
        `,
          )
          .join("")}
        <tr>
          <td style="padding:12px 0;font-size:12px;font-weight:700;color:#7a90b8;vertical-align:top;">Pesan</td>
          <td></td>
        </tr>
      </table>

      <div style="background:#f4f8ff;border-radius:12px;padding:20px;margin-top:4px;">
        <p style="margin:0;font-size:14px;color:#1a2744;line-height:1.7;white-space:pre-wrap;">${data.message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
      </div>

      <div style="margin-top:24px;padding:16px;background:#fffbeb;border-radius:12px;border-left:4px solid #ffc107;">
        <p style="margin:0;font-size:12px;color:#7a3e00;font-weight:600;">⚡ Balas dalam 24 jam untuk menjaga kepercayaan pelajar kami.</p>
      </div>

      <div style="margin-top:24px;">
        <a href="mailto:${data.email}" style="display:inline-block;background:linear-gradient(135deg,#1a52c8,#1e6eee);color:#fff;padding:12px 24px;border-radius:12px;font-size:13px;font-weight:700;text-decoration:none;">
          Balas Sekarang →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f4f8ff;padding:16px 32px;text-align:center;">
      <p style="margin:0;font-size:11px;color:#7a90b8;">Pesan ini dikirim dari formulir kontak di inggrisgo.com</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function buildAutoReplyEmail(name: string) {
  return `
<!DOCTYPE html>
<html lang="id">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f4f8ff;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(10,45,135,0.1);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0a2d87,#1a52c8);padding:28px 32px;text-align:center;">
      <div style="width:64px;height:64px;background:rgba(255,255,255,0.15);border-radius:16px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:32px;">🎉</span>
      </div>
      <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0;">Terima kasih sudah menghubungi InggrisGo!</h1>
    </div>

    <!-- Body -->
    <div style="padding:36px 32px;text-align:center;">
      <p style="font-size:16px;color:#1a2744;font-weight:700;margin:0 0 8px;">Halo, ${name.split(" ")[0]}! 👋</p>
      <p style="font-size:14px;color:#3a5080;line-height:1.7;margin:0 0 24px;">
        Pesan kamu sudah kami terima! Tim InggrisGo akan membaca dan merespons pesanmu dalam waktu <strong style="color:#1e6eee;">24 jam</strong>.
      </p>

      <div style="background:#f4f8ff;border-radius:16px;padding:24px;margin-bottom:28px;text-align:left;">
        <p style="margin:0 0 12px;font-size:12px;font-weight:700;color:#7a90b8;letter-spacing:0.08em;text-transform:uppercase;">Sementara menunggu, kamu bisa:</p>
        ${[
          ["📖", "Baca artikel tips speaking gratis di blog kami"],
          ["🎓", "Lihat program kelas speaking & English camp"],
          ["💬", "Chat via WhatsApp untuk respons lebih cepat"],
        ]
          .map(
            ([emoji, text]) => `
          <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:10px;">
            <span style="font-size:16px;flex-shrink:0;">${emoji}</span>
            <p style="margin:0;font-size:13px;color:#3a5080;line-height:1.5;">${text}</p>
          </div>
        `,
          )
          .join("")}
      </div>

      <a href="https://inggrisgo.com/courses" style="display:inline-block;background:linear-gradient(135deg,#f5a800,#ffc107);color:#0a2d87;padding:14px 32px;border-radius:14px;font-size:14px;font-weight:800;text-decoration:none;margin-bottom:8px;">
        Lihat Program Kami →
      </a>
      <p style="margin:8px 0 0;font-size:11px;color:#7a90b8;">atau kunjungi <a href="https://inggrisgo.com/blog" style="color:#1e6eee;text-decoration:none;">blog.inggrisgo.com</a> untuk artikel gratis</p>
    </div>

    <!-- Footer -->
    <div style="background:#f4f8ff;padding:20px 32px;text-align:center;border-top:1px solid #e8f0fe;">
      <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#0a2d87;">Tim InggrisGo</p>
      <p style="margin:0;font-size:11px;color:#7a90b8;">Kami membalas setiap pesan dengan tulus 💙</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

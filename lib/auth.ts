import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "@/app/db/schema/auth-schema";
import { db } from "@/app/db/db";
import { emailOTP } from "better-auth/plugins";
import { resend } from "./resend";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),

  emailAndPassword: {
    enabled: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp }) {
        const { error } = await resend.emails.send({
          from: "InggrisGo <no-reply@inggrisgo.com>", // ⚠️ use your domain in production
          to: [email],
          subject: "Kode Verifikasi InggrisGo",

          text: `
Kode verifikasi Anda: ${otp}

Kode ini berlaku selama 5 menit.

Jika Anda tidak meminta kode ini, abaikan email ini.
      `.trim(),

          html: `
<div style="font-family: Inter, Arial, sans-serif; background:#f8fafc; padding:40px 0;">
  <div style="max-width:480px; margin:0 auto; background:white; border-radius:16px; padding:32px; box-shadow:0 10px 30px rgba(0,0,0,0.06);">
    
    <!-- Brand -->
    <div style="text-align:center; margin-bottom:24px;">
      <h1 style="margin:0; font-size:20px; color:#0f172a;">
        InggrisGo
      </h1>
    </div>

    <!-- Title -->
    <h2 style="margin:0 0 12px; font-size:18px; color:#0f172a;">
      Verifikasi Email Anda
    </h2>

    <p style="margin:0 0 24px; font-size:14px; color:#64748b;">
      Gunakan kode di bawah ini untuk melanjutkan proses masuk atau pendaftaran.
    </p>

    <!-- OTP BOX -->
    <div style="text-align:center; margin:24px 0;">
      <div style="
        display:inline-block;
        font-size:32px;
        letter-spacing:8px;
        font-weight:700;
        color:#1a52c8;
        background:#f1f5f9;
        padding:16px 24px;
        border-radius:12px;
      ">
        ${otp}
      </div>
    </div>

    <!-- Expiry -->
    <p style="margin:0 0 16px; font-size:13px; color:#475569;">
      Kode ini berlaku selama <strong>5 menit</strong>.
    </p>

    <!-- Divider -->
    <div style="height:1px; background:#e2e8f0; margin:24px 0;"></div>

    <!-- Safety -->
    <p style="margin:0; font-size:12px; color:#94a3b8;">
      Jika Anda tidak meminta kode ini, Anda dapat mengabaikan email ini dengan aman.
    </p>

  </div>

  <!-- Footer -->
  <p style="text-align:center; font-size:11px; color:#94a3b8; margin-top:16px;">
    © ${new Date().getFullYear()} InggrisGo. All rights reserved.
  </p>
</div>
      `.trim(),
        });

        if (error) {
          console.error("Failed to send OTP email:", error);
          throw new Error("Gagal mengirim kode OTP");
        }
      },
    }),
  ],
});

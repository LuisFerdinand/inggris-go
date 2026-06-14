// app/api/upload/route.ts
//
// Secure server-side upload to Cloudinary.
// The client sends the file as multipart/form-data.
// This route signs the upload on the server so the API secret
// never reaches the browser.
//
// Required env vars (add to .env.local):
//   CLOUDINARY_CLOUD_NAME=your_cloud_name
//   CLOUDINARY_API_KEY=your_api_key
//   CLOUDINARY_API_SECRET=your_api_secret
//
// Optional:
//   CLOUDINARY_UPLOAD_FOLDER=blog   ← subfolder inside your Cloudinary media library

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/* ── Cloudinary credentials ───────────────────────────────── */

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME!;
const API_KEY = process.env.CLOUDINARY_API_KEY!;
const API_SECRET = process.env.CLOUDINARY_API_SECRET!;
const FOLDER = process.env.CLOUDINARY_UPLOAD_FOLDER ?? "blog";

function missingEnv() {
  return !CLOUD_NAME || !API_KEY || !API_SECRET;
}

/* ── SHA-1 signature helper (Web Crypto — no extra packages) ─ */

async function sha1Hex(message: string): Promise<string> {
  const data = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function signUpload(params: Record<string, string>): Promise<string> {
  // Cloudinary signature: alphabetically sorted key=value pairs + API secret
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return sha1Hex(`${sorted}${API_SECRET}`);
}

/* ── Route handler ────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  // Only authenticated users may upload
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (missingEnv()) {
    console.error(
      "[upload] Missing Cloudinary env vars. " +
        "Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env.local",
    );
    return NextResponse.json(
      { error: "Upload not configured" },
      { status: 500 },
    );
  }

  // Parse multipart form — Next.js App Router handles this natively
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Validate file type
  const mimeType = file.type;
  if (!mimeType.startsWith("image/")) {
    return NextResponse.json(
      { error: "Only image files are allowed" },
      { status: 400 },
    );
  }

  // Validate file size (max 10 MB)
  const MAX_BYTES = 10 * 1024 * 1024;
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "File terlalu besar. Maksimal 10 MB." },
      { status: 400 },
    );
  }

  // Build signed upload params
  const timestamp = String(Math.round(Date.now() / 1000));
  const uploadParams: Record<string, string> = {
    folder: FOLDER,
    timestamp,
  };

  const signature = await signUpload(uploadParams);

  // Forward to Cloudinary upload API as multipart
  const cloudForm = new FormData();
  cloudForm.append("file", file);
  cloudForm.append("api_key", API_KEY);
  cloudForm.append("timestamp", timestamp);
  cloudForm.append("signature", signature);
  cloudForm.append("folder", FOLDER);

  let cloudRes: Response;
  try {
    cloudRes = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: "POST", body: cloudForm },
    );
  } catch (err) {
    console.error("[upload] Cloudinary fetch failed:", err);
    return NextResponse.json(
      { error: "Upload ke Cloudinary gagal" },
      { status: 502 },
    );
  }

  const result = await cloudRes.json();

  if (!cloudRes.ok) {
    console.error("[upload] Cloudinary error:", result);
    return NextResponse.json(
      { error: result?.error?.message ?? "Upload gagal" },
      { status: cloudRes.status },
    );
  }

  // Return only what the client needs
  return NextResponse.json({
    url: result.secure_url as string,
    publicId: result.public_id as string,
    width: result.width as number,
    height: result.height as number,
  });
}
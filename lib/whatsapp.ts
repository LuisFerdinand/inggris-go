// lib/whatsapp.ts
//
// Small shared helpers for WhatsApp numbers (safe for client and server).

/**
 * Normalise an Indonesian-style phone number to wa.me format (digits only,
 * country code first): "0813-5311-6000" → "6281353116000", "+62 813…" → "62813…".
 * Returns null when the input is empty or clearly not a phone number.
 */
export function normalizeWhatsappNumber(raw: string | null | undefined) {
  if (!raw) return null;

  let digits = raw.replace(/\D/g, "");
  if (!digits) return null;

  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = `62${digits.slice(1)}`;
  else if (digits.startsWith("8")) digits = `62${digits}`;

  // E.164 allows at most 15 digits; anything under 9 is not a real number.
  if (digits.length < 9 || digits.length > 15) return null;

  return digits;
}

export function buildWhatsappLink(number: string, text: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

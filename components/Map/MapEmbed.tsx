// components/Map/MapEmbed.tsx
//
// Plain Google Maps embed. It needs no API key and no extra JavaScript, unlike
// the previous Leaflet map, whose tile server started answering with an
// "API KEY REQUIRED" image.

type MapEmbedProps = {
  /** Place name / address Google should search for. Wins over lat/lng. */
  query?: string;
  lat?: number;
  lng?: number;
  zoom?: number;
  title?: string;
  className?: string;
};

// Inggris Go, Kampung Inggris Pare (same spot the old map was centred on).
const DEFAULT_COORDS = { lat: -7.756, lng: 112.198 };

export default function MapEmbed({
  query,
  lat = DEFAULT_COORDS.lat,
  lng = DEFAULT_COORDS.lng,
  zoom = 15,
  title = "Peta lokasi Inggris Go",
  className = "",
}: MapEmbedProps) {
  const q = query?.trim() || `${lat},${lng}`;
  const src = `https://www.google.com/maps?q=${encodeURIComponent(q)}&z=${zoom}&hl=id&output=embed`;

  return (
    <iframe
      title={title}
      src={src}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
      className={`block h-full w-full border-0 ${className}`}
    />
  );
}

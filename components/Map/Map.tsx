"use client";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";

export default function Map() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined" || mapInstanceRef.current) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;

      if (!mapRef.current || mapInstanceRef.current) return;

      const map = L.map(mapRef.current, {
        zoomControl: false,
        scrollWheelZoom: false,
        attributionControl: false,
      }).setView([-7.756, 112.198], 15);

      mapInstanceRef.current = map;

      // Light, clean tile style — warm and readable
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
        },
      ).addTo(map);

      // Custom SVG pulse marker
      const pulseIcon = L.divIcon({
        className: "",
        html: `
          <div style="position:relative;width:48px;height:48px;display:flex;align-items:center;justify-content:center;">
            <span style="
              position:absolute;
              width:48px;height:48px;
              border-radius:50%;
              background:rgba(249,115,22,0.25);
              animation:pulse-ring 2s ease-out infinite;
            "></span>
            <span style="
              position:absolute;
              width:32px;height:32px;
              border-radius:50%;
              background:rgba(249,115,22,0.18);
              animation:pulse-ring 2s ease-out infinite 0.4s;
            "></span>
            <div style="
              position:relative;
              width:18px;height:18px;
              border-radius:50%;
              background:#f97316;
              border:2.5px solid #fff;
              box-shadow:0 2px 12px rgba(249,115,22,0.7);
              z-index:2;
            "></div>
          </div>
          <style>
            @keyframes pulse-ring {
              0%{transform:scale(0.5);opacity:1}
              100%{transform:scale(1.6);opacity:0}
            }
          </style>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 24],
        popupAnchor: [0, -28],
      });

      L.marker([-7.756, 112.198], { icon: pulseIcon })
        .addTo(map)
        .bindPopup(
          `<div style="font-family:'Segoe UI',sans-serif;padding:2px 4px;">
            <strong style="color:#f97316;font-size:13px;">Inggris Go</strong><br/>
            <span style="color:#666;font-size:11.5px;">Kampung Inggris Pare, Kediri</span><br/>
            <a href="https://maps.app.goo.gl/gD93KnZpFX1BYbha8" target="_blank" rel="noopener noreferrer"
              style="color:#f97316;font-size:11px;text-decoration:none;display:inline-flex;align-items:center;gap:3px;margin-top:4px;">
              Buka di Google Maps ↗
            </a>
          </div>`,
          { className: "custom-popup" },
        )
        .openPopup();

      // Custom zoom control
      L.control.zoom({ position: "bottomright" }).addTo(map);
      L.control
        .attribution({ position: "bottomright", prefix: false })
        .addTo(map);
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <style>{`
        .custom-popup .leaflet-popup-content-wrapper {
          background: #fff;
          border: 1px solid rgba(249,115,22,0.2);
          border-radius: 10px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          color: #222;
        }
        .custom-popup .leaflet-popup-tip {
          background: #fff;
        }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
        }
        .leaflet-control-zoom a {
          background: #fff !important;
          color: #f97316 !important;
          border: none !important;
          border-bottom: 1px solid #f0f0f0 !important;
          font-weight: 600;
        }
        .leaflet-control-zoom a:hover {
          background: #fff7ed !important;
          color: #ea6b0a !important;
        }
        .leaflet-control-attribution {
          background: rgba(255,255,255,0.75) !important;
          color: #999 !important;
          font-size: 9px !important;
          backdrop-filter: blur(4px);
          border-radius: 4px 0 0 0 !important;
        }
        .leaflet-control-attribution a { color: #f97316 !important; }
        .leaflet-bottom.leaflet-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
      `}</style>
      <div
        ref={mapRef}
        className="w-full h-full  overflow-hidden"
        style={{ minHeight: 220 }}
      />
    </>
  );
}

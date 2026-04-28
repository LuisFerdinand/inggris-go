"use client";

import { useState } from "react";

import { Icon } from "./Icon";
import { ICON_NAMES } from "@/lib/icons";

export function IconPicker({
  value,
  onChange,
}: {
  value?: string;
  onChange: (icon: string) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = ICON_NAMES.filter((name) =>
    name.includes(query.toLowerCase()),
  );

  return (
    <div className="w-full">
      {/* Search */}
      <input
        type="text"
        placeholder="Search icon..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full mb-3 px-3 py-2 border rounded-lg text-sm"
      />

      {/* Grid */}
      <div className="grid grid-cols-6 gap-2 max-h-72 overflow-auto">
        {filtered.map((name) => (
          <button
            key={name}
            onClick={() => onChange(name)}
            className={`p-2 rounded-lg border flex flex-col items-center justify-center gap-1 transition ${
              value === name
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:bg-gray-50"
            }`}
          >
            <Icon name={name} className="w-5 h-5" />
            <span className="text-[10px] text-gray-500 truncate w-full text-center">
              {name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

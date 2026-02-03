"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const PALETTES = [
  { key: "obsidian", label: "Obsidian" },
  { key: "slateforge", label: "Slateforge" },
  { key: "embercore", label: "Embercore" },
  { key: "nebula", label: "Nebula" },
];

function applyPalette(palette: string | null) {
  const root = document.documentElement;
  if (palette) {
    root.setAttribute("data-palette", palette);
    localStorage.setItem("palette", palette);
  } else {
    root.removeAttribute("data-palette");
    localStorage.removeItem("palette");
  }
}

export function ThemePaletteSelector() {
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("palette");
    if (saved) {
      setSelected(saved);
      document.documentElement.setAttribute("data-palette", saved);
    }
  }, []);

  function handleSelect(p: string) {
    setSelected(p);
    applyPalette(p);
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {PALETTES.map((p) => (
          <Button
            key={p.key}
            variant={selected === p.key ? "default" : "outline"}
            onClick={() => handleSelect(p.key)}
            className="flex flex-col items-center gap-2 h-auto py-3"
          >
            <span className="font-medium">{p.label}</span>
            {/* Color swatch row */}
            <div className="flex gap-1">
              <span
                className="inline-block h-3 w-3 rounded-sm"
                style={{
                  backgroundColor:
                    p.key === "obsidian"
                      ? "#1E63D8"
                      : p.key === "slateforge"
                      ? "#6B3BD6"
                      : p.key === "embercore"
                      ? "#D4482E"
                      : "#5858EA",
                }}
              />
              <span
                className="inline-block h-3 w-3 rounded-sm"
                style={{
                  backgroundColor:
                    p.key === "obsidian"
                      ? "#4B5563"
                      : p.key === "slateforge"
                      ? "#374151"
                      : p.key === "embercore"
                      ? "#5F3E33"
                      : "#4C4F71",
                }}
              />
              <span
                className="inline-block h-3 w-3 rounded-sm"
                style={{
                  backgroundColor:
                    p.key === "obsidian"
                      ? "#10B981"
                      : p.key === "slateforge"
                      ? "#059669"
                      : p.key === "embercore"
                      ? "#2E8B57"
                      : "#3B8261",
                }}
              />
            </div>
            {selected === p.key && <Badge variant="secondary">Active</Badge>}
          </Button>
        ))}
      </div>
      <div className="flex justify-start items-center">
        <span className="text-xs text-muted-foreground">
          Palette applies to both light and dark modes.
        </span>
      </div>
    </div>
  );
}

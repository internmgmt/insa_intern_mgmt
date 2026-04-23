"use client";

import { useId, useState } from "react";

type Datum = { label: string; value: number; color?: string };

function normalizeColors(data: Datum[], palette?: string[]): Datum[] {
  // A refined, professional palette that fits the application theme (Mineral/Teal/Copper)
  // but offers distinct variation for readability.
  const defaultPalette = palette || [
    "hsl(181, 36%, 52%)", // Mineral Teal (Primary)
    "hsl(215, 20%, 65%)", // Cool Grey/Blue
    "hsl(22, 34%, 57%)", // Copper (Accent)
    "hsl(262, 25%, 60%)", // Muted Purple
    "hsl(158, 29%, 55%)", // Sage Green
    "hsl(339, 25%, 60%)", // Muted Rose
    "hsl(45, 30%, 60%)", // Sand/Gold
    "hsl(190, 30%, 60%)", // Sky
    "hsl(10, 30%, 60%)", // Terracotta
  ];
  return data.map((d, i) => ({
    ...d,
    color: d.color || defaultPalette[i % defaultPalette.length],
  }));
}

function adjustAlpha(color: string, alpha: number): string {
  if (color.startsWith("hsl")) {
    return color.replace("hsl", "hsla").replace(")", `, ${alpha})`);
  }
  return color;
}

export function Treemap({
  data,
  height = 240,
  className,
}: {
  data: Datum[];
  height?: number;
  className?: string;
}) {
  const normalized = normalizeColors(data);
  const sorted = [...normalized].sort((a, b) => b.value - a.value).slice(0, 5); // Max 5 items for cleaner layout

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-muted-foreground bg-muted/5 rounded-xl border border-dashed h-40">
        <p className="text-xs font-bold uppercase tracking-widest opacity-30">
          No data available
        </p>
      </div>
    );
  }

  const gridRows = 12;
  const gridCols = 12;

  // Render logic
  return (
    <div
      className={`grid gap-1.5 w-full ${className}`}
      style={{
        height,
        gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${gridRows}, minmax(0, 1fr))`,
      }}
    >
      {sorted.map((d, i) => {
        let colSpan = 12;
        let rowSpan = 12;

        if (sorted.length === 2) {
          colSpan = 6;
          rowSpan = 12;
        } else if (sorted.length >= 3) {
          if (i === 0) {
            // Main Hero Item
            colSpan = 7;
            rowSpan = 12;
          } else {
            // Side Items
            colSpan = 5;
            const remainingItems = sorted.length - 1;
            rowSpan = Math.floor(12 / remainingItems);
          }
        }

        return (
          <div
            key={i}
            className="relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:z-10 group cursor-default"
            style={{
              backgroundColor: d.color,
              gridColumn: `span ${colSpan}`,
              gridRow: `span ${rowSpan}`,
            }}
          >
            {/* Glossy gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-black/5 pointer-events-none" />

            <div className="relative h-full flex flex-col justify-between p-3 sm:p-4 text-white">
              <span
                className={`font-bold leading-tight break-words drop-shadow-sm ${i === 0 ? "text-lg sm:text-xl" : "text-xs sm:text-sm"}`}
              >
                {d.label}
              </span>
              <div className="flex items-end justify-between">
                <span
                  className={`font-mono font-bold tracking-tighter opacity-90 drop-shadow-md ${i === 0 ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl"}`}
                >
                  {d.value}
                </span>
                {i === 0 && (
                  <span className="text-[10px] uppercase font-bold tracking-widest opacity-60 mb-1 hidden sm:inline-block">
                    Top Field
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function DonutChart({
  data,
  total,
  size = 140,
  thickness = 24,
  className,
  centerLabels,
}: {
  data: Datum[];
  total?: number;
  size?: number;
  thickness?: number;
  className?: string;
  centerLabels?: { label: string; value: string };
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  // Filter out zero or negative values to prevent chart calculation errors and visual clutter
  const filteredData = data.filter((d) => d.value > 0);
  const normalized = normalizeColors(filteredData);
  const sum =
    typeof total === "number"
      ? total
      : normalized.reduce((acc, d) => acc + d.value, 0);
  const centerId = useId();
  const radius = size / 2 - thickness / 2;
  const circumference = radius * 2 * Math.PI;

  if (normalized.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-muted-foreground py-8">
        <div className="h-24 w-24 rounded-full border-4 border-dashed border-muted flex items-center justify-center text-[10px] uppercase font-bold tracking-tighter">
          No Data
        </div>
      </div>
    );
  }

  const gap = sum > 0 ? Math.min(6, circumference * 0.015) : 0;
  const totalGap = gap * normalized.length;
  const available = Math.max(0, circumference - totalGap);
  let offset = 0;

  const activeItem = hoverIdx !== null ? normalized[hoverIdx] : null;

  return (
    <div
      className={
        "flex flex-col gap-6 sm:flex-row sm:items-center w-full max-w-full overflow-hidden" +
        (className ? ` ${className}` : "")
      }
    >
      <div
        className="relative group shrink-0"
        style={{ width: size, height: size }}
        aria-hidden
      >
        <svg
          width={size}
          height={size}
          className="drop-shadow-sm overflow-visible"
        >
          <defs>
            <filter
              id={`${centerId}-shadow`}
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feDropShadow
                dx="0"
                dy="4"
                stdDeviation="4"
                floodColor="rgba(0,0,0,0.1)"
              />
            </filter>
          </defs>
          <g
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            filter={`url(#${centerId}-shadow)`}
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="rgba(0,0,0,0.04)"
              strokeWidth={thickness}
              fill="none"
              className="transition-all duration-300"
            />
            {normalized.map((d, i) => {
              const segment = sum > 0 ? (d.value / sum) * available : 0;
              const dashArray = `${segment} ${circumference - segment}`;
              const dashOffset = -offset;
              offset += segment + gap;
              const isActive = hoverIdx === i;

              return (
                <circle
                  key={d.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={d.color}
                  strokeWidth={isActive ? thickness + 4 : thickness}
                  strokeLinecap="round"
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                  fill="none"
                  onMouseEnter={() => setHoverIdx(i)}
                  onMouseLeave={() => setHoverIdx(null)}
                  className="transition-all duration-300 cursor-pointer hover:opacity-90"
                  style={{ opacity: hoverIdx !== null && !isActive ? 0.3 : 1 }}
                />
              );
            })}
          </g>
        </svg>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-center">
          <div className="flex flex-col items-center justify-center space-y-0.5">
            <div className="text-3xl font-black tracking-tighter text-foreground animate-in fade-in zoom-in duration-300">
              {activeItem ? activeItem.value : centerLabels?.value || sum}
            </div>
            <div className="text-[10px] items-center justify-center uppercase font-bold text-muted-foreground/80 tracking-widest max-w-[80px] line-clamp-2 leading-tight">
              {activeItem ? activeItem.label : centerLabels?.label || "Total"}
            </div>
          </div>
        </div>
      </div>
      <div className="grid gap-2 text-xs flex-1">
        {normalized.map((d, i) => {
          const pct = sum > 0 ? Math.round((d.value / sum) * 100) : 0;
          const isActive = hoverIdx === i;
          return (
            <div
              key={d.label}
              className={`flex items-center justify-between gap-3 p-1.5 rounded-lg transition-colors cursor-default ${isActive ? "bg-muted/50 shadow-sm" : "hover:bg-muted/30"}`}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  style={{ backgroundColor: d.color, width: 8, height: 8 }}
                  className={`inline-block rounded-full transition-transform duration-300 ${isActive ? "scale-150 shadow-md" : ""}`}
                />
                <span
                  className={`font-semibold truncate transition-colors ${isActive ? "text-primary" : "text-muted-foreground/80"}`}
                >
                  {d.label}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground tabular-nums">
                <span
                  className={`text-xs font-bold ${isActive ? "text-foreground" : ""}`}
                >
                  {d.value}
                </span>
                <span className="text-[10px] opacity-40">|</span>
                <span
                  className={`text-[10px] font-mono ${isActive ? "text-primary" : ""}`}
                >
                  {pct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function BarChart({
  data,
  height = 140,
  className,
}: {
  data: Datum[];
  height?: number;
  className?: string;
}) {
  const normalized = normalizeColors(data);
  const max = Math.max(1, ...normalized.map((d) => d.value));
  const barWidth = Math.max(18, Math.floor(280 / normalized.length));
  const maxLabel = normalized.find((d) => d.value === max)?.label;

  return (
    <div
      className={
        "rounded-xl border bg-background p-3" +
        (className ? ` ${className}` : "")
      }
      style={{
        backgroundImage:
          "linear-gradient(to top, rgba(0,0,0,0.04) 1px, transparent 1px)",
        backgroundSize: "100% 28px",
      }}
    >
      <div className="mb-2 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>0</span>
        <span>{max}</span>
      </div>
      <div className="flex items-end gap-2" style={{ height }}>
        {normalized.map((d) => {
          const barHeight = Math.round((d.value / max) * (height - 32));
          return (
            <div
              key={d.label}
              className="flex flex-col items-center"
              style={{ width: barWidth }}
            >
              <div className="mb-1 text-[10px] font-medium text-muted-foreground">
                {d.value}
              </div>
              <div
                style={{
                  backgroundImage: `linear-gradient(180deg, ${d.color} 0%, ${d.color} 70%, rgba(0,0,0,0.18) 100%)`,
                  height: barHeight,
                  width: "100%",
                }}
                className={
                  "rounded-t-xl shadow-sm ring-1 ring-black/5 " +
                  (d.label === maxLabel ? "shadow-md" : "")
                }
                title={`${d.label}: ${d.value}`}
              />
              <div
                className="mt-1 text-[10px] text-center text-muted-foreground truncate w-full"
                title={d.label}
              >
                {d.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function LineChart({
  points,
  width = 320,
  height = 140,
  className,
}: {
  points: number[];
  width?: number;
  height?: number;
  className?: string;
}) {
  const max = Math.max(1, ...points);
  const stepX = width / Math.max(1, points.length - 1);
  const gradientId = useId();
  const path = points
    .map(
      (p, i) =>
        `${i === 0 ? "M" : "L"}${i * stepX},${height - (p / max) * (height - 20)}`,
    )
    .join(" ");
  const areaPath = `M0,${height} ${path} L${width},${height} Z`;
  const lastIndex = Math.max(0, points.length - 1);
  const lastX = lastIndex * stepX;
  const lastY = height - (points[lastIndex] / max) * (height - 20);
  const gridLines = 4;

  return (
    <div
      className={
        "rounded-xl border bg-background p-3" +
        (className ? ` ${className}` : "")
      }
    >
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width={width} height={height} fill="transparent" />
        {Array.from({ length: gridLines }).map((_, i) => {
          const y = (height / (gridLines + 1)) * (i + 1);
          return (
            <line
              key={i}
              x1="0"
              y1={y}
              x2={width}
              y2={y}
              stroke="rgba(0,0,0,0.06)"
              strokeDasharray="4 4"
            />
          );
        })}
        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path d={path} fill="none" stroke="#2563eb" strokeWidth={2} />
        {points.map((p, i) => {
          const cx = i * stepX;
          const cy = height - (p / max) * (height - 20);
          return <circle key={i} cx={cx} cy={cy} r={3} fill="#2563eb" />;
        })}
        <circle
          cx={lastX}
          cy={lastY}
          r={4}
          fill="#2563eb"
          stroke="white"
          strokeWidth={2}
        />
        <text
          x={lastX}
          y={Math.max(12, lastY - 8)}
          textAnchor="middle"
          fontSize="10"
          fill="#2563eb"
        >
          {points[lastIndex]}
        </text>
      </svg>
    </div>
  );
}

/**
 * Modern High-Density Chart Components
 */

export function ProgressRing({
  value,
  label,
  size = 120,
  stroke = 10,
  className,
  color = "currentColor",
}: {
  value: number;
  label: string;
  size?: number;
  stroke?: number;
  className?: string;
  color?: string;
}) {
  const radius = size / 2 - stroke / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  const center = size / 2;

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          fill="transparent"
          className="text-muted/20"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-bold tracking-tighter">
          {Math.round(value)}%
        </span>
        <span className="text-[10px] uppercase font-bold text-muted-foreground leading-none">
          {label}
        </span>
      </div>
    </div>
  );
}

export function AreaTrendChart({
  data,
  height = 200,
  className,
  color = "rgb(59, 130, 246)",
}: {
  data: { label: string; value: number }[];
  height?: number;
  className?: string;
  color?: string;
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center text-muted-foreground bg-muted/5 rounded-xl border border-dashed"
        style={{ height }}
      >
        <p className="text-xs font-bold uppercase tracking-widest opacity-30">
          No submissions recorded
        </p>
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.value), 1);
  const width = 600; // Reference width for SVG coordinate system
  const stepX = width / (data.length - 1 || 1);

  const points = data.map((d, i) => ({
    x: i * stepX,
    y: height - (d.value / max) * (height - 40) - 20,
  }));

  const d =
    points.length > 0
      ? `M ${points[0].x} ${points[0].y} ` +
        points
          .slice(1)
          .map((p) => `L ${p.x} ${p.y}`)
          .join(" ")
      : "";

  const areaD =
    points.length > 0
      ? `${d} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`
      : "";

  const id = useId();

  return (
    <div className={`w-full ${className}`}>
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="overflow-visible"
      >
        <defs>
          <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
          <line
            key={i}
            x1="0"
            y1={height - v * (height - 40) - 20}
            x2={width}
            y2={height - v * (height - 40) - 20}
            stroke="currentColor"
            strokeWidth="1"
            className="text-muted/10"
            strokeDasharray="4 4"
          />
        ))}
        <path d={areaD} fill={`url(#grad-${id})`} />
        <path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Interaction points */}
        {points.map((p, i) => (
          <g
            key={i}
            className="group/point cursor-pointer"
            onMouseEnter={() => setHoverIdx(i)}
            onMouseLeave={() => setHoverIdx(null)}
          >
            <circle
              cx={p.x}
              cy={p.y}
              r={hoverIdx === i ? "8" : "4"}
              fill={color}
              className="transition-all duration-300 stroke-background stroke-2"
            />
            {hoverIdx === i && (
              <g className="animate-in fade-in zoom-in duration-200">
                <rect
                  x={p.x - 20}
                  y={p.y - 30}
                  width="40"
                  height="20"
                  rx="4"
                  fill="black"
                />
                <text
                  x={p.x}
                  y={p.y - 16}
                  textAnchor="middle"
                  className="text-[10px] fill-white font-bold"
                >
                  {data[i].value}
                </text>
              </g>
            )}
            <text
              x={p.x}
              y={height - 5}
              textAnchor="middle"
              className={`text-[10px] uppercase tracking-tighter transition-colors duration-300 ${hoverIdx === i ? "font-bold" : "fill-muted-foreground font-medium"}`}
              style={{ fill: hoverIdx === i ? color : undefined }}
            >
              {data[i].label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export function ModernBarChart({
  data,
  height = 180,
  className,
  color,
}: {
  data: { label: string; value: number }[];
  height?: number;
  className?: string;
  color?: string;
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const filteredData = data.filter((d) => d.value > 0);
  const normalized = normalizeColors(filteredData);

  if (normalized.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-muted-foreground bg-muted/5 rounded-xl border border-dashed h-40">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">
          No regional data available
        </p>
      </div>
    );
  }

  const max = Math.max(...normalized.map((d) => d.value), 1);
  return (
    <div className={`space-y-3 w-full overflow-hidden ${className}`}>
      {normalized.map((d, i) => {
        const percentage = (d.value / max) * 100;
        const isActive = hoverIdx === i;
        const currentColor = color || d.color;

        return (
          <div
            key={i}
            className={`space-y-1 transition-all duration-200 p-1.5 rounded-lg border border-transparent ${isActive ? "bg-muted/50 border-muted/50" : ""}`}
            onMouseEnter={() => setHoverIdx(i)}
            onMouseLeave={() => setHoverIdx(null)}
          >
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest transition-colors mb-1">
              <span
                className={`truncate max-w-[140px] flex items-center gap-2 ${isActive ? "text-primary" : "text-muted-foreground"}`}
              >
                <span
                  className="w-2 h-2 rounded-full hidden sm:inline-block"
                  style={{ backgroundColor: currentColor }}
                />
                {d.label}
              </span>
              <span
                className={
                  isActive ? "text-foreground" : "text-muted-foreground/80"
                }
              >
                {d.value}
              </span>
            </div>
            <div className="h-2.5 w-full bg-muted/30 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ease-out rounded-full shadow-[0_0_12px_rgba(0,0,0,0.05)]`}
                style={{
                  width: `${percentage}%`,
                  backgroundColor: currentColor,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ComparisonChart({
  data,
  className,
}: {
  data: { label: string; current: number; previous: number }[];
  className?: string;
}) {
  return (
    <div className={`space-y-4 ${className}`}>
      {data.map((d, i) => {
        const max = Math.max(d.current, d.previous, 1);
        const curPct = (d.current / max) * 100;
        const prevPct = (d.previous / max) * 100;
        const diff = d.current - d.previous;
        const isPositive = diff >= 0;

        return (
          <div
            key={i}
            className="bg-muted/10 p-3 rounded-xl border border-muted/20"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-bold truncate">{d.label}</span>
              <span
                className={`text-[10px] font-black px-1.5 py-0.5 rounded ${isPositive ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"}`}
              >
                {isPositive ? "+" : ""}
                {diff}
              </span>
            </div>
            <div className="space-y-2">
              <div className="h-1.5 w-full bg-muted rounded-full">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-700"
                  style={{ width: `${curPct}%` }}
                />
              </div>
              <div className="h-1.5 w-full bg-muted/50 rounded-full">
                <div
                  className="h-full bg-slate-400/30 rounded-full transition-all duration-700"
                  style={{ width: `${prevPct}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

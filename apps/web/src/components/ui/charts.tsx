"use client";

import { useId } from "react";

type Datum = { label: string; value: number; color?: string };

function normalizeColors(data: Datum[], palette?: string[]): Datum[] {
  const defaultPalette = palette || [
    "#2563eb", // blue-600
    "#16a34a", // green-600
    "#f59e0b", // amber-500
    "#ef4444", // red-500
    "#7c3aed", // violet-600
    "#0ea5e9", // sky-500
    "#14b8a6", // teal-500
  ];
  return data.map((d, i) => ({ ...d, color: d.color || defaultPalette[i % defaultPalette.length] }));
}

export function DonutChart({
  data,
  total,
  size = 140,
  thickness = 24,
  className,
  centerLabel,
}: {
  data: Datum[];
  total?: number;
  size?: number;
  thickness?: number;
  className?: string;
  centerLabel?: any;
}) {
  const normalized = normalizeColors(data);
  const sum = typeof total === "number" ? total : normalized.reduce((acc, d) => acc + d.value, 0);
  const centerId = useId();
  const radius = size / 2 - thickness / 2;
  const circumference = 2 * Math.PI * radius;
  const gap = sum > 0 ? Math.min(6, circumference * 0.015) : 0;
  const totalGap = gap * normalized.length;
  const available = Math.max(0, circumference - totalGap);
  let offset = 0;

  return (
    <div className={"flex flex-col gap-4 sm:flex-row sm:items-center" + (className ? ` ${className}` : "")}>
      <div className="relative" style={{ width: size, height: size }} aria-hidden>
        <svg width={size} height={size} className="drop-shadow-sm">
          <defs>
            <filter id={`${centerId}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="rgba(0,0,0,0.12)" />
            </filter>
          </defs>
          <g transform={`rotate(-90 ${size / 2} ${size / 2})`} filter={`url(#${centerId}-shadow)`}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="rgba(0,0,0,0.06)"
              strokeWidth={thickness}
              fill="none"
            />
            {normalized.map((d) => {
              const segment = sum > 0 ? (d.value / sum) * available : 0;
              const dashArray = `${segment} ${circumference - segment}`;
              const dashOffset = -offset;
              offset += segment + gap;
              return (
                <circle
                  key={d.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={d.color}
                  strokeWidth={thickness}
                  strokeLinecap="round"
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                  fill="none"
                />
              );
            })}
          </g>
        </svg>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-center">
          <div className="rounded-full bg-background/90 px-3 py-2 shadow-sm ring-1 ring-black/5">
            <div className="text-xs text-muted-foreground">
              {centerLabel ?? (
                <div>
                  <div className="text-2xl font-semibold text-foreground">{sum}</div>
                  <div className="uppercase tracking-wide text-[10px]">Total</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="grid gap-2 text-xs">
        {normalized.map((d) => {
          const pct = sum > 0 ? Math.round((d.value / sum) * 100) : 0;
          return (
            <div key={d.label} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  style={{ backgroundColor: d.color, width: 10, height: 10 }}
                  className="inline-block rounded"
                />
                <span className="font-medium">{d.label}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>{d.value}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px]">{pct}%</span>
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
      className={"rounded-xl border bg-background/60 p-3" + (className ? ` ${className}` : "")}
      style={{
        backgroundImage: "linear-gradient(to top, rgba(0,0,0,0.04) 1px, transparent 1px)",
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
            <div key={d.label} className="flex flex-col items-center" style={{ width: barWidth }}>
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
              <div className="mt-1 text-[10px] text-center text-muted-foreground truncate w-full" title={d.label}>
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
    .map((p, i) => `${i === 0 ? "M" : "L"}${i * stepX},${height - (p / max) * (height - 20)}`)
    .join(" ");
  const areaPath = `M0,${height} ${path} L${width},${height} Z`;
  const lastIndex = Math.max(0, points.length - 1);
  const lastX = lastIndex * stepX;
  const lastY = height - (points[lastIndex] / max) * (height - 20);
  const gridLines = 4;

  return (
    <div className={"rounded-xl border bg-background/60 p-3" + (className ? ` ${className}` : "")}>
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
          return <line key={i} x1="0" y1={y} x2={width} y2={y} stroke="rgba(0,0,0,0.06)" strokeDasharray="4 4" />;
        })}
        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path d={path} fill="none" stroke="#2563eb" strokeWidth={2} />
        {points.map((p, i) => {
          const cx = i * stepX;
          const cy = height - (p / max) * (height - 20);
          return <circle key={i} cx={cx} cy={cy} r={3} fill="#2563eb" />;
        })}
        <circle cx={lastX} cy={lastY} r={4} fill="#2563eb" stroke="white" strokeWidth={2} />
        <text x={lastX} y={Math.max(12, lastY - 8)} textAnchor="middle" fontSize="10" fill="#2563eb">
          {points[lastIndex]}
        </text>
      </svg>
    </div>
  );
}

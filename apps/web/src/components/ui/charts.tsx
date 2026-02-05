"use client";

import { useId, useState } from "react";

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
  const filteredData = data.filter(d => d.value > 0);
  const normalized = normalizeColors(filteredData);
  const sum = typeof total === "number" ? total : normalized.reduce((acc, d) => acc + d.value, 0);
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
    <div className={"flex flex-col gap-6 sm:flex-row sm:items-center w-full max-w-full overflow-hidden" + (className ? ` ${className}` : "")}>
      <div className="relative group shrink-0" style={{ width: size, height: size }} aria-hidden>
        <svg width={size} height={size} className="drop-shadow-sm overflow-visible">
          <defs>
            <filter id={`${centerId}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="rgba(0,0,0,0.1)" />
            </filter>
          </defs>
          <g transform={`rotate(-90 ${size / 2} ${size / 2})`} filter={`url(#${centerId}-shadow)`}>
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
              {activeItem ? activeItem.value : (centerLabels?.value || sum)}
            </div>
            <div className="text-[10px] items-center justify-center uppercase font-bold text-muted-foreground/80 tracking-widest max-w-[80px] line-clamp-2 leading-tight">
              {activeItem ? activeItem.label : (centerLabels?.label || "Total")}
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
              className={`flex items-center justify-between gap-3 p-1.5 rounded-lg transition-colors cursor-default ${isActive ? 'bg-muted/50 shadow-sm' : 'hover:bg-muted/30'}`}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  style={{ backgroundColor: d.color, width: 8, height: 8 }}
                  className={`inline-block rounded-full transition-transform duration-300 ${isActive ? 'scale-150 shadow-md' : ''}`}
                />
                <span className={`font-semibold truncate transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground/80'}`}>{d.label}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground tabular-nums">
                <span className={`text-xs font-bold ${isActive ? 'text-foreground' : ''}`}>{d.value}</span>
                <span className="text-[10px] opacity-40">|</span>
                <span className={`text-[10px] font-mono ${isActive ? 'text-primary' : ''}`}>{pct}%</span>
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

/**
 * Modern High-Density Chart Components
 */

export function ProgressRing({
  value,
  label,
  size = 120,
  stroke = 10,
  className
}: {
  value: number;
  label: string;
  size?: number;
  stroke?: number;
  className?: string;
}) {
  const radius = (size / 2) - (stroke / 2);
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  const center = size / 2;

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
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
          stroke="currentColor"
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-emerald-500 transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-bold tracking-tighter">{Math.round(value)}%</span>
        <span className="text-[10px] uppercase font-bold text-muted-foreground leading-none">{label}</span>
      </div>
    </div>
  );
}

export function AreaTrendChart({
  data,
  height = 200,
  className
}: {
  data: { label: string; value: number }[];
  height?: number;
  className?: string;
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-muted-foreground bg-muted/5 rounded-xl border border-dashed" style={{ height }}>
        <p className="text-xs font-bold uppercase tracking-widest opacity-30">No submissions recorded</p>
      </div>
    );
  }

  const max = Math.max(...data.map(d => d.value), 1);
  const width = 600; // Reference width for SVG coordinate system
  const stepX = width / (data.length - 1 || 1);
  
  const points = data.map((d, i) => ({
    x: i * stepX,
    y: height - (d.value / max) * (height - 40) - 20
  }));

  const d = points.length > 0 
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';
    
  const areaD = points.length > 0
    ? `${d} L ${points[points.length-1].x} ${height} L ${points[0].x} ${height} Z`
    : '';

  const id = useId();

  return (
    <div className={`w-full ${className}`}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible">
        <defs>
          <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
          <line
            key={i}
            x1="0" y1={height - (v * (height - 40)) - 20}
            x2={width} y2={height - (v * (height - 40)) - 20}
            stroke="currentColor"
            strokeWidth="1"
            className="text-muted/10"
            strokeDasharray="4 4"
          />
        ))}
        <path d={areaD} fill={`url(#grad-${id})`} />
        <path d={d} fill="none" stroke="rgb(59, 130, 246)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        
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
              className={`transition-all duration-300 ${hoverIdx === i ? 'fill-blue-600' : 'fill-blue-500'} stroke-background stroke-2`} 
            />
            {hoverIdx === i && (
              <g className="animate-in fade-in zoom-in duration-200">
                <rect x={p.x - 20} y={p.y - 30} width="40" height="20" rx="4" fill="black" />
                <text x={p.x} y={p.y - 16} textAnchor="middle" className="text-[10px] fill-white font-bold">
                  {data[i].value}
                </text>
              </g>
            )}
            <text 
              x={p.x} 
              y={height - 5} 
              textAnchor="middle" 
              className={`text-[10px] uppercase tracking-tighter transition-colors duration-300 ${hoverIdx === i ? 'fill-primary font-bold' : 'fill-muted-foreground font-medium'}`}
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
  className
}: {
  data: { label: string; value: number }[];
  height?: number;
  className?: string;
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const filteredData = data.filter(d => d.value > 0);
  
  if (filteredData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-muted-foreground bg-muted/5 rounded-xl border border-dashed h-40">
        <p className="text-xs font-bold uppercase tracking-widest opacity-30">No regional data available</p>
      </div>
    );
  }

  const max = Math.max(...filteredData.map(d => d.value), 1);
  return (
    <div className={`space-y-3 w-full overflow-hidden ${className}`}>
      {filteredData.map((d, i) => {
        const percentage = (d.value / max) * 100;
        const isActive = hoverIdx === i;
        return (
          <div 
            key={i} 
            className={`space-y-1 transition-all duration-200 p-1 rounded-lg ${isActive ? 'bg-muted/50' : ''}`}
            onMouseEnter={() => setHoverIdx(i)}
            onMouseLeave={() => setHoverIdx(null)}
          >
            <div className={`flex justify-between items-center text-xs font-bold uppercase tracking-widest transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
              <span className="truncate max-w-[140px]">{d.label}</span>
              <span className={isActive ? 'text-foreground' : 'text-muted-foreground/60'}>{d.value}</span>
            </div>
            <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ease-in-out rounded-full shadow-[0_0_12px_rgba(59,130,246,0.2)] ${isActive ? 'bg-primary' : 'bg-primary/70'}`}
                style={{ width: `${percentage}%` }}
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
  className
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
          <div key={i} className="bg-muted/10 p-3 rounded-xl border border-muted/20">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-bold truncate">{d.label}</span>
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${isPositive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                {isPositive ? '+' : ''}{diff}
              </span>
            </div>
            <div className="space-y-2">
              <div className="h-1.5 w-full bg-muted rounded-full">
                <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${curPct}%` }} />
              </div>
              <div className="h-1.5 w-full bg-muted/50 rounded-full">
                <div className="h-full bg-slate-400/30 rounded-full transition-all duration-700" style={{ width: `${prevPct}%` }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

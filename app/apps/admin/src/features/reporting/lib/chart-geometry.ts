/**
 * Pure geometry for the inline SVG trend charts (US-030): no chart library, no DOM. The component
 * only maps these numbers to elements, so the maths is unit-tested on its own.
 */

export interface ChartSeriesInput {
  key: string;
  values: readonly number[];
}

export interface ChartPoint {
  value: number;
  x: number;
  y: number;
}

export interface ChartLine {
  key: string;
  path: string;
  points: ChartPoint[];
}

export interface ChartTick {
  value: number;
  y: number;
}

export interface ChartLabel {
  label: string;
  x: number;
}

export interface ChartGeometry {
  lines: ChartLine[];
  ticks: ChartTick[];
  xLabels: ChartLabel[];
  zeroY: number;
}

export const CHART_WIDTH = 600;
export const CHART_HEIGHT = 240;
export const PLOT_TOP = 40;
export const PLOT_BOTTOM = 200;
export const PLOT_LEFT = 64;
export const PLOT_RIGHT = 584;
export const X_LABEL_Y = 224;

const MAX_TICKS = 4;
const HALF_DECADE = 5;
const STEP_BASES = [1, 2, HALF_DECADE];
const DECIMAL = 10;
const MAX_DENSE_LABELS = 12;

interface Extent {
  max: number;
  min: number;
}

/** Zero is always inside the plot so the bars of a loss-making month point the right way. */
function extent(series: readonly ChartSeriesInput[]): Extent {
  const values = series.flatMap((item) => item.values);
  const max = Math.max(0, ...values);
  const min = Math.min(0, ...values);
  return max === min ? { max: 1, min } : { max, min };
}

/** 1 / 2 / 5 × 10ⁿ step that yields at most four ticks across the range. */
export function niceStep(range: number): number {
  if (range <= 0) return 1;
  const magnitude = DECIMAL ** Math.floor(Math.log10(range / MAX_TICKS));
  for (const base of STEP_BASES) {
    const step = base * magnitude;
    if (range / step <= MAX_TICKS) return step;
  }
  return DECIMAL * magnitude;
}

function scaleY(value: number, bounds: Extent): number {
  const ratio = (value - bounds.min) / (bounds.max - bounds.min);
  return Math.round(PLOT_BOTTOM - ratio * (PLOT_BOTTOM - PLOT_TOP));
}

function scaleX(index: number, count: number): number {
  if (count <= 1) return Math.round((PLOT_LEFT + PLOT_RIGHT) / 2);
  return Math.round(PLOT_LEFT + (index * (PLOT_RIGHT - PLOT_LEFT)) / (count - 1));
}

function ticks(bounds: Extent): ChartTick[] {
  const step = niceStep(bounds.max - bounds.min);
  const out: ChartTick[] = [];
  for (let value = Math.ceil(bounds.min / step) * step; value <= bounds.max; value += step) {
    out.push({ value, y: scaleY(value, bounds) });
  }
  return out;
}

function line(series: ChartSeriesInput, bounds: Extent, count: number): ChartLine {
  const points = series.values.map((value, index) => ({
    value,
    x: scaleX(index, count),
    y: scaleY(value, bounds),
  }));
  const path = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`)
    .join(' ');
  return { key: series.key, path, points };
}

/** Every label when twelve or fewer; every other one beyond that so they never overlap. */
function xLabels(labels: readonly string[]): ChartLabel[] {
  const stride = labels.length > MAX_DENSE_LABELS ? 2 : 1;
  return labels
    .map((label, index) => ({ label, x: scaleX(index, labels.length) }))
    .filter((_, index) => index % stride === 0);
}

export function chartGeometry(
  labels: readonly string[],
  series: readonly ChartSeriesInput[],
): ChartGeometry {
  const bounds = extent(series);
  return {
    lines: series.map((item) => line(item, bounds, labels.length)),
    ticks: ticks(bounds),
    xLabels: xLabels(labels),
    zeroY: scaleY(0, bounds),
  };
}

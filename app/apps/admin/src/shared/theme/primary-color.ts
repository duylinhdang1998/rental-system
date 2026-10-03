export const PRIMARY_COLORS = [
  {
    id: 'violet',
    swatch: 'bg-violet-600',
    primary: '#7c3aed',
    hover: '#6d28d9',
    pressed: '#5b21b6',
    soft: '#ede9fe',
  },
  {
    id: 'blue',
    swatch: 'bg-blue-600',
    primary: '#2563eb',
    hover: '#1d4ed8',
    pressed: '#1e40af',
    soft: '#dbeafe',
  },
  {
    id: 'green',
    swatch: 'bg-green-700',
    primary: '#15803d',
    hover: '#166534',
    pressed: '#14532d',
    soft: '#dcfce7',
  },
  {
    id: 'red',
    swatch: 'bg-red-600',
    primary: '#dc2626',
    hover: '#b91c1c',
    pressed: '#991b1b',
    soft: '#fee2e2',
  },
  {
    id: 'rose',
    swatch: 'bg-rose-600',
    primary: '#e11d48',
    hover: '#be123c',
    pressed: '#9f1239',
    soft: '#ffe4e6',
  },
  {
    id: 'orange',
    swatch: 'bg-orange-700',
    primary: '#c2410c',
    hover: '#9a3412',
    pressed: '#7c2d12',
    soft: '#ffedd5',
  },
  {
    id: 'zinc',
    swatch: 'bg-zinc-900',
    primary: '#18181b',
    hover: '#27272a',
    pressed: '#09090b',
    soft: '#f4f4f5',
  },
] as const;

export type PrimaryColor = (typeof PRIMARY_COLORS)[number];
const STORAGE_KEY = 'rental-primary-color';

export function resolvePrimaryColor(id: string | null): PrimaryColor {
  return PRIMARY_COLORS.find((color) => color.id === id) ?? PRIMARY_COLORS[0];
}

export function applyPrimaryColor(color: PrimaryColor): void {
  const root = document.documentElement;
  root.dataset.primaryColor = color.id;
  const tokens = {
    '--color-primary': color.primary,
    '--color-primary-hover': color.hover,
    '--color-primary-pressed': color.pressed,
    '--color-primary-soft': color.soft,
    '--color-focus': color.hover,
  };
  Object.entries(tokens).forEach(([key, value]) => root.style.setProperty(key, value));
}

export function restorePrimaryColor(): void {
  let id: string | null = null;
  try {
    id = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // The selector still works when browser storage is unavailable.
  }
  applyPrimaryColor(resolvePrimaryColor(id));
}

export function savePrimaryColor(color: PrimaryColor): void {
  applyPrimaryColor(color);
  try {
    window.localStorage.setItem(STORAGE_KEY, color.id);
  } catch {
    // Apply the preference for this visit even when it cannot be persisted.
  }
}

export type LabColor = [number, number, number];

type RgbColor = [number, number, number];

export function normalizeHex(value: string): string | null {
  const trimmed = value.trim().replace(/^#/, "");
  const expanded = trimmed.length === 3
    ? trimmed.split("").map((char) => char + char).join("")
    : trimmed;

  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) {
    return null;
  }

  return `#${expanded.toUpperCase()}`;
}

export function hexToRgb(hex: string): RgbColor {
  const normalized = normalizeHex(hex);

  if (!normalized) {
    throw new Error(`Invalid hex color: ${hex}`);
  }

  const value = normalized.slice(1);
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ];
}

function pivotRgb(channel: number) {
  const value = channel / 255;
  return value > 0.04045 ? Math.pow((value + 0.055) / 1.055, 2.4) : value / 12.92;
}

function pivotXyz(value: number) {
  return value > 0.008856 ? Math.cbrt(value) : 7.787 * value + 16 / 116;
}

export function hexToLab(hex: string): LabColor {
  const [red, green, blue] = hexToRgb(hex).map(pivotRgb) as RgbColor;

  const x = (red * 0.4124 + green * 0.3576 + blue * 0.1805) / 0.95047;
  const y = (red * 0.2126 + green * 0.7152 + blue * 0.0722) / 1.0;
  const z = (red * 0.0193 + green * 0.1192 + blue * 0.9505) / 1.08883;

  const fx = pivotXyz(x);
  const fy = pivotXyz(y);
  const fz = pivotXyz(z);

  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

export function deltaE(input: string, target: string): number {
  const [l1, a1, b1] = hexToLab(input);
  const [l2, a2, b2] = hexToLab(target);
  return Math.sqrt((l1 - l2) ** 2 + (a1 - a2) ** 2 + (b1 - b2) ** 2);
}

export function matchScore(delta: number): number {
  return Math.max(0, Math.round(100 - Math.min(delta, 80) * 1.25));
}

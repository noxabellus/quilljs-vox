import { Color } from "Document/theme";

export type Vec2 = [number, number];

export function parseFloatSafe (value: string): number {
    const parsed = parseFloat(value);
    return isNaN(parsed)? 0.0 : parsed;
}

export function parseIntSafe (value: string): number {
    const parsed = parseInt(value);
    return isNaN(parsed)? 0 : parsed;
}

export function toFixed (num: number) {
    return Math.round(num * 1e2) / 1e2;
}


export function hslToRgb ([h, s, l]: Color): Color {
    s = (s && (s / 100)) || 0;
    l = (l && (l / 100)) || 0;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number, k: number = (n + h / 30) % 12) => l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)] as Color;
}

export function rgbToHSL ([r, g, b]: Color): Color {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 510;
    const d = max - min;
    const s = d === 0 ? 0 : d / (255 - Math.abs(max + min - 255));
    const h = (max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4) * 60;
    return [isNaN(h)? 0 : h, s * 100, l * 100] as Color;
}

export function hsvToRgb ([h, s, v]: Color): Color {
    h = (h && (h / 360)) || 0;
    s = (s && (s / 100)) || 0;
    v = (v && (v / 100)) || 0;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    let r, g, b;
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
        default: throw "invalid hsv";
    }
    return [
        Math.round(r * 255),
        Math.round(g * 255),
        Math.round(b * 255),
    ];
}

export function rgbToHsv ([r, g, b]: Color): Color {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    const s = max === 0 ? 0 : d / max;
    const v = max / 255;
    const h = max === min ? 0 : max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [isNaN(h)? 0 : h * 60, s * 100, v * 100] as Color;
}


export function rgbToPosition (rgb: Color, width: number, height: number): Vec2 {
    return hslToPosition(rgbToHSL(rgb), width, height);
}

export function hslToPosition ([h, _s, l]: Color, width: number, height: number): Vec2 {
    h = (h && (h / 360)) || 0;
    l = (l && (l / 100)) || 0;
    return [h * width, (1 - l) * height];
}

export function hsvToPosition ([h, _s, v]: Color, width: number, height: number): Vec2 {
    h = (h && (h / 360)) || 0;
    v = (v && (v / 100)) || 0;
    return [h * width, (1 - v) * height];
}

export function rgbToHex ([r, g, b]: Color): string {
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export function hexToRgb (hex: string): Color {
    if (!hex.startsWith("#")) throw "invalid hex code";

    if (hex.length === 4) {
        hex = hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }

    return [
        parseInt(hex.slice(1, 3), 16),
        parseInt(hex.slice(3, 5), 16),
        parseInt(hex.slice(5, 7), 16),
    ];
}

export function hslToHex (hsl: Color): string {
    return rgbToHex(hslToRgb(hsl));
}

export function hsvToHex (hsv: Color): string {
    return rgbToHex(hsvToRgb(hsv));
}

export function hexToHSL (hex: string): Color {
    return rgbToHSL(hexToRgb(hex));
}

export function hexToHSV (hex: string): Color {
    return rgbToHsv(hexToRgb(hex));
}


export default {
    parseFloatSafe,
    parseIntSafe,
    toFixed,
    hslToRgb,
    rgbToHSL,
    hsvToRgb,
    rgbToHsv,
    rgbToPosition,
    hslToPosition,
    hsvToPosition,
    rgbToHex,
    hexToRgb,
    hslToHex,
    hsvToHex,
    hexToHSL,
    hexToHSV,
};

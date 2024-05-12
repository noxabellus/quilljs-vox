import { Vec2, Vec3, Vec4, toFixed } from "./math";


export type ColorType = "hex-rgb"| "rgb" | "hsl" | "hsv" | "hex-rgba"  | "rgba" | "hsla" | "hsva";

export function colorType(value: string): ColorType {
    if (isHexRgb(value)) return "hex-rgb";
    if (isHexRgba(value)) return "hex-rgba";
    if (isRgb(value)) return "rgb";
    if (isHsl(value)) return "hsl";
    if (isHsv(value)) return "hsv";
    if (isRgba(value)) return "rgba";
    if (isHsla(value)) return "hsla";
    if (isHsva(value)) return "hsva";
    throw `invalid color: ${value}`;
}

export type HexRgb = string & {__hex3: true};
export type HexRgba = string & {__hex4: true};

export function asHexRgb (value: string): HexRgb {
    if (isHexRgb(value)) return value;

    if (isHexRgba(value)) return value.slice(0, -2) as HexRgb;

    const rgb = tryParseRgb(value);
    if (rgb) return rgbToHex(rgb);

    const rgba = tryParseRgba(value);
    if (rgba) return rgbToHex([rgba[0], rgba[1], rgba[2]]);

    const hsl = tryParseHsl(value);
    if (hsl) return rgbToHex(hslToRgb(hsl));

    const hsla = tryParseHsla(value);
    if (hsla) return rgbToHex(hslToRgb([hsla[0], hsla[1], hsla[2]]));

    const hsv = tryParseHsv(value);
    if (hsv) return rgbToHex(hsvToRgb(hsv));

    const hsva = tryParseHsva(value);
    if (hsva) return rgbToHex(hsvToRgb([hsva[0], hsva[1], hsva[2]]));

    throw `invalid color ${value} (expected HexRgb, or a convertible value, [rgb, rgba, hsl, hsla, hsv, hsva])`;
}

export function isHexRgb (value: string): value is HexRgb {
    return value.match(/^#[a-fA-F0-9]{6}$/) !== null;
}

export function asHexRgba (value: string): HexRgba {
    if (isHexRgba(value)) return value;

    if (isHexRgb(value)) return `${value}ff` as HexRgba;

    const rgb = tryParseRgb(value);
    if (rgb) return rgbaToHex([...rgb, 1.0]);

    const rgba = tryParseRgba(value);
    if (rgba) return rgbaToHex(rgba);

    const hsl = tryParseHsl(value);
    if (hsl) return rgbaToHex([...hslToRgb(hsl), 1.0]);

    const hsla = tryParseHsla(value);
    if (hsla) return rgbaToHex([...hslToRgb([hsla[0], hsla[1], hsla[2]]), hsla[3]]);

    const hsv = tryParseHsv(value);
    if (hsv) return rgbaToHex([...hsvToRgb(hsv), 1.0]);

    const hsva = tryParseHsva(value);
    if (hsva) return rgbaToHex([...hsvToRgb([hsva[0], hsva[1], hsva[2]]), hsva[3]]);

    throw `invalid color ${value} (expected HexRgba, or a convertible value, [rgb, rgba, hsl, hsla, hsv, hsva])`;
}


export function isHexRgba (value: string): value is HexRgba {
    return value.match(/^#[a-fA-F0-9]{8}$/) !== null;
}

const RX_RGB = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/;
const RX_RGBA = /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d(?:\.\d{1,4})?)\s*\)$/;
const RX_HSL = /^hsl\(\s*(\d{1,3}(?:\.\d{1,2})?)\s*,\s*(\d{1,3}(?:\.\d{1,2})?)%\s*,\s*(\d{1,3}(?:\.\d{1,2})?)%\s*\)$/;
const RX_HSLA = /^hsla\(\s*(\d{1,3}(?:\.\d{1,2})?)\s*,\s*(\d{1,3}(?:\.\d{1,2})?)%\s*,\s*(\d{1,3}(?:\.\d{1,2})?)%\s*,\s*(\d(?:\.\d{1,4})?)\s*\)$/;
const RX_HSV = /^hsv\(\s*(\d{1,3}(?:\.\d{1,2})?)\s*,\s*(\d{1,3}(?:\.\d{1,2})?)%\s*,\s*(\d{1,3}(?:\.\d{1,2})?)%\s*\)$/;
const RX_HSVA = /^hsva\(\s*(\d{1,3}(?:\.\d{1,2})?)\s*,\s*(\d{1,3}(?:\.\d{1,2})?)%\s*,\s*(\d{1,3}(?:\.\d{1,2})?)%\s*,\s*(\d(?:\.\d{1,4})?)\s*\)$/;

export function isRgb(value: string): boolean {
    return value.match(RX_RGB) !== null;
}

export function isHsl(value: string): boolean {
    return value.match(RX_HSL) !== null;
}

export function isHsv(value: string): boolean {
    return value.match(RX_HSV) !== null;
}

export function isRgba(value: string): boolean {
    return value.match(RX_RGBA) !== null;
}

export function isHsla(value: string): boolean {
    return value.match(RX_HSLA) !== null;
}

export function isHsva(value: string): boolean {
    return value.match(RX_HSVA) !== null;
}


export function parseRgb(value: string): Vec3 {
    const [r, g, b] = value.match(RX_RGB)!.slice(1);
    return [parseInt(r), parseInt(g), parseInt(b)];
}

export function parseHsl(value: string): Vec3 {
    const [h, s, l] = value.match(RX_HSL)!.slice(1);
    return [parseFloat(h), parseFloat(s), parseFloat(l)];
}

export function parseHsv(value: string): Vec3 {
    const [h, s, v] = value.match(RX_HSV)!.slice(1);
    return [parseFloat(h), parseFloat(s), parseFloat(v)];
}

export function parseRgba(value: string): Vec4 {
    const [r, g, b, a] = value.match(RX_RGBA)!.slice(1);
    return [parseInt(r), parseInt(g), parseInt(b), parseFloat(a)];
}

export function parseHsla(value: string): Vec4 {
    const [h, s, l, a] = value.match(RX_HSLA)!.slice(1);
    return [parseFloat(h), parseFloat(s), parseFloat(l), parseFloat(a)];
}

export function parseHsva(value: string): Vec4 {
    const [h, s, v, a] = value.match(RX_HSVA)!.slice(1);
    return [parseFloat(h), parseFloat(s), parseFloat(v), parseFloat(a)];
}


export function tryParseRgb(value: string): Vec3 | null {
    const match = value.match(RX_RGB);
    if (match == null) return null;

    const [r, g, b] = match.slice(1);
    return [parseInt(r), parseInt(g), parseInt(b)];
}

export function tryParseHsl(value: string): Vec3 | null {
    const match = value.match(RX_HSL);
    if (match == null) return null;

    const [h, s, l] = match.slice(1);
    return [parseFloat(h), parseFloat(s), parseFloat(l)];
}

export function tryParseHsv(value: string): Vec3 | null {
    const match = value.match(RX_HSV);
    if (match == null) return null;

    const [h, s, v] = match.slice(1);
    return [parseFloat(h), parseFloat(s), parseFloat(v)];
}

export function tryParseRgba(value: string): Vec4 | null {
    const match = value.match(RX_RGBA);
    if (match == null) return null;

    const [r, g, b, a] = match.slice(1);
    return [parseInt(r), parseInt(g), parseInt(b), parseFloat(a)];
}

export function tryParseHsla(value: string): Vec4 | null {
    const match = value.match(RX_HSLA);
    if (match == null) return null;

    const [h, s, l, a] = match.slice(1);
    return [parseFloat(h), parseFloat(s), parseFloat(l), parseFloat(a)];
}

export function tryParseHsva(value: string): Vec4 | null {
    const match = value.match(RX_HSVA);
    if (match == null) return null;

    const [h, s, v, a] = match.slice(1);
    return [parseFloat(h), parseFloat(s), parseFloat(v), parseFloat(a)];
}



export function hslToRgb([h, s, l]: Vec3): Vec3 {
    s /= 100;
    l /= 100;

    const a = s * Math.min(l, 1 - l);
    const f = (n: number, k: number = (n + h / 30) % 12) => l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)] as Vec3;
}

export function rgbToHsl([r, g, b]: Vec3): Vec3 {
    r /= 255;
    g /= 255;
    b /= 255;

    // Find greatest and smallest channel values
    const cMin = Math.min(r, g, b), cMax = Math.max(r, g, b), delta = cMax - cMin;

    let h = 0, s = 0, l = 0;

    if (delta == 0) h = 0;
    else if (cMax == r) h = ((g - b) / delta) % 6;
    else if (cMax == g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;

    h = toFixed(h * 60);

    if (h < 0) h += 360;

    l = (cMax + cMin) / 2;

    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

    s = toFixed(s * 100);
    l = toFixed(l * 100);

    return [h, s, l];
}

export function hsvToRgb([h, s, v]: Vec3): Vec3 {
    h /= 360;
    s /= 100;
    v /= 100;

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
        default: throw "bad hsv";
    }

    return [
        Math.round(r * 255),
        Math.round(g * 255),
        Math.round(b * 255),
    ];
}

export function rgbToHsv([r, g, b]: Vec3): Vec3 {
    r /= 255;
    g /= 255;
    b /= 255;

    const v = Math.max(r, g, b);
    const diff = v - Math.min(r, g, b);
    const diffC = (c: number) => (v - c) / 6 / diff + 1 / 2;

    let h, s;
    if (diff == 0) {
        h = s = 0;
    } else {
        s = diff / v;

        if (r === v) {
            h = diffC(b) - diffC(g);
        } else if (g === v) {
            h = (1 / 3) + diffC(r) - diffC(b);
        } else if (b === v) {
            h = (2 / 3) + diffC(g) - diffC(r);
        } else {
            throw "bad rgb";
        }

        if (h < 0) {
            h += 1;
        } else if (h > 1) {
            h -= 1;
        }
    }

    return [
        toFixed(h * 360),
        toFixed(s * 100),
        toFixed(v * 100),
    ];
}


export function rgbToPosition(rgb: Vec3, width: number, height: number): Vec2 {
    return hslToPosition(rgbToHsl(rgb), width, height);
}

export function positionToRgb([x, y]: Vec2, sat: number, width: number, height: number): Vec3 {
    return hslToRgb(positionToHsl([x, y], sat, width, height));
}

export function hslToPosition([h, _s, l]: Vec3, width: number, height: number): Vec2 {
    h /= 360;
    l /= 100;
    return [Math.round(h * width), Math.round((1 - l) * height)];
}

export function positionToHsl([x, y]: Vec2, sat: number, width: number, height: number): Vec3 {
    return [toFixed(x / width * 360), toFixed(sat), toFixed((1 - y / height) * 100)];
}

export function hsvToPosition([h, _s, v]: Vec3, width: number, height: number): Vec2 {
    h /= 360;
    v /= 100;
    return [Math.round(h * width), Math.round((1 - v) * height)];
}

export function positionToHsv([x, y]: Vec2, sat: number, width: number, height: number): Vec3 {
    return [toFixed(x / width * 360), toFixed(sat), toFixed((1 - y / height) * 100)];
}


export function rgbToHex([r, g, b]: Vec3): HexRgb {
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}` as HexRgb;
}

export function hexToRgb(hex: HexRgb): Vec3 {
    return [
        parseInt(hex.slice(1, 3), 16),
        parseInt(hex.slice(3, 5), 16),
        parseInt(hex.slice(5, 7), 16),
    ];
}

export function hslToHex(hsl: Vec3): HexRgb {
    return rgbToHex(hslToRgb(hsl));
}

export function hsvToHex(hsv: Vec3): HexRgb {
    return rgbToHex(hsvToRgb(hsv));
}

export function hexToHsl(hex: HexRgb): Vec3 {
    return rgbToHsl(hexToRgb(hex));
}

export function hexToHsv(hex: HexRgb): Vec3 {
    return rgbToHsv(hexToRgb(hex));
}

export function rgbaToHex([r, g, b, a]: Vec4): HexRgba {
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}${Math.round(a * 255).toString(16).padStart(2, "0")}` as HexRgba;
}

export function hexToRgba(hex: HexRgba): Vec4 {
    return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16), parseInt(hex.slice(7, 9), 16) / 255];
}


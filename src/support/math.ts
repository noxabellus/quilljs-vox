export type Vec2 = [number, number];
export type Vec3 = [number, number, number];
export type Vec4 = [number, number, number, number];

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


export function hslToRgb ([h, s, l]: Vec3): Vec3 {
    s /= 100;
    l /= 100;

    const a = s * Math.min(l, 1 - l);
    const f = (n: number, k: number = (n + h / 30) % 12) => l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)] as Vec3;
}

export function rgbToHsl ([r, g, b]: Vec3): Vec3 {
    r /= 255;
    g /= 255;
    b /= 255;

    // Find greatest and smallest channel values
    const cMin = Math.min(r, g, b),
          cMax = Math.max(r, g, b),
          delta = cMax - cMin;

    let h = 0,
        s = 0,
        l = 0;

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

export function hsvToRgb ([h, s, v]: Vec3): Vec3 {
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

export function rgbToHsv ([r, g, b]: Vec3): Vec3 {
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


export function rgbToPosition (rgb: Vec3, width: number, height: number): Vec2 {
    return hslToPosition(rgbToHsl(rgb), width, height);
}

export function positionToRgb ([x, y]: Vec2, sat: number, width: number, height: number): Vec3 {
    return hslToRgb(positionToHsl([x, y], sat, width, height));
}

export function hslToPosition ([h, _s, l]: Vec3, width: number, height: number): Vec2 {
    h /= 360;
    l /= 100;
    return [Math.round(h * width), Math.round((1 - l) * height)];
}

export function positionToHsl ([x, y]: Vec2, sat: number, width: number, height: number): Vec3 {
    return [toFixed(x / width * 360), toFixed(sat), toFixed((1.0 - y / height) * 100)];
}

export function hsvToPosition ([h, _s, v]: Vec3, width: number, height: number): Vec2 {
    h /= 360;
    v /= 100;
    return [Math.round(h * width), Math.round((1 - v) * height)];
}

export function positionToHsv ([x, y]: Vec2, sat: number, width: number, height: number): Vec3 {
    return [toFixed(x / width * 360), toFixed(sat), toFixed((1.0 - y / height) * 100)];
}


export function rgbToHex ([r, g, b]: Vec3): string {
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export function hexToRgb (hex: string): Vec3 {
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

export function hslToHex (hsl: Vec3): string {
    return rgbToHex(hslToRgb(hsl));
}

export function hsvToHex (hsv: Vec3): string {
    return rgbToHex(hsvToRgb(hsv));
}

export function hexToHsl (hex: string): Vec3 {
    return rgbToHsl(hexToRgb(hex));
}

export function hexToHsv (hex: string): Vec3 {
    return rgbToHsv(hexToRgb(hex));
}


export function rgbaToHex ([r, g, b, a]: Vec4): string {
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}${Math.round(a * 255).toString(16).padStart(2, "0")}`;
}

export function hexToRgba (hex: string): Vec4 {
    if (!hex.startsWith("#")) throw "invalid hex code";

    if (hex.length == 4) {
        hex = hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }

    if (hex.length === 5) {
        hex = hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3] + hex[4] + hex[4];
    }

    if (hex.length == 7) {
        hex += "ff";
    }

    return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16), parseInt(hex.slice(7, 9), 16) / 255];
}




export default {
    parseFloatSafe,
    parseIntSafe,
    toFixed,
    hslToRgb,
    rgbToHsl,
    hsvToRgb,
    rgbToHsv,
    rgbToPosition,
    positionToRgb,
    hslToPosition,
    positionToHsl,
    hsvToPosition,
    positionToHsv,
    rgbToHex,
    hexToRgb,
    hslToHex,
    hsvToHex,
    hexToHsl,
    hexToHsv,
    rgbaToHex,
    hexToRgba,
};

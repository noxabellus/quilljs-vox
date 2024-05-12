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

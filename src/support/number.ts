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

export default {
    parseFloatSafe,
    parseIntSafe,
    toFixed,
};

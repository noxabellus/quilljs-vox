
export function parseFloatSafe (value: string): number {
    const parsed = parseFloat(value);
    return isNaN(parsed)? 0.0 : parsed;
}

export function parseIntSafe (value: string): number {
    const parsed = parseInt(value);
    return isNaN(parsed)? 0 : parsed;
}

export default {
    parseFloatSafe,
    parseIntSafe,
};

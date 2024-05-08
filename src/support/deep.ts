export function deepCompare(a: any, b: any): boolean {
    if (a === b) return true;

    if (typeof a !== typeof b) return false;

    if (Array.isArray(a)) {
        if (!Array.isArray(b)) return false;

        if (a.length !== b.length) return false;

        return a.every((v, i) => deepCompare(v, b[i]));
    }

    if (typeof a === "object") {
        const aKeys = Object.keys(a);
        const bKeys = Object.keys(b);

        if (aKeys.length !== bKeys.length) return false;

        return aKeys.every(key => deepCompare(a[key], b[key]));
    }

    return false;
}

export function deepCopy (value: any): any {
    if (Array.isArray(value)) {
        return value.map(deepCopy);
    }

    if (typeof value === "object") {
        const out: any = {};

        for (const key in value) {
            out[key] = deepCopy(value[key]);
        }

        return out;
    }

    return value;
}

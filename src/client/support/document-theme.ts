
export type Theme = {
    "width"?: Length,
    "border-size"?: Length,
    "border-color"?: Color,
    "border-opacity"?: number,
    "border-radius"?: Length,
    "primary-font-family"?: string,
    "primary-font-size"?: Length,
    "primary-font-weight"?: FontWeight,
    "primary-text-color"?: Color,
    "background-color"?: Color,
    "padding"?: Dimensions,
};
export type ThemeKey = keyof typeof DEFAULT_DOCUMENT_THEME;
export type PropertyType = "string" | "number" | "length" | "color" | "dimensions";
export type Dimensions = [Length, Length, Length, Length];
export type FontWeight = "normal" | "bold" | "bolder" | "light" | "lighter" | number;
export type Color = [number, number, number];
export type LengthUnit = "px" | "pt" | "em" | "rem" | "%" | "vh" | "vw" | "vmin" | "vmax" | "cm" | "mm" | "in" | "pc";
export type Length
    = {"px":number}
    | {"pt":number}
    | {"em":number}
    | {"rem":number}
    | {"%":number}
    | {"vh":number}
    | {"vw":number}
    | {"vmin":number}
    | {"vmax":number}
    | {"cm":number}
    | {"mm":number}
    | {"in":number}
    | {"pc":number}
    ;

export const DEFAULT_DOCUMENT_THEME: Theme = {
    "width": {"px": 960},
    "border-size": {"px": 1},
    "border-color": [255, 255, 255],
    "border-opacity": 0.2,
    "border-radius": {"px": 8},
    "primary-font-family": "Helvetica, Arial, sans-serif",
    "primary-font-size": {"pt": 12},
    "primary-font-weight": "normal",
    "primary-text-color": [255, 255, 255],
    "background-color": [0, 0, 0],
    "padding": [{"px": 16}, {"px": 16}, {"px": 8}, {"px": 8}],
};

export const THEME_KEYS = Object.keys(DEFAULT_DOCUMENT_THEME);
export const THEME_UNITS = [
    "px", "pt", "em", "rem", "%", "vh", "vw",
    "vmin", "vmax", "cm", "mm", "in", "pc",
];

export function isThemeKey (key: string): key is ThemeKey {
    return THEME_KEYS.includes(key);
}

export function applyDocumentTheme (elem: HTMLElement, theme: Theme) {
    Object.entries(theme).forEach(([key, value]) => {
        applyDocumentProperty(elem, key as keyof Theme, value);
    });
}

export function applyDocumentProperty (elem: HTMLElement, key: ThemeKey, value: Theme[typeof key]) {
    const keyFull = `--document-${key}`;

    let valueString = propertyString(value);

    if (valueString === undefined) {
        valueString = propertyString(DEFAULT_DOCUMENT_THEME[key]);
    }

    elem.style.setProperty(keyFull, valueString);
}

export function propertyTypeOfKey (key: ThemeKey): PropertyType {
    return propertyType(DEFAULT_DOCUMENT_THEME[key]);
}

export function isValidProperty (key: ThemeKey, value: any): value is Theme[typeof key] {
    return propertyTypeOfKey(key) === propertyType(value);
}

export function propertyType<K extends ThemeKey> (value: Theme[K]): PropertyType | undefined {
    if (Array.isArray(value)) {
        switch (value.length) {
            case 3: return "color";
            case 4: return "dimensions";
            default: return undefined;
        }
    }

    const type = typeof value;
    switch (type) {
        case "string": return "string";
        case "number": return "number";
        case "object": return "length";
        default: return undefined;
    }
}

export function propertyString<K extends ThemeKey> (value: Theme[K]): string | undefined {
    switch (propertyType(value)) {
        case "string": return value as string;
        case "number": return `${value}`;
        case "color": return (value as Color).map(propertyString).join(", ");
        case "dimensions": return (value as Dimensions).map(propertyString).join(" ");
        case "length": {
            const [unit, val] = Object.entries(value)[0];
            return `${val}${unit}`;
        }
        default: return undefined;
    }
}

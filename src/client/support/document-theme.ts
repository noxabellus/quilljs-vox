import { unsafeForceVal } from "./nullable";

export type Theme = {
    "width"?: Length,
    "border-size"?: Length,
    "border-color"?: Color,
    "border-opacity"?: number,
    "border-radius"?: Length,
    "primary-font-family"?: string,
    "primary-font-size"?: Length,
    "primary-font-weight"?: FontWeight,
    "primary-color"?: Color,
    "background-color"?: Color,
    "padding"?: Dimensions,
};
export type ThemeProperty
= Length
| Color
| FontWeight
| Dimensions
| number
| string
;
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
    "primary-color": [255, 255, 255],
    "background-color": [41, 41, 41],
    "padding": [{"px": 14}, {"px": 14}, {"px": 16}, {"px": 16}],
};

export const THEME_KEYS = Object.keys(DEFAULT_DOCUMENT_THEME);
export const THEME_UNITS: LengthUnit[] = [
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

    if (valueString === null) {
        valueString = propertyString(DEFAULT_DOCUMENT_THEME[key]);
    }

    elem.style.setProperty(keyFull, valueString);
}

export function propertyTypeOfKey (key: ThemeKey): PropertyType {
    // safety: ThemeKey is by definition a key of Theme
    return unsafeForceVal(propertyType(DEFAULT_DOCUMENT_THEME[key]));
}

export function isValidProperty (key: ThemeKey, value: any): value is Theme[typeof key] {
    return propertyTypeOfKey(key) === propertyType(value);
}

export function lengthUnit (value: Length): LengthUnit {
    return Object.keys(value)[0] as LengthUnit;
}

export function propertyType<K extends ThemeKey> (value: Theme[K]): PropertyType | null {
    if (Array.isArray(value)) {
        switch (value.length) {
            case 3: return "color";
            case 4: return "dimensions";
            default: return null;
        }
    }

    const type = typeof value;
    switch (type) {
        case "string": return "string";
        case "number": return "number";
        case "object": return "length";
        default: return null;
    }
}

export function propertyString<K extends ThemeKey> (value: Theme[K]): string | null {
    switch (propertyType(value)) {
        case "string": return value as string;
        case "number": return `${value}`;
        case "color": return (value as Color).map(propertyString).join(", ");
        case "dimensions": return (value as Dimensions).map(propertyString).join(" ");
        case "length": {
            // safety: propertyType already validated that this is not undefined
            const [unit, val] = Object.entries(unsafeForceVal(value))[0];
            return `${val}${unit}`;
        }
        default: return null;
    }
}

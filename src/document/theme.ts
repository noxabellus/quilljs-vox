import resetCss from "Extern/reset.css?raw";

import { unsafeForceVal } from "Support/nullable";

import documentStyles from "./styles";

export const DEFAULT_FONTS: string[] = [
    "serif",
    "sans-serif",
    "monospace",
];

export type FullTheme = {
    "base-font-family": Font,
    "base-font-size": Length,
    "base-font-color": Color,
    "border-color": Color,
    "background-color": Color,
    "page-color": Color,
    "width": Length,
    "margin": Dimensions,
    "padding": Dimensions,
    "border-size": Length,
    "border-radius": Dimensions,
};

export const THEME_TYPES: {[K in keyof FullTheme]: PropertyType} = {
    "base-font-family": "font",
    "base-font-size": "length",
    "base-font-color": "color",
    "border-color": "color",
    "background-color": "color",
    "page-color": "color",
    "width": "length",
    "margin": "dimensions",
    "padding": "dimensions",
    "border-size": "length",
    "border-radius": "dimensions",
};

export type Font = { fontName: string };

export type Theme = Partial<FullTheme>;

export type ThemeProperty
    = Length
    | Color
    | FontWeight
    | Dimensions
    | number
    | string
    | Font
    ;
export type ThemeKey = keyof FullTheme;
export type PropertyType = "font" | "string" | "number" | "length" | "color" | "dimensions";
export type Dimensions = [Length, Length, Length, Length];
export type FontWeight = "normal" | "bold" | "bolder" | "light" | "lighter" | number;
export type Color = [number, number, number];
export type LengthUnit = "px" | "pt" | "em" | "cm" | "mm" | "in" | "pc";
export type Length
    = {"px":number}
    | {"pt":number}
    | {"em":number}
    | {"cm":number}
    | {"mm":number}
    | {"in":number}
    | {"pc":number}
    ;



export const LengthUnitRatios = {
    px: 1,
    pt: 1.33,
    pc: 16,
    in: 96,
    mm: 3.78,
    cm: 37.8,
};

export function lengthConvert (theme: Theme, value: number, unit: LengthUnit, returnUnit: LengthUnit): number {
    const basePx = lengthToPx(theme, unit);
    const returnPx = lengthToPx(theme, returnUnit);
    return value * (basePx / returnPx);
}

export function lengthToPx (theme: Theme, unit: LengthUnit, value?: number): number;
export function lengthToPx (theme: Theme, unit: Length): number;

export function lengthToPx (theme: Theme, ...args: any[]): number {
    let x: [LengthUnit, number];
    if (args.length == 1) {
        if (typeof args[0] == "string") {
            x = [args[0] as LengthUnit, 1];
        } else {
            x = Object.entries(args[0])[0] as any;
        }
    } else {
        x = args as any;
    }

    const [unit, val] = x;

    if (unit == "px") return val;

    const ratio = (LengthUnitRatios as any)[unit] as number | undefined;
    if (ratio) {
        return val * ratio;
    } else {
        const base = theme["base-font-size"];

        let basePx;

        if (base) {
            basePx = lengthToPx(DEFAULT_DOCUMENT_THEME, base);
        } else {
            const defaultBase = DEFAULT_DOCUMENT_THEME["base-font-size"];
            basePx = lengthToPx({}, defaultBase);
        }

        return val * basePx;
    }
}

export function isRelativeUnit (unit: LengthUnit): boolean {
    return unit == "em";
}

export function isRelativeLength (length: Length): boolean {
    return isRelativeUnit(Object.keys(length)[0] as LengthUnit);
}

export const DEFAULT_DOCUMENT_THEME: FullTheme = {
    "base-font-family": {"fontName": "sans-serif"},
    "base-font-size": {"pt": 12},
    "base-font-color": [255, 255, 255],
    "page-color": [41, 41, 41],
    "background-color": [0, 0, 0],
    "width": {"in": 8.5},
    "margin": [{"px": 16}, {"px": 16}, {"px": 16}, {"px": 16}],
    "padding": [{"px": 14}, {"px": 16}, {"px": 14}, {"px": 16}],
    "border-size": {"px": 1},
    "border-color": [255, 255, 255],
    "border-radius": [{"px": 8}, {"px": 8}, {"px": 8}, {"px": 8}],
};

const FONT_KEYS: (keyof FullTheme)[] = [
    "base-font-family",
];

if (lengthUnit(DEFAULT_DOCUMENT_THEME["base-font-size"] as Length) == "em")
    throw "Primary font size of default theme cannot be a relative unit";

for (const key of FONT_KEYS) {
    const value = DEFAULT_DOCUMENT_THEME[key] as Font;
    if (value.fontName == "inherit") continue;
    if (!DEFAULT_FONTS.includes(value.fontName))
        throw `Font family ${value} is not a default font`;
}

export const THEME_KEYS = Object.keys(DEFAULT_DOCUMENT_THEME);
export const THEME_UNITS: [LengthUnit, LengthUnit, LengthUnit, LengthUnit, LengthUnit, LengthUnit, LengthUnit] = [
    "px", "pt", "em", "cm", "mm", "in", "pc",
];

export function isThemeKey (key: string): key is ThemeKey {
    return THEME_KEYS.includes(key);
}

export function themeValue (theme: Theme, key: ThemeKey): ThemeProperty {
    const value = theme[key];
    if (value !== undefined) return value;
    else return DEFAULT_DOCUMENT_THEME[key];
}

export function applyDocumentTheme (elem: HTMLElement, theme: Theme) {
    Object.keys(DEFAULT_DOCUMENT_THEME).forEach((key: keyof Theme) => {
        applyDocumentProperty(elem, theme, key, theme[key]);
    });
}

export function makeFullTheme (theme: Theme): FullTheme {
    return {...DEFAULT_DOCUMENT_THEME, ...theme};
}

export function applyDocumentProperty (elem: HTMLElement, theme: Theme, key: ThemeKey, value?: Theme[typeof key]) {
    const keyFull = `--document-${key}`;

    let valueString = propertyString(theme, value);

    if (valueString === null) {
        valueString = propertyString(theme, DEFAULT_DOCUMENT_THEME[key]);
    }

    elem.style.setProperty(keyFull, valueString);
}

export function themeCss (theme: FullTheme, documentSelector: string): string {
    return `
        ${resetCss}

        :root {
            ${Object.entries(theme).map(([key, value]) =>
                `${`--document-${key}`}: ${propertyString(theme, value)};`
            ).join("\n")}
        }

        body {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: stretch;
            background: rgb(var(--document-background-color));
            height: fit-content;
        }

        ${documentStyles(documentSelector)}
    `;
}

export function propertyTypeOfKey (key: ThemeKey): PropertyType {
    // safety: DEFAULT_DOCUMENT_THEME is statically validated
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
        case "object": {
            const keys = Object.keys(value as any);

            if (keys.length != 1) return null;
            const key = keys[0];

            if (THEME_UNITS.includes(key as LengthUnit)) return "length";
            if (key == "fontName") return "font";
            return null;
        };
        default: return null;
    }
}

export function propertyString<K extends ThemeKey> (theme: Theme, value: Theme[K]): string | null {
    switch (propertyType(value)) {
        case "string": return value as any;
        case "number": return `${value}`;
        case "color": return (value as Color).join(", ");
        case "dimensions": return (value as Dimensions).map(x => lengthString(theme, x)).join(" ");
        case "length": return lengthString(theme, value as Length);
        case "font": return fontString(theme, value as Font);
        default: return null;
    }
}

export function lengthString (theme: Theme, value: Length): string {
    // safety: propertyType already validated that this is not undefined
    const [unit, val] = Object.entries(unsafeForceVal(value))[0];
    if (unit != "em") {
        return `${val}${unit}`;
    } else {
        const px = lengthToPx(theme, unit, val);
        return `${px}px`;
    }
}

export function fontString (theme: Theme, value: Font): string {
    if (value.fontName == "inherit") {
        return fontString(DEFAULT_DOCUMENT_THEME, theme["base-font-family"] || {fontName: "inherit"});
    } else {
        return value.fontName;
    }
}

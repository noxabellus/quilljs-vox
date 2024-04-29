export const DEFAULT_DOCUMENT_THEME = {
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
    "padding-vertical": {"px": 16},
    "padding-horizontal": {"px": 8},
};

export const THEME_KEYS = Object.keys(DEFAULT_DOCUMENT_THEME);
export const THEME_UNITS = ["px", "pt", "em", "rem", "%", "vh", "vw", "vmin", "vmax", "cm", "mm", "in", "pc"];


export function applyDocumentTheme (elem, theme) {
    Object.entries(theme).forEach(([key, value]) => {
        applyDocumentProperty(elem, key, value);
    });
}

export function applyDocumentProperty (elem, key, value) {
    if (!THEME_KEYS.includes(key)) throw `invalid theme key: ${key}`;

    const keyFull = `--document-${key}`;

    const valueString = propertyString(value);

    if (valueString === null) {
        valueString = propertyString(DEFAULT_DOCUMENT_THEME[key]);
    }

    elem.style.setProperty(keyFull, valueString);
}

export function propertyType (value) {
    if (Array.isArray(value)) return "list";

    const type = typeof value;
    switch (type) {
        case "string": return "string";
        case "number": return "number";
        case "object": {
            const keys = Object.keys(value);
            if (keys.length !== 1){
                throw `unit object in theme must have exactly one key: ${keys}`;
            }
            
            const unit = keys[0];
            if (!THEME_UNITS.includes(unit)){
                throw `unit object in theme must have a valid unit: ${unit}`;
            }
            
            const val = value[unit];
            if (propertyType(val) !== "number" && propertyType(val) !== "string"){
                throw `unit object in theme must have a number or string value: ${val}`;
            }
            
            return "unit";
        }
    }
}

export function propertyString (value) {
    switch (propertyType(value)) {
        case "string": return value;
        case "number": return `${value}`;
        case "list": return value.map(propertyString).join(", ");
        case "unit": {
            const [unit, val] = Object.entries(value)[0];
            return `${val}${unit}`;
        }
    }
}

export default {
    DEFAULT_DOCUMENT_THEME,
    THEME_KEYS,
    THEME_UNITS,
    applyDocumentTheme,
    applyDocumentProperty,
    propertyType,
    propertyString,
};
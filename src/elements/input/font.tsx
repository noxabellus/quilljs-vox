import { DEFAULT_FONTS } from "Document/theme";
import Dropdown from "./dropdown";

export type FontProps = {
    title?: string,
    value: string,
    allowInherit?: boolean,
    allowedFonts: string[],
    disabled?: boolean,
    onChange?: (value: string) => void,
};

export default function FontInput ({title, value, allowInherit, allowedFonts, disabled, onChange}: FontProps) {
    const actualFontNames = [...allowedFonts, ...DEFAULT_FONTS];
    if (allowInherit) actualFontNames.push("inherit");

    const fontNames = actualFontNames.slice();
    if (!fontNames.includes(value)) fontNames.push(value);
    fontNames.sort();

    const selected = fontNames.indexOf(value);

    const changeFont = (i: number) => {
        const newFontName = fontNames[i];

        onChange?.(newFontName);
    };

    return <Dropdown
        title={title || "Click to select a font"}
        disabled={disabled}
        selected={selected}
        onChange={changeFont}
    >
        {fontNames.map((fontName: string, i: number) => {
            if (actualFontNames.includes(fontName)) {
                return <option key={i} style={{fontFamily: fontName}}>{fontName}</option>;
            } else {
                return <option key={i} title="Selected font no longer exists, click to select a new one" style={{fontStyle: "italic", color: "red"}}>{fontName}</option>;
            }
        })}
    </Dropdown>;
}

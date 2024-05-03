import { LengthUnit, Theme, applyDocumentTheme } from "./document-theme";

export default function convertUnit (theme: Theme, value: number, unit: LengthUnit, returnUnit?: LengthUnit): number {
    const target = document.createElement("div");
    target.style.visibility = "hidden";
    document.body.appendChild(target);
    applyDocumentTheme(target, theme);

    const temp = document.createElement("div");
    temp.style.overflow = "hidden";
    temp.style.visibility = "hidden";

    target.appendChild(temp);

    temp.style.width = `100${unit}`;
    const baseFactor = 100 / temp.offsetWidth;

    temp.style.width = `100${returnUnit}`;
    const newFactor = 100 / temp.offsetWidth;

    const result = value * (newFactor * baseFactor);

    target.removeChild(temp);
    document.body.removeChild(target);

    return result;
}

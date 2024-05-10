import { Color } from "Document/theme";
import Label from "Elements/label";
import Input from "./index";
import { parseIntSafe } from "Support/number";


export default function InputColor({name, property, onChange}: {property: Color, name?: string, onChange: (value: Color) => void}) {
    const compNames = ["r", "g", "b"];
    const comps = property as Color;

    return <div>
        {comps.map((comp, compIndex) => {
            return <Label key={compIndex}>
                <span>{compNames[compIndex]}</span>
                <Input
                    step="1"
                    min="0"
                    max="255"
                    name={`${name||"color"}-${compIndex}`}
                    type="number"
                    value={comp}
                    onChange={e => {
                        const value = parseIntSafe(e.target.value);
                        const newComps = [...comps] as Color;
                        newComps[compIndex] = value;
                        onChange(newComps);
                    }}
                />
            </Label>;
        })}
    </div>;
}

import { parseFloatSafe, toFixed } from "Support/math";

import { Length, THEME_UNITS, Theme, lengthConvert, lengthUnit } from "Document/theme";

import Dropdown from "./dropdown";
import Input from "./index";

import styled from "styled-components";


const LengthSection = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    & > button {margin-left: 5px;}
`;


export default function LengthInput ({theme, property, name, onChange}: {theme: Theme, property: Length, name?: string, onChange: (value: Length) => void}) {
    const unit = lengthUnit(property);
    const value = (property as any)[unit] as number;

    const changeUnit = (i: number) => {
        const newUnit = THEME_UNITS[i];
        const converted = toFixed(lengthConvert(theme, value, unit, newUnit));

        onChange({ [newUnit]: converted } as Length);
    };

    return <LengthSection>
        <Input
            step="0.01"
            min="-9999"
            max="9999"
            name={name}
            type="number"
            value={value}
            onChange={e => {
                const value = parseFloatSafe(e.target.value);
                onChange({ [unit]: value } as Length);
            }}
        />
        <Dropdown
            selected={THEME_UNITS.indexOf(unit)}
            onChange={changeUnit}
        >
            {THEME_UNITS.map((unit, i) => <option key={i}>{unit}</option>)}
        </Dropdown>
    </LengthSection>;
}

import { ReactNode } from "react";
import styled from "styled-components";

import Input from "Elements/input";
import { HorizontalSlider } from "Elements/input/slider";

import { Column } from "Elements/layout";
import { HexRgb } from "Support/color";


export type ColorPickerProps = {
    value: HexRgb,
    onChange: (hex: HexRgb) => void,
    width: number,
    height: number,
    children: ReactNode | ReactNode[],
};


export const LocalValue = styled.span`
    text-align: center;
    font-family: monospace;
    font-size: 8pt;
    user-select: text;
    border-radius: 5px;
    padding: 2px;
    border: 1px solid rgb(var(--primary-color));
    background:rgba(0, 0, 0, 0.2);
    color: white;
    white-space: nowrap;
`;


export const ComponentLabel = styled.span.attrs(p => ({style: {background: p.color}}))`
    text-shadow: 1px 1px 0px black;
    font-family: monospace;
    user-select: none;
    border: 1px solid white;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    width: 1.2em;
    height: 1.2em;
`;


export const ComponentBlock = styled(Column)`
    margin-top: 5px;
`;

export const ComponentSection = styled(ComponentBlock)`
    flex-direction: row;
    align-items: center;
    justify-content: center;
    & > *:not(:first-child) {
        margin-left: 5px;
    }
`;


export function ColorComponent ({color, title, min, max, step, value, onChange}: {color: string, title: string, min: string, max: string, step: string, value: number, onChange: (v: string) => void}) {
    return <ComponentSection>
        <ComponentLabel title={title} color={color}>{title[0]}</ComponentLabel>
        <Input title={title} type="number" min={min} max={max} step={step} value={value} onChange={e => onChange(e.target.value)} />
        <HorizontalSlider title={title} min={min} max={max} step={step} value={value} onChange={e => onChange(e.target.value)} />
    </ComponentSection>;
}

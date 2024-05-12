import { useEffect, useState } from "react";

import { HexDisplay, makeFullTransparencyDemo } from "Elements/color-display";
import Block from "Elements/block";
import { Column, Row } from "Elements/layout";
import Dropdown from "Elements/input/dropdown";
import Button from "Elements/input/button";
import ToolSet from "Elements/tool-set";

import { ColorComponent } from "./base";
import ColorPickerHsl from "./hsl";
import ColorPickerHsv from "./hsv";
import ColorPickerRgb from "./rgb";

import undoImg from "Assets/rotate-ccw.svg?raw";
import confirmImg from "Assets/checkmark.svg?raw";
import cancelImg from "Assets/xmark.svg?raw";
import styled from "styled-components";


export type ColorPickerProps = {
    width: number,
    height: number,
    value: string,
    onChange?: (value: string) => void,
    onCancel: () => void,
    onConfirm: (value: string) => void
}


const ColorPickerStyles = styled(Column)`
    align-items: flex-end;
    position: absolute;
`;


export default function ColorPicker ({width, height, value, onChange, onCancel, onConfirm}: ColorPickerProps) {
    if (value.length !== 9 || !value.startsWith("#") || value.slice(1).match(/[^a-fA-F0-9]/))
        throw `invalid hex color: ${value} (expected 9 characters of the form #RRGGBBAA)`;

    const [selected, setSelected] = useState<0 | 1 | 2>(2);
    const [hex, setHex] = useState(value.slice(0, 7));
    const [alpha, setAlpha] = useState(parseInt(value.slice(7), 16) / 255);

    let picker;
    switch (selected) {
        case 0: picker = <ColorPickerRgb value={hex} width={width} height={height} onChange={setHex}/>; break;
        case 1: picker = <ColorPickerHsl value={hex} width={width} height={height} onChange={setHex}/>; break;
        case 2: picker = <ColorPickerHsv value={hex} width={width} height={height} onChange={setHex}/>; break;
    }

    const getFullString = () =>
        `${hex}${Math.round(alpha * 255).toString(16).padStart(2, "0")}`;

    useEffect(() => {
        onChange?.(getFullString());
    }, [hex, alpha]);

    return <ColorPickerStyles>
        <Block style={{width: `${width + 12}px`}}>
            <Row style={{marginBottom: "5px"}}>
                <Dropdown style={{marginRight: "5px"}} selected={selected} onChange={(i) => setSelected(i as any)}>
                    <option>RGB</option>
                    <option>HSL</option>
                    <option>HSV</option>
                </Dropdown>
                <HexDisplay display={hex+Math.round(alpha * 255).toString(16)} style={{borderRadius: "5px", border: "1px solid white", flexGrow: 1, height: "2em", alignSelf: "stretch", justifySelf: "stretch", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center"}}>
                    <span style={{fontFamily: "monospace", borderRadius: ".5em", background:"rgba(0,0,0,0.2)", color:"white", userSelect: "text"}}>{getFullString()}</span>
                </HexDisplay>
            </Row>
            {picker}
            <ColorComponent color={makeFullTransparencyDemo([0, 255, 255, alpha])} title="Alpha" min={0.0} max={1.0} step={0.01} value={alpha} onChange={v => setAlpha(parseFloat(v))} />
        </Block>
        <ToolSet>
            <Button.Icon title="Cancel editing color" svg={cancelImg} onClick={onCancel} />
            <Button.Icon title="Revert to starting color" svg={undoImg} onClick={() => {
                setHex(value.slice(0, 7));
                setAlpha(parseInt(value.slice(7), 16) / 255);
            }} />
            <Button.Icon title="Confirm edited color" svg={confirmImg} onClick={() => onConfirm(getFullString())} />
        </ToolSet>
    </ColorPickerStyles>;
}

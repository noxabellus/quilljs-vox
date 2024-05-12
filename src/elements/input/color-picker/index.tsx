import { HTMLAttributes, forwardRef, useEffect, useState } from "react";

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
import defaultImg from "Assets/circle-cross.svg?raw";
import cancelImg from "Assets/xmark.svg?raw";
import styled from "styled-components";
import { toFixed } from "Support/math";
import { HexRgb, HexRgba } from "Support/color";



export type ColorPickerProps
    = ColorPickerLocal
    & Omit<HTMLAttributes<HTMLDivElement>, keyof ColorPickerLocal>;

type ColorPickerLocal = {
    width: number,
    height: number,
    value: HexRgba,
    defaultValue?: HexRgba,
    onChange?: (value: HexRgba) => void,
    onCancel: () => void,
    onConfirm: (value: HexRgba) => void
};


const ColorPickerStyles = styled(Column)`
    display: flex !important;
    flex-direction: column !important;
    flex-wrap: nowrap !important;
    justify-content: flex-start !important;
    align-items: flex-end !important;
    position: fixed !important;
    z-index: 1000 !important;
    left: 0;
    top: 0;
`;


const ColorPicker = forwardRef(({width, height, value, defaultValue, onChange, onCancel, onConfirm, ...props}: ColorPickerProps, ref?: React.Ref<HTMLDivElement>) => {
    const [selected, setSelected] = useState<0 | 1 | 2>(2);
    const [hex, setHex] = useState(value.slice(0, 7) as HexRgb);
    const [alpha, setAlpha] = useState(parseInt(value.slice(7), 16) / 255);

    let Picker;
    switch (selected) {
        case 0: Picker = ColorPickerRgb; break;
        case 1: Picker = ColorPickerHsl; break;
        case 2: Picker = ColorPickerHsv; break;
    }

    const getFullString = () =>
        `${hex}${Math.round(alpha * 255).toString(16).padStart(2, "0")}` as HexRgba;

    useEffect(() => {
        onChange?.(getFullString());
    }, [hex, alpha]);

    return <ColorPickerStyles ref={ref} {...props}>
        <Block style={{width: `${width + 12}px`}}>
            <Row style={{marginBottom: "5px"}}>
                <Dropdown style={{marginRight: "5px"}} selected={selected} onChange={(i) => setSelected(i as any)}>
                    <option>RGB</option>
                    <option>HSL</option>
                    <option>HSV</option>
                </Dropdown>
                <HexDisplay color={getFullString()} style={{borderRadius: "5px", border: "1px solid white", flexGrow: 1, height: "2em", alignSelf: "stretch", justifySelf: "stretch", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center"}}>
                    <span style={{fontFamily: "monospace", borderRadius: ".5em", background:"rgba(0,0,0,0.2)", color:"white", userSelect: "text"}}>{getFullString()}</span>
                </HexDisplay>
            </Row>
            <Picker value={hex} width={width} height={height} onChange={setHex}>
                <ColorComponent color={makeFullTransparencyDemo([0, 255, 255, alpha])} title="Alpha" min="0.0000" max="1.0000" step="0.0001" value={alpha} onChange={v => setAlpha(toFixed(parseFloat(v)))} />
            </Picker>
        </Block>
        <ToolSet>
            <Button.Icon title="Cancel editing color" svg={cancelImg} onClick={onCancel} />
            {defaultValue &&
                <Button.Icon title="Reset to default color" svg={defaultImg} onClick={() => {
                    setHex(defaultValue.slice(0, 7) as HexRgb);
                    setAlpha(parseInt(defaultValue.slice(7), 16) / 255);
                }} />
            }
            <Button.Icon title="Revert to starting color" svg={undoImg} onClick={() => {
                setHex(value.slice(0, 7) as HexRgb);
                setAlpha(parseInt(value.slice(7), 16) / 255);
            }} />
            <Button.Icon title="Confirm edited color" svg={confirmImg} onClick={() => onConfirm(getFullString())} />
        </ToolSet>
    </ColorPickerStyles>;
});

ColorPicker.displayName = "ColorPicker";

export default ColorPicker;

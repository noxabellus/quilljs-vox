import { RefObject, useEffect, useState } from "react";

import { HexRgba } from "Support/color";

import popOutBuilder from "Elements/popout-builder";
import { HexDisplay } from "Elements/color-display";

import Button from "./button";
import ColorPicker from "./color-picker";


export type InputProps = {
    title?: string,
    value: HexRgba,
    defaultValue?: HexRgba,
    disabled?: boolean,
    onChange?: (value: HexRgba) => void,
    onCancel?: (value: HexRgba) => void,
    onConfirm?: (value: HexRgba) => void,
};

export default function InputColor({title, value, defaultValue, disabled, onChange, onCancel, onConfirm}: InputProps) {
    const [controlRef, popOutRef, open, setOpen] = popOutBuilder();
    const [color, setColor] = useState(value);
    const [tempColor, setTempColor] = useState<HexRgba | null>(null);
    const [lastChange, setLastChange] = useState<HexRgba | null>(color);

    const colorToShow = tempColor ?? color;

    useEffect(() => {
        if (colorToShow !== lastChange) {
            console.log("onChange", colorToShow, lastChange);
            onChange?.(colorToShow);
            setLastChange(colorToShow);
        }
    }, [tempColor]);

    useEffect(() => {
        onConfirm?.(colorToShow);
    }, [color]);

    useEffect(() => {
        if (tempColor === null) {
            console.log("setting new value");
            setColor(value);
            setLastChange(value);
        }
    }, [value]);

    return <>
        <Button disabled={disabled} ref={controlRef} title={title || "Click to open color editor"} onClick={() => setOpen(!open)}>
            <HexDisplay color={colorToShow}/>
        </Button>
        {open &&
            <ColorPicker
                ref={popOutRef as RefObject<HTMLDivElement>}
                width={200}
                height={100}
                value={color}
                defaultValue={defaultValue}
                onChange={newHex => setTempColor(newHex)}
                onCancel={() => {
                    setOpen(false);
                    setTempColor(null);
                    onCancel?.(value);
                }}
                onConfirm={newHex => {
                    setTempColor(null);
                    setColor(newHex);
                    setOpen(false);
                }}
            />
        }
    </>;
}

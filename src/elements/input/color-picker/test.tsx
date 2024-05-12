import { RefObject, useState } from "react";
import ColorPicker from "Elements/input/color-picker";
import Button from "Elements/input/button";
import { HexDisplay } from "Elements/color-display";
import { Column } from "Elements/layout";
import popOutBuilder from "Elements/popout-builder";
import { HexRgba, asHexRgba } from "Support/color";

export default function PickerTest () {
    const [controlRef, popOutRef, open, setOpen] = popOutBuilder();
    const [color, setColor] = useState(asHexRgba("#2648c0ad"));
    const [tempColor, setTempColor] = useState<HexRgba | null>(null);

    const colorToShow = tempColor ?? color;

    return <>
        <span style={{color: "white", background: colorToShow}}>{colorToShow}</span>
        <Column style={{alignItems:"center"}}>
            <Button ref={controlRef} title="Click to open color editor" onClick={() => setOpen(!open)}>
                <HexDisplay color={colorToShow}/>
            </Button>
        </Column>
        {open &&
            <ColorPicker
                ref={popOutRef as RefObject<HTMLDivElement>}
                width={200}
                height={100}
                value={color}
                onChange={newHex => setTempColor(newHex)}
                onCancel={() => {
                    setOpen(false);
                    setTempColor(null);
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

import { createRoot } from "react-dom/client";

// import App from "./content/app";

import ColorPicker from "Elements/input/color-picker";
import { RefObject, useState } from "react";
import Button from "Elements/input/button";
import { HexDisplay } from "Elements/color-display";
import { Column } from "Elements/layout";
import popOutBuilder from "Elements/popout-builder";
import { hexToRgb, hsvToRgb, rgbToHex, rgbToHsv } from "Support/math";


const domNode = document.body.appendChild(document.createElement("div"));
domNode.id = "app-container";
domNode.style.backgroundColor = "black";

function PickerTest () {
    const [controlRef, popOutRef, open, setOpen] = popOutBuilder();
    const [color, setColor] = useState("#2648c0ad");
    const [tempColor, setTempColor] = useState<string | null>(null);

    const colorToShow = tempColor ?? color;

    return <>
        <span style={{color: "white", background: colorToShow}}>{colorToShow}</span>
        <Column style={{alignItems:"center"}}>
            <Button ref={controlRef} title="Click to open color editor" onClick={() => setOpen(!open)}>
                <HexDisplay display={colorToShow}/>
            </Button>
        </Column>
        {open &&
            <ColorPicker
                ref={popOutRef as RefObject<any>}
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

const hex = "#2648c0";
const rgb1 = hexToRgb(hex);
const hsv = rgbToHsv(rgb1);
const rgb2 = hsvToRgb(hsv);
const hex2 = rgbToHex(rgb2);

console.log(hex == hex2, rgb1, hsv, rgb2, hex2);


const root = createRoot(domNode);
root.render(<PickerTest />);

import { createRoot } from "react-dom/client";

// import App from "./content/app";

import ColorPicker from "Elements/input/color-picker";
import { useState } from "react";
import Button from "Elements/input/button";
import { HexDisplay } from "Elements/color-display";
import { Column } from "Elements/layout";


const domNode = document.body.appendChild(document.createElement("div"));
domNode.id = "app-container";

function PickerTest () {
    const [open, setOpen] = useState(false);
    const [color, setColor] = useState("#2648c0ad");

    return <>
        <Column style={{alignItems:"center"}}>
            <Button title="Click to open color editor" onClick={() => setOpen(!open)}>
                <HexDisplay display={color}/>
            </Button>
        </Column>
        {open && <ColorPicker width={200} height={100} value={color} onChange={newHex => console.log(newHex)} onCancel={() => setOpen(false)} onConfirm={newHex => {
            setColor(newHex);
            setOpen(false);
        }}/>}
    </>;
}

const root = createRoot(domNode);
root.render(<PickerTest />);

import styled from "styled-components";

import { Color } from "Document/theme";
import { HTMLAttributes } from "react";
import { hsvToRgb } from "Support/math";


export type ColorProps
    = { display: Color, }
    & HTMLAttributes<HTMLDivElement>
    ;

export type HexProps
    = { display: string, }
    & HTMLAttributes<HTMLDivElement>
    ;



const Styled = styled.div`
    display: inline-block;
    min-width: 1em;
    min-height: 1em;
    user-select: none;
`;

// const checkerboard = [
//     "linear-gradient(45deg, #808080 25%, white 25%)",
//     "linear-gradient(-45deg, #808080 25%, white 25%)",
//     "linear-gradient(45deg, white 75%, #808080 75%)",
//     "linear-gradient(-45deg, white 75%, #808080 75%)"
// ];

export function RgbDisplay ({display, style, ...props}: ColorProps) {
    return <Styled style={{...style, backgroundColor: `rgb(${display.join(", ")})`}} {...props} />;
}

export function HslDisplay ({display, style, ...props}: ColorProps) {
    return <Styled style={{...style, backgroundColor: `hsl(${display[0]}, ${display[1]}%, ${display[2]}%)`}} {...props} />;
}

export function HsvDisplay ({display, style, ...props}: ColorProps) {
    return <Styled style={{...style, backgroundColor: `rgb(${hsvToRgb(display).join(", ")})`}} {...props} />;
}

export function HexDisplay ({display, style, ...props}: HexProps) {
    const base = hexToRgba(display);
    const rgba = `rgba(${base.join(", ")})`;
    const rgb = `rgb(${base.slice(0, 3).join(", ")})`;
    console.log(rgba);
    return <Styled style={{...style, background: `linear-gradient(to right, ${rgb} 50%, ${rgba} 50%), repeating-conic-gradient(#808080 0% 25%, white 0% 50%) 50% / 20px 20px`}} {...props} />;
}

function hexToRgba (hex: string) {
    if (!hex.startsWith("#")) throw "invalid hex code";

    if (hex.length == 4) {
        hex = hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }

    if (hex.length === 5) {
        hex = hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3] + hex[4] + hex[4];
    }

    if (hex.length == 7) {
        hex += "ff";
    }

    return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16), parseInt(hex.slice(7, 9), 16) / 255];
}

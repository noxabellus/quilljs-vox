import styled from "styled-components";

import { Color } from "Document/theme";
import { HTMLAttributes } from "react";
import { hexToRgba, hsvToRgb, Vec4 } from "Support/math";


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

    return <Styled style={{...style, background: makeHalfTransparencyDemo(base)}} {...props} />;
}

export function makeHalfTransparencyDemo (color: Vec4): string {
    const rgba = `rgba(${color.join(", ")})`;
    const rgb = `rgb(${color.slice(0, 3).join(", ")})`;
    return `linear-gradient(to right, ${rgb} 50%, ${rgba} 50%), repeating-conic-gradient(#808080 0% 25%, white 0% 50%) 50% / .5em .5em`;
}


export function makeFullTransparencyDemo (color: Vec4): string {
    const rgba = `rgba(${color.join(", ")})`;
    return `linear-gradient(${rgba}, ${rgba}), repeating-conic-gradient(#808080 0% 25%, white 0% 50%) 50% / .5em .5em`;
}

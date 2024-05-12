import styled from "styled-components";

import { HTMLAttributes } from "react";
import { Vec3, Vec4 } from "Support/math";
import { HexRgba, hexToRgba, hsvToRgb } from "Support/color";


export type ColorProps
    = { color: Vec3, }
    & HTMLAttributes<HTMLDivElement>
    ;

export type HexProps
    = { color: HexRgba, }
    & HTMLAttributes<HTMLDivElement>
    ;



const Styled = styled.div`
    display: inline-block;
    min-width: 1em;
    min-height: 1em;
    user-select: none;
    outline: 1px solid rgb(var(--primary-color));
    *:hover > & {
        outline-color: rgb(var(--accent-color));
    }
    outline-offset: 1px;
    border-radius: 2px;
`;

export function RgbDisplay ({color, style, ...props}: ColorProps) {
    return <Styled style={{...style, backgroundColor: `rgb(${color.join(", ")})`}} {...props} />;
}

export function HslDisplay ({color, style, ...props}: ColorProps) {
    return <Styled style={{...style, backgroundColor: `hsl(${color[0]}, ${color[1]}%, ${color[2]}%)`}} {...props} />;
}

export function HsvDisplay ({color, style, ...props}: ColorProps) {
    return <Styled style={{...style, backgroundColor: `rgb(${hsvToRgb(color).join(", ")})`}} {...props} />;
}

export function HexDisplay ({color, style, ...props}: HexProps) {
    return <Styled style={{...style, background: makeHalfTransparencyDemo(color)}} {...props} />;
}

export function makeHalfTransparencyDemo (color: HexRgba | Vec4): string {
    if (typeof color === "string") color = hexToRgba(color);
    const rgba = `rgba(${color.join(", ")})`;
    const rgb = `rgb(${color.slice(0, 3).join(", ")})`;
    return `linear-gradient(to right, ${rgb} 50%, ${rgba} 50%), repeating-conic-gradient(#808080 0% 25%, white 0% 50%) 50% / .5em .5em`;
}

export function makeFullTransparencyDemo (color: HexRgba | Vec4): string {
    if (typeof color === "string") color = hexToRgba(color);
    const rgba = `rgba(${color.join(", ")})`;
    return `linear-gradient(${rgba}, ${rgba}), repeating-conic-gradient(#808080 0% 25%, white 0% 50%) 50% / .5em .5em`;
}

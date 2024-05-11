import styled from "styled-components";

import { Color } from "Document/theme";
import { HTMLAttributes } from "react";


export type ColorProps
    = { display: Color, }
    & HTMLAttributes<HTMLDivElement>
    ;


const Styled = styled.div`
    display: inline-block;
    min-width: 1em;
    min-height: 1em;
    user-select: none;
`;

export default function ColorDisplay ({display, style, ...props}: ColorProps) {
    return <Styled style={{...style, backgroundColor: `rgb(${display.join(", ")})`}} {...props} />;
}

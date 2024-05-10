import styled from "styled-components";

import { Color } from "Document/theme";
import { HTMLAttributes } from "react";


export type ColorProps
    = { displayColor: Color, }
    & HTMLAttributes<HTMLDivElement>
    ;


export default styled.div<ColorProps>`
    display: inline-block;
    width: 1em;
    height: 1em;
    background-color: rgb(${p => p.displayColor.join(", ")});
    user-select: none;
`;

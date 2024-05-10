import styled from "styled-components";

import { Color } from "Document/theme";
import { HTMLAttributes } from "react";


export type ColorProps
    = { display: Color, }
    & HTMLAttributes<HTMLDivElement>
    ;


const Styled = styled.div<ColorProps>`
    display: inline-block;
    width: 1em;
    height: 1em;
    background-color: rgb(${p => p.display.join(", ")});
    user-select: none;
`;

export default function ColorDisplay (props: ColorProps) {
    return <Styled {...props} />;
}

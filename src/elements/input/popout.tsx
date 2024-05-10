import { RefObject, forwardRef } from "react";
import styled, { css } from "styled-components";

import BaseStyles from "../base-styles";


const PopOutStyles = styled.nav<{$position: {left: number, top: number}}>`
    ${BaseStyles.primary}
    ${BaseStyles.onActivate.shadow}
    ${BaseStyles.onActivate.border}

    display: flex;
    flex-direction: column;
    align-items: stretch;
    list-style: none;
    position: fixed;
    z-index: 1000;
    padding: 0;


    ${({$position: {left, top}}) =>
        css`
            left: ${left}px;
            top: ${top}px;
        `
    }
`;

const PopOut = forwardRef((props: any, ref: RefObject<HTMLElement>) => {
    return <PopOutStyles ref={ref} {...props} />;
});

PopOut.displayName = "PopOut";

export default PopOut;

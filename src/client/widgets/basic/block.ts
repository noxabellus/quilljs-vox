import styled, { css } from "styled-components";

import BaseStyles from "../basic/base-styles";


export default styled.div<{$minWidth?: string}>`
    ${BaseStyles.block}
    border-radius: 5px;
    padding: 5px;
    color: rgb(var(--primary-color));
    font-family: var(--sans-family);
    text-align: center;

    & h1 {
        font-size: 1.5em;
        text-decoration-line: underline;
        margin: 5px;
    }

    ${({$minWidth}) => css`
        width: ${$minWidth || "640px"};
        min-height: ${$minWidth || "640px"};
        @media (max-width: ${$minWidth || "640px"}) {
            & {
                width: 100vw;
            }
        }
    `}
`;
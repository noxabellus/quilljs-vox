import styled, { css } from "styled-components";

import Block from "./block";
import ToolSet from "./tool-set";


export default styled.div`
    display: flex;
    max-height: 100vh;
    max-width: 100vw;
    flex-grow: 1;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: rgb(var(--background-color));
    overflow: scroll;
    scrollbar-width: none;
    border: 1px solid rgba(var(--accent-color), 0.5);
    ${p => p.theme.splashMode
        ? css`
            -webkit-app-region: drag;
            & ${Block},
            & ${ToolSet}
            { -webkit-app-region: no-drag; }
            & ~ * { -webkit-app-region: no-drag; }
        `
        : null
    }
    ${p => p.theme.isFullscreen
        ? css`
            border: none;
            border-radius: 0;
        `
        : p.theme.splashMode
            ? css`
                border-radius: 20px;
            `
            : css`
                border-radius: 5px;
            `
    }
    ${p => p.theme.useToolbar
        ? css`
            border-top-left-radius: 0px;
            border-top-right-radius: 0px;
        `
        : null
    }
`;

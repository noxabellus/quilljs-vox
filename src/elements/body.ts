import styled, { css } from "styled-components";


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
    ${p => p.theme.isFullscreen
        ? css`
            border: none;
            border-radius: 0;
        `
        : css`
            border: 1px solid rgba(var(--accent-color), 0.5);
            border-bottom-left-radius: 5px;
            border-bottom-right-radius: 5px;
        `
    }
`;

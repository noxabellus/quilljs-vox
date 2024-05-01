import { css } from "styled-components";

export default css`
    user-select: none;
    font-family: var(--sans-family);
    background: rgb(var(--element-color));
    border: 1px solid rgb(var(--primary-text-color));
    border-radius: 3px;
    min-width: 1.75em;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    &:hover {
        border-color: rgb(var(--accent-color));
    }
    &.selected {
        border-color: rgb(var(--accent-color));
    }
`;

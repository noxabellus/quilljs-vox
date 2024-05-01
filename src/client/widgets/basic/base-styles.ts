import { css } from "styled-components";

export default css`
    user-select: none;
    background: rgb(var(--element-color));
    border: 1px solid rgb(var(--primary-text-color));
    border-radius: 3px;
    &:hover {
        border-color: rgb(var(--accent-color));
    }
    &.selected {
        border-color: rgb(var(--accent-color));
    }
`;

import { css } from "styled-components";

const block = css`
    margin-bottom: 10px;
    background-color: rgb(var(--element-color));
    border: 2px solid rgb(var(--accent-color));
    box-shadow: 0 0 8px 4px rgba(var(--shadow-color), var(--shadow-opacity)),
                0 0 8px 4px rgba(var(--shadow-color), var(--shadow-opacity)) inset;
`;

const primary = css`
    user-select: none;
    font-family: var(--sans-family);
    background: rgb(var(--element-color));
    border: 1px solid rgb(var(--primary-color));
    border-radius: 3px;
    min-width: 1.75em;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 5px;
    color: rgb(var(--primary-color));
    stroke: rgb(var(--primary-color));
    box-shadow: 0 0 8px 4px rgba(var(--shadow-color), var(--shadow-opacity)),
                0 0 8px 4px rgba(var(--shadow-color), var(--shadow-opacity)) inset;

    &:disabled {
        cursor: not-allowed;
        opacity: 0.5;
    }
`;

const strokeActivationFx = css`
    color: rgb(var(--accent-color));
    stroke: rgb(var(--accent-color));
`;

const borderActivationFx = css`
    border-color: rgb(var(--accent-color));
`;

const shadowActivationFx = css`
    box-shadow: 0 -5px 8px 4px rgba(var(--shadow-color), var(--shadow-opacity)),
                0 10px 8px 4px rgba(var(--shadow-color), var(--shadow-opacity)) inset,
                0  0   8px 4px rgba(var(--light-color ), var(--light-opacity )) inset;
`;

const fullActivationFx = css`
    ${strokeActivationFx}
    ${borderActivationFx}
    ${shadowActivationFx}
`;

const activation = (x:any) => css`
    &:not(:disabled):hover,
    &:not(:disabled).selected {
        ${x}
    }
`;

const strokeOnActivate = activation(strokeActivationFx);
const borderOnActivate = activation(borderActivationFx);
const shadowOnActivate = activation(shadowActivationFx);
const fullFxOnActivate = activation(fullActivationFx);

export default {
    block,

    primary,

    activationFx: {
        full: fullActivationFx,
        stroke: strokeActivationFx,
        border: borderActivationFx,
        shadow: shadowActivationFx,
    },

    onActivate: {
        full: fullFxOnActivate,
        stroke: strokeOnActivate,
        border: borderOnActivate,
        shadow: shadowOnActivate,
    },
};

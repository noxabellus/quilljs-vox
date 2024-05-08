import { DetailedHTMLProps, InputHTMLAttributes, useContext } from "react";
import styled from "styled-components";

import AppState from "../client/content/app/state";


export type InputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;


export const InputStyles = styled.input`
    border: 1px solid rgb(var(--primary-color));
    border-radius: 2px;

    &:hover,
    &:focus {
        border-color: rgb(var(--accent-color));
    }

    &:disabled,
    &[unselectable="on"] {
        cursor: not-allowed;
        opacity: 0.5;
        user-select: none;
    }

    &[type="number"] {
        width: 3em;
    }

    &[type="text"] {
        width: 6em;
    }
`;


export default function Input({disabled, unselectable, ...props}: InputProps) {
    const appContext = useContext(AppState.Context);
    return <InputStyles
        disabled={disabled || appContext.lockIO}
        unselectable={unselectable === "on" || appContext.lockIO? "on": "off"}
        {...props}
    />;
}

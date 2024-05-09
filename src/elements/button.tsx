import { ButtonHTMLAttributes, DetailedHTMLProps, forwardRef, useContext } from "react";
import styled from "styled-components";

import AppState from "../client/content/app/state";

import BaseStyles from "./base-styles";
import Svg from "./svg";


export type ButtonProps = DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;


export type Button = {
    Icon: typeof Icon;
    Serif: typeof Serif;
    InlineIcon: typeof InlineIcon;
} & typeof Plain;

export type IconProps
    = {svg: string}
    & ButtonProps
    ;


const ButtonBase = styled.button`
    ${BaseStyles.primary}
    ${BaseStyles.onActivate.full}

    background: rgb(var(--element-color));
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
`;

const InlineSvg = styled.button`
    ${BaseStyles.activationFx.stroke}

    cursor: pointer;

    &:disabled {
        cursor: not-allowed;
        opacity: 0.5;
    }
`;


export const Plain = forwardRef(({children, disabled, ...props}: ButtonProps, ref: any) => {
    const appContext = useContext(AppState.Context);
    return <ButtonBase ref={ref} disabled={disabled || appContext.lockIO} {...props}>{children}</ButtonBase>;
});

Plain.displayName = "Button";


export const Icon = ({svg, ...props}: IconProps) => {
    return <Plain {...props}><Svg src={svg}/></Plain>;
};

Icon.displayName = "Button.Icon";


export const InlineIcon = ({svg, disabled, ...props}: IconProps) => {
    const appContext = useContext(AppState.Context);
    return <InlineSvg  disabled={disabled || appContext.lockIO} {...props}><Svg src={svg}/></InlineSvg>;
};

InlineIcon.displayName = "Button.InlineIcon";


export const Serif = styled(Plain)`
    font-family: var(--serif-family);
`;

Serif.displayName = "Button.Serif";


const defs = Object.assign(Plain, {Icon, Serif, InlineIcon}) as Button;

export default defs;

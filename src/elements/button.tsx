import { ButtonHTMLAttributes, DetailedHTMLProps, forwardRef, useContext } from "react";
import styled from "styled-components";

import AppState from "../client/content/app/state";

import BaseStyles from "./base-styles";
import Svg from "./svg";


export type ButtonProps = DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;


export type Button = {
    Icon: typeof ButtonIcon;
    Serif: typeof ButtonSerif;
} & typeof ButtonPlain;

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
`;


const ButtonPlain = forwardRef(({children, disabled, ...props}: ButtonProps, ref: any) => {
    const appContext = useContext(AppState.Context);
    return <ButtonBase ref={ref} disabled={disabled || appContext.lockIO} {...props}>{children}</ButtonBase>;
});

ButtonPlain.displayName = "Button";


function ButtonIcon ({svg, ...props}: IconProps) {
    return <ButtonPlain {...props}><Svg src={svg}></Svg></ButtonPlain>;
}

ButtonIcon.displayName = "Button.Icon";


const ButtonSerif = styled(ButtonPlain)`
    font-family: var(--serif-family);
`;

ButtonSerif.displayName = "Button.Serif";


export default Object.assign(ButtonPlain, {Icon: ButtonIcon, Serif: ButtonSerif});

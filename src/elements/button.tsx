import { ButtonHTMLAttributes, DetailedHTMLProps } from "react";
import styled from "styled-components";

import BaseStyles from "./base-styles";
import Svg from "./svg";


export type Button = {
    Icon: typeof IconButton;
    Serif: typeof SerifButton;
} & typeof ButtonBase;

export type IconProps
    = {svg: string}
    & DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
    ;


const ButtonBase = styled.button`
    ${BaseStyles.primary}
    ${BaseStyles.onActivate.full}

    background: rgb(var(--element-color));
    cursor: pointer;
`;


function IconButton({svg, ...props}: IconProps) {
    return <ButtonBase {...props}><Svg src={svg}></Svg></ButtonBase>;
}


const SerifButton = styled(ButtonBase)`
    font-family: var(--serif-family);
`;


const Button: Button = ButtonBase as any;

Button.Serif = SerifButton;
Button.Icon = IconButton;

export default Button;

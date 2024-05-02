import styled from "styled-components";
import BaseStyles from "../basic/base-styles";

import Icon from "../basic/icon";


export type Button = {
    Icon: typeof IconButton;
    Serif: typeof SerifButton;
} & typeof ButtonBase;

const ButtonBase = styled.button`
    ${BaseStyles.primary}
    ${BaseStyles.onActivate.full}

    background: rgb(var(--element-color));
    cursor: pointer;
`;

function IconButton({svg, ...props}: {svg: string} & React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>) {
    return <ButtonBase {...props}><Icon svg={svg}></Icon></ButtonBase>;
}

const SerifButton = styled(ButtonBase)`
    font-family: var(--serif-family);
`;


const Button: Button = ButtonBase as any;

Button.Serif = SerifButton;
Button.Icon = IconButton;

export default Button;

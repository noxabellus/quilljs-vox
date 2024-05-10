import { ButtonHTMLAttributes, DetailedHTMLProps, useState } from "react";

import Button from "./button";

import uncheckedImg from "Assets/xmark.svg?raw";
import checkedImg   from "Assets/checkmark.svg?raw";


export type CheckboxProps
    = {
        checked: boolean,
        onChange: (checked: boolean) => void,
    }
    & Omit<DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, "onChange">
    ;


export default function Checkbox({checked, onChange, ...props}: CheckboxProps) {
    const [state, setState] = useState(checked);

    return <Button.Icon svg={checked? checkedImg : uncheckedImg} onClick={_ => {
        setState(!state);
        setTimeout(() => onChange(!state));
    }} {...props}/>;
}

import { DetailedHTMLProps, InputHTMLAttributes } from "react";
import styled from "styled-components";

import baseStyles from "Elements/base-styles";


const SliderStyles = styled.input`
    background: rgb(var(--element-color));
    border: 1px solid rgb(var(--primary-color));
    border-radius: 2px;
    height: 1.2em;
    width: 1.2em;
    appearance: none;
    flex-grow: 1;
    flex-shrink: 1;

    &::-webkit-slider-thumb {
        appearance: none;
        width: 1.2em;
        height: 1.2em;
        border: 1px solid rgb(var(--accent-color));
        border-radius: 5px;
        background: rgb(var(--element-color));

        cursor: pointer;
        ${baseStyles.activationFx.full}
    }

    // =[
    &:hover::webkit-slider-thumb,
    &::webkit-slider-thumb:hover {
        background: red;
    }

`;


export function VerticalSlider({ style, ...props }: DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>) {
    return <SliderStyles type="range" style={{ ...style, marginLeft: ".35em", width: ".5em", writingMode: "vertical-lr" }} {...props} />;
}

export function HorizontalSlider({ style, ...props }: DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>) {
    return <SliderStyles type="range" style={{ ...style, height: ".5em" }} {...props} />;
}

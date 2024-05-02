import styled from "styled-components";

import BaseStyles from "../basic/base-styles";
import Button from "../basic/button";
import ToolSet from "../basic/tool-set";

import backImg from "../../../../assets/checkmark.svg?raw";
import { useLayoutEffect, useRef } from "react";

const Block = styled.div`
    ${BaseStyles.block}
    border-radius: 5px;
    padding: 5px;
    color: rgb(var(--primary-color));
    font-family: var(--sans-family);
    width: 640px;
    min-height: 640px;
    text-align: center;

    & h1 {
        font-size: 1.5em;
        text-decoration-line: underline;
        margin: 5px;
    }

    @media (max-width: 640px) {
        & {
            width: 100vw;
        }
    }
`;

export default function AppSettings({onClose}: {onClose: () => void}) {
    const onCloseRef = useRef(onClose);

    useLayoutEffect(() => {
        onCloseRef.current = onClose;
    });

    return <>
        <Block>
            <h1>Settings</h1>
            <div>
                todo
                <ul id="settings-labels">

                </ul>
                <ul id="settings-values">

                </ul>
            </div>
        </Block>
        <ToolSet>
            <Button.Icon svg={backImg} onClick={_ => onCloseRef.current?.()}/>
        </ToolSet>
    </>;
}

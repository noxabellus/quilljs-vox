import { useContext } from "react";
import styled from "styled-components";

import Block from "Elements/block";
import Button from "Elements/button";

import AppState from "../../app/state";

import LocalSettingsEditor from "./local-settings-editor";
import ThemeEditor from "./theme-editor";
import EditorState from "./state";

import backImg from "Assets/checkmark.svg?raw";


const Settings = styled(Block)<{["$ed-width"]: number}>`
    position: absolute;
    top: 50px;
    right: 5px;
    max-height: calc(100vh - 55px);
    overflow-y: scroll;
    scrollbar-width: none;

    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;

    & li {
        margin-top: 5px;
    }

    & > button {
        margin-top: 10px;
    }

    @media (max-width: ${p => p["$ed-width"] + (5 * 2) - 1}px) {
        top: 45px;
        max-height: calc(100vh - 50px);
    }
`;


export default function DocumentSettings () {
    const editorState = useContext(EditorState.Context);
    const appDispatch = useContext(AppState.Dispatch);

    return <Settings $ed-width={editorState.width}>
        <LocalSettingsEditor />
        <ThemeEditor />
        <Button.Icon
            title="Close Document Settings"
            svg={backImg}
            onClick={_ => appDispatch({ type: "set-mode", value: "editor" })}
        />
    </Settings>;
}

import { useContext } from "react";
import styled from "styled-components";

import Button from "../../basic/button";

import AppState from "../../app/state";

import LocalSettingsEditor from "./local-settings-editor";
import ThemeEditor from "./theme-editor";

import backImg from "../../../../../assets/checkmark.svg?raw";
import Center from "../../basic/center";
import EditorState from "./state";


const Settings = styled(Center)<{["$ed-width"]: number}>`
    position: absolute;
    top: 50px;
    right: 0px;

    margin-right: 10px;

    @media (min-width: ${p => p["$ed-width"] + (5 * 2)}px) {
        margin-right: 5px;
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

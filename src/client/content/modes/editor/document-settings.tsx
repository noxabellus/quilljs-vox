import styled from "styled-components";

import Block from "Elements/block";
import Button from "Elements/button";

import { useAppState } from "../../app/state";

import LocalSettingsEditor from "./local-settings-editor";
import ThemeEditor from "./theme-editor";
import { useEditorState } from "./state";

import backImg from "Assets/checkmark.svg?raw";
import FontEditor from "./font-editor";
import SettingsSection from "Elements/settings-section";


const SettingsContainer = styled(Block)<{["$ed-width"]: number}>`
    position: absolute;
    top: 50px;
    right: 5px;
    max-height: calc(100vh - 55px);
    overflow-y: scroll;
    scrollbar-width: none;
    padding: 0;

    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    max-width: 20em;

    @media (max-width: ${p => p["$ed-width"] + (5 * 2) - 1}px) {
        top: 45px;
        max-height: calc(100vh - 50px);
    }
`;


export default function DocumentSettings () {
    const [appState, appDispatch] = useAppState();
    const [editorState, _editorDispatch] = useEditorState(appState);

    return <SettingsContainer $ed-width={editorState.details.nodeData.width}>
        <LocalSettingsEditor />
        <FontEditor />
        <ThemeEditor />
        <SettingsSection>
            <Button.Icon
                title="Close Document Settings"
                svg={backImg}
                onClick={_ => appDispatch({ type: "set-mode", value: "editor" })}
            />
        </SettingsSection>
    </SettingsContainer>;
}

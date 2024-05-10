import styled, { css } from "styled-components";

import Button from "Elements/input/button";
import Block from "Elements/block";

import { useAppState } from "../../app/state";

import LocalSettingsEditor from "./local-settings-editor";
import ThemeEditor from "./theme-editor";
import { useEditorState } from "./state";

import backImg from "Assets/checkmark.svg?raw";
import FontEditor from "./font-editor";
import SettingsSection from "Elements/settings-section";


const SettingsContainer = styled(Block)<{["$ed-width"]: number}>`
    position: absolute;
    ${ p => p.theme.isFullscreen
        ? css`
            top: 5px;
            max-height: calc(100vh - 10px);
        `
        : css`
            top: calc(2em + 5px);
            max-height: calc(100vh - (2em + 10px));
        `
    }

    right: 5px;
    overflow-y: scroll;
    scrollbar-width: none;
    padding: 0;

    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    max-width: 20em;
`;


export default function DocumentSettings () {
    const [appState, _appDispatch] = useAppState();
    const [editorState, editorDispatch] = useEditorState(appState);

    return <SettingsContainer $ed-width={editorState.details.nodeData.width}>
        <LocalSettingsEditor />
        <FontEditor />
        <ThemeEditor />
        <SettingsSection>
            <Button.Icon
                title="Close Document Settings"
                svg={backImg}
                onClick={_ => editorDispatch({ type: "set-overlay", value: { key: "settings", enabled: false } })}
            />
        </SettingsSection>
    </SettingsContainer>;
}

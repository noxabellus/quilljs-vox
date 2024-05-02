import {MouseEvent, useContext} from "react";
import styled from "styled-components";

import Dropdown from "../../basic/dropdown";
import Svg from "../../basic/svg";
import Button from "../../basic/button";
import ToolSet from "../../basic/tool-set";

import EditorState from "./state";
import { EDITOR_ALIGNMENT_NAMES, EDITOR_TEXT_DETAILS_PROPERTIES, EditorAlignmentIndex, EditorContext, EditorTextDetails } from "./types";

import savedImg from "../../../../../assets/file-checkmark.svg?raw";
import unsavedImg from "../../../../../assets/file-circle-cross.svg?raw";
// import alignColumnsImg from "../../assets/align-columns.svg";
import alignLeftImg from "../../../../../assets/align-left.svg?raw";
import alignCenterImg from "../../../../../assets/align-center.svg?raw";
import alignRightImg from "../../../../../assets/align-right.svg?raw";
import alignJustifyImg from "../../../../../assets/align-justify.svg?raw";
import unstyleImg from "../../../../../assets/circle-cross.svg?raw";
import gearImg from "../../../../../assets/gear.svg?raw";
import exportImg from "../../../../../assets/file-arrow-down.svg?raw";
import Spacer from "../../basic/spacer";
import AppState from "../../app/state";
import { saveVox, writeVox } from "../../../support/file";
import { forceRef } from "../../../support/nullable";
import Result from "../../../support/result";
import remote from "../../../support/remote";


const EditorToolSet = styled(ToolSet)<{["$ed-width"]: number}>`
    width: 100vw;
    border-left: none;
    border-top: none;
    border-right: none;
    border-radius: 0px;
    justify-content: flex-start;

    @media (min-width: ${p => p["$ed-width"] + (5 * 2)}px) {
        & {
            width: calc(var(--document-width) + (var(--frame-padding) * 2) + (5px * 2));
            justify-content: center;
            border: 1px solid rgb(var(--accent-color));
            border-radius: 5px;
            margin: 5px auto 0px;
        }
    }
`;

export default function Toolbar() {
    const appContext = useContext(AppState.Context);
    const appDispatch = useContext(AppState.Dispatch);
    const editorContext = useContext(EditorState.Context);
    const editorDispatch = useContext(EditorState.Dispatch);
    const disabled = !editorContext.focused || editorContext.lockIO;

    const formatter = (prop: keyof EditorTextDetails) => (e: MouseEvent) => {
        editorDispatch({ type: `set-${prop}`, value: !editorContext[prop] });
        e.preventDefault();
    };

    const className = (prop: keyof EditorContext): "selected" | "" =>
        editorContext[prop] && editorContext.focused ? "selected" : "";

    const getAlignmentIndex = () => {
        switch (editorContext.align) {
            case "center": return 1;
            case "right": return 2;
            case "justify": return 3;
            default: return 0;
        }
    };

    const changeAlignment = (newIndex: EditorAlignmentIndex) => {
        const align = EDITOR_ALIGNMENT_NAMES[newIndex];

        editorDispatch({ type: "set-align", value: align });
    };

    const unstyle = () => {
        editorDispatch({ type: "clear-format" });
    };

    const TextDetailsButton = ({kind}: {kind: keyof EditorTextDetails}) => {
        const [propName, propValue, propText, propTitle] = EDITOR_TEXT_DETAILS_PROPERTIES[kind];

        return (<Button.Serif
            disabled={disabled}
            style={{[propName]: propValue}}
            onClick={formatter(kind)}
            className={className(kind)}
            title={propTitle}
        >
            {propText}
        </Button.Serif>);
    };

    const saveFile = async () => {
        editorDispatch({
            type: "set-lock-io",
            value: true,
        });

        if (appContext.data.filePath) {
            const result = await writeVox(appContext.data.filePath, forceRef(appContext.data.document));

            editorDispatch({
                type: "set-lock-io",
                value: false,
            });

            if (Result.isSuccess(result)) {
                appDispatch({
                    type: "set-data-x",
                    value: {
                        type: "set-dirty",
                        value: false,
                    },
                });
            } else if (Result.isError(result)) {
                alert(`Failed to save file:\n\t${result.body}`);
            }
        } else {
            const result = await saveVox(forceRef(appContext.data.document));

            editorDispatch({
                type: "set-lock-io",
                value: false,
            });

            if (Result.isSuccess(result)) {
                appDispatch({
                    type: "set-data-x",
                    value: {
                        type: "set-file-path",
                        value: result.body,
                    },
                });

                appDispatch({
                    type: "set-data-x",
                    value: {
                        type: "set-dirty",
                        value: false,
                    },
                });

                const question = await remote.dialog.showMessageBox({
                    title: "Auto-save",
                    message: "Would you like to enable auto-save?",
                    detail: "This can be changed at any time in the document settings.",
                    type: "question",
                    buttons: ["No", "Yes"],
                    defaultId: 1,
                    cancelId: 0,
                });

                if (question.response === 1) {
                    appDispatch({
                        type: "set-data-x",
                        value: {
                            type: "set-auto-save",
                            value: true,
                        },
                    });
                }
            } else if (Result.isError(result)) {
                alert(`Failed to save file:\n\t${result.body}`);
            }

            editorDispatch({
                type: "set-focused",
                value: true,
            });
        }
    };

    const SaveButton = () => {
        const cantSave = editorContext.lockIO || !appContext.data.dirty;
        const status = appContext.data.dirty ? "Unsaved changes present" : "No changes to save";
        const saveImg = appContext.data.dirty ? unsavedImg : savedImg;
        return <Button.Icon disabled={cantSave} title={`Save .vox (${status})`} svg={saveImg} onClick={saveFile}/>;
    };


    return <EditorToolSet $ed-width={editorContext.width}>
        <SaveButton/>
        <Button.Icon disabled={editorContext.lockIO} title="Document Settings" svg={gearImg}/>
        <Button.Icon disabled={editorContext.lockIO} title="Export Document" svg={exportImg}/>
        <Spacer/>
        <TextDetailsButton kind="bold"/>
        <TextDetailsButton kind="italic"/>
        <TextDetailsButton kind="underline"/>
        <TextDetailsButton kind="strike"/>
        <Dropdown
            disabled={disabled}
            selected={getAlignmentIndex()}
            onChanged={changeAlignment}
        >
            <Svg title="Align Left" src={alignLeftImg}/>
            <Svg title="Align Center" src={alignCenterImg}/>
            <Svg title="Align Right" src={alignRightImg}/>
            <Svg title="Align Left-Justify" src={alignJustifyImg}/>
        </Dropdown>
        <Button.Icon disabled={disabled} onClick={unstyle} svg={unstyleImg}/>
        <Spacer/>
    </EditorToolSet>;
}

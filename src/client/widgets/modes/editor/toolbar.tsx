import { MouseEvent } from "react";
import styled from "styled-components";

import Dropdown from "../../basic/dropdown";
import Svg from "../../basic/svg";
import Button from "../../basic/button";
import ToolSet from "../../basic/tool-set";

import { useEditorState } from "./state";
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
import closeImg from "../../../../../assets/xmark.svg?raw";

import Spacer from "../../basic/spacer";
import { dataIsDirty, useAppState } from "../../app/state";
import { saveHtml, saveVox, writeVox } from "../../../support/file";
import { forceRef } from "../../../support/nullable";
import Result from "../../../support/result";
import remote from "../../../support/remote";
import saveInterrupt from "../../app/save-interrupt";


const EditorToolSet = styled(ToolSet)<{["$ed-width"]: number}>`
    width: 100vw;
    border-left: none;
    border-top: none;
    border-right: none;
    border-radius: 0px;
    justify-content: flex-start;

    @media (min-width: ${p => p["$ed-width"] + (5 * 2)}px) {
        & {
            width: calc(${p => p["$ed-width"]}px + (5px * 2));
            justify-content: center;
            border: 1px solid rgb(var(--accent-color));
            border-radius: 5px;
            margin: 5px auto 0px;
        }
    }
`;

export default function Toolbar () {
    const [appContext, appDispatch] = useAppState();
    const [editorContext, editorDispatch] = useEditorState();
    const disabled = !editorContext.focused || appContext.lockIO;

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
        const time = appContext.data.lastUpdated;

        appDispatch({
            type: "set-lock-io",
            value: true,
        });

        if (appContext.data.filePath) {
            const result = await writeVox(appContext.data.filePath, forceRef(appContext.data.document));

            appDispatch({
                type: "set-lock-io",
                value: false,
            });

            if (Result.isSuccess(result)) {
                appDispatch({
                    type: "set-data-x",
                    value: {
                        type: "set-last-saved",
                        value: time,
                    },
                });
            } else if (Result.isError(result)) {
                alert(`Failed to save file:\n\t${result.body}`);
            }
        } else {
            const result = await saveVox(forceRef(appContext.data.document));
            const time = appContext.data.lastUpdated;

            appDispatch({
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
                        type: "set-last-saved",
                        value: time,
                    },
                });

                if (!appContext.data.localSettings["Auto Save"]) {
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
                            type: "set-local-settings-x",
                            value: {
                                type: "set-auto-save",
                                value: true,
                            },
                        });
                    }
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
        const dirty = dataIsDirty(appContext);
        const cantSave = appContext.lockIO || !dirty;
        const status = dirty? "Unsaved changes present" : "No changes to save";
        const saveImg = dirty? unsavedImg : savedImg;
        return <Button.Icon disabled={cantSave} title={`Save .vox (${status})`} svg={saveImg} onClick={saveFile}/>;
    };

    const openSettings = () => {
        appDispatch({
            type: "set-mode",
            value: appContext.mode == "doc-settings"? "editor" : "doc-settings",
        });
    };

    const exportHtml = async () => {
        const doc = forceRef(appContext.data.document);
        const html = doc.render();

        appDispatch({ type: "set-lock-io", value: true });

        const result = await saveHtml(html);

        appDispatch({ type: "set-lock-io", value: false });

        if (Result.isError(result)) {
            alert(`Failed to save HTML file:\n\t${result.body}`);
        }
    };


    const closeDocument = async () => {
        function exit () {
            appDispatch({
                type: "post-doc",
                value: null,
            });
        }

        if (dataIsDirty(appContext)) {
            saveInterrupt(appContext, appDispatch, exit);
        } else {
            exit();
        }
    };

    return <EditorToolSet $ed-width={editorContext.width}>
        <SaveButton/>
        <Button.Icon disabled={appContext.lockIO} onClick={openSettings} title="Document Settings" svg={gearImg}/>
        <Button.Icon disabled={appContext.lockIO} onClick={exportHtml} title="Export Document" svg={exportImg}/>
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
        <Button.Icon disabled={appContext.lockIO} onClick={closeDocument} title="Close Document (return to splash screen)" svg={closeImg}/>
    </EditorToolSet>;
}

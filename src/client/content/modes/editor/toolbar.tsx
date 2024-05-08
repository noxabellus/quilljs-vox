import { MouseEvent } from "react";
import styled from "styled-components";

import { saveHtml, saveVox, writeVox } from "Support/file";
import Result from "Support/result";
import remote from "Support/remote";

import Dropdown from "Elements/dropdown";
import Svg from "Elements/svg";
import Button from "Elements/button";
import ToolSet from "Elements/tool-set";
import Spacer from "Elements/spacer";

import Document from "Document";

import { useAppState } from "../../app/state";
import saveInterrupt from "./save-interrupt";

import { useEditorState, dataIsDirty, dataNeedsSave } from "./state";
import { EDITOR_ALIGNMENT_NAMES, EDITOR_HEADER_LEVELS, EDITOR_TEXT_DECORATION_PROPERTIES, TextDecoration } from "./types";

import savedImg from "Assets/file-checkmark.svg?raw";
import unsavedImg from "Assets/file-circle-cross.svg?raw";
import saveAsImg from "Assets/file-arrow-up.svg?raw";
// import alignColumnsImg from "Assets/align-columns.svg";
import alignLeftImg from "Assets/align-left.svg?raw";
import alignCenterImg from "Assets/align-center.svg?raw";
import alignRightImg from "Assets/align-right.svg?raw";
import alignJustifyImg from "Assets/align-justify.svg?raw";
import unstyleImg from "Assets/circle-cross.svg?raw";
import sliderImg from "Assets/horizontal-sliders.svg?raw";
import exportImg from "Assets/file-arrow-down.svg?raw";
import gearImg from "Assets/gear.svg?raw";
import closeImg from "Assets/xmark.svg?raw";


const EditorToolSet = styled(ToolSet)<{["$ed-width"]: number}>`
    width: 100vw;
    border-left: none;
    border-top: none;
    border-right: none;
    border-radius: 0px;
    justify-content: flex-start;

    @media (min-width: ${p => p["$ed-width"] + (5 * 2) + 1}px) {
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
    const [editorContext, editorDispatch] = useEditorState(appContext);
    const disabled = !editorContext.details.nodeData.focused || appContext.lockIO;

    const formatter = (prop: keyof TextDecoration) => (e: MouseEvent) => {
        e.preventDefault();
        editorDispatch({ type: `set-${prop}`, value: !editorContext.details.textDecoration[prop] });
    };

    const className = (prop: keyof TextDecoration): "selected" | "" =>
        editorContext.details.textDecoration[prop] && editorContext.details.nodeData.focused ? "selected" : "";

    const getBlockIndex = () =>
        EDITOR_HEADER_LEVELS.findIndex(k => k === editorContext.details.blockFormat.header);

    const getAlignmentIndex = () =>
        EDITOR_ALIGNMENT_NAMES.findIndex(k => k === editorContext.details.blockFormat.align);

    const changeBlock = (newIndex: number) =>
        editorDispatch({ type: "set-header", value: EDITOR_HEADER_LEVELS[newIndex] });

    const changeAlignment = (newIndex: number) =>
        editorDispatch({ type: "set-align", value: EDITOR_ALIGNMENT_NAMES[newIndex] });

    const unstyle = () =>
        editorDispatch({ type: "clear-format" });

    const TextDetailsButton = ({kind}: {kind: keyof TextDecoration}) => {
        const [propName, propValue, propText, propTitle] = EDITOR_TEXT_DECORATION_PROPERTIES[kind];

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
        const time = editorContext.lastUpdated;

        appDispatch({
            type: "set-lock-io",
            value: true,
        });

        if (editorContext.filePath) {
            const result = await writeVox(editorContext.filePath, editorContext.document);

            appDispatch({
                type: "set-lock-io",
                value: false,
            });

            if (Result.isSuccess(result)) {
                editorDispatch({
                    type: "set-last-saved",
                    value: time,
                });
            } else if (Result.isError(result)) {
                alert(`Failed to save file:\n\t${result.body}`);
            }
        } else {
            const result = await saveVox(editorContext.document);

            appDispatch({
                type: "set-lock-io",
                value: false,
            });

            if (Result.isSuccess(result)) {
                editorDispatch({
                    type: "set-file-path",
                    value: result.body,
                });

                editorDispatch({
                    type: "set-last-saved",
                    value: time,
                });

                if (!editorContext.settings["Auto Save"]) {
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
                        editorDispatch({
                            type: "set-auto-save",
                            value: true,
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


    const saveFileAs = async () => {
        const time = editorContext.lastUpdated;

        appDispatch({
            type: "set-lock-io",
            value: true,
        });

        const result = await saveVox(editorContext.document);

        appDispatch({
            type: "set-lock-io",
            value: false,
        });

        if (Result.isSuccess(result)) {
            editorDispatch({
                type: "set-file-path",
                value: result.body,
            });

            editorDispatch({
                type: "set-last-saved",
                value: time,
            });

            if (!editorContext.settings["Auto Save"]) {
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
                    editorDispatch({
                        type: "set-auto-save",
                        value: true,
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
    };

    const SaveButton = () => {
        const dirty = dataIsDirty(editorContext.documentId, appContext);
        const cantSave = appContext.lockIO || !dirty;
        const status = dirty? "Unsaved changes present" : "No changes to save";
        const saveImg = dirty? unsavedImg : savedImg;
        return <Button.Icon disabled={cantSave} title={`Save .vox (${status})`} svg={saveImg} onClick={saveFile}/>;
    };

    const SaveAsButton = () => {
        return <Button.Icon disabled={appContext.lockIO} title={`Save as new .vox (${status})`} svg={saveAsImg} onClick={saveFileAs}/>;
    };


    const docSettings = () => {
        editorDispatch({
            type: "set-overlay",
            value: {
                key: "settings",
                enabled: !editorContext.overlays.settings
            },
        });
    };

    const exportHtml = async () => {
        const html = Document.render(editorContext.document);

        appDispatch({ type: "set-lock-io", value: true });

        const result = await saveHtml(html);

        appDispatch({ type: "set-lock-io", value: false });

        if (Result.isError(result)) {
            alert(`Failed to save HTML file:\n\t${result.body}`);
        }
    };

    const appSettings = () => {
        appDispatch({
            type: "set-mode",
            value: "settings",
        });
    };

    const closeDocument = async () => {
        function exit () {
            appDispatch({
                type: "close-doc",
                value: editorContext.documentId,
            });
        }

        if (dataNeedsSave(editorContext.documentId, appContext)) {
            return saveInterrupt(editorContext, appDispatch, exit);
        } else {
            return exit();
        }
    };

    const settingsSelected = editorContext.overlays.settings ? "selected" : "";

    return <EditorToolSet $ed-width={editorContext.details.nodeData.width}>
        <SaveButton/>
        {editorContext.filePath && <SaveAsButton/>}
        <Button.Icon disabled={appContext.lockIO} onClick={docSettings} title="Document Settings" svg={sliderImg} className={settingsSelected}/>
        <Button.Icon disabled={appContext.lockIO} onClick={exportHtml} title="Export Document" svg={exportImg}/>
        <Spacer/>
        <Dropdown
            disabled={disabled}
            selected={getBlockIndex()}
            onChange={changeBlock}
        >
            <option>Paragraph</option>
            <option>Heading 1</option>
            <option>Heading 2</option>
            <option>Heading 3</option>
            <option>Heading 4</option>
            <option>Heading 5</option>
            <option>Heading 6</option>
        </Dropdown>
        <TextDetailsButton kind="bold"/>
        <TextDetailsButton kind="italic"/>
        <TextDetailsButton kind="underline"/>
        <TextDetailsButton kind="strike"/>
        <Dropdown
            disabled={disabled}
            selected={getAlignmentIndex()}
            onChange={changeAlignment}
        >
            <Svg title="Align Left" src={alignLeftImg}/>
            <Svg title="Align Center" src={alignCenterImg}/>
            <Svg title="Align Right" src={alignRightImg}/>
            <Svg title="Align Left-Justify" src={alignJustifyImg}/>
        </Dropdown>
        <Button.Icon disabled={disabled} onClick={unstyle} svg={unstyleImg}/>
        <Spacer/>
        <Button.Icon disabled={appContext.lockIO} onClick={appSettings} title="Application settings" svg={gearImg}/>
        <Button.Icon disabled={appContext.lockIO} onClick={closeDocument} title="Close Document (return to splash screen)" svg={closeImg}/>
    </EditorToolSet>;
}

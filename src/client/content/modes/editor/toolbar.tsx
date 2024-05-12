import { MouseEvent, useState } from "react";
import styled from "styled-components";

import { saveHtml, saveVox, writeVox } from "Support/file";
import Result from "Support/result";
import remote from "Support/remote";

import Dropdown from "Elements/input/dropdown";
import Button from "Elements/input/button";
import Dropout from "Elements/input/dropout";
import LengthInput from "Elements/input/length";
import ColorInput from "Elements/input/color";
import Svg from "Elements/svg";
import ToolSet from "Elements/tool-set";
import Spacer from "Elements/spacer";

import Document from "Document";
import { DEFAULT_DOCUMENT_THEME, DEFAULT_FONTS, lengthToPx, lookupPropertyString, simpleColorString, simpleLengthString } from "Document/theme";

import { useAppState } from "../../app/state";

import saveInterrupt from "./save-interrupt";
import { useEditorState, dataIsDirty, dataNeedsSave } from "./state";
import { EDITOR_ALIGNMENT_NAMES, EDITOR_HEADER_LEVELS, EDITOR_TEXT_DECORATION_PROPERTIES, TextDecoration } from "./types";


import savedImg from "Assets/file-checkmark.svg?raw";
import confirmImg from "Assets/checkmark.svg?raw";
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
import closeImg from "Assets/arrow-right-into-bracket.svg?raw";
import { HexRgba } from "Support/color";
import FontInput from "Elements/input/font";




const EditorToolSet = styled(ToolSet)<{["$ed-width"]: number}>`
    justify-content: flex-start;
    width: min(100vw - 10px, ${p => p["$ed-width"]}px + (5px * 2));
    border: 1px solid rgb(var(--accent-color));
    border-radius: 5px;
    margin: 5px auto 0px;
`;

export default function Toolbar () {
    const [appContext, appDispatch] = useAppState();
    const [editorContext, editorDispatch] = useEditorState(appContext);
    const disabled = !editorContext.details.nodeData.focused;

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
        return <Button.Icon title={`Save as new .vox (${status})`} svg={saveAsImg} onClick={saveFileAs}/>;
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
            return saveInterrupt(editorContext, appDispatch, exit, () => {});
        } else {
            return exit();
        }
    };


    const baseFont = lookupPropertyString(editorContext.document.theme, "base-font-family");
    const actualFontFamilies = Object.keys(editorContext.document.fonts);

    const fontFamilies = actualFontFamilies.slice();
    if (!fontFamilies.includes(baseFont) && !DEFAULT_FONTS.includes(baseFont)) {
        fontFamilies.push(baseFont);
    }

    const selectedFont = editorContext.details.fontAttributes.font || baseFont;

    const changeFontFamily = (fontFamily: string) => {
        if (fontFamily === baseFont) {
            editorDispatch({ type: "set-font-family", value: null });
        } else {
            editorDispatch({ type: "set-font-family", value: fontFamily });
        }
    };


    const getDocumentFontSize = () =>
        editorContext.document.theme["base-font-size"] || DEFAULT_DOCUMENT_THEME["base-font-size"];

    const [tempFontSize, setTempFontSize] = useState(editorContext.details.fontAttributes.size || getDocumentFontSize());

    const getFontSize = () => {
        return simpleLengthString(tempFontSize);
    };

    const resetFontSize = () => {
        setTempFontSize(editorContext.details.fontAttributes.size || getDocumentFontSize());
    };

    const confirmFontSize = (setOpen: React.Dispatch<React.SetStateAction<boolean>>) => () => {
        const a = lengthToPx(editorContext.document.theme, tempFontSize);
        const b = lengthToPx(editorContext.document.theme, getDocumentFontSize());

        if (a === b) {
            editorDispatch({ type: "set-font-size", value: null });
        } else {
            editorDispatch({ type: "set-font-size", value: tempFontSize });
        }

        setOpen(false);
    };


    const getDocumentFontColor = () =>
        editorContext.document.theme["base-font-color"] || DEFAULT_DOCUMENT_THEME["base-font-color"];

    const fontColor = editorContext.details.fontAttributes.color || getDocumentFontColor();

    const setFontColor = (newFontColor: HexRgba) => {
        const a = simpleColorString(newFontColor);
        const b = simpleColorString(getDocumentFontColor());

        if (a.toLowerCase() === b.toLowerCase()) {
            editorDispatch({ type: "set-font-color", value: null });
        } else {
            editorDispatch({ type: "set-font-color", value: newFontColor });
        }
    };


    const getDocumentFontBackground = () =>
        editorContext.document.theme["page-color"] || DEFAULT_DOCUMENT_THEME["page-color"];

    const fontBackground = editorContext.details.fontAttributes.background || getDocumentFontBackground();

    const setFontBackground = (newFontBackground: HexRgba) => {
        const a = simpleColorString(newFontBackground);
        const b = simpleColorString(getDocumentFontBackground());

        if (a.toLowerCase() === b.toLowerCase()) {
            editorDispatch({ type: "set-font-background", value: null });
        } else {
            editorDispatch({ type: "set-font-background", value: newFontBackground });
        }
    };


    const settingsSelected = editorContext.overlays.settings ? "selected" : "";

    return <EditorToolSet $ed-width={editorContext.details.nodeData.width}>
        <SaveButton/>
        {editorContext.filePath && <SaveAsButton/>}
        <Button.Icon onClick={docSettings} title="Document Settings" svg={sliderImg} className={settingsSelected}/>
        <Button.Icon onClick={exportHtml} title="Export Document" svg={exportImg}/>
        <Spacer/>
        <TextDetailsButton kind="bold"/>
        <TextDetailsButton kind="italic"/>
        <TextDetailsButton kind="underline"/>
        <TextDetailsButton kind="strike"/>
        <ColorInput
            title={`Text Foreground Color (${fontColor})`}
            disabled={disabled}
            value={fontColor}
            defaultValue={getDocumentFontColor()}
            onChange={setFontColor}
        />
        <ColorInput
            title={`Text Background Color (${fontBackground})`}
            disabled={disabled}
            value={fontBackground}
            defaultValue={getDocumentFontBackground()}
            onChange={setFontBackground}
        />
        <FontInput
            title={`Font Family (${selectedFont})`}
            disabled={disabled}
            value={selectedFont}
            allowedFonts={fontFamilies}
            onChange={changeFontFamily}
        />
        <Dropout
            title={`Font Size (${getFontSize()})`}
            disabled={disabled}
            folded={<p>{getFontSize()}</p>}
            style={{padding: "5px"}}
            onBlur={resetFontSize}
            unfolded={setOpen => <>
                    <LengthInput
                        theme={editorContext.document.theme}
                        property={tempFontSize}
                        onChange={setTempFontSize}
                    />
                    <Button.Icon
                        onClick={confirmFontSize(setOpen)}
                        style={{marginTop: "5px"}}
                        svg={confirmImg}
                    />
                </>
            }
        />
        <Dropdown
            title={`Block Mode (${getBlockIndex() == 0? "Paragraph" : `Header Level ${getBlockIndex()}`})`}
            disabled={disabled}
            selected={getBlockIndex()}
            onChange={changeBlock}
        >
            <option title="Standard Paragraph Block">P</option>
            <option title="Header Level 1 Block">H1</option>
            <option title="Header Level 2 Block">H2</option>
            <option title="Header Level 3 Block">H3</option>
            <option title="Header Level 4 Block">H4</option>
            <option title="Header Level 5 Block">H5</option>
            <option title="Header Level 6 Block">H6</option>
        </Dropdown>
        <Dropdown
            title={`Alignment (${EDITOR_ALIGNMENT_NAMES[getAlignmentIndex()] || "Left"})`}
            disabled={disabled}
            selected={getAlignmentIndex()}
            onChange={changeAlignment}
        >
            <Svg title="Align Left" src={alignLeftImg}/>
            <Svg title="Align Center" src={alignCenterImg}/>
            <Svg title="Align Right" src={alignRightImg}/>
            <Svg title="Align Left-Justify" src={alignJustifyImg}/>
        </Dropdown>
        <Button.Icon title="Remove all styles" disabled={disabled} onClick={unstyle} svg={unstyleImg}/>
        <Spacer/>
        <Button.Icon onClick={appSettings} title="Application settings" svg={gearImg}/>
        <Button.Icon onClick={closeDocument} title="Close Document (return to splash screen)" svg={closeImg}/>
    </EditorToolSet>;
}

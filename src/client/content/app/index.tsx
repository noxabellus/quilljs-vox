import { useLayoutEffect, useReducer } from "react";

import { PathLike } from "fs";

import remote from "Support/remote";
import Document from "Document";

import Splash from "../modes/splash";
import Editor from "../modes/editor";
import AppSettings from "../modes/app-settings";

import AppState, { dataIsDirty, dataNeedsSave } from "./state";
import * as AppTypes from "./types";
import * as EditorTypes from "../modes/editor/types";
import Result from "Support/result";
import saveInterrupt from "../modes/editor/save-interrupt";


function setWindowTitle (body: {dirty: boolean, title: string | null, filePath: PathLike | null} | string | null) {
    if (body) {
        let base;
        if (typeof body === "object") {
            const { dirty, title, filePath } = body;
            const displayTitle = title || "Untitled";

            if (filePath) {
                base = `${displayTitle} @[${filePath}]`;
            } else {
                base = `${displayTitle} @[unsaved]`;
            }

            if (dirty) {
                base = `*${base}`;
            }
        } else {
            base = body;
        }

        window.document.title = `Vox - ${base}`;
    } else {
        window.document.title = "Vox Editor";
    }
}


function editorDispatch (context: EditorTypes.Context, action: EditorTypes.Action): EditorTypes.Context {
    console.log("Editor reducer", action);

    const out: EditorTypes.Context = {...context};

    let q;
    if (action.type == "post-quill") {
        out.quill = action.value;
        if (out.quill) Document.linkEditor(out.document, out.quill);
        return out;
    } else {
        if (!out.quill) throw "Cannot dispatch actions other than `post-quill` without a quill instance";
        q = out.quill;
    }

    switch (action.type) {
        case "set-last-saved":
            out.lastSaved = action.value;
            out.startedFromBlankDocument = false;
            break;

        case "set-last-updated":
            out.lastUpdated = action.value;
            break;

        case "set-file-path":
            out.lastUpdated = Date.now();
            out.filePath = action.value;
            out.startedFromBlankDocument = false;
            break;

        case "set-auto-save":
            out.settings["Auto Save"] = action.value;
            break;

        case "set-overlay":
            out.overlays[action.value.key] = action.value.enabled;
            break;

        case "set-title":
            out.document.title = action.value;
            break;

        case "set-theme":
            out.document.theme = action.value;
            Document.applyTheme(out.document, q.container);
            break;

        case "set-theme-property":
            (out.document.theme as any)[action.value.key] = action.value.data;
            Document.applyTheme(out.document, q.container);
            break;

        case "set-quill-data":
            Document.copyEditorState(out.document, action.value);
            break;

        case "set-delta":
            Document.copyEditorDelta(out.document, action.value);
            break;

        case "set-history":
            Document.copyEditorHistory(out.document, action.value);
            break;

        case "set-font-data": {
            const result = Document.registerFontData(out.document, action.value.name, action.value.data);

            if (!Result.isSuccess(result)) {
                alert(`Failed to load font "${action.value.name}":\n\t${Result.problemMessage(result)}`);
            } else {
                Document.applyFonts(out.document, q.container);
            }
        } break;

        case "rename-font": {
            const result = Document.renameFont(out.document, action.value.oldName, action.value.newName);

            if (!Result.isSuccess(result)) {
                alert(`Failed to rename font "${action.value.oldName}" to "${action.value.newName}":\n\t${Result.problemMessage(result)}`);
            } else {
                Document.applyFonts(out.document, q.container);
            }
        } break;

        case "delete-font": {
            const result = Document.deleteFont(out.document, action.value);

            if (!Result.isSuccess(result)) {
                alert(`Failed to delete font "${action.value}":\n\t${Result.problemMessage(result)}`);
            } else {
                Document.applyFonts(out.document, q.container);
            }
        } break;

        case "set-bold":
            if (!out.details.nodeData.range)
                throw "Cannot set bold without a range";

            q.format("bold", action.value);

            out.details.textDecoration.bold = action.value;
            break;

        case "set-italic":
            if (!out.details.nodeData.range)
                throw "Cannot set italic without a range";

            q.format("italic", action.value);

            out.details.textDecoration.italic = action.value;
            break;

        case "set-underline":
            if (!out.details.nodeData.range)
                throw "Cannot set underline without a range";

            q.format("underline", action.value);

            out.details.textDecoration.underline = action.value;
            break;

        case "set-strike":
            if (!out.details.nodeData.range)
                throw "Cannot set strike without a range";

            q.format("strike", action.value);

            out.details.textDecoration.strike = action.value;
            break;

        case "set-align":
            if (!out.details.nodeData.range)
                throw "Cannot set align without a range";

            q.format("align", action.value);

            out.details.blockFormat.align = action.value;

            break;

        case "set-header":
            if (!out.details.nodeData.range)
                throw "Cannot set block format without a range";

            q.format("header", action.value);

            out.details.blockFormat.header = action.value;

            break;

        case "set-focused":
            if (action.value) q.focus();
            else q.blur();

            out.details.nodeData.focused = action.value;

            break;

        case "set-width":
            q.root.style.width = `${action.value}px`;
            out.details.nodeData.width = q.container.offsetWidth;

            break;

        case "refresh-images":
            Document.applyImages(out.document, q.container);
            break;

        case "clear-format": {
            if (!out.details.nodeData.range)
                throw "Cannot clear format without a range";

            if (out.details.nodeData.range.length == 0) {
                const [line, _] = q.getLine(out.details.nodeData.range.index);

                if (line === null) throw "No line found";

                q.formatText(line.offset(), line.length(), {
                    bold: false,
                    italic: false,
                    underline: false,
                    strike: false,
                    align: null,
                    header: null,
                });

                out.details.blockFormat = { align: null, header: null, };
                out.details.textDecoration = { bold: false, italic: false, underline: false, strike: false };
            } else {
                q.formatText(out.details.nodeData.range.index, out.details.nodeData.range.length, {
                    bold: false,
                    italic: false,
                    underline: false,
                    strike: false,
                });

                out.details.textDecoration = { bold: false, italic: false, underline: false, strike: false };
            }

        } break;

        case "post-range": {
            const blockFormats: string[] = [ "align", "header" ];
            const textDecorations = [ "bold", "italic", "underline", "strike" ];

            if (action.value) {
                out.details.nodeData.focused = true;

                const fmt = q.getFormat(action.value);

                for (const key of blockFormats) {
                    if (key in fmt) {
                        out.details.blockFormat[key as keyof EditorTypes.BlockFormat] = fmt[key] as any;
                    } else {
                        out.details.blockFormat[key as keyof EditorTypes.BlockFormat] = null;
                    }
                }

                for (const key of textDecorations) {
                    if (key in fmt) out.details.textDecoration[key as keyof EditorTypes.TextDecoration] = fmt[key] as any;
                    else out.details.textDecoration[key as keyof EditorTypes.TextDecoration] = false;
                }
            } else {
                out.details.nodeData.focused = false;
            }

            out.details.nodeData.range = action.value;
        } break;

        case "post-width":
            out.details.nodeData.width = action.value;
            break;

        default: throw "invalid editor action type";
    }

    return out;
}

export default function App () {
    const [context, dispatch] = useReducer(reducer, {
        lockIO: false,
        mode: "splash",
        editors: [],
        settings: null
    });


    function reducer (state: AppTypes.Context, action: AppTypes.Action): AppTypes.Context {
        let out: AppTypes.Context;

        console.log("app action", action);

        if (action.type === "set-lock-io") {
            out = { ...state, lockIO: action.value };
        } else if (state.lockIO) {
            throw "Cannot dispatch while IO locked";
        } else {
            switch (action.type) {
                case "set-mode": {
                    if (action.value === null) {
                        switch (state.editors.length > 0) {
                            case null:
                                out = { ...state, mode: "splash" };
                                break;
                            default:
                                out = { ...state, mode: "editor" };
                                break;
                        }
                    } else {
                        out = { ...state, mode: action.value };
                    }
                } break;

                case "open-doc": {
                    const filePath = action.value.filePath;
                    const document = action.value.document;

                    const settings: EditorTypes.Settings = { "Auto Save": false };

                    if (filePath) {
                        const json = JSON.parse(localStorage[`settings[${filePath}]`]);

                        let reset = false;
                        if (typeof json === "object") {
                            const keys = Object.keys(settings) as (keyof EditorTypes.Settings)[];

                            for (const key of keys) {
                                if (key in json) {
                                    if (typeof json[key] === typeof settings[key]) {
                                        settings[key] = json[key];
                                    } else {
                                        console.error(`local storage is corrupt at ${key}, resetting to default value`, json[key], settings[key]);
                                        reset = true;
                                        break;
                                    }
                                }
                            }
                        } else {
                            reset = true;
                        }

                        if (reset) {
                            localStorage[`settings[${filePath}]`] = JSON.stringify(settings);
                        }
                    }

                    const context: EditorTypes.Context = {
                        documentId: state.editors.length,
                        lastUpdated: Date.now(),
                        lastSaved: 0,
                        settings,
                        startedFromBlankDocument: Document.isBlank(document),
                        filePath,
                        document,
                        overlays: {
                            settings: false,
                        },
                        details: {
                            nodeData: {
                                focused: false,
                                range: null,
                                width: 0,
                            },
                            blockFormat: {
                                align: null,
                                header: null,
                            },
                            textDecoration: {
                                bold: false,
                                italic: false,
                                underline: false,
                                strike: false,
                            },
                        },
                        quill: null,
                    };

                    out = {
                        ...state,
                        mode: "editor",
                        editors: [
                            ...state.editors,
                            context,
                        ],
                    };
                } break;

                case "close-doc": {
                    const editors = state.editors.filter((_, index) => index !== action.value);
                    out = {
                        ...state,
                        mode: editors.length > 0 ? "editor" : "splash",
                        editors
                    };
                } break;

                case "editor-action": {
                    const editor = state.editors[action.value.documentId];
                    const newEditor = editorDispatch(editor, action.value.action);
                    out = {
                        ...state,
                        editors: state.editors.map((_, index) => index === action.value.documentId ? newEditor : _)
                    };
                } break;

                default:
                    console.error("unknown app action", action);
                    throw "Unknown app action";
            }
        }

        switch (out.mode) {
            case "editor": {
            // FIXME
            //     const dirty = dataIsDirty(out);

            //     if (!out.data) throw "Cannot set editor mode without data";
            //     setWindowTitle({ dirty, title: out.data.document.current?.title || null, filePath: out.data.filePath });

            //     if (out.data.filePath) {
            //         setTimeout(() => localStorage[`settings[${out.data.filePath}]`] = JSON.stringify(out.data.settings));
            //     }

            //     if (dirty && out.data.settings["Auto Save"] && out.data.filePath && out.data.document.current) {
            //         const path = out.data.filePath;
            //         const doc = out.data.document.current;
            //         const time = out.data.lastUpdated;

            //         setTimeout(async () => {
            //             const result = await writeVox(path, doc);

            //             if (Result.isSuccess(result)) {
            //                 dispatch({
            //                     type: "set-data-x",
            //                     value: {
            //                         type: "set-last-saved",
            //                         value: time,
            //                     },
            //                 });
            //             } else {
            //                 alert(`Failed to auto-save file:\n\t${Result.problemMessage(result)}\n(Disabling auto-save)`);
            //                 dispatch({
            //                     type: "set-local-settings-x",
            //                     value: {
            //                         type: "set-auto-save",
            //                         value: false,
            //                     },
            //                 });
            //             }
            //         });
            //     }
            } break;

            case "splash":
                setWindowTitle(AppTypes.MODE_TITLES[out.mode]);
                break;

            default: break;
        }

        return out;
    }

    let modal;
    switch (context.mode) {
        case "splash":
            modal = <Splash />;
            break;
        case "editor":
            modal = <>
                {context.editors.map((_editor, index) =>
                    <Editor key={index} documentId={index} />)}
            </>;
            break;
        case "settings":
            modal = <AppSettings />;
            break;
    }

    useLayoutEffect(() => {
        async function handler (exit: () => void) {
            if (dataNeedsSave(context)) {
                for (const editor of context.editors) {
                    saveInterrupt(editor, dispatch, exit);
                }
            } else {
                exit();
            }
        }

        remote.window.onClose = handler;

        return () => {
            remote.window.onClose = null;
        };
    }, [dataIsDirty(context)]);

    return <AppState context={context} dispatch={dispatch}>
        {modal}
    </AppState>;
}


// prevents a bug when the window is reloaded by electron
window.onbeforeunload = () => {
    remote.window.onClose = null;
};

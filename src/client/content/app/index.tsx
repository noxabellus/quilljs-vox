import { useLayoutEffect, useReducer } from "react";

import { PathLike } from "fs";

import remote from "Support/remote";
import Document from "Document";

import Splash from "../modes/splash";
import Editor from "../modes/editor";
import AppSettings from "../modes/app-settings";

import AppState from "./state";
import * as AppTypes from "./types";
import * as EditorTypes from "../modes/editor/types";
import Result from "Support/result";
import saveInterrupt from "../modes/editor/save-interrupt";
import EditorState from "../modes/editor/state";
import { writeVox } from "Support/file";
import TitleBar from "./titlebar";
import { ThemeProvider } from "styled-components";


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
                base = `${base}*`;
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
        if (out.quill) {
            console.log("linking document", out.document);
            Document.linkEditor(out.document, out.quill);

            const quillWidth = out.quill.container.offsetWidth;
            if (quillWidth > 100) { // hack to prevent a visual bug where the width is ~0
                out.details.nodeData.width = quillWidth;
            }
        }
        return out;
    } else {
        if (!out.quill) throw "Cannot dispatch actions other than `post-quill` without a quill instance";
        q = out.quill;
    }

    switch (action.type) {
        case "set-last-saved":
            out.lastSaved = action.value;
            out.startedFromBlankDocument = false;
            return out;

        case "set-file-path":
            out.lastUpdated = Date.now();
            out.filePath = action.value;
            out.startedFromBlankDocument = false;
            return out;

        case "set-auto-save":
            out.settings["Auto Save"] = action.value;
            return out;

        case "set-overlay":
            out.overlays[action.value.key] = action.value.enabled;
            return out;

        case "set-focused":
            if (action.value) q.focus();
            else q.blur();
            out.details.nodeData.focused = action.value;
            return out;

        case "refresh-images":
            Document.applyImages(out.document, q.container);
            return out;

        case "post-width":
            out.details.nodeData.width = action.value;
            return out;

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
            }
        } break;

        case "rename-font": {
            const result = Document.renameFont(out.document, action.value.oldName, action.value.newName);
            if (!Result.isSuccess(result)) {
                alert(`Failed to rename font "${action.value.oldName}" to "${action.value.newName}":\n\t${Result.problemMessage(result)}`);
            }
        } break;

        case "delete-font": {
            const result = Document.deleteFont(out.document, action.value);
            if (!Result.isSuccess(result)) {
                alert(`Failed to delete font "${action.value}":\n\t${Result.problemMessage(result)}`);
            }
        } break;

        case "set-bold":
            if (!out.details.nodeData.range) throw "Cannot set bold without a range";
            q.format("bold", action.value);
            out.details.textDecoration.bold = action.value;
            break;

        case "set-italic":
            if (!out.details.nodeData.range) throw "Cannot set italic without a range";
            q.format("italic", action.value);
            out.details.textDecoration.italic = action.value;
            break;

        case "set-underline":
            if (!out.details.nodeData.range) throw "Cannot set underline without a range";
            q.format("underline", action.value);
            out.details.textDecoration.underline = action.value;
            break;

        case "set-strike":
            if (!out.details.nodeData.range) throw "Cannot set strike without a range";
            q.format("strike", action.value);
            out.details.textDecoration.strike = action.value;
            break;

        case "set-align":
            if (!out.details.nodeData.range) throw "Cannot set align without a range";
            q.format("align", action.value);
            out.details.blockFormat.align = action.value;
            break;

        case "set-header":
            if (!out.details.nodeData.range) throw "Cannot set block format without a range";
            q.format("header", action.value);
            out.details.blockFormat.header = action.value;
            break;

        case "clear-format": {
            if (!out.details.nodeData.range) throw "Cannot clear format without a range";
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

        default: throw "invalid editor action type";
    }

    out.lastUpdated = Date.now();
    out.details.nodeData.width = q.container.offsetWidth;

    return out;
}

// hack to make electron event handlers work
let latestContext: AppTypes.Context = null as any;

export default function App () {
    const [context, dispatch] = useReducer(appReducer, {
        lockIO: false,
        fullscreen: remote.native.getCurrentWindow().isFullScreen(),
        mode: "splash",
        lastMode: "splash",
        editors: [],
        settings: null
    });

    latestContext = context;

    function appReducer (state: AppTypes.Context, action: AppTypes.Action): AppTypes.Context {
        let out: AppTypes.Context;

        console.log("app action", action);

        if (action.type === "set-lock-io") {
            out = { ...state, lockIO: action.value };
        } else if (state.lockIO) {
            throw "Cannot dispatch while IO locked";
        } else {
            switch (action.type) {
                case "set-fullscreen":
                    remote.native.getCurrentWindow().setFullScreen(action.value);
                // eslint-disable-next-line no-fallthrough
                case "post-fullscreen":
                    out = { ...state, fullscreen: action.value };
                    break;

                case "set-mode":
                    out = { ...state, mode: action.value === null? state.lastMode : action.value, lastMode: state.mode };
                    break;

                case "open-doc": {
                    const filePath = action.value.filePath;
                    const document = action.value.document;

                    const settings: EditorTypes.Settings = { "Auto Save": false };

                    if (filePath) {
                        let reset = false;
                        let json;

                        try {
                            json = JSON.parse(localStorage[`settings[${filePath}]`]);
                        } catch (error) {
                            console.error("local storage is unparsable, resetting to default value", error);
                            reset = true;
                        }

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

                    const time = Date.now();
                    const documentId = state.editors.length;

                    const editor: EditorTypes.Context = {
                        documentId,
                        lastUpdated: time,
                        lastSaved: filePath !== null? time : 0,
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
                                width: 640,
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
                        mode: {editor: documentId},
                        lastMode: state.mode,
                        editors: [
                            ...state.editors,
                            editor,
                        ],
                    };
                } break;

                case "close-doc": {
                    const editors = state.editors.filter((_, index) => index !== action.value);
                    out = {
                        ...state,
                        mode: state.lastMode,
                        lastMode: "splash",
                        editors
                    };
                } break;

                case "editor-action": {
                    const editor = state.editors[action.value.documentId];
                    const newEditor = editorDispatch(editor, action.value.action);
                    out = {
                        ...state,
                        editors: state.editors.map((editor, index) => index === action.value.documentId ? newEditor : editor)
                    };
                } break;

                default:
                    console.error("unknown app action", action);
                    throw "Unknown app action";
            }
        }

        if (typeof out.mode === "object" && Object.keys(out.mode)[0] == "editor") {
            const editor = out.editors[out.mode.editor];
            const dirty = EditorState.dataIsDirty(editor.documentId, out);

            if (editor.filePath) {
                setTimeout(async () => {
                    localStorage[`settings[${editor.filePath}]`] = JSON.stringify(editor.settings);
                });
            }

            if (dirty && editor.settings["Auto Save"] && editor.filePath) {
                const path = editor.filePath;
                const doc = editor.document;
                const time = editor.lastUpdated;

                setTimeout(async () => {
                    const result = await writeVox(path, doc);

                    if (Result.isSuccess(result)) {
                        dispatch({
                            type: "editor-action",
                            value: {
                                documentId: editor.documentId,
                                action: {
                                    type: "set-last-saved",
                                    value: time,
                                },
                            },
                        });
                    } else {
                        alert(`Failed to auto-save file:\n\t${Result.problemMessage(result)}\n(Disabling auto-save)`);
                        dispatch({
                            type: "editor-action",
                            value: {
                                documentId: editor.documentId,
                                action: {
                                    type: "set-auto-save",
                                    value: false,
                                },
                            },
                        });
                    }
                });
            }
        }

        latestContext = out;

        return out;
    }

    let modal;
    if (typeof context.mode === "string") {
        setWindowTitle(AppTypes.MODE_TITLES[context.mode]);

        switch (context.mode) {
            case "splash":
                modal = (<Splash />);
                break;

            case "settings":
                modal = (<AppSettings />);
                break;

            default:
                throw "unknown mode";
        }
    } else {
        const keys = Object.keys(context.mode);
        if (keys.length > 1) throw "unknown mode object";

        const mode = keys[0];

        switch (mode) {
            case "editor": {
                const editor = context.editors[context.mode.editor];
                const dirty = EditorState.dataIsDirty(editor.documentId, context);

                modal = <Editor key={editor.documentId} documentId={editor.documentId} />;

                setWindowTitle({ dirty, title: editor.document.title || null, filePath: editor.filePath });
            } break;

            default:
                throw "unknown mode";
        }
    }

    useLayoutEffect(() => {
        console.log("add close hook");
        remote.window.onClose = async (exit: () => void) => {
            let shouldExit = true;
            if (AppState.dataNeedsSave(latestContext)) {
                for (const editor of latestContext.editors) {
                    if (EditorState.dataNeedsSave(editor.documentId, latestContext)) {
                        await saveInterrupt(editor, dispatch, () => {}, () => { shouldExit = false; });
                    }

                    if (!shouldExit) break;
                }
            }

            if (shouldExit) exit();
        };

        console.log("add keybinds");
        remote.globalShortcut.register("F11", () =>
            dispatch({ type: "set-fullscreen", value: !latestContext.fullscreen }));

        return () => {
            console.log("remove close hook");
            remote.window.onClose = null;

            console.log("remove keybinds");
            remote.globalShortcut.unregisterAll();
        };
    }, []);


    const theme = {
        isFullscreen: context.fullscreen,
    };

    return <ThemeProvider theme={theme}>
        <AppState context={context} dispatch={dispatch}>
            <TitleBar />
            {modal}
        </AppState>
    </ThemeProvider>;
}


// prevents bugs when the window is reloaded by electron
window.onbeforeunload = () => {
    remote.window.onClose = null;
    remote.globalShortcut.unregisterAll();
};

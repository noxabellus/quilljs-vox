import { useLayoutEffect, useReducer, useRef } from "react";
import { PathLike } from "fs";

import Splash from "../modes/splash";
import Editor from "../modes/editor";
import AppSettings from "../modes/app-settings";

import AppState from "./state";
import { AppContext, AppStateAction, APP_MODE_TITLES, AppMode } from "./types";
import Document from "../../support/document";
import remote from "../../support/remote";
import saveInterrupt from "./save-interrupt";


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


export default function App () {
    const documentRef = useRef(null);
    const [context, dispatch] = useReducer(reducer, {
        lockIO: false,
        mode: "splash",
        data: {
            dirty: false,
            autoSave: false,
            filePath: null,
            document: documentRef
        },
        settings: null
    });


    function reducer (state: AppContext, action: AppStateAction): AppContext {
        let out: AppContext;

        console.log("AppDispatch", state, action.type, action.value);

        if (action.type === "set-lock-io") {
            out = { ...state, lockIO: action.value };
        } else if (state.lockIO) {
            throw "Cannot dispatch while IO locked";
        } else {
            switch (action.type) {
                case "set-mode": {
                    if (action.value === null) {
                        switch (state.data.document.current) {
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

                case "set-data-x": {
                    switch (action.value.type) {
                        case "set-dirty":
                            out = { ...state, data: { ...state.data, dirty: action.value.value } };
                            break;

                        case "set-auto-save":
                            out = { ...state, data: { ...state.data, autoSave: action.value.value } };
                            break;

                        case "set-file-path":
                            out = { ...state, data: { ...state.data, dirty: true, filePath: action.value.value } };
                            break;
                    }
                } break;

                case "set-doc-x": {
                    const document = state.data.document.current;
                    if (!document) throw "Cannot set document data without a document";

                    switch (action.value.type) {
                        case "set-doc-title":
                            document.title = action.value.value;
                            break;

                        case "set-doc-theme":
                            document.theme = action.value.value;
                            break;

                        case "set-doc-theme-property":
                            (document.theme as any)[action.value.value.key] = action.value.value.data;
                            break;

                        case "set-doc-quill-data":
                            document.copyEditorState(action.value.value);
                            break;

                        case "set-doc-delta":
                            document.copyEditorDelta(action.value.value);
                            break;

                        case "set-doc-history":
                            document.copyEditorHistory(action.value.value);
                            break;
                        }
                    out = { ...state, data: { ...state.data, dirty: true } };
                } break;

                case "post-doc": {
                    let mode: AppMode;
                    let filePath: PathLike | null;

                    if (action.value) {
                        if (action.value instanceof Document) {
                            filePath = null;
                            state.data.document.current = action.value;
                            mode = "editor";
                        } else {
                            filePath = action.value.filePath;
                            state.data.document.current = action.value.document;
                            mode = "editor";
                        }
                    } else {
                        filePath = null;
                        state.data.document.current = null;
                        mode = "splash";
                    }

                    out = {...state, mode, data: {...state.data, dirty: false, autoSave: false, filePath}};
                } break;
            }
        }

        switch (out.mode) {
            case "doc-settings":
            case "editor":
                if (!out.data) throw "Cannot set editor mode without data";
                setWindowTitle({ dirty: out.data.dirty, title: out.data.document.current?.title || null, filePath: out.data.filePath });
                break;
            default:
                setWindowTitle(APP_MODE_TITLES[out.mode]);
                break;
        }

        return out;
    }

    let modal;
    switch (context.mode) {
        case "splash":
            modal = <Splash />;
            break;
        case "doc-settings":
        case "editor":
            modal = <Editor key={`${context.data.filePath} | ${context.data.document.current?.title}`} />;
            break;
        case "settings":
            modal = <AppSettings />;
            break;
    }


    useLayoutEffect(() => {
        async function handler (exit: () => void) {
            if (context.data.dirty) {
                saveInterrupt(context, dispatch, exit);
            } else {
                exit();
            }
        }

        remote.window.onClose = handler;

        return () => {
            remote.window.onClose = null;
        };
    }, [context.data.dirty]);


    return <AppState context={context} dispatch={dispatch}>
        {modal}
    </AppState>;
}


// prevents a bug when the window is reloaded by electron
window.onbeforeunload = () => {
    remote.window.onClose = null;
};

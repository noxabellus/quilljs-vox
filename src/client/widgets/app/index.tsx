/* eslint-disable @typescript-eslint/no-unused-vars */

import Splash from "../modes/splash";
import Editor from "../modes/editor";
import AppSettings from "../modes/app-settings";
import AppState from "./state";
import { AppContext, AppStateAction, APP_MODE_TITLES, DEFAULT_APP_CONTEXT } from "./types";
import { useReducer } from "react";
import Document from "../../support/document";
import { PathLike } from "fs";



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
    const [context, dispatch] = useReducer(reducer, {...DEFAULT_APP_CONTEXT});

    function reducer (state: AppContext, action: AppStateAction): AppContext {
        let out: AppContext;

        console.log("dispatch", state, action.type, action.value);

        switch (action.type) {
            case "set-mode":
                if (action.value === null) {
                    switch (state.data) {
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
                break;

            case "set-data-x": {
                if (!state.data) throw "Cannot set dirty without data";

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

                break;
            }

            case "set-doc-x": {
                if (!state.data) throw "Cannot set doc element without data";
                switch (action.value.type) {
                    case "set-doc-title":
                        out = { ...state, data: { ...state.data, dirty: true, document: Object.setPrototypeOf({ ...state.data.document, title: action.value.value }, Document.prototype) } };
                        break;

                    case "set-doc-theme":
                        out = { ...state, data: { ...state.data, dirty: true, document: Object.setPrototypeOf({ ...state.data.document, theme: action.value.value }, Document.prototype) } };
                        break;

                    case "set-doc-quill-data":
                        out = { ...state, data: { ...state.data, dirty: true, document: Object.setPrototypeOf({ ...state.data.document, delta: action.value.value.delta, history: action.value.value.history }, Document.prototype) } };
                        break;

                    case "set-doc-delta":
                        out = { ...state, data: { ...state.data, dirty: true, document: Object.setPrototypeOf({ ...state.data.document, delta: action.value.value }, Document.prototype) } };
                        break;

                    case "set-doc-history":
                        out = { ...state, data: { ...state.data, dirty: true, document: Object.setPrototypeOf({ ...state.data.document, history: action.value.value }, Document.prototype) } };
                        break;
                }
            } break;

            case "post-data":
                out = { ...state, data: action.value};
                break;
        }

        switch (out.mode) {
            case "editor":
                if (!out.data) throw "Cannot set editor mode without data";
                setWindowTitle({ dirty: out.data.dirty, title: out.data.document.title, filePath: out.data.filePath });
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
        case "editor":
            modal = <Editor />;
            break;
        case "settings":
            modal = <AppSettings />;
            break;
    }

    return <AppState context={context} dispatch={dispatch}>
        {modal}
    </AppState>;
}


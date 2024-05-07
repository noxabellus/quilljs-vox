import { useLayoutEffect, useReducer, useRef } from "react";

import { PathLike } from "fs";

import Document from "Support/document";
import remote from "Support/remote";
import saveInterrupt from "./save-interrupt";
import { writeVox } from "Support/file";
import Result from "Support/result";

import Splash from "../modes/splash";
import Editor from "../modes/editor";
import AppSettings from "../modes/app-settings";

import AppState, { dataIsDirty } from "./state";
import { AppContext, AppStateAction, APP_MODE_TITLES, AppMode, AppLocalSettings } from "./types";


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
            lastSaved: 0,
            lastUpdated: 0,
            localSettings: {
                "Auto Save": false,
            },
            filePath: null,
            document: documentRef
        },
        settings: null
    });


    function reducer (state: AppContext, action: AppStateAction): AppContext {
        let out: AppContext;

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
                        case "set-last-saved":
                            out = { ...state, data: { ...state.data, lastSaved: action.value.value } };
                            break;

                        case "set-last-updated":
                            out = { ...state, data: { ...state.data, lastUpdated: action.value.value } };
                            break;

                        case "set-file-path":
                            out = { ...state, data: { ...state.data, lastUpdated: Date.now(), filePath: action.value.value } };
                            break;
                    }
                } break;

                case "set-local-settings-x": {
                    switch (action.value.type) {
                        case "set-auto-save":
                            out = { ...state, data: { ...state.data, localSettings: { ...state.data.localSettings, "Auto Save": action.value.value } } };
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
                    out = { ...state, data: { ...state.data, lastUpdated: Date.now() } };
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

                    const localSettings: AppLocalSettings = { "Auto Save": false };

                    if (filePath) {
                        const json = JSON.parse(localStorage[`settings[${filePath}]`]);

                        let reset = false;
                        if (typeof json === "object") {
                            const keys = Object.keys(localSettings) as (keyof AppLocalSettings)[];
                            for (const key of keys) {
                                if (key in json) {
                                    if (typeof json[key] === typeof localSettings[key]) {
                                        localSettings[key] = json[key];
                                    } else {
                                        console.error(`local storage is corrupt at ${key}, resetting to default value`, json[key], localSettings[key]);
                                        reset = true;
                                        break;
                                    }
                                }
                            }
                        } else {
                            reset = true;
                        }

                        if (reset) {
                            localStorage[`settings[${filePath}]`] = JSON.stringify(localSettings);
                        }
                    }

                    out = {...state, mode, data: {...state.data, lastSaved: 0, lastUpdated: Date.now(), localSettings, filePath}};
                } break;
            }
        }

        switch (out.mode) {
            case "doc-settings":
            case "editor": {
                const dirty = dataIsDirty(out);

                if (!out.data) throw "Cannot set editor mode without data";
                setWindowTitle({ dirty, title: out.data.document.current?.title || null, filePath: out.data.filePath });

                if (out.data.filePath) {
                    setTimeout(() => localStorage[`settings[${out.data.filePath}]`] = JSON.stringify(out.data.localSettings));
                }

                if (dirty && out.data.localSettings["Auto Save"] && out.data.filePath && out.data.document.current) {
                    const path = out.data.filePath;
                    const doc = out.data.document.current;
                    const time = out.data.lastUpdated;

                    setTimeout(async () => {
                        const result = await writeVox(path, doc);

                        if (Result.isSuccess(result)) {
                            dispatch({
                                type: "set-data-x",
                                value: {
                                    type: "set-last-saved",
                                    value: time,
                                },
                            });
                        } else {
                            alert(`Failed to auto-save file:\n\t${Result.problemMessage(result)}\n(Disabling auto-save)`);
                            dispatch({
                                type: "set-local-settings-x",
                                value: {
                                    type: "set-auto-save",
                                    value: false,
                                },
                            });
                        }
                    });
                }
            } break;
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
            if (dataIsDirty(context)) {
                saveInterrupt(context, dispatch, exit);
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

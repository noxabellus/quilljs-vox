import { PathLike } from "fs";

import Document from "Document";
import * as EditorTypes from "../modes/editor/types";


export type Mode = "splash" | "settings" | "editor";

export type ModeTitles = {
    [K in Mode]: string | null
};

export const MODE_TITLES: ModeTitles = {
    splash: null,
    settings: "App Settings",
    editor: "Editor",
};

export type Settings = null;


export type Context = {
    lockIO: boolean,
    mode: Mode,
    editors: EditorTypes.Context[],
    settings: Settings,
};

export type Action
    = SetLockIO
    | SetMode
    | OpenDoc
    | CloseDoc
    | EditorAction
    ;

export type EditorAction = {
    type: "editor-action",
    value: {
        documentId: number,
        action: EditorTypes.Action,
    },
};


export type SetLockIO = {
    type: "set-lock-io",
    value: boolean,
};

export type SetMode = {
    type: "set-mode",
    value: Mode | null,
};


export type OpenDoc = {
    type: "open-doc",
    value: OpenDocValue,
};

export type CloseDoc = {
    type: "close-doc",
    value: number,
}

export type OpenDocValue = {
    filePath: PathLike | null,
    document: Document,
};

export type SetEditorState = {
    type: "set-editor-state",
    value: EditorTypes.Context,
};

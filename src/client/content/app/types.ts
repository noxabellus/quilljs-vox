import { PathLike } from "fs";

import Document from "Document";
import * as EditorTypes from "../modes/editor/types";
import { Settings } from "./settings";


export type Mode = "splash" | "settings" | {"editor": number};

export const MODE_TITLES = {
    splash: null,
    settings: "App Settings",
    editor: "Editor",
};


export type Context = {
    lockIO: boolean,
    fullscreen: boolean,
    mode: Mode,
    lastMode: Mode,
    editors: EditorTypes.Context[],
    settings: Settings,
};

export type Action
    = SetLockIO
    | SetFullscreen
    | PostFullscreen
    | SetMode
    | OpenDoc
    | CloseDoc
    | EditorAction
    ;


export type SetLockIO = {
    type: "set-lock-io",
    value: boolean,
};

export type SetFullscreen = {
    type: "set-fullscreen",
    value: boolean,
};

export type PostFullscreen = {
    type: "post-fullscreen",
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

export type EditorAction = {
    type: "editor-action",
    value: {
        documentId: number,
        action: EditorTypes.Action,
    },
};

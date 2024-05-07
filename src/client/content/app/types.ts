import { MutableRefObject } from "react";

import Delta from "quill-delta";
import History from "quill/modules/history";

import { PathLike } from "fs";

import Document from "Support/document";
import { Theme } from "Support/document-theme";


export type AppMode = "splash" | "settings" | "editor" | "doc-settings";

export type AppModeTitles = {
    [K in AppMode]: string | null
};

export const APP_MODE_TITLES: AppModeTitles = {
    splash: null,
    settings: "App Settings",
    editor: "Editor",
    "doc-settings": "Document Settings",
};

export type AppSettings = null;

export type AppData = {
    lastUpdated: number,
    lastSaved: number,
    localSettings: AppLocalSettings,
    filePath: PathLike | null,
    document: MutableRefObject<Document | null>,
};

export type AppLocalSettings = {
    ["Auto Save"]: boolean,
};

export type AppContext = {
    lockIO: boolean,
    mode: AppMode,
    data: AppData,
    settings: AppSettings,
};

export type AppStateAction
    = AppStateSetLockIO
    | AppStateSetMode
    | AppStateSetDataX
    | AppStateSetLocalSettingsX
    | AppStateSetDocX
    | AppStatePostDoc
    ;

export type AppStateSetDataX = {
    type: "set-data-x";
    value: AppStateDataAction;
};

export type AppStateSetLocalSettingsX = {
    type: "set-local-settings-x";
    value: AppStateLocalSettingsAction;
};

export type AppStateLocalSettingsAction
    = AppStateSetAutoSave
    ;

export type AppStateSetAutoSave = {
    type: "set-auto-save";
    value: boolean;
};

export type AppStateDataAction
    = AppStateSetLastUpdated
    | AppStateSetLastSaved
    | AppStateSetFilePath
    ;

export type AppStateSetDocX = {
    type: "set-doc-x";
    value: AppStateDocAction;
};

export type AppStateDocAction
    = AppStateSetDocTitle
    | AppStateSetDocTheme
    | AppStateSetDocThemeProperty
    | AppStateSetDocQuillData
    | AppStateSetDocDelta
    | AppStateSetDocHistory
    ;

export type AppStateSetLockIO = {
    type: "set-lock-io",
    value: boolean,
};

export type AppStateSetMode = {
    type: "set-mode",
    value: AppMode | null,
};

export type AppStateSetLastUpdated = {
    type: "set-last-updated",
    value: number,
};

export type AppStateSetLastSaved = {
    type: "set-last-saved",
    value: number,
};


export type AppStateSetFilePath = {
    type: "set-file-path",
    value: PathLike,
};

export type AppStateSetDocTitle = {
    type: "set-doc-title",
    value: string,
};

export type AppStateSetDocTheme = {
    type: "set-doc-theme",
    value: Theme,
};

export type AppStateSetDocThemeProperty = {
    type: "set-doc-theme-property",
    value: { key: keyof Theme, data: Theme[keyof Theme] },
};

export type AppStateSetDocQuillData = {
    type: "set-doc-quill-data",
    value: { delta: Delta, history: History },
};

export type AppStateSetDocDelta = {
    type: "set-doc-delta",
    value: Delta,
};

export type AppStateSetDocHistory = {
    type: "set-doc-history",
    value: History,
};

export type AppStatePostDoc = {
    type: "post-doc",
    value: AppStatePostDocValue,
};

export type AppStatePostDocValue
    = {
        filePath: PathLike,
        document: Document,
    }
    | Document
    | null
    ;

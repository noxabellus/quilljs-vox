import { PathLike } from "fs";

import Document from "../../support/document";
import { Theme } from "../../support/document-theme";
import Delta from "quill-delta";
import History from "quill/modules/history";


export type AppMode = "splash" | "settings" | "editor";

export type AppModeTitles = {
    [K in AppMode]: string | null
};

export const APP_MODE_TITLES: AppModeTitles = { splash: null, settings: "App Settings", editor: "Editor" };

export type AppSettings = null;

export type AppData = {
    dirty: boolean;
    autoSave: boolean;
    filePath: PathLike | null;
    document: Document;
};

export type AppContext = {
    mode: AppMode;
    data: AppData | null;
    settings: AppSettings;
};

export type AppStateActionType
    = "set-mode"
    | "set-data-x"
    | "set-doc-x"
    | "post-data"
    ;

export type AppStateDocActionType
    = "set-doc-title"
    | "set-doc-theme"
    | "set-doc-quill-data"
    | "set-doc-delta"
    | "set-doc-history"
    ;

export type AppStateAction
    = AppStateSetMode
    | AppStateSetDataX
    | AppStateSetDocX
    | AppStatePostData
    ;

export type AppStateSetDataX = {
    type: "set-data-x";
    value: AppStateDataAction;
};

export type AppStateDataAction
    = AppStateSetDirty
    | AppStateSetAutoSave
    | AppStateSetFilePath
    ;

export type AppStateSetDocX = {
    type: "set-doc-x";
    value: AppStateDocAction;
};

export type AppStateDocAction
    = AppStateSetDocTitle
    | AppStateSetDocTheme
    | AppStateSetDocQuillData
    | AppStateSetDocDelta
    | AppStateSetDocHistory
    ;

export type AppStateSetMode = {
    type: "set-mode";
    value: AppMode | null;
};

export type AppStateSetDirty = {
    type: "set-dirty";
    value: boolean;
};

export type AppStateSetAutoSave = {
    type: "set-auto-save";
    value: boolean;
};

export type AppStateSetFilePath = {
    type: "set-file-path";
    value: PathLike;
};

export type AppStateSetDocTitle = {
    type: "set-doc-title";
    value: string;
};

export type AppStateSetDocTheme = {
    type: "set-doc-theme";
    value: Theme;
};

export type AppStateSetDocQuillData = {
    type: "set-doc-quill-data";
    value: { delta: Delta, history: History };
};

export type AppStateSetDocDelta = {
    type: "set-doc-delta";
    value: Delta;
};

export type AppStateSetDocHistory = {
    type: "set-doc-history";
    value: Delta[];
};

export type AppStatePostData = {
    type: "post-data";
    value: AppData;
};

export const DEFAULT_APP_CONTEXT: AppContext = {
    mode: "splash",
    data: null,
    settings: null,
};

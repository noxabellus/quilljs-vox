import { PathLike } from "fs";
import Quill, { Delta, Range } from "Extern/quill";

import Document from "Document";
import { Length, Theme } from "Document/theme";
import History from "quill/modules/history";
import { HexRgba } from "Support/color";
import { KeyCombo } from "Client/content/app/settings";


export type Context = {
    documentId: number,
    lastUpdated: number,
    lastSaved: number,
    settings: Settings,
    filePath: PathLike | null,
    document: Document,
    startedFromBlankDocument: boolean,
    details: Details,
    overlays: EditorOverlays
    quill: Quill | null,
};

export type EditorOverlays = {
    settings: boolean,
};

export type Settings = {
    ["Auto Save"]: boolean,
};

export type Details = {
    nodeData: NodeData,
    blockFormat: BlockFormat,
    textDecoration: TextDecoration,
    fontAttributes: FontAttributes,
};

export type NodeData = {
    focused: boolean,
    range: Range | null,
    lastRange: Range,
    width: number,
};

export type BlockFormat = {
    align: BlockAlign,
    header: BlockHeaderLevel,
};

export type TextDecoration = {
    bold: boolean,
    italic: boolean,
    underline: boolean,
    strike: boolean,
    script: null | TextScript,
};

export type TextScript = "sub" | "super";

export type FontAttributes = {
    size: Length | null,
    font: string | null,
    color: HexRgba | null,
    background: HexRgba | null,
};


export type TextDecorationProperties = {
    [K in keyof Omit<TextDecoration, "script">]: [string, string, string, string]
};

export type BlockAlign = null | "center" | "right" | "justify";
export type BlockHeaderLevel = null | 1 | 2 | 3 | 4 | 5 | 6;

export const EDITOR_HEADER_LEVELS: BlockHeaderLevel[] =
    [null, 1, 2, 3, 4, 5, 6];

export const EDITOR_ALIGNMENT_NAMES: BlockAlign[] =
    [null, "center", "right", "justify"];

export const EDITOR_TEXT_DECORATION_PROPERTIES: TextDecorationProperties = {
    bold: ["fontWeight", "bold", "B", "Bold"],
    italic: ["fontStyle", "italic", "I", "Italic"],
    underline: ["textDecoration", "underline", "U", "Underline"],
    strike: ["textDecoration", "line-through", "S", "Strikethrough"],
};

export const EDITOR_SCRIPT_TITLES: {[K in TextScript]: string} = {
    sub: "Subscript",
    super: "Superscript",
};


export type Action
    = SetLastUpdated
    | SetLastSaved
    | SetFilePath
    | SetAutoSave
    | SetOverlay
    | SetBold
    | SetItalic
    | SetUnderline
    | SetStrike
    | SetScript
    | SetFontSize
    | SetFontFamily
    | SetFontColor
    | SetFontBackground
    | SetAlign
    | SetHeader
    | SetFocused
    | SetWidth
    | ClearFormat
    | PostQuill
    | PostRange
    | PostWidth
    | SetTitle
    | SetTheme
    | SetThemeProperty
    | SetQuillData
    | SetDelta
    | SetHistory
    | SetFontData
    | RenameFont
    | DeleteFont
    | RefreshImages
    | KeyboardShortcut
    | Undo
    | Redo
    ;

export type SetFilePath = {
    type: "set-file-path",
    value: PathLike,
};

export type SetLastUpdated = {
    type: "set-last-updated",
    value: number,
};

export type SetLastSaved = {
    type: "set-last-saved",
    value: number,
};

export type SetAutoSave = {
    type: "set-auto-save";
    value: boolean;
};

export type SetOverlay = {
    type: "set-overlay",
    value: {
        key: keyof EditorOverlays,
        enabled: boolean,
    }
};

export type SetBold = {
    type: "set-bold",
    value: boolean,
};

export type SetItalic = {
    type: "set-italic",
    value: boolean,
};

export type SetUnderline = {
    type: "set-underline",
    value: boolean,
};

export type SetStrike = {
    type: "set-strike",
    value: boolean,
};

export type SetScript = {
    type: "set-script",
    value: TextScript | null,
};

export type SetFontSize = {
    type: "set-font-size",
    value: Length | null,
};

export type SetFontFamily = {
    type: "set-font-family",
    value: string | null,
};

export type SetFontColor = {
    type: "set-font-color",
    value: HexRgba | null,
};

export type SetFontBackground = {
    type: "set-font-background",
    value: HexRgba | null,
};

export type SetAlign = {
    type: "set-align",
    value: BlockAlign,
};

export type SetHeader = {
    type: "set-header",
    value: BlockHeaderLevel,
};

export type SetFocused = {
    type: "set-focused",
    value: boolean,
};

export type SetWidth = {
    type: "set-width",
    value: number,
};

export type ClearFormat = {
    type: "clear-format",
};

export type PostQuill = {
    type: "post-quill",
    value: Quill | null,
};

export type PostRange = {
    type: "post-range",
    value: Range | null,
};

export type PostWidth = {
    type: "post-width",
    value: number,
};

export type SetTitle = {
    type: "set-title",
    value: string,
};

export type SetTheme = {
    type: "set-theme",
    value: Theme,
};

export type SetThemeProperty = {
    type: "set-theme-property",
    value: { key: keyof Theme, data: Theme[keyof Theme] },
};

export type SetQuillData = {
    type: "set-quill-data",
    value: { delta: Delta, history: History },
};

export type SetDelta = {
    type: "set-delta",
    value: Delta,
};

export type SetHistory = {
    type: "set-history",
    value: History,
};

export type SetFontData = {
    type: "set-font-data",
    value: {
        name: string,
        data: string,
    },
};

export type RenameFont = {
    type: "rename-font",
    value: {
        oldName: string,
        newName: string,
    },
};

export type DeleteFont = {
    type: "delete-font",
    value: string,
};

export type RefreshImages = {
    type: "refresh-images",
};

export type KeyboardShortcut = {
    type: "keyboard-shortcut",
    value: KeyCombo,
};

export type Undo = {
    type: "undo",
};

export type Redo = {
    type: "redo",
};

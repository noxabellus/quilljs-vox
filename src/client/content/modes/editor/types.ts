import { Range } from "quill/core";



export type EditorContext = {
    focused: boolean,
    range: Range | null,
    width: number,
} & EditorFormat;

export type EditorFormat = {
    align: EditorAlignment,
    block: EditorBlock,
} & EditorTextDetails;


export type EditorTextDetails = {
    bold: boolean,
    italic: boolean,
    underline: boolean,
    strike: boolean,
};


export type EditorTextDetailsProperties = {
    [K in keyof EditorTextDetails]: [string, string, string, string]
};

export type EditorAlignment = null | "center" | "right" | "justify";
export type EditorBlock = null | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export const EDITOR_BLOCK_NAMES: EditorBlock[] =
    [null, "h1", "h2", "h3", "h4", "h5", "h6"];

export const EDITOR_ALIGNMENT_NAMES: EditorAlignment[] =
    [null, "center", "right", "justify"];

export const EDITOR_TEXT_DETAILS_PROPERTIES: EditorTextDetailsProperties = {
    bold: ["fontWeight", "bold", "B", "Bold"],
    italic: ["fontStyle", "italic", "I", "Italic"],
    underline: ["textDecoration", "underline", "U", "Underline"],
    strike: ["textDecoration", "line-through", "S", "Strikethrough"],
};

export const DEFAULT_EDITOR_CONTEXT: EditorContext = {
    focused: false,
    bold: false,
    italic: false,
    underline: false,
    strike: false,
    align: null,
    block: null,
    range: null,
    width: 1010,
};


export type EditorStateAction
    = EditorStateSetBold
    | EditorStateSetItalic
    | EditorStateSetUnderline
    | EditorStateSetStrike
    | EditorStateSetAlign
    | EditorStateSetBlock
    | EditorStateSetFocused
    | EditorStateSetWidth
    | EditorStateClearFormat
    | EditorStatePostRange
    | EditorStatePostWidth
    ;

export type EditorStateSetBold = {
    type: "set-bold",
    value: boolean,
};

export type EditorStateSetItalic = {
    type: "set-italic",
    value: boolean,
};

export type EditorStateSetUnderline = {
    type: "set-underline",
    value: boolean,
};

export type EditorStateSetStrike = {
    type: "set-strike",
    value: boolean,
};

export type EditorStateSetAlign = {
    type: "set-align",
    value: EditorAlignment,
};

export type EditorStateSetBlock = {
    type: "set-block",
    value: EditorBlock,
};

export type EditorStateSetFocused = {
    type: "set-focused",
    value: boolean,
};

export type EditorStateSetWidth = {
    type: "set-width",
    value: number,
};

export type EditorStateClearFormat = {
    type: "clear-format",
};

export type EditorStatePostRange = {
    type: "post-range",
    value: Range | null,
};

export type EditorStatePostWidth = {
    type: "post-width",
    value: number,
};

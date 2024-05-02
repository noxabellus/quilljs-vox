import { Dispatch, createContext } from "react";
import { Range } from "quill";
import Delta from "quill-delta";

export type EditorAlignment = "center" | "right" | "justify" | null;

export type EditorContext = {
    focused: boolean;
    range: Range | null;
    width: number;
} & EditorFormat;

export type EditorFormat = {
    align: EditorAlignment;
} & EditorTextDetails;

export type EditorTextDetails = {
    bold: boolean,
    italic: boolean,
    underline: boolean,
    strike: boolean,
};

export type EditorTextDetailsProperties = {
    [K in keyof EditorTextDetails]: [string, string, string];
};

export const EDITOR_TEXT_DETAILS_PROPERTIES: EditorTextDetailsProperties = {
    bold: ["fontWeight", "bold", "B"],
    italic: ["fontStyle", "italic", "I"],
    underline: ["textDecoration", "underline", "U"],
    strike: ["textDecoration", "line-through", "S"],
};

export const DEFAULT_EDITOR_CONTEXT: EditorContext = {
    focused: false,
    bold: false,
    italic: false,
    underline: false,
    strike: false,
    align: null,
    range: null,
    width: 1010,
};

export type ContextAction
    = SetBold
    | SetItalic
    | SetUnderline
    | SetStrike
    | SetAlign
    | SetFocused
    | SetWidth
    | ClearFormat
    | PostRange
    | PostDelta
    | PostWidth
    ;

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

export type SetAlign = {
    type: "set-align",
    value: EditorAlignment,
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

export type PostRange = {
    type: "post-range",
    value: Range | null,
};

export type PostDelta = {
    type: "post-delta",
    value: Delta,
};

export type PostWidth = {
    type: "post-width",
    value: number,
};


export const EditorContext = createContext<EditorContext>(DEFAULT_EDITOR_CONTEXT);

export const EditorDispatch = createContext<Dispatch<ContextAction>>(() => {
    throw "No provider found for EditorDispatch!";
});

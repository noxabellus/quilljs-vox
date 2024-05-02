import { createContext } from "react";
import { Range } from "quill";

export type EditorAlignment = "left" | "center" | "right" | "justify";

export type EditorContext = {
    focused: boolean;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strike: boolean;
    align: EditorAlignment;
    range: Range | null;
};

export const DEFAULT_EDITOR_CONTEXT: EditorContext = {
    focused: false,
    bold: false,
    italic: false,
    underline: false,
    strike: false,
    align: "left",
    range: null,
};

export const EditorContext = createContext<EditorContext>(DEFAULT_EDITOR_CONTEXT);

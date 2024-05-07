import { useContext, useReducer, useRef } from "react";
import Quill from "quill/core";

import Body from "Elements/body";

import AppState from "../../app/state";

import EditorState from "./state";
import { EditorStateAction, DEFAULT_EDITOR_CONTEXT, EditorContext } from "./types";
import DocumentEditor from "./document-editor";
import EditorToolbar from "./toolbar";
import DocumentSettings from "./document-settings";


export default function Editor () {
    const quillRef = useRef<Quill>(null);

    const [editorContext, editorDispatch] = useReducer(reducer, { ...DEFAULT_EDITOR_CONTEXT });
    const appContext = useContext(AppState.Context);

    function reducer (state: EditorContext, action: EditorStateAction): EditorContext {
        const q = quillRef.current;
        if (!q) throw "Quill editor not initialized";

        console.log("Editor reducer", action, state);

        switch (action.type) {
            case "set-bold":
                if (!state.range)
                    throw "Cannot set bold without a range";
                q.format("bold", action.value);
                return { ...state, bold: action.value };

            case "set-italic":
                if (!state.range)
                    throw "Cannot set italic without a range";
                q.format("italic", action.value);
                return { ...state, italic: action.value };

            case "set-underline":
                if (!state.range)
                    throw "Cannot set underline without a range";
                q.format("underline", action.value);
                return { ...state, underline: action.value };

            case "set-strike":
                if (!state.range)
                    throw "Cannot set strike without a range";
                q.format("strike", action.value);
                return { ...state, strike: action.value };

            case "set-align":
                if (!state.range)
                    throw "Cannot set align without a range";
                q.format("align", action.value);
                return { ...state, align: action.value };

            case "set-block":
                if (!state.range)
                    throw "Cannot set block format without a range";

                switch (action.value) {
                    case "h1": q.format("header", 1); break;
                    case "h2": q.format("header", 2); break;
                    case "h3": q.format("header", 3); break;
                    case "h4": q.format("header", 4); break;
                    case "h5": q.format("header", 5); break;
                    case "h6": q.format("header", 6); break;
                    default: q.format("header", null); break;
                }
                return { ...state, block: action.value };

            case "set-focused":
                if (action.value) q.focus();
                else q.blur();

                return { ...state, focused: action.value };

            case "set-width":
                q.root.style.width = `${action.value}px`;
                return { ...state, width: q.container.offsetWidth };

            case "clear-format": {
                if (!state.range)
                    throw "Cannot clear format without a range";

                if (state.range.length == 0) {
                    const [line, _] = q.getLine(state.range.index);

                    if (line === null) throw "No line found";

                    q.formatText(line.offset(), line.length(), {
                        bold: false,
                        italic: false,
                        underline: false,
                        strike: false,
                        align: null,
                        header: null,
                    });
                } else {
                    q.formatText(state.range.index, state.range.length, {
                        bold: false,
                        italic: false,
                        underline: false,
                        strike: false,
                    });
                }

                return { ...state, bold: false, italic: false, underline: false, strike: false, align: null };
            }

            case "post-range": {
                let focused;
                const formats: any = { bold: false, italic: false, underline: false, strike: false, align: null };
                if (action.value) {
                    focused = true;
                    const fmt = q.getFormat(action.value);
                    for (const key in formats) {
                        if (key in fmt) formats[key] = fmt[key];
                    }
                    if ("header" in fmt) formats.block = `h${fmt.header}`;
                    else formats.block = null;
                } else {
                    focused = false;
                }

                return { ...state, ...formats, focused, range: action.value };
            }

            case "post-width":
                return { ...state, width: action.value };
        }
    }


    return <EditorState context={editorContext} dispatch={editorDispatch}>
        <Body>
            <EditorToolbar />
            <DocumentEditor ref={quillRef} disabled={appContext.lockIO}/>
            {appContext.mode == "doc-settings" && <DocumentSettings key="doc-settings"/>}
        </Body>
    </EditorState>;
};
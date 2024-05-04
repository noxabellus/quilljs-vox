import { useContext, useReducer, useRef } from "react";
import Quill from "quill";

import EditorState from "./state";
import { EditorStateAction, DEFAULT_EDITOR_CONTEXT, EditorContext } from "./types";
import DocumentEditor from "./document-editor";
import EditorToolbar from "./toolbar";
import AppState from "../../app/state";
import DocumentSettings from "./document-settings";


export default function Editor () {
    const quillRef = useRef<Quill>(null);

    const [editorContext, editorDispatch] = useReducer(reducer, { ...DEFAULT_EDITOR_CONTEXT });
    const appContext = useContext(AppState.Context);

    function reducer (state: EditorContext, action: EditorStateAction): EditorContext {
        const q = quillRef.current;
        if (!q) throw "Quill editor not initialized";

        console.log("EditorDispatch", action.type, (action as any).value);

        switch (action.type) {
            case "set-bold":
                q.format("bold", action.value);
                return { ...state, bold: action.value };

            case "set-italic":
                q.format("italic", action.value);
                return { ...state, italic: action.value };

            case "set-underline":
                q.format("underline", action.value);
                return { ...state, underline: action.value };

            case "set-strike":
                q.format("strike", action.value);
                return { ...state, strike: action.value };

            case "set-align":
                q.format("align", action.value);
                return { ...state, align: action.value };

            case "set-focused":
                if (action.value) q.focus();
                else q.blur();

                return { ...state, focused: action.value };

            case "set-width":
                q.root.style.width = `${action.value}px`;
                return { ...state, width: q.container.offsetWidth };

            case "clear-format":
                if (!state.range)
                    throw "Cannot clear format without a range";

                q.removeFormat(state.range.index, state.range.length);

                if (state.range.length == 0) {
                    q.format("bold", false);
                    q.format("italic", false);
                    q.format("underline", false);
                    q.format("strike", false);
                }

                return { ...state, bold: false, italic: false, underline: false, strike: false, align: null };

            case "post-range": {
                let focused;
                const formats: any = { bold: false, italic: false, underline: false, strike: false, align: null };
                if (action.value) {
                    focused = true;
                    const fmt = q.getFormat(action.value);
                    for (const key in formats) {
                        if (key in fmt) formats[key] = fmt[key];
                    }
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
        <EditorToolbar />
        <DocumentEditor ref={quillRef} disabled={appContext.lockIO}/>
        {appContext.mode == "doc-settings" && <DocumentSettings key="doc-settings"/>}
    </EditorState>;
};

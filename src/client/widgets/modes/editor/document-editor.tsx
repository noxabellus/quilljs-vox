import { MutableRefObject, forwardRef, useContext, useEffect, useRef } from "react";
import styled from "styled-components";

import Quill from "quill";
import Delta from "quill-delta";

import { forceRef } from "../../../support/nullable";
import { EditorDispatch } from "./context";

export type QuillEditorProps = {
    defaultValue: Delta;
}

type QuillRef = MutableRefObject<Quill | null>;


const Editor = styled.div`
    overflow: scroll;
    scrollbar-width: none;
    flex-grow: 1;

    & .ql-container {
        border: 1px solid rgba(var(--frame-border-color), var(--frame-border-opacity));
        border-top: none;
        margin: auto;
        width: min-content;
        height: min-content;
        padding: var(--frame-padding);
        background-color: rgba(var(--frame-background-color), var(--frame-background-opacity));
        color: rgb(var(--primary-color));
        box-shadow: 0 0 10px 10px rgba(var(--shadow-color), calc(var(--shadow-opacity) / 4)),
                    0 0 10px 10px rgba(var(--shadow-color), calc(var(--shadow-opacity) / 4)) inset;
    }

    & .ql-container .ql-editor {
        width: var(--document-width);
        border: var(--document-border-size) solid rgba(var(--document-border-color), var(--document-border-opacity));
        border-radius: var(--document-border-radius);
        font-family: var(--document-primary-font-family);
        font-size: var(--document-primary-font-size);
        font-weight: var(--document-primary-font-weight);
        color: rgb(var(--document-primary-color));
        background-color: rgb(var(--document-background-color));
        padding: var(--document-padding);
    }
`;

const DocumentEditor = forwardRef(
    ({ defaultValue }: QuillEditorProps, ref: QuillRef) => {
        const containerRef = useRef<HTMLDivElement>(null);
        const defaultValueRef = useRef(defaultValue);
        const dispatch = useContext(EditorDispatch);

        useEffect(() => {
            const container = forceRef(containerRef);

            const editorContainer = container.appendChild(
                container.ownerDocument.createElement("div"),
            );

            const quill = new Quill(editorContainer);

            ref.current = quill;

            dispatch({
                type: "post-width",
                value: quill.container.offsetWidth,
            });

            if (defaultValueRef.current) {
                quill.setContents(defaultValueRef.current);
            }

            quill.on("text-change", (delta, oldContent) => {
                dispatch({
                    type: "post-delta",
                    value: oldContent.compose(delta),
                });
            });

            quill.on("selection-change", (range) => {
                dispatch({
                    type: "post-range",
                    value: range,
                });
            });

            return () => {
                ref.current = null;
                container.innerHTML = "";
            };
        }, [ref]);

        return <Editor ref={containerRef}/>;
    }
);

DocumentEditor.displayName = "QuillEditor";

export default DocumentEditor;

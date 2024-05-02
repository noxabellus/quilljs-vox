import Quill, { Range } from "quill";
import Delta from "quill-delta";
import { MutableRefObject, forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import { forceRef } from "../../support/nullable";
import styled from "styled-components";

export type QuillEditorProps = {
    defaultValue: Delta;
    onTextChange: (delta: Delta, oldDelta: Delta, source: string) => void;
    onSelectionChange: (range: Range, oldRange: Range, source: string) => void;
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
        min-height: 100vh;
    }
`;

const DocumentEditor = forwardRef(
    ({ defaultValue, onTextChange, onSelectionChange }: QuillEditorProps, ref: QuillRef) => {
        const containerRef = useRef<HTMLDivElement>(null);
        const defaultValueRef = useRef(defaultValue);
        const onTextChangeRef = useRef(onTextChange);
        const onSelectionChangeRef = useRef(onSelectionChange);

        useLayoutEffect(() => {
            onTextChangeRef.current = onTextChange;
            onSelectionChangeRef.current = onSelectionChange;
        });

        useEffect(() => {
            const container = forceRef(containerRef);

            const editorContainer = container.appendChild(
                container.ownerDocument.createElement("div"),
            );

            const quill = new Quill(editorContainer);

            ref.current = quill;

            if (defaultValueRef.current) {
                quill.setContents(defaultValueRef.current);
            }

            quill.on("text-change", (...args) => {
                onTextChangeRef.current?.(...args);
            });

            quill.on("selection-change", (...args) => {
                onSelectionChangeRef.current?.(...args);
            });

            return () => {
                ref.current = null;
                container.innerHTML = "";
            };
        }, [ref]);

        return <Editor ref={containerRef}></Editor>;
    }
);

DocumentEditor.displayName = "QuillEditor";

export default DocumentEditor;

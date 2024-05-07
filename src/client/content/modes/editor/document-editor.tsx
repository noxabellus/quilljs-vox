import { MutableRefObject, forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import styled from "styled-components";

import Quill from "quill";
import "./quill-extensions";

import { forceRef } from "Support/nullable";

import { makeFullTheme } from "Document/theme";
import documentStyles from "Document/styles";

import { useAppState } from "../../app/state";
import { useEditorState } from "./state";


export type QuillEditorProps = {
    defaultValue?: string;
    disabled?: boolean;
}

type QuillRef = MutableRefObject<Quill | null>;

const Editor = styled.div<{$edWidth: number}>`
    overflow: scroll;
    scrollbar-width: none;
    max-width: 100%;
    max-height: 100%;
    flex-grow: 1;

    & .ql-container {
        border: 1px solid rgba(var(--frame-border-color), var(--frame-border-opacity));
        border-radius: 5px;
        margin: 7px auto;
        width: min-content;
        height: min-content;
        background-color: rgb(var(--document-background-color));
        color: rgb(var(--primary-color));
        box-shadow: 0 0 10px 10px rgba(var(--shadow-color), calc(var(--shadow-opacity) / 4)),
                    0 0 10px 10px rgba(var(--shadow-color), calc(var(--shadow-opacity) / 4)) inset;
    }

    @media (max-width: ${p => `${p.$edWidth + 5 * 2}px`}) {
        & .ql-container {
            margin: 7px 5px;
        }
    }

    ${documentStyles("& .ql-container .ql-editor")}

    & .ql-disabled .ql-editor {
        opacity: 0.5;
        cursor: not-allowed;
    }

    & .ql-disabled .ql-editor * {
        cursor: not-allowed;
        user-select: none;
    }
`;

const DocumentEditor = forwardRef(
    ({ defaultValue, disabled }: QuillEditorProps, ref: QuillRef) => {
        const containerRef = useRef<HTMLDivElement>(null);
        const defaultValueRef = useRef(defaultValue);
        const disabledRef = useRef(disabled);
        const [appContext, appDispatch] = useAppState();
        const [editorContext, editorDispatch] = useEditorState();

        useLayoutEffect(() => {
            defaultValueRef.current = defaultValue;
            disabledRef.current = disabled;

            if (disabled) {
                ref.current?.disable();
            } else {
                ref.current?.enable();
            }
        }, [disabled, defaultValue]);

        useLayoutEffect(() => {
            const q = ref.current;
            if (!q) return;

            const doc = appContext.data.document.current;
            if (!doc) throw "No document found!";

            doc.applyTheme(q.container);

            setTimeout(() => editorDispatch({
                type: "post-width",
                value: q.container.offsetWidth,
            }));
        }, Object.values(makeFullTheme(appContext.data.document.current?.theme || {})));

        useLayoutEffect(() => {
            const q = ref.current;
            if (!q) return;

            const doc = appContext.data.document.current;
            if (!doc) throw "No document found!";

            doc.applyImages(q.container);
        }, [appContext.data.document.current?.images.data.length]);

        useEffect(() => {
            const doc = appContext.data.document.current;
            if (!doc) throw "No document found!";

            const container = forceRef(containerRef);

            const editorContainer = container.appendChild(
                container.ownerDocument.createElement("div"),
            );

            const quill = new Quill(editorContainer, {
                placeholder: defaultValueRef.current,
                modules: {
                    clipboard: { doc: appContext.data.document }
                }
            });

            doc.linkEditor(quill);

            ref.current = quill;

            setTimeout(() => editorDispatch({
                type: "post-width",
                value: quill.container.offsetWidth,
            }));

            quill.on("text-change", (delta, oldContent) => {
                setTimeout(() => {
                    appDispatch({
                        type: "set-doc-x",
                        value: {
                            type: "set-doc-quill-data",
                            value: {
                                delta: oldContent.compose(delta),
                                history: quill.history
                            },
                        },
                    });
                    editorDispatch({
                        type: "post-range",
                        value: quill.getSelection(),
                    });
                });
            });

            quill.on("selection-change", (range) => {
                editorDispatch({
                    type: "post-range",
                    value: range,
                });
            });

            return () => {
                ref.current = null;
                container.innerHTML = "";
            };
        }, [ref, appContext.data.document]);

        return <Editor $edWidth={editorContext.width} ref={containerRef}/>;
    }
);

DocumentEditor.displayName = "QuillEditor";

export default DocumentEditor;

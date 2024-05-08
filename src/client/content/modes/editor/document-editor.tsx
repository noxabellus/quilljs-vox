import { useEffect, useLayoutEffect, useRef } from "react";
import styled from "styled-components";

import Quill from "quill";
import "./quill-extensions";

import { forceRef } from "Support/nullable";

import Document from "Document";
import documentStyles from "Document/styles";

import { useEditorState } from "./state";
import { useAppState } from "../../app/state";


export type QuillEditorProps = {
    defaultValue?: string;
    disabled?: boolean;
}

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

export default function DocumentEditor ({ defaultValue, disabled }: QuillEditorProps) {
    const ref = useRef<Quill | null>(null);
    const [appContext, _appDispatch] = useAppState();
    const [editorContext, editorDispatch] = useEditorState(appContext);
    const containerRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (disabled) {
            ref.current?.disable();
        } else {
            ref.current?.enable();
        }
    }, [disabled]);

    useEffect(() => {
        console.log("setting up quill");
        const container = forceRef(containerRef);

        const editorContainer = container.appendChild(
            container.ownerDocument.createElement("div"),
        );

        const quill = new Quill(editorContainer, {
            placeholder: defaultValue,
            modules: {
                clipboard: {
                    getDoc: () => editorContext.document,
                    notify: () => editorDispatch({ type: "refresh-images" })
                }
            }
        });

        Document.linkEditor(editorContext.document, quill);

        ref.current = quill;

        setTimeout(() => {
            editorDispatch({
                type: "post-quill",
                value: quill,
            });

            editorDispatch({
                type: "post-width",
                value: quill.container.offsetWidth,
            });
        });

        quill.on("text-change", (delta, oldContent) => {
            setTimeout(() => {
                editorDispatch({
                    type: "set-quill-data",
                    value: {
                        delta: oldContent.compose(delta),
                        history: quill.history
                    }
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
            console.log("tearing down quill");
            ref.current = null;
            container.innerHTML = "";
        };
    }, [defaultValue]);

    return <Editor $edWidth={editorContext.details.nodeData.width} ref={containerRef}/>;
}

import { MutableRefObject, forwardRef, useContext, useEffect, useLayoutEffect, useRef } from "react";
import styled from "styled-components";

import Quill from "quill";
import Clipboard from "quill/modules/clipboard";

class ClipboardWrap extends Clipboard {
    constructor (quill: Quill, options: Partial<typeof Clipboard.DEFAULTS>) {
        super(quill, options);
    }

    async onCapturePaste(e: ClipboardEvent) {
        e.preventDefault();
        e.stopPropagation();

        const clipboard = e.clipboardData;
        if (!clipboard) return;

        const tmp = document.createElement("div");
        tmp.innerHTML = clipboard.getData("text/html");

        const images = tmp.querySelectorAll("img");

        for (const img of images) {
            const src = img.src;
            if (!src) continue;

            const result = await toDataURL(src);
            if (Result.isSuccess(result)) {
                const newImg = document.createElement("img");
                newImg.src = result.body;
                img.replaceWith(newImg);
            } else {
                alert(`Failed to load image:\n${Result.problemMessage(result)}`);
            }
        }

        this.dangerouslyPasteHTML(tmp.innerHTML);
    }
}

Quill.register("modules/clipboard", ClipboardWrap as any, true);


import { forceRef } from "../../../support/nullable";
import EditorState from "./state";
import AppState from "../../app/state";
import { applyDocumentTheme } from "../../../support/document-theme";
import Result from "../../../support/result";
import { toDataURL } from "../../../support/xhr";

export type QuillEditorProps = {
    defaultValue?: string;
    disabled?: boolean;
}

type QuillRef = MutableRefObject<Quill | null>;


const Editor = styled.div`
    overflow: scroll;
    scrollbar-width: none;
    flex-grow: 1;

    & .ql-container {
        border: 1px solid rgba(var(--frame-border-color), var(--frame-border-opacity));
        border-radius: 5px;
        margin: 5px auto;
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
        const appContext = useContext(AppState.Context);
        const appDispatch = useContext(AppState.Dispatch);
        const editorDispatch = useContext(EditorState.Dispatch);

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
            if (!ref.current) return;
            const q = ref.current;

            console.log("applying document theme...");

            const doc = appContext.data.document.current;
            if (!doc) throw "No document found!";

            applyDocumentTheme(q.container, doc.theme);

            setTimeout(() => editorDispatch({
                type: "post-width",
                value: q.container.offsetWidth,
            }));
        }, Object.values(appContext.data.document.current?.theme || {}));

        useEffect(() => {
            console.log("setting up quill...");

            const container = forceRef(containerRef);

            const editorContainer = container.appendChild(
                container.ownerDocument.createElement("div"),
            );

            const quill = new Quill(editorContainer, {
                placeholder: defaultValueRef.current
            });

            const doc = appContext.data.document.current;
            if (!doc) throw "No document found!";
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
                });
            });

            quill.on("selection-change", (range) => {
                editorDispatch({
                    type: "post-range",
                    value: range,
                });
            });

            return () => {
                console.log("cleaning up quill...");
                ref.current = null;
                container.innerHTML = "";
            };
        }, [ref, appContext.data.document]);

        return <Editor ref={containerRef}/>;
    }
);

DocumentEditor.displayName = "QuillEditor";

export default DocumentEditor;

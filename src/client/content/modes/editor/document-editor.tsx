import { useEffect, useLayoutEffect, useRef } from "react";
import styled from "styled-components";

import Quill from "Extern/quill";

import { forceRef } from "Support/nullable";

import documentStyles from "Document/styles";

import { useEditorState } from "./state";
import { useAppState } from "../../app/state";
import { BLACK_LISTED_SHORTCUT_KEYS } from "./types";


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

        ref.current = quill;

        setTimeout(() => {
            editorDispatch({
                type: "post-quill",
                value: quill,
            });

            // hack to mitigate a visual bug;
            // when the document takes a while to load,
            // the width is not available for some time
            setTimeout(() => {
                editorDispatch({
                    type: "post-width",
                    value: quill.container.offsetWidth,
                });
            }, 500);
        });

        quill.root.addEventListener("keydown", (e: KeyboardEvent) => {
            if (BLACK_LISTED_SHORTCUT_KEYS.includes(e.key)) return;

            const modifiers = {
                ctrl: e.ctrlKey,
                alt: e.altKey,
                shift: e.shiftKey
            };

            if (!Object.values(modifiers).some(a => a)) return;

            e.preventDefault();
            e.stopPropagation();

            editorDispatch({
                type: "keyboard-shortcut",
                value: {
                    key: e.key,
                    modifiers,
                }
            });
        });

        quill.on("editor-change", (eventName, ...args: any[]) => {
            if (eventName == "text-change") {
                const [delta, oldContent] = args;
                editorDispatch({
                    type: "set-quill-data",
                    value: {
                        delta: oldContent.compose(delta),
                        history: quill.history
                    }
                });
            } else {
                const [range] = args;
                editorDispatch({
                    type: "post-range",
                    value: range,
                });
            }
        });

        return () => {
            console.log("tearing down quill");
            ref.current = null;
            container.innerHTML = "";
        };
    }, [defaultValue]);

    return <Editor $edWidth={editorContext.details.nodeData.width} ref={containerRef}/>;
}

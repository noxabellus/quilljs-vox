import { MutableRefObject, forwardRef, useContext, useEffect, useLayoutEffect, useRef } from "react";
import styled from "styled-components";

import Quill from "quill";
import Clipboard from "quill/modules/clipboard";

import { EmbedBlot, Root } from  "parchment";
import { sanitize } from "quill/formats/link";

const ATTRIBUTES = ["alt", "height", "width"];

class Image extends EmbedBlot {
    static blotName = "image";
    static tagName = "IMG";

    constructor (scroll: Root, domNode: Node) {
        console.log("constructor");
        super(scroll, domNode);
    }

    static create(value: any) {
        const node = document.createElement("img");

        if (typeof value === "string") {
            node.dataset.imgId = value;
        }

        console.log("created");

        return node;
    }

    static formats(domNode: Element) {
        console.log("formats");
        return ATTRIBUTES.reduce((formats: Record<string, string | null>, attribute) => {
            console.log("reduce", formats, attribute);

            if (domNode.hasAttribute(attribute)) {
                formats[attribute] = domNode.getAttribute(attribute);
            }

            return formats;
        }, {});
    }

    static match(url: string) {
        return /\.(jpe?g|gif|png)$/.test(url) || /^data:image\/.+;base64/.test(url);
    }

    static sanitize(url: string) {
        return sanitize(url, ["http", "https", "data"]) ? url : "";
    }

    static value(domNode: HTMLImageElement) {
        console.log("value");
        console.log("domNode", domNode);
        const src = domNode.getAttribute("src");
        domNode.src = "";
        return domNode.dataset.imgId || (console.log("fuck me", src), src);
    }

    format(name: string, value: string) {
        console.log("begin format");
        const node = this.domNode as Element;
        if (ATTRIBUTES.indexOf(name) > -1) {
            if (value) {
                node.setAttribute(name, value);
            } else {
                node.removeAttribute(name);
            }
        } else {
            super.format(name, value);
        }
        console.log("end format");
    }
}

class ClipboardWrap extends Clipboard {
    doc: MutableRefObject<Document>;

    constructor (quill: Quill, options: Partial<typeof Clipboard.DEFAULTS> & {doc: MutableRefObject<Document>}) {
        super(quill, {...options, matchers: [
            // ["img", (node, delta) => {
            //     return delta;
            // }]
        ]});
        this.doc = options.doc;
    }

    async onCapturePaste(e: ClipboardEvent) {
        e.preventDefault();
        e.stopPropagation();

        const doc = this.doc.current;
        if (!doc) throw "No document found!";

        const clipboard = e.clipboardData?.getData("text/html");
        if (!clipboard) return;

        const tmp = document.createElement("div");
        tmp.innerHTML = clipboard;

        const images = tmp.querySelectorAll("img");

        for (const img of images) {
            const src = img.src;
            if (src.startsWith("data:")) continue;

            const result = await doc.registerImage(src);
            if (Result.isSuccess(result)) {
                console.log("replacing image...");
                img.src = `${result.body}`;
                console.log("womp");
            } else {
                alert(`Failed to load image "${img.src}":\n\t${Result.problemMessage(result)}`);
            }
        }

        const selection = this.quill.getSelection();

        if (!selection) return;

        const paste = this.convertHTML(tmp.innerHTML);

        const delta = [
            {retain: selection.index},
            {delete: selection.length},
            ...paste.ops,
        ];

        console.log("output");
        this.quill.updateContents(delta, "user");
        this.quill.setSelection(selection.index + paste.transformPosition(0), 0, "silent");
    }
}

Quill.register("modules/clipboard", ClipboardWrap as any);
Quill.register("formats/image", Image);

import { forceRef } from "../../../support/nullable";
import EditorState from "./state";
import AppState from "../../app/state";
import Result from "../../../support/result";
import Document from "../../../support/document";

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
            const q = ref.current;
            if (!q) return;

            console.log("applying document theme...");

            const doc = appContext.data.document.current;
            if (!doc) throw "No document found!";

            doc.applyTheme(q.container);

            setTimeout(() => editorDispatch({
                type: "post-width",
                value: q.container.offsetWidth,
            }));
        }, Object.values(appContext.data.document.current?.theme || {}));

        useLayoutEffect(() => {
            const q = ref.current;
            if (!q) return;

            const doc = appContext.data.document.current;
            if (!doc) throw "No document found!";

            doc.applyImages(q.container);
        }, [appContext.data.document.current?.images.data.length]);

        useEffect(() => {
            console.log("setting up quill...");

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

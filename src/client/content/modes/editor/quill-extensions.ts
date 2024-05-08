import Quill from "quill";
import Clipboard from "quill/modules/clipboard";
import { sanitize } from "quill/formats/link";
import { EmbedBlot, Root } from  "parchment";

import Result from "Support/result";

import Document from "Document";


const ATTRIBUTES = ["title", "alt", "height", "width"];

class Image extends EmbedBlot {
    static blotName = "image";
    static tagName = "IMG";

    constructor (scroll: Root, domNode: Node) {
        super(scroll, domNode);
    }

    static create(value: any) {
        const node = document.createElement("img");

        node.dataset.imgId = value;

        return node;
    }

    static formats(domNode: Element) {
        return ATTRIBUTES.reduce((formats: Record<string, string | null>, attribute) => {
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
        return domNode.dataset.imgId;
    }

    format(name: string, value: string) {
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
    }
}

class ClipboardWrap extends Clipboard {
    doc: Document;
    notify: () => void;

    constructor (quill: Quill, options: Partial<typeof Clipboard.DEFAULTS> & {doc: Document, notify: () => void}) {
        super(quill, {...options, matchers: [
            // ["img", (node, delta) => {
            //     return delta;
            // }]
        ]});
        this.doc = options.doc;
        this.notify = options.notify;
    }

    async onCapturePaste(e: ClipboardEvent) {
        e.preventDefault();
        e.stopPropagation();

        const clipboard = e.clipboardData?.getData("text/html");
        if (!clipboard) return;

        const tmp = document.createElement("div");
        tmp.innerHTML = clipboard;

        const images = tmp.querySelectorAll("img");

        for (const img of images) {
            const src = img.src;

            if (src === "") {
                const id = parseInt(img.dataset.imgId || "");

                if (isNaN(id)) {
                    alert("pasted image has no source or imgId");
                } else if (!Document.hasImage(this.doc, id)) {
                    alert(`pasted image must belong to another document, the imgId ${id} is not bound in this document`);
                } else {
                    continue;
                }

                return;
            }

            const result = await Document.registerImage(this.doc, src);
            if (Result.isSuccess(result)) {
                img.src = "";
                img.title = img.alt;
                img.dataset.imgId = `${result.body}`;
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

        this.quill.updateContents(delta, "user");
        this.quill.setSelection(selection.index + paste.transformPosition(0), 0, "silent");
        setTimeout(() => this.notify());
    }
}

Quill.register("modules/clipboard", ClipboardWrap as any);
Quill.register("formats/image", Image);

import Quill from "quill/core/quill";
import Clipboard from "quill/modules/clipboard";

import Result from "Support/result";

import Document from "Document";


export default class ClipboardWrap extends Clipboard {
    getDoc: () => Document;
    notify: () => void;

    constructor (quill: Quill, options: Partial<typeof Clipboard.DEFAULTS> & {getDoc: () => Document, notify: () => void}) {
        super(quill, {...Clipboard.DEFAULTS, ...options});
        this.getDoc = options.getDoc;
        this.notify = options.notify;
    }

    async onCapturePaste(e: ClipboardEvent) {
        e.preventDefault();
        e.stopPropagation();

        const doc = this.getDoc();

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
                } else if (!Document.hasImage(doc, id)) {
                    alert(`pasted image must belong to another document, the imgId ${id} is not bound in this document`);
                } else {
                    continue;
                }

                return;
            }

            const result = await Document.registerImage(doc, src);
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
        this.notify();
    }
}

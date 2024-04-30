import Quill from "quill";
import { saveHtml, writeVox } from "../../support/file";
import Widget from "../../support/widget";
import Settings from "../../support/settings";
import Document from "../../support/document";
import Result from "../../support/result";

import editorHeaderSrc from "./editor-header.html";
import editorBodySrc from "./editor-body.html";

import { html_beautify } from "js-beautify";
import { PathLike } from "original-fs";

export default function Element(filePath: PathLike, doc: Document, container = document.body) {
    const editorHeaderElem = Widget(editorHeaderSrc);
    const editorBodyElem = Widget(editorBodySrc);

    const userContentElem: HTMLElement = editorBodyElem.querySelector("#user-content");
    const documentToolbarElem: HTMLElement = editorHeaderElem.querySelector("#document-toolbar");
    const settingsToggleElem: HTMLButtonElement = documentToolbarElem.querySelector("button.settings-toggle");
    const documentSettingsElem: HTMLElement = editorHeaderElem.querySelector("#document-settings");
    const exportElem: HTMLButtonElement = documentToolbarElem.querySelector("button.export");
    const disableButtonElems: NodeListOf<HTMLButtonElement> = documentToolbarElem.querySelectorAll("button:not(.no-lock)");
    const alignToggleElem: HTMLButtonElement = documentToolbarElem.querySelector("button.align-toggle");
    const alignDropdownElem: HTMLElement = documentToolbarElem.querySelector("#align-dropdown");
    const alignDropdownElems: NodeListOf<HTMLButtonElement> = alignDropdownElem.querySelectorAll("button");

    const documentSettings = Settings(documentSettingsElem, {
        "width": [960, parseInt, (v) => userContentElem.style.width = `${v}px`],
        "padding": [20, parseInt, (v) => userContentElem.style.padding = `${v}px`],
    });

    const quill = new Quill(userContentElem, {
        modules: {
            toolbar: documentToolbarElem,
            history: {
                delay: 1000,
                maxStack: Infinity,
                userOnly: false,
            }
        }
    });

    let saved = true;
    let autoSave = true;

    disableButtonElems.forEach(elem => {
        elem.disabled = true;
    });

    doc.linkEditor(quill);

    exportElem.addEventListener("click", async () => {
        // TODO: document title
        const html = html_beautify(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>${doc.title}</title>
                <style>${doc.generateStyles()}</style>
            </head>
            <body>${quill.root.innerHTML}</body>
            </html>
        `, { /* eslint-disable camelcase */
            indent_size: 4,
            wrap_line_length: 80,
            wrap_attributes: "auto",
            wrap_attributes_indent_size: 2,
            end_with_newline: true,
            preserve_newlines: true,
            max_preserve_newlines: 2,
            indent_inner_html: true,
            extra_liners: [],
        } /* eslint-enable camelcase */);

        exportElem.disabled = true;

        const res = await saveHtml(html);

        if (Result.isError(res)) {
            alert(`failed to export HTML file:\n${res.body}`);
        }

        exportElem.disabled = false;
    });

    settingsToggleElem.addEventListener("click", () => {
        documentSettingsElem.style.top = `${settingsToggleElem.offsetTop}px`;
        documentSettingsElem.style.left = `${settingsToggleElem.offsetLeft}px`;
        documentSettingsElem.classList.add("visible");
        quill.blur();
    });

    documentSettingsElem.addEventListener("mouseleave", () => {
        documentSettingsElem.classList.remove("visible");
    });

    alignToggleElem.addEventListener("click", () => {
        alignDropdownElem.style.top = `${alignToggleElem.offsetTop}px`;
        alignDropdownElem.style.left = `${alignToggleElem.offsetLeft}px`;
        alignDropdownElem.style.width = `${alignToggleElem.offsetWidth}px`;
        alignDropdownElem.classList.add("visible");
        quill.focus();
    });

    alignDropdownElem.addEventListener("mouseleave", () => {
        alignDropdownElem.classList.remove("visible");
    });

    alignDropdownElems.forEach(elem => {
        elem.addEventListener("click", _ => {
            const selection = quill.getSelection();
            const currentAlign = quill.getFormat(selection).align;
            alignDropdownElem.classList.remove("visible");
            if (currentAlign == elem.value) {
                quill.focus();
                return;
            }
            alignToggleElem.innerHTML = elem.innerHTML;
            quill.format("align", elem.value);
        });
    });

    quill.on("selection-change", (range, _oldRange, _source) => {
        if (range === null) {
            disableButtonElems.forEach(elem => {
                elem.disabled = true;
            });
            return;
        } else {
            disableButtonElems.forEach(elem => {
                elem.disabled = false;
            });
        }

        switch (quill.getFormat(range).align) {
            case "center": alignToggleElem.innerHTML = "Center"; break;
            case "right": alignToggleElem.innerHTML = "Right"; break;
            case "justify": alignToggleElem.innerHTML = "Justify"; break;
            default: alignToggleElem.innerHTML = "Left"; break;
        }
    });

    quill.on("text-change", (delta, oldDelta, _source) => {
        doc.delta = oldDelta.compose(delta).ops;
        saved = false;
    });

    const intervalId = setInterval(saveFile, 3000);
    async function saveFile() {
        if (!saved) {
            const fileRes = await writeVox(filePath, doc);

            if (Result.isSuccess(fileRes)) {
                saved = true;
                console.log("saved file", filePath);
            } else {
                alert(`failed to save file, stopping auto-save:\n${Result.problemMessage(fileRes)}`);
                autoSave = false;
                clearInterval(intervalId);
            }
        }
    }

    container.append(editorHeaderElem, editorBodyElem);

    return {
        header: editorHeaderElem,
        body: editorBodyElem,
        settings: documentSettings,
        quill,
        doc,
        close() {
            clearInterval(intervalId);
            if (autoSave) {
                saveFile();
            }

            this.header.remove();
            this.body.remove();
            this.settings = null;
            this.quill = null;
            this.doc = null;
        }
    };
}

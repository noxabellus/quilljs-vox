import Quill from "quill";
import { saveHtml, writeVox } from "../../support/file";
import Widget from "../../support/widget";
import Settings from "../../support/settings";
import Document from "../../support/document";
import Result from "../../support/result";

import editor_header_src from "./editor-header.html";
import editor_body_src from "./editor-body.html";

import { html_beautify } from "js-beautify";
import { PathLike } from "original-fs";

export default function Element(filePath: PathLike, doc: Document, container = document.body) {
    const editor_header_elem = Widget(editor_header_src);
    const editor_body_elem = Widget(editor_body_src);

    const user_content_elem: HTMLElement = editor_body_elem.querySelector("#user-content");
    const document_toolbar_elem: HTMLElement = editor_header_elem.querySelector("#document-toolbar");
    const settings_toggle_elem: HTMLButtonElement = document_toolbar_elem.querySelector("button.settings-toggle");
    const document_settings_elem: HTMLElement = editor_header_elem.querySelector("#document-settings");
    const export_elem: HTMLButtonElement = document_toolbar_elem.querySelector("button.export");
    const disable_button_elems: NodeListOf<HTMLButtonElement> = document_toolbar_elem.querySelectorAll("button:not(.no-lock)");
    const align_toggle_elem: HTMLButtonElement = document_toolbar_elem.querySelector("button.align-toggle");
    const align_dropdown_elem: HTMLElement = document_toolbar_elem.querySelector("#align-dropdown");
    const align_dropdown_elems: NodeListOf<HTMLButtonElement> = align_dropdown_elem.querySelectorAll("button");

    const document_settings = Settings(document_settings_elem, {
        "width": [960, parseInt, (v) => user_content_elem.style.width = `${v}px`],
        "padding": [20, parseInt, (v) => user_content_elem.style.padding = `${v}px`],
    });

    const quill = new Quill(user_content_elem, {
        modules: {
            toolbar: document_toolbar_elem,
            history: {
                delay: 1000,
                maxStack: Infinity,
                userOnly: false,
            }
        }
    });

    let saved = true;
    let auto_save = true;
    
    disable_button_elems.forEach(elem => {
        elem.disabled = true;
    });

    doc.linkEditor(quill);

    export_elem.addEventListener("click", async () => {
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
        `, {
            indent_size: 4,
            wrap_line_length: 80,
            wrap_attributes: "auto",
            wrap_attributes_indent_size: 2,
            end_with_newline: true,
            preserve_newlines: true,
            max_preserve_newlines: 2,
            indent_inner_html: true,
            extra_liners: [],
        });

        export_elem.disabled = true;
        
        const res = await saveHtml(html);

        if (Result.is_error(res)) {
            alert(`failed to export HTML file:\n${res.body}`);
        }

        export_elem.disabled = false;
    });

    settings_toggle_elem.addEventListener("click", () => {
        document_settings_elem.style.top = `${settings_toggle_elem.offsetTop}px`;
        document_settings_elem.style.left = `${settings_toggle_elem.offsetLeft}px`;
        document_settings_elem.classList.add("visible");
        quill.blur();
    });

    document_settings_elem.addEventListener("mouseleave", () => {
        document_settings_elem.classList.remove("visible");
    });

    align_toggle_elem.addEventListener("click", () => {
        align_dropdown_elem.style.top = `${align_toggle_elem.offsetTop}px`;
        align_dropdown_elem.style.left = `${align_toggle_elem.offsetLeft}px`;
        align_dropdown_elem.style.width = `${align_toggle_elem.offsetWidth}px`;
        align_dropdown_elem.classList.add("visible");
        quill.focus();
    });

    align_dropdown_elem.addEventListener("mouseleave", () => {
        align_dropdown_elem.classList.remove("visible");
    });

    align_dropdown_elems.forEach(elem => {
        elem.addEventListener("click", (e) => {
            const selection = quill.getSelection();
            const currentAlign = quill.getFormat(selection).align;
            align_dropdown_elem.classList.remove("visible");
            if (currentAlign == elem.value) {
                quill.focus();
                return;
            }
            align_toggle_elem.innerHTML = elem.innerHTML;
            quill.format("align", elem.value);
        });
    });

    quill.on("selection-change", (range, _oldRange, _source) => {
        if (range === null) {
            disable_button_elems.forEach(elem => {
                elem.disabled = true;
            });
            return;
        } else {
            disable_button_elems.forEach(elem => {
                elem.disabled = false;
            });
        }

        switch (quill.getFormat(range).align) {
            case "center": align_toggle_elem.innerHTML = "Center"; break;
            case "right": align_toggle_elem.innerHTML = "Right"; break;
            case "justify": align_toggle_elem.innerHTML = "Justify"; break;
            default: align_toggle_elem.innerHTML = "Left"; break;
        }
    });

    quill.on("text-change", (delta, oldDelta, _source) => {
        doc.delta = oldDelta.compose(delta).ops;
        saved = false;
    });

    const intervalId = setInterval(saveFile, 3000);
    async function saveFile() {
        if (!saved) {
            const file_res = await writeVox(filePath, doc);

            if (Result.is_success(file_res)) {
                saved = true;
                console.log("saved file", filePath);
            } else {
                alert(`failed to save file, stopping auto-save:\n${Result.unsuccessful_message(file_res)}`);
                auto_save = false;
                clearInterval(intervalId);
            }
        }
    }

    container.append(editor_header_elem, editor_body_elem);

    return {
        header: editor_header_elem,
        body: editor_body_elem,
        settings: document_settings,
        quill,
        doc,
        close() {
            clearInterval(intervalId);
            if (auto_save) {
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
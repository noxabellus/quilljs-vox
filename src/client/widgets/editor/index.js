import Quill from 'quill';
import { writeVox } from '../../support/file.js';
import { terminal } from '../../support/remote.js';
import Widget from "../../support/widget.js";
import Settings from "../../support/settings.js";

import editor_header_src from "./editor-header.html";
import editor_body_src from "./editor-body.html";
import { loadHistoryStack } from '../../support/history.js';

export default function Element(filePath, state, container = document.body) {
    const editor_header_elem = Widget(editor_header_src);
    const editor_body_elem = Widget(editor_body_src);

    container.append(editor_header_elem, editor_body_elem);

    const user_content_elem = editor_body_elem.querySelector("#user-content");
    const document_toolbar_elem = editor_header_elem.querySelector("#document-toolbar");
    const settings_toggle_elem = document_toolbar_elem.querySelector("button.settings-toggle");
    const document_settings_elem = editor_header_elem.querySelector("#document-settings");

    const document_settings = Settings(document_settings_elem, {
        "width": [960, parseInt, (v) => user_content_elem.style.width = `${v}px`],
        "padding": [20, parseInt, (v) => user_content_elem.style.padding = `${v}px`],
    })

    const disable_button_elems =
        document_toolbar_elem.querySelectorAll("button:not(.settings-toggle)");
    disable_button_elems.forEach(elem => {
        elem.disabled = true;
    });

    const align_toggle_elem =
        document_toolbar_elem.querySelector("button.align-toggle");

    const align_dropdown_elem =
        document_toolbar_elem.querySelector("#align-dropdown");

    const align_dropdown_elems =
        align_dropdown_elem.querySelectorAll("button");

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

    quill.setContents(state.delta);
    loadHistoryStack(state.history, quill);
    state.history = quill.history.stack;

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

    quill.on('selection-change', (range, _oldRange, _source) => {
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

    quill.on('text-change', (delta, oldDelta, _source) => {
        state.delta = oldDelta.compose(delta);
        saved = false;
    });
    
    const intervalId = setInterval(saveFile, 3000);
    async function saveFile() {
        if (!saved) {
            const file_res = await writeVox(filePath, state);

            if (file_res.is_success()) {
                saved = true;
                console.log("saved file", filePath);
            } else {
                alert("failed to save file, stopping auto-save", file_res.body);
                auto_save = false;
                clearInterval(intervalId);
            }
        }
    }

    return {
        header: editor_header_elem,
        body: editor_body_elem,
        settings: document_settings,
        quill,
        close() {
            clearInterval(intervalId);
            if (auto_save) {
                saveFile();
            }

            this.header.remove();
            this.body.remove();
            this.settings = null;
            this.quill = null;
        }
    };
}
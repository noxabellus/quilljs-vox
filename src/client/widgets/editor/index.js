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

    settings_toggle_elem.addEventListener("mouseenter", () => {
        document_settings_elem.style.top = `${settings_toggle_elem.offsetTop}px`;
        document_settings_elem.style.left = `${settings_toggle_elem.offsetLeft}px`;
        document_settings_elem.classList.add("visible");
    });

    document_settings_elem.addEventListener("mouseleave", () => {
        document_settings_elem.classList.remove("visible");
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
    
    quill.setContents(state.delta);
    loadHistoryStack(state.history, quill);
    state.history = quill.history.stack;

    let saved = false;
    let auto_save = true;
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
                terminal.log("saved file", filePath);
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
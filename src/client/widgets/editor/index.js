import Quill from 'quill';
import { openVox, saveVox } from '../../support/file.js';
import { terminal } from '../../support/remote.js';
import Widget from "../../support/widget.js";
import Settings from "../../support/settings.js";

import editor_header_src from "./editor-header.html";
import editor_body_src from "./editor-body.html";

export default async function Element(container = document.body) {
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

    // const file = await openVox();

    // console.log(file);

    // const out = { test: 1, test2: "foo" };
    // console.log(await saveVox(out));

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

    quill.on('text-change', (delta, oldDelta, source) => {
        if (source == 'api') {
            terminal.log('An API call triggered this change.');
        } else if (source == 'user') {
            terminal.log('A user action triggered this change.');
        }
        terminal.log("new", delta);
        terminal.log("old", oldDelta);
        terminal.log(oldDelta.compose(delta));
    });

    return {
        header: editor_header_elem,
        body: editor_body_elem,
        settings: document_settings,
        quill,
    };
}
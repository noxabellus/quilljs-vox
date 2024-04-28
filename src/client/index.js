import Quill from 'quill';
import { openVox, saveVox } from './support/file.js';
import { terminal } from './support/remote.js';

import editor_header from "./widgets/editor-header.html"
import editor from "./widgets/editor.html"

document.body.append(editor_header, editor);

const size_control = editor_header.querySelector("#size-control");

const size_guide = size_control.appendChild(document.createElement("div"));
size_guide.id = "size-guide";

const size_hover = size_control.appendChild(document.createElement("div"));
size_hover.id = "size-hover";
size_hover.style.top = "-8px";
size_hover.style.width = "0px";

const size_text = size_control.appendChild(document.createElement("div"));
size_text.id = "size-text";
size_text.innerText = "960px";


let editor_width = 960;
function setWidth () {
    size_guide.style.width = `${editor_width}px`;
    editor.minWidth = `${editor_width}px`;
    editor.querySelector("#user-content").style.width = `${editor_width}px`;
};
setWidth();

size_control.addEventListener("mousemove", (event) => {
    const width = getComputedStyle(document.body).width;
    const half_width = parseFloat(width) / 2.0;
    const calc = Math.floor(Math.abs(event.pageX - half_width));
    size_hover.style.left = `${half_width - calc}px`;
    editor_width = calc * 2.0;
    size_hover.style.width = `${editor_width}px`;
    size_text.innerText = `${editor_width}px`;
});

size_control.addEventListener("click", setWidth);

// const file = await openVox();

// console.log(file);

// const out = { test: 1, test2: "foo" };
// console.log(await saveVox(out));

const quill = new Quill(editor.querySelector("#user-content"), {
    modules: {
        toolbar: editor_header.querySelector("#toolbar"),
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
});


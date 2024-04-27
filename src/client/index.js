import Quill from 'quill';
import { openFile, saveFile } from './editor/file.js';
import { terminal } from './editor/remote.js';

const file = await openFile();

console.log(file);

const out = { test: 1, test2: "foo" };
console.log(await saveFile(out));


const quill = new Quill('#editor', {
    modules: {
        toolbar: "#toolbar",
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


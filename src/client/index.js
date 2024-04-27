import Quill from 'quill';
import * as remote from '@electron/remote'


const con = remote.app.console;

const quill = new Quill('#editor', {
    modules: {
        toolbar: "#toolbar"
    }
});

quill.on('text-change', (delta, oldDelta, source) => {
    if (source == 'api') {
        con.log('An API call triggered this change.');
    } else if (source == 'user') {
        con.log('A user action triggered this change.');
    }
    con.log("new", delta);
    con.log("old", oldDelta);
});
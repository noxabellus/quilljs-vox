import { Delta } from 'quill';

export function loadHistoryStack (stack, editor) {
    stack.undo.forEach(elem => 
        editor.history.stack.undo.push({
            redo: new Delta(elem.redo.ops),
            undo: new Delta(elem.undo.ops),
        })
    );

    stack.redo.forEach(elem =>
        editor.history.stack.redo.push({
            redo: new Delta(elem.redo.ops),
            undo: new Delta(elem.undo.ops),
        })
    );
}

export default {
    loadHistoryStack,
};
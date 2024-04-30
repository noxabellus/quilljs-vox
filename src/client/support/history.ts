import Delta from "quill-delta";
import { ProtoHistory, History } from "./document";
import Quill from "quill";

export function loadHistoryStack (stack: ProtoHistory | History, quill: Quill) {
    quill.history.stack.undo = [];
    quill.history.stack.redo = [];

    stack.undo.forEach(elem =>
        quill.history.stack.undo.push({
            delta: new Delta(elem.delta),
            range: elem.range,
        })
    );

    stack.redo.forEach(elem =>
        quill.history.stack.redo.push({
            delta: new Delta(elem.delta),
            range: elem.range,
        })
    );
}

export default {
    loadHistoryStack,
};

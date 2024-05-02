import Quill, { Range } from "quill";
import Delta from "quill-delta";
import { useRef, useState } from "react";
import { unsafeForceVal } from "../../support/nullable";
import { DEFAULT_EDITOR_CONTEXT, EditorAlignment, EditorContext } from "./context";
import DocumentEditor from "./document-editor";
import EditorToolbar from "./toolbar";


export default function Editor () {
    const quillRef = useRef<Quill>(null);

    const [context, setContext] = useState({ ...DEFAULT_EDITOR_CONTEXT });

    const updateContext = (q: Quill, range: Range | null) => {
        if (!range) {
            setContext(ctx => {
                return {
                    ...ctx,
                    focused: false,
                    bold: false,
                    italic: false,
                    underline: false,
                    strike: false,
                    align: "left",
                    range: null,
                };
            });
        } else {
            const formats = q.getFormat(range);
            setContext(ctx => {
                return {
                    ...ctx,
                    focused: true,
                    bold: !!formats.bold,
                    italic: !!formats.italic,
                    underline: !!formats.underline,
                    strike: !!formats.strike,
                    align: (formats.align || "left") as EditorAlignment,
                    range,
                };
            });
        }
    };

    return <>
        <EditorContext.Provider value={context}>
            <EditorToolbar ref={quillRef} />
        </EditorContext.Provider>
        <DocumentEditor
            ref={quillRef}
            defaultValue={new Delta()
                .insert("Hello")
                .insert("\n", { header: 1 })
                .insert("Some ")
                .insert("initial", { bold: true })
                .insert(" ")
                .insert("content", { underline: true })
                .insert("\n")}
            onSelectionChange={(range, _oldRange, _source) => {
                const q = unsafeForceVal(quillRef.current);
                updateContext(q, range);
            } }
            onTextChange={(_delta, _oldDelta, _source) => {
                const q = unsafeForceVal(quillRef.current);
                const range = q.getSelection();
                updateContext(q, range);
            } } />
    </>;
};

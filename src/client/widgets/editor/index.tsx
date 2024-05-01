import Quill, { Delta,  Range } from "quill/core";
import { MutableRefObject, forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import { forceRef } from "../../support/nullable";

type EditorProps = {
    readOnly: boolean;
    defaultValue: Delta;
    onTextChange: (delta: Delta, oldDelta: Delta, source: string) => void;
    onSelectionChange: (range: Range, oldRange: Range, source: string) => void;
}

type QuillRef = MutableRefObject<Quill | null>;

const Editor = forwardRef(
    ({ readOnly, defaultValue, onTextChange, onSelectionChange }: EditorProps, ref: QuillRef) => {
        const containerRef = useRef<HTMLDivElement>(null);
        const defaultValueRef = useRef(defaultValue);
        const onTextChangeRef = useRef(onTextChange);
        const onSelectionChangeRef = useRef(onSelectionChange);

        useLayoutEffect(() => {
            onTextChangeRef.current = onTextChange;
            onSelectionChangeRef.current = onSelectionChange;
        });

        useEffect(() => {
            ref.current?.enable(!readOnly);
        }, [ref, readOnly]);

        useEffect(() => {
            const container = forceRef(containerRef);

            const editorContainer = container.appendChild(
                container.ownerDocument.createElement("div"),
            );

            const quill = new Quill(editorContainer);

            ref.current = quill;

            if (defaultValueRef.current) {
                quill.setContents(defaultValueRef.current);
            }

            quill.on("text-change", (...args) => {
                onTextChangeRef.current?.(...args);
            });

            quill.on("selection-change", (...args) => {
                onSelectionChangeRef.current?.(...args);
            });

            return () => {
                ref.current = null;
                container.innerHTML = "";
            };
        }, [ref]);

        return <div ref={containerRef}></div>;
    }
);

Editor.displayName = "Editor";

export default Editor;

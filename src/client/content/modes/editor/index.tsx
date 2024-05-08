import Body from "Elements/body";

import { useAppState } from "../../app/state";

import EditorState from "./state";
import * as EditorTypes from "./types";
import DocumentEditor from "./document-editor";
import EditorToolbar from "./toolbar";
import DocumentSettings from "./document-settings";


export default function Editor ({documentId}: {documentId: number}) {
    const [appContext, appDispatch] = useAppState();

    function editorDispatch (action: EditorTypes.Action) {
        appDispatch({
            type: "editor-action",
            value: {
                documentId,
                action,
            },
        });
    }

    return <EditorState documentId={documentId} dispatch={editorDispatch}>
        <Body>
            <EditorToolbar />
            <DocumentEditor disabled={appContext.lockIO}/>
            {appContext.editors[documentId].overlays.settings && <DocumentSettings key="doc-settings"/>}
        </Body>
    </EditorState>;
};

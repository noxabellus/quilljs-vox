import { Dispatch, ReactNode, createContext, useContext } from "react";

import * as AppTypes from "../../app/types";
import { Context, Action } from "./types";

import Document from "Document";



export type EditorDispatch = (action: Action) => void;

const Context = createContext<number>(undefined as any);
const Dispatch = createContext<EditorDispatch>(() => {
    throw "No provider found for EditorDispatch!";
});

export type EditorStateProps = {
    documentId: number;
    dispatch: EditorDispatch;
    children: ReactNode[] | ReactNode;
}

export default function EditorState ({documentId, dispatch, children}: EditorStateProps) {
    return <Context.Provider value={documentId}>
        <Dispatch.Provider value={dispatch}>
            {children}
        </Dispatch.Provider>
    </Context.Provider>;
}

export function useEditorState (appContext: AppTypes.Context) {
    return [appContext.editors[useContext(Context)], useContext(Dispatch)] as const;
}

EditorState.Context = Context;
EditorState.Dispatch = Dispatch;


export function dataIsDirty (documentId: number, context: AppTypes.Context) {
    return context.editors[documentId].lastUpdated > context.editors[documentId].lastSaved;
}

export function dataNeedsSave (documentId: number, context: AppTypes.Context) {
    if (context.editors[documentId].startedFromBlankDocument === true && (Document.isBlank(context.editors[documentId].document) ?? true)) return false;
    return dataIsDirty(documentId, context);
}

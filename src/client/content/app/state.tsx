import { Dispatch, ReactNode, createContext, useContext } from "react";

import { Context, Action } from "./types";

import * as EditorState from "../modes/editor/state";


const Context = createContext<Context>(undefined as any);
const Dispatch = createContext<Dispatch<Action>>(() => {
    throw "No provider found for AppDispatch!";
});

export type AppStateTypes = {
    context: Context,
    dispatch: Dispatch<Action>,
    children: ReactNode[] | ReactNode,
}

export default function AppState ({context, dispatch, children}: AppStateTypes) {
    return <Context.Provider value={context}>
        <Dispatch.Provider value={dispatch}>
            {children}
        </Dispatch.Provider>
    </Context.Provider>;
}

export function useAppState () {
    return [useContext(Context), useContext(Dispatch)] as const;
}

export function dataIsDirty (appContext: Context) {
    return appContext.editors.some(editor => EditorState.dataIsDirty(editor.documentId, appContext));
}

export function dataNeedsSave (appContext: Context) {
    return appContext.editors.some(editor => EditorState.dataNeedsSave(editor.documentId, appContext));
}

AppState.Context = Context;
AppState.Dispatch = Dispatch;
AppState.useAppState = useAppState;
AppState.dataIsDirty = dataIsDirty;
AppState.dataNeedsSave = dataNeedsSave;

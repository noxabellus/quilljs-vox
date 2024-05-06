import { Dispatch, ReactNode, createContext, useContext } from "react";
import { EditorContext, DEFAULT_EDITOR_CONTEXT, EditorStateAction } from "./types";

const Context = createContext<EditorContext>(DEFAULT_EDITOR_CONTEXT);
const Dispatch = createContext<Dispatch<EditorStateAction>>(() => {
    throw "No provider found for EditorDispatch!";
});

export type EditorStateProps = {
    context: EditorContext;
    dispatch: Dispatch<EditorStateAction>;
    children: ReactNode[] | ReactNode;
}

export default function EditorState ({context, dispatch, children}: EditorStateProps) {
    return <Context.Provider value={context}>
        <Dispatch.Provider value={dispatch}>
            {children}
        </Dispatch.Provider>
    </Context.Provider>;
}

export function useEditorState () {
    return [useContext(Context), useContext(Dispatch)] as const;
}

EditorState.Context = Context;
EditorState.Dispatch = Dispatch;

import { Dispatch, ReactNode, createContext } from "react";
import { AppContext, AppStateAction } from "./types";

const Context = createContext<AppContext>({
    mode: "splash",
    data: {} as any,
    settings: null
});

const Dispatch = createContext<Dispatch<AppStateAction>>(() => {
    throw "No provider found for AppDispatch!";
});

export type AppStateProps = {
    context: AppContext;
    dispatch: Dispatch<AppStateAction>;
    children: ReactNode[] | ReactNode;
}

export default function AppState ({context, dispatch, children}: AppStateProps) {
    return <Context.Provider value={context}>
        <Dispatch.Provider value={dispatch}>
            {children}
        </Dispatch.Provider>
    </Context.Provider>;
}

AppState.Context = Context;
AppState.Dispatch = Dispatch;

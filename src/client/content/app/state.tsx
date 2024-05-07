import { Dispatch, ReactNode, createContext, useContext } from "react";

import { AppContext, AppStateAction } from "./types";


const Context = createContext<AppContext>({
    lockIO: false,
    mode: "splash",
    data: {} as any,
    settings: null
});

const Dispatch = createContext<Dispatch<AppStateAction>>(() => {
    throw "No provider found for AppDispatch!";
});

export type AppStateTypes = {
    context: AppContext,
    dispatch: Dispatch<AppStateAction>,
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

export function dataIsDirty (appContext: AppContext) {
    return appContext.data.lastUpdated > appContext.data.lastSaved;
}

AppState.Context = Context;
AppState.Dispatch = Dispatch;

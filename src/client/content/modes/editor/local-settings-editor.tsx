import { useContext } from "react";

import Checkbox from "Elements/checkbox";
import Label from "Elements/label";

import AppState from "../../app/state";
import { AppLocalSettings } from "../../app/types";


function LocalSetting({type, value}: {type: keyof AppLocalSettings, value: AppLocalSettings[typeof type]}) {
    const appDispatch = useContext(AppState.Dispatch);

    switch (type) {
        case "Auto Save": {
            return <div>
                <Checkbox checked={value} onChange={value => appDispatch({
                    type: "set-local-settings-x",
                    value: {
                        type: "set-auto-save",
                        value,
                    }
                })} />
            </div>;
        }
    }
}

export default function LocalSettingsEditor() {
    const appContext = useContext(AppState.Context);

    const fields = Object.keys(appContext.data.localSettings).map((key: keyof AppLocalSettings) => {
        const value = appContext.data.localSettings[key];
        return <li key={key}>
            <Label>{key}<LocalSetting type={key} value={value}/></Label>
        </li>;
    });

    return <>
        <h1>Settings</h1>
        <ul>{fields}</ul>
    </>;
}

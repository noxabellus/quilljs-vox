import { useContext } from "react";

import Block from "Elements/block";
import Checkbox from "Elements/checkbox";

import AppState from "../../app/state";
import { AppLocalSettings } from "../../app/types";


function LocalSetting({type, value}: {type: keyof AppLocalSettings, value: AppLocalSettings[typeof type]}) {
    const appDispatch = useContext(AppState.Dispatch);

    switch (type) {
        case "Auto Save": {
            return <Checkbox checked={value} onChange={value => appDispatch({
                type: "set-local-settings-x",
                value: {
                    type: "set-auto-save",
                    value,
                }
            })} />;
        }
    }
}

export default function LocalSettingsEditor() {
    const appContext = useContext(AppState.Context);

    const fields = Object.keys(appContext.data.localSettings).map((key: keyof AppLocalSettings) => {
        const value = appContext.data.localSettings[key];
        return <li key={key}>
            <label>{key}<LocalSetting type={key} value={value}/></label>
        </li>;
    });

    return <Block>
        <h1>Settings</h1>
        <ul>{fields}</ul>
    </Block>;
}

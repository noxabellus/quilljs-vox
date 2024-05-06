import { useContext, useState } from "react";
import Block from "../../basic/block";
import AppState from "../../app/state";
import { AppLocalSettings } from "../../app/types";
import Button from "../../basic/button";


import uncheckedImg from "../../../../../assets/xmark.svg?raw";
import checkedImg   from "../../../../../assets/checkmark.svg?raw";


function Checkbox({checked, onChange}: {checked: boolean, onChange: (checked: boolean) => void}) {
    const [state, setState] = useState(checked);
    return <Button.Icon svg={checked? checkedImg : uncheckedImg} onClick={_ => {
        setState(!state);
        setTimeout(() => onChange(!state));
    }} />;
}

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

import Checkbox from "Elements/checkbox";
import Label from "Elements/label";

import { Settings } from "./types";
import SettingsList from "Elements/settings-list";
import SettingsSection from "Elements/settings-section";
import { useEditorState } from "./state";
import { useAppState } from "../../app/state";


function LocalSetting({type, value}: {type: keyof Settings, value: Settings[typeof type]}) {
    const [appContext, _appDispatch] = useAppState();
    const [_editorContext, editorDispatch] = useEditorState(appContext);

    switch (type) {
        case "Auto Save": {
            return <div>
                <Checkbox checked={value} onChange={value => editorDispatch({
                    type: "set-auto-save",
                    value,
                })} />
            </div>;
        }
    }
}

export default function LocalSettingsEditor() {
    const [appContext, _appDispatch] = useAppState();
    const [editorContext, _editorDispatch] = useEditorState(appContext);

    const fields = Object.keys(editorContext.settings).map((key: keyof Settings) => {
        const value = editorContext.settings[key];
        return <li key={key}>
            <Label><span>{key}</span><LocalSetting type={key} value={value}/></Label>
        </li>;
    });

    return <SettingsSection>
        <h1>Settings</h1>
        <SettingsList>{fields}</SettingsList>
    </SettingsSection>;
}

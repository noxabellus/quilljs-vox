import { useContext } from "react";

import Block from "../basic/block";
import BasicLayout from "../basic/basic-layout";
import Button from "../basic/button";
import ToolSet from "../basic/tool-set";

import backImg from "../../../../assets/checkmark.svg?raw";
import AppState from "../app/state";


export default function AppSettings() {
    const dispatch = useContext(AppState.Dispatch);
    return <BasicLayout $minWidth="640px">
        <Block $minWidth="640px">
            <h1>Settings</h1>
            <div>
                todo
                <ul id="settings-labels">

                </ul>
                <ul id="settings-values">

                </ul>
            </div>
        </Block>
        <ToolSet>
            <Button.Icon title="Close Settings" svg={backImg} onClick={_ => dispatch({ type: "set-mode", value: null })}/>
        </ToolSet>
    </BasicLayout>;
}

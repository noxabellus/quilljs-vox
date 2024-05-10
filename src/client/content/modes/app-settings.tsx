import { useContext } from "react";

import Block from "Elements/block";
import BasicLayout from "Elements/basic-layout";
import Button from "Elements/button";
import ToolSet from "Elements/tool-set";

import AppState from "../app/state";

import backImg from "Assets/checkmark.svg?raw";
import SplashModeExit from "Elements/splash-mode-exit";


export default function AppSettings() {
    const dispatch = useContext(AppState.Dispatch);
    return <>
        <BasicLayout $minWidth="640px">
            <Block>
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
        </BasicLayout>
        <SplashModeExit />
    </>;
}

import { useContext } from "react";
import styled from "styled-components";

// import BaseStyles from "../../basic/base-styles";
import Button from "../../basic/button";

import AppState from "../../app/state";

import ThemeEditor from "./theme-editor";

import backImg from "../../../../../assets/checkmark.svg?raw";
import Center from "../../basic/center";


const Settings = styled(Center)`
    position: absolute;
    top: 50px;
    right: 0;
`;


export default function DocumentSettings () {
    const appDispatch = useContext(AppState.Dispatch);

    return <Settings>
        <ThemeEditor />
        <Button.Icon
            title="Close Document Settings"
            svg={backImg}
            onClick={_ => appDispatch({ type: "set-mode", value: "editor" })}
        />
    </Settings>;
}

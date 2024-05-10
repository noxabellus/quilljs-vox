import styled, { useTheme } from "styled-components";

import remote from "Support/remote";

import Button from "Elements/button";
import Spacer from "Elements/spacer";
import Block from "Elements/block";

import { useAppState } from "./state";

import closeImg from "Assets/xmark.svg?raw";
import fullscreenImg from "Assets/expand.svg?raw";
import exitFullscreenImg from "Assets/contract.svg?raw";


const Bar = styled(Block)`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    user-select: none;
    font-size: 10pt;
    color: rgb(var(--accent-color));
    padding: 5px;
    background: rgb(var(--element-color));
    border: 1px solid rgb(var(--accent-color));
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    height: calc(2em + 5px);
    margin: 0;
    -webkit-app-region: drag;

    & > h1 {
        font-size: 1em;
        text-decoration: none
    }

    & > * {
        margin-left: 5px;
    }

    & > button {
        -webkit-app-region: no-drag;
    }
`;


const ReturnButton = styled(Button.Icon)`
    position: absolute;
    top: 0;
    right: 0;
    margin: 5px;
    z-index: 99999999999999;
`;


export default function TitleBar () {
    const [appContext, appDispatch] = useAppState();
    const theme = useTheme();

    const toggleFullscreen = () => {
        appDispatch({ type: "set-fullscreen", value: !appContext.fullscreen });
    };

    if (appContext.fullscreen) {
        return <ReturnButton title="Exit fullscreen [F11]" svg={exitFullscreenImg} onClick={() => toggleFullscreen()} />;
    } else if (theme.useToolbar) {
        return <Bar>
            <h1>{window.document.title}</h1>
            <Spacer />
            <Button.InlineIcon title="Enter fullscreen [F11]" svg={fullscreenImg} onClick={() => toggleFullscreen()} />
            <Button.InlineIcon title="Close Vox [Alt+F4]" svg={closeImg} onClick={() => remote.app.quit()} />
        </Bar>;
    } else {
        return null;
    }
}

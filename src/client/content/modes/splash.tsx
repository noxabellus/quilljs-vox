import { useContext, useState } from "react";
import styled, { css } from "styled-components";

import Result from "Support/result";
import { openVox } from "Support/file";

import Document from "Document";

import BaseStyles from "Elements/base-styles";
import Button from "Elements/button";
import Svg from "Elements/svg";
import ToolSet from "Elements/tool-set";
import BasicLayout from "Elements/basic-layout";

import AppState from "../app/state";

import logoImg from "Assets/vox.svg?raw";
import newFileImg from "Assets/file-pencil.svg?raw";
import openFileImg from "Assets/folder.svg?raw";
import gearImg from "Assets/gear.svg?raw";
import SplashModeExit from "Elements/splash-mode-exit";

const Logo = styled(Svg)`
    ${BaseStyles.block}
    width: 640px;
    border-radius: 30px;
    padding: 30px;
    fill: rgb(var(--vox-color));
    max-width: 100vw;
`;

const Toolbar = styled(ToolSet)`
    font-size: 1.5em;
    margin-right: 30px;
    @media (max-width: 640px) {
        & {
            margin-right: 0px;
        }
    }
`;

const SplashLayout = styled(BasicLayout)`
    ${p => !p.theme.isFullscreen
        ? css`
            border-radius: 20px;
        `
        : ""
    }
`;


export default function Splash() {
    const dispatch = useContext(AppState.Dispatch);

    const [locked, setLocked] = useState(false);

    const newFile = () => {
        dispatch({
            type: "open-doc",
            value: {
                filePath: null,
                document: Document.create(),
            },
        });
    };

    const openFile = async () => {
        setLocked(true);

        const result = await openVox();

        if (Result.isSuccess(result)) {
            dispatch({
                type: "open-doc",
                value: {
                    filePath: result.body.filePath,
                    document: result.body.doc,
                }
            });
        } else {
            if (Result.isError(result)) {
                alert(`Failed to open file:\n\t${result.body}`);
            }

            setLocked(false);
        }
    };

    const openSettings = () => {
        setLocked(true);
        dispatch({
            type: "set-mode",
            value: "settings",
        });
    };

    return <>
        <SplashLayout $minWidth="640px" id="splash">
            <Logo src={logoImg} />
            <Toolbar>
                <Button.Icon disabled={locked} title="New File" svg={newFileImg} onClick={newFile}/>
                <Button.Icon disabled={locked} title="Open File" svg={openFileImg} onClick={openFile}/>
                <Button.Icon disabled={locked} title="Vox Settings" svg={gearImg} onClick={openSettings}/>
            </Toolbar>
        </SplashLayout>
        <SplashModeExit />
    </>;
}

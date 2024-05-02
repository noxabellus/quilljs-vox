import { useState } from "react";
import styled from "styled-components";
import { PathLike } from "original-fs";

import Result from "../../support/result";
import Document from "../../support/document";
// import { openVox, saveVox } from "../../support/file";

import Button from "../basic/button";
import Svg from "../basic/svg";

import logoImg from "../../../../assets/vox.svg?raw";
import newFileImg from "../../../../assets/file-pencil-alt.svg?raw";
import openFileImg from "../../../../assets/folder.svg?raw";
import gearImg from "../../../../assets/gear.svg?raw";
import ToolSet from "../basic/tool-set";
import BaseStyles from "../basic/base-styles";

import AppSettings from "./app-settings";


export type SplashResult = Result<{filePath: PathLike, doc: Document}>;


const Background = styled.div`
    display: flex;
    flex-grow: 1;
    justify-content: center;
    align-items: center;
    background-color: rgb(var(--background-color));
`;

const SplashArea = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-end;

    & #logo {
        ${BaseStyles.block}
        width: 640px;
        border-radius: 30px;
        padding: 30px;
        fill: rgb(var(--vox-color));
    }

    @media (max-width: 640px) {
        & {
            align-items: center;
        }
        & #logo {
            width: 100vw;
        }
    }
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


export default function Splash() {
    const [showSettings, setShowSettings] = useState(false);
    return <Background>
        <SplashArea>{
            showSettings
                ? <AppSettings onClose={() => setShowSettings(false)}/>
                : <>
                    <Svg id="logo" src={logoImg} />
                    <Toolbar>
                        <Button.Icon svg={newFileImg}/>
                        <Button.Icon svg={openFileImg}/>
                        <Button.Icon svg={gearImg} onClick={_ => setShowSettings(true)}/>
                    </Toolbar>
                </>
        }</SplashArea>
    </Background>;
}

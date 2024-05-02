import { useContext, useState } from "react";
import styled from "styled-components";
import { PathLike } from "fs";

import Result from "../../support/result";
import Document from "../../support/document";
import { openVox } from "../../support/file";

import BaseStyles from "../basic/base-styles";
import Button from "../basic/button";
import Svg from "../basic/svg";
import ToolSet from "../basic/tool-set";
import BasicLayout from "../basic/basic-layout";

import logoImg from "../../../../assets/vox.svg?raw";
import newFileImg from "../../../../assets/file-pencil-alt.svg?raw";
import openFileImg from "../../../../assets/folder.svg?raw";
import gearImg from "../../../../assets/gear.svg?raw";
import AppState from "../app/state";


export type SplashResult = Result<{filePath: PathLike, doc: Document}>;


const Logo = styled(Svg)`
    ${BaseStyles.block}
    width: 640px;
    border-radius: 30px;
    padding: 30px;
    fill: rgb(var(--vox-color));

    @media (max-width: 640px) {
        & {
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
    const dispatch = useContext(AppState.Dispatch);

    const [locked, setLocked] = useState(false);

    const newFile = () => {
        dispatch({
            type: "post-doc",
            value: new Document(),
        });
    };

    const openFile = async () => {
        setLocked(true);

        const result = await openVox();

        if (Result.isSuccess(result)) {
            dispatch({
                type: "post-doc",
                value: {
                    filePath: result.body.filePath,
                    document: result.body.doc,
                }
            });
        } else if (Result.isError(result)) {
            alert(`Failed to open file:\n\t${result.body}`);
        } else {
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

    return <BasicLayout $minWidth="640px" id="splash">
        <Logo src={logoImg} />
        <Toolbar>
            <Button.Icon disabled={locked} title="New File" svg={newFileImg} onClick={newFile}/>
            <Button.Icon disabled={locked} title="Open File" svg={openFileImg} onClick={openFile}/>
            <Button.Icon disabled={locked} title="Vox Settings" svg={gearImg} onClick={openSettings}/>
        </Toolbar>
    </BasicLayout>;
}

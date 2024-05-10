
import styled, { useTheme } from "styled-components";

import remote from "Support/remote";

import Button from "Elements/button";

import closeImg from "Assets/xmark.svg?raw";


const CloseIcon = styled(Button.InlineIcon)`
    position: absolute;
    top: 20px;
    right: 20px;
`;

export default function SplashModeExit() {
    const theme = useTheme();
    return theme.splashMode
        ? <CloseIcon title="Close Vox [Alt+F4]" svg={closeImg} onClick={() => remote.app.quit()} />
        : null
        ;
}

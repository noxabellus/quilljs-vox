import {MouseEvent, useContext} from "react";
import styled from "styled-components";

import Dropdown from "../../basic/dropdown";
import Svg from "../../basic/svg";
import Button from "../../basic/button";
import ToolSet from "../../basic/tool-set";

import EditorState from "./state";
import { EDITOR_ALIGNMENT_NAMES, EDITOR_TEXT_DETAILS_PROPERTIES, EditorAlignmentIndex, EditorContext, EditorTextDetails } from "./types";

// import alignColumnsImg from "../../assets/align-columns.svg";
import alignLeftImg from "../../../../../assets/align-left.svg?raw";
import alignCenterImg from "../../../../../assets/align-center.svg?raw";
import alignRightImg from "../../../../../assets/align-right.svg?raw";
import alignJustifyImg from "../../../../../assets/align-justify.svg?raw";
import unstyleImg from "../../../../../assets/circle-cross.svg?raw";
import gearImg from "../../../../../assets/gear.svg?raw";
import exportImg from "../../../../../assets/file-arrow-down.svg?raw";


const EditorToolSet = styled(ToolSet)<{["$ed-width"]: number}>`
    width: 100vw;
    border-left: none;
    border-top: none;
    border-right: none;
    border-radius: 0px;
    justify-content: flex-start;

    @media (min-width: ${p => p["$ed-width"] + (5 * 2)}px) {
        & {
            width: calc(var(--document-width) + (var(--frame-padding) * 2) + (5px * 2));
            justify-content: center;
            border: 1px solid rgb(var(--accent-color));
            border-radius: 5px;
            margin: 5px auto 0px;
        }
    }
`;

export default function Toolbar() {
    const context = useContext(EditorState.Context);
    const dispatch = useContext(EditorState.Dispatch);
    const disabled = !context.focused;

    const formatter = (prop: keyof EditorTextDetails) => (e: MouseEvent) => {
        dispatch({ type: `set-${prop}`, value: !context[prop] });
        e.preventDefault();
    };

    const className = (prop: keyof EditorContext): "selected" | "" =>
        context[prop] && context.focused ? "selected" : "";

    const getAlignmentIndex = () => {
        switch (context.align) {
            case "center": return 1;
            case "right": return 2;
            case "justify": return 3;
            default: return 0;
        }
    };

    const changeAlignment = (newIndex: EditorAlignmentIndex) => {
        const align = EDITOR_ALIGNMENT_NAMES[newIndex];

        dispatch({ type: "set-align", value: align });
    };

    const unstyle = () => {
        dispatch({ type: "clear-format" });
    };

    const TextDetailsButton = ({kind}: {kind: keyof EditorTextDetails}) => {
        const [propName, propValue, propText, propTitle] = EDITOR_TEXT_DETAILS_PROPERTIES[kind];

        return (<Button.Serif
            disabled={disabled}
            style={{[propName]: propValue}}
            onClick={formatter(kind)}
            className={className(kind)}
            title={propTitle}
        >
            {propText}
        </Button.Serif>);
    };


    return <EditorToolSet $ed-width={context.width}>
        <TextDetailsButton kind="bold"/>
        <TextDetailsButton kind="italic"/>
        <TextDetailsButton kind="underline"/>
        <TextDetailsButton kind="strike"/>
        <Dropdown
            disabled={disabled}
            selected={getAlignmentIndex()}
            onChanged={changeAlignment}
        >
            <Svg title="Align Left" src={alignLeftImg}/>
            <Svg title="Align Center" src={alignCenterImg}/>
            <Svg title="Align Right" src={alignRightImg}/>
            <Svg title="Align Left-Justify" src={alignJustifyImg}/>
        </Dropdown>
        <Button.Icon disabled={disabled} onClick={unstyle} svg={unstyleImg}/>
        <Button.Icon title="Document Settings" svg={gearImg}/>
        <Button.Icon title="Export Document" svg={exportImg}/>
    </EditorToolSet>;
}

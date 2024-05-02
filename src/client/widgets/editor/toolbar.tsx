import {MutableRefObject, forwardRef, useContext} from "react";
import styled from "styled-components";


import Dropdown from "../basic/dropdown";
import Icon from "../basic/icon";
import Button from "../basic/button";

// import alignColumnsImg from "../../assets/align-columns.svg";
import alignLeftImg from "../../../../assets/align-left.svg?raw";
import alignCenterImg from "../../../../assets/align-center.svg?raw";
import alignRightImg from "../../../../assets/align-right.svg?raw";
import alignJustifyImg from "../../../../assets/align-justify.svg?raw";
import unstyleImg from "../../../../assets/circle-cross.svg?raw";
import gearImg from "../../../../assets/gear.svg?raw";
import exportImg from "../../../../assets/file-arrow-down.svg?raw";
import Quill from "quill";

import {EDITOR_TEXT_DETAILS_PROPERTIES, EditorAlignment, EditorContext, EditorDispatch, EditorTextDetails} from "./context";



const ToolSet = styled.nav<{["$ed-width"]: number}>`
    max-width: 100vw;
    overflow-x: scroll;
    scrollbar-width: none;
    display: flex;
    padding: 5px;
    flex-direction: row;
    justify-content: flex-start;
    align-items: stretch;
    font-family: var(--sans-family);
    font-size: var(--tool-font-size);
    background: rgb(var(--element-color));
    border-bottom: 1px solid rgb(var(--accent-color));
    cursor: default;

    @media (min-width: ${p => p["$ed-width"] + (5 * 2)}px) {
        & {
            width: calc(var(--document-width) + (var(--frame-padding) * 2) + (5px * 2));
            justify-content: center;
            border: 1px solid rgb(var(--accent-color));
            border-radius: 5px;
            margin: 5px auto 0px;
        }
    }

    & > :not(:first-child) {
        margin-left: 5px;
    }
`;



const Toolbar = forwardRef(({..._props}, _ref: MutableRefObject<Quill | null>) => {
    const context = useContext(EditorContext);
    const dispatch = useContext(EditorDispatch);
    const disabled = !context.focused;

    const formatter = (prop: keyof EditorTextDetails) => (e: any) => {
        dispatch({ type: `set-${prop}`, value: !context[prop] });
        e.preventDefault();
    };

    const className = (prop: keyof EditorContext): "selected" | "" =>
        context[prop] && context.focused ? "selected" : "";

    const getAlignmentIndex = (): number => {
        switch (context.align) {
            case "center": return 1;
            case "right": return 2;
            case "justify": return 3;
            default: return 0;
        }
    };

    const changeAlignment = (newIndex: number) => {
        const align: EditorAlignment = [null, "center", "right", "justify"][newIndex] as EditorAlignment;
        dispatch({ type: "set-align", value: align });
    };

    const unstyle = () => {
        dispatch({ type: "clear-format" });
    };

    const TextDetailsButton = ({kind}: {kind: keyof EditorTextDetails}) => {
        const [propName, propValue, propText] = EDITOR_TEXT_DETAILS_PROPERTIES[kind];
        return (<Button.Serif
            disabled={disabled}
            style={{[propName]: propValue}}
            onClick={formatter(kind)}
            className={className(kind)}
        >
            {propText}
        </Button.Serif>);
    };


    return <ToolSet $ed-width={context.width}>
        <TextDetailsButton kind="bold"/>
        <TextDetailsButton kind="italic"/>
        <TextDetailsButton kind="underline"/>
        <TextDetailsButton kind="strike"/>
        <Dropdown
            disabled={disabled}
            selected={getAlignmentIndex()}
            onChanged={changeAlignment}
        >
            <Icon svg={alignLeftImg}/>
            <Icon svg={alignCenterImg}/>
            <Icon svg={alignRightImg}/>
            <Icon svg={alignJustifyImg}/>
        </Dropdown>
        <Button.Icon disabled={disabled} onClick={unstyle} svg={unstyleImg}/>
        <Button.Icon svg={gearImg}/>
        <Button.Icon svg={exportImg}/>
    </ToolSet>;
});

Toolbar.displayName = "Toolbar";

export default Toolbar;

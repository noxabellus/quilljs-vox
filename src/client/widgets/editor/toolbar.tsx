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

import {EditorAlignment, EditorContext} from "./context";



const ToolSet = styled.nav`
    /* width: calc(var(--document-width) + (var(--frame-padding) * 2) + (5px * 2)); */
    max-width: 100vw;
    overflow-x: scroll;
    scrollbar-width: none;
    display: flex;
    padding: 5px;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    font-family: var(--sans-family);
    font-size: var(--tool-font-size);
    background: rgb(var(--element-color));
    border-bottom: 1px solid rgb(var(--accent-color));
    cursor: default;

    & > :not(:first-child) {
        margin-left: 5px;
    }
`;



const Toolbar = forwardRef(({..._props}, ref: MutableRefObject<Quill | null>) => {
    const context = useContext(EditorContext);
    const disabled = !context.focused;

    const formatter = (prop: string) => (e: any) => {
        if (disabled) return;

        const q = ref.current;
        if (!q) return;

        const existing = q.getFormat();
        q.format(prop, !existing[prop]);
        e.preventDefault();
    };

    const className = (prop: keyof EditorContext): "selected" | "" =>
        context[prop] && context.focused ? "selected" : "";

    const getAlignmentIndex = (align: EditorAlignment): number => {
        switch (align) {
            case "center": return 1;
            case "right": return 2;
            case "justify": return 3;
            default: return 0;
        }
    };

    const changeAlignment = (newIndex: number) => {
        if (disabled) return;

        const q = ref.current;
        if (!q) return;

        const align: EditorAlignment = [null, "center", "right", "justify"][newIndex] as EditorAlignment;
        q.format("align", align);
    };

    const unstyle = () => {
        const q = ref.current;
        if (!q) return;

        const range = q.getSelection();
        if (!range) return;

        q.removeFormat(range.index, range.length);
        q.format("align", null);
        q.format("bold", false);
        q.format("italic", false);
        q.format("underline", false);
        q.format("strike", false);
    };


    return <ToolSet>
        <Button.Serif disabled={disabled} style={{fontWeight: "bold"}} onClick={formatter("bold")} className={className("bold")}>B</Button.Serif>
        <Button.Serif disabled={disabled} style={{fontStyle: "italic"}} onClick={formatter("italic")} className={className("italic")}>I</Button.Serif>
        <Button.Serif disabled={disabled} style={{textDecoration: "underline"}} onClick={formatter("underline")} className={className("underline")}>U</Button.Serif>
        <Button.Serif disabled={disabled} style={{textDecoration: "line-through"}} onClick={formatter("strike")} className={className("strike")}>S</Button.Serif>
        <Dropdown
            disabled={disabled}
            selected={getAlignmentIndex(context.align)}
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

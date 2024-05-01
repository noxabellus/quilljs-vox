import styled from "styled-components";
import baseStyles from "../basic/base-styles";
import { forwardRef } from "react";

import Dropdown from "../basic/dropdown";
import Icon from "../basic/icon";

// import alignColumnsImg from "../../assets/align-columns.svg";
import alignLeftImg from "../../../../assets/align-left.svg?raw";
import alignCenterImg from "../../../../assets/align-center.svg?raw";
import alignRightImg from "../../../../assets/align-right.svg?raw";
import alignJustifyImg from "../../../../assets/align-justify.svg?raw";
import unstyleImg from "../../../../assets/circle-cross.svg?raw";
import gearImg from "../../../../assets/gear.svg?raw";
import exportImg from "../../../../assets/file-arrow-down.svg?raw";

const Button = styled.div`
    ${baseStyles}
    background: rgb(var(--element-color));
    cursor: pointer;
    margin-left: 5px;
    padding: 5px;
    color: white;

    &:hover,
    &.selected {
        color: rgb(var(--accent-color));
    }
`;

function IconButton({svg}: {svg: string}) {
    return <Button><Icon svg={svg}></Icon></Button>;
}

const SerifButton = styled(Button)`
    font-family: var(--serif-family);
`;

const ToolSet = styled.nav`
    display: flex;
    align-items: stretch;
    justify-content: center;
`;

const Toolbar = forwardRef(({..._props}, _ref) => {
    return <ToolSet>
        <SerifButton style={{fontWeight: "bold"}}>B</SerifButton>
        <SerifButton style={{fontStyle: "italic"}}>I</SerifButton>
        <SerifButton style={{textDecoration: "underline"}}>U</SerifButton>
        <SerifButton style={{textDecoration: "line-through"}}>S</SerifButton>
        <Dropdown
            selectedDefault={0}
            onChanged={(newIndex, oldIndex) => console.log(newIndex, oldIndex)}
            style={{marginLeft: "5px"}}
        >
            <Icon svg={alignLeftImg}/>
            <Icon svg={alignCenterImg}/>
            <Icon svg={alignRightImg}/>
            <Icon svg={alignJustifyImg}/>
        </Dropdown>
        <IconButton svg={unstyleImg}/>
        <IconButton svg={gearImg}/>
        <IconButton svg={exportImg}/>
    </ToolSet>;
});

Toolbar.displayName = "Toolbar";

export default Toolbar;

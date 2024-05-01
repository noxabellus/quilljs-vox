import Dropdown from "../basic/dropdown";
import Icon from "../basic/icon";

// import alignColumnsImg from "../../assets/align-columns.svg";
import alignLeftImg from "../../../../assets/align-left.svg?raw";
import alignCenterImg from "../../../../assets/align-center.svg?raw";
import alignRightImg from "../../../../assets/align-right.svg?raw";
import alignJustifyImg from "../../../../assets/align-justify.svg?raw";
import styled from "styled-components";
import baseStyles from "../basic/base-styles";
import { forwardRef } from "react";

const Button = styled.button`
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

const Toolbar = forwardRef(({..._props}, _ref) => {
    return <div>
        <Button className="text-face bold">B</Button>
        <Button className="text-face italic">I</Button>
        <Button className="text-face underline">U</Button>
        <Button className="text-face strike">S</Button>
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
        <Button className="ql-clean">Clear</Button>
        <Button className="settings-toggle no-lock">Document Settings</Button>
        <Button className="export no-lock">Export</Button>
    </div>;
});

Toolbar.displayName = "Toolbar";

export default Toolbar;

import styled from "styled-components";


export default styled.fieldset`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    user-select: none;
    font-family: monospace;

    & > span {
        margin-right: 10px;
        font-size: 1.2em;
    }

    & input[type="text"] {
        font-size: 1.2em;
    }

    & > div {
        display: flex;
        flex-direction: row;
        flex-grow: 1;
        flex-wrap: wrap;
        justify-content: flex-end;
        align-items: center;
    }

    & > div > *:not(:first-child) {
        margin-left: 5px;
    }
`;

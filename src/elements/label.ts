import styled from "styled-components";


export default styled.fieldset`
    display: flex;
    flex-direction: column;
    user-select: none;

    & > div {
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;
    }

    & > div > *:not(:first-child) {
        margin-left: 5px;
    }
`;

import styled from "styled-components";


export default styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;

    &:not(:last-child) {
        border-bottom: 1px solid rgb(var(--accent-color));
    }

    & > button {
        align-self: flex-end;
        margin: 5px;
    }
`;

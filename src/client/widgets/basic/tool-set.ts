import styled from "styled-components";

export default styled.nav`
    overflow-x: scroll;
    scrollbar-width: none;
    display: flex;
    padding: 5px;
    width: max-content;
    flex-direction: row;
    justify-content: center;
    align-items: stretch;
    font-family: var(--sans-family);
    font-size: var(--tool-font-size);
    background: rgb(var(--element-color));
    border: 1px solid rgb(var(--accent-color));
    border-radius: 5px;
    box-shadow: 0 0 8px 4px rgba(var(--shadow-color), var(--shadow-opacity)),
                0 0 8px 4px rgba(var(--shadow-color), var(--shadow-opacity)) inset;
    cursor: default;

    & > :not(:first-child) {
        margin-left: 5px;
    }
`;

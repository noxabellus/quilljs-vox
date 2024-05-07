import styled from "styled-components";


export default styled.input`
    border: 1px solid rgb(var(--primary-color));
    border-radius: 2px;

    &:hover,
    &:focus {
        border-color: rgb(var(--accent-color));
    }

    &[type="number"] {
        width: 3em;
    }
    &[type="text"] {
        width: 6em;
    }
`;

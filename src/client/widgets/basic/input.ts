import styled from "styled-components";

export default styled.input`
    border: 1px solid rgb(var(--primary-color));

    &:hover,
    &:focus {
        border-color: rgb(var(--accent-color));
    }
`;

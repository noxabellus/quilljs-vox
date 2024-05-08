import styled from "styled-components";


export default styled.ul`
    & > li {
        border-top: 1px solid rgba(var(--primary-color), 0.2);
        padding: 5px;
    }

    &:not(:last-child) {
        border-bottom: 1px solid rgba(var(--primary-color), 0.2);
    }
`;

import styled from "styled-components";

import BaseStyles from "./base-styles";



export default styled.div`
    ${BaseStyles.block}
    border-radius: 5px;
    padding: 5px;
    color: rgb(var(--primary-color));
    font-family: var(--sans-family);

    & h1 {
        text-align: center;
        font-size: 1.5em;
        text-decoration-line: underline;
        margin: 5px;
    }
`;

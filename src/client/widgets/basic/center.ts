import styled from "styled-components";


export default styled.div<{$minWidth?: string}>`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-end;

    @media (max-width: ${({$minWidth}) => $minWidth || "640px"}) {
        & {
            align-items: center;
        }
    }
`;

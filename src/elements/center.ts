import styled from "styled-components";


export type CenterTypes = {$minWidth?: string};


export default styled.div<CenterTypes>`
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

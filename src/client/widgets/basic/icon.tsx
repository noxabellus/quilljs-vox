import styled from "styled-components";


const Img = styled.div`
    & path {
        stroke: rgb(var(--primary-text-color));
    }

    .selected > & path {
        stroke: rgb(var(--accent-color));
    }

    div:hover > & path {
        stroke: rgb(var(--accent-color));
    }
`;

export default function Icon({svg}: {svg: string}) {
    return <Img dangerouslySetInnerHTML={{__html: svg}}></Img>;
};

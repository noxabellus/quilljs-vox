export default function Icon({svg}: {svg: string}) {
    return <div dangerouslySetInnerHTML={{__html: svg}}></div>;
};

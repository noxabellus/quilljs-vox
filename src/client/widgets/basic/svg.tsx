export default function Svg({src, ...props}: {src: string} & React.HTMLAttributes<HTMLDivElement>) {
    return <div dangerouslySetInnerHTML={{__html: src}} {...props}></div>;
};

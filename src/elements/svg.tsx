import { DetailedHTMLProps, HTMLAttributes } from "react";


export type SvgProps
    = {
        src: string,
    }
    & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>
    ;


export default function Svg({src, style, ...props}: SvgProps) {
    return <div dangerouslySetInnerHTML={{__html: src}} style={{...style, display: "flex", alignItems: "center", justifyContent: "center", flexGrow: 1}} {...props}></div>;
};

import { HTMLAttributes, ReactNode } from "react";

import Body from "./body";
import Center from "./center";


export type BasicLayoutProps
    = {
        $minWidth?: string,
        children: ReactNode[] | ReactNode,
    }
    & HTMLAttributes<HTMLDivElement>
    ;


export default function BasicLayout ({$minWidth, children, ...props}: BasicLayoutProps) {
    const innerProps: any = {};

    if (props.id) {
        innerProps.id = props.id + "-inner";
    }

    return <Body {...props}>
        <Center $minWidth={$minWidth} {...innerProps}>
            {children}
        </Center>
    </Body>;
}

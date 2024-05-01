import styled, { css } from "styled-components";

import { ReactElement, useEffect, useRef, useState } from "react";
import { forceRef } from "../../support/nullable";
import baseStyles from "./base-styles";

type DropdownProps = {
    selectedDefault: number;
    children: ReactElement[];
    onChanged?: (newIndex: number, oldIndex: number) => void;
    style?: React.CSSProperties;
};

const Primary = styled.div`
    ${baseStyles}
    cursor: pointer;
    display: inline-block;
    padding: 5px;
`;

const PopOut = styled.nav<{$position: {left: string, top: string}}>`
    ${baseStyles}
    display: inline-block;
    list-style: none;
    position: absolute;

    ${({$position: {left, top}}) =>
        css`
            left: ${left};
            top: ${top};
        `
    }
`;

const Choice = styled.div`
    cursor: pointer;
    padding: 5px;
`;

export default function Dropdown({selectedDefault, children, onChanged, style}: DropdownProps) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState(selectedDefault);
    const [position, setPosition] = useState({left: "0px", top: "0px"});

    const popOutRef = useRef<HTMLDivElement>(null);
    const primaryRef = useRef<HTMLDivElement>(null);

    const clicker = (i: number) => () => {
        setOpen(false);
        setSelected(i);
        if (onChanged && i != selected) onChanged(i, selected);
    };

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (!primaryRef.current?.contains(e.target as Node)
            &&  !popOutRef.current?.contains(e.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener("click", handler);

        return () => document.removeEventListener("click", handler);
    }, [primaryRef, popOutRef]);

    useEffect(() => {
        const rect = forceRef(primaryRef).getBoundingClientRect();
        setPosition({left: `${rect.left}px`, top: `${rect.top}px`});
    }, [primaryRef]);

    return <>
        <Primary
            ref={primaryRef}
            onClick={() => setOpen(true)}
            style={style}
        >
            {children[selected]}
        </Primary>

        {open && <PopOut ref={popOutRef} $position={position} style={{...style, margin: 0}}>
            {children.map((ch, i) =>
                <Choice key={i}
                    onClick={clicker(i)}
                    className={selected == i? "selected" : ""}
                >
                    {ch}
                </Choice>
            )}
        </PopOut>}
    </>;
}

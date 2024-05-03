import styled, { css } from "styled-components";

import { ReactElement, useEffect, useLayoutEffect,  useRef, useState } from "react";
import { forceRef } from "../../support/nullable";
import BaseStyles from "./base-styles";
import Button from "./button";

type DropdownProps = {
    disabled?: boolean;
    selected: number;
    children: ReactElement[];
    onChanged?: (newIndex: number, oldIndex: number) => void;
    style?: React.CSSProperties;
};

const PopOut = styled.nav<{$position: {left: string, top: string}}>`
    ${BaseStyles.primary}
    ${BaseStyles.onActivate.shadow}
    ${BaseStyles.onActivate.border}

    display: inline-block;
    list-style: none;
    position: fixed;
    z-index: 1000;
    padding: 0;

    ${({$position: {left, top}}) =>
        css`
            left: ${left};
            top: ${top};
        `
    }
`;

const Choice = styled.div`
    ${BaseStyles.onActivate.stroke}

    cursor: pointer;
    padding: 5px;
`;

function DropdownImpl({disabled, selected, children, onChanged, style}: DropdownProps) {
    const [open, setOpen] = useState(false);
    const disabledRef = useRef(disabled);
    const selectedRef = useRef(selected);
    const onChangedRef = useRef(onChanged);
    const [position, setPosition] = useState({left: "0px", top: "0px"});

    const primaryRef = useRef<HTMLButtonElement>(null);
    const popOutRef = useRef<HTMLDivElement>(null);

    const clicker = (i: number) => () => {
        setOpen(false);
        const last = selectedRef.current;
        selectedRef.current = i;
        if (onChangedRef.current && i != last) onChangedRef.current(i, last);
    };

    useLayoutEffect(() => {
        disabledRef.current = disabled;
        selectedRef.current = selected;
        onChangedRef.current = onChanged;
    });

    const handleOpen = () => {
        if (disabledRef.current) return;
        const rect = forceRef(primaryRef).getBoundingClientRect();
        setPosition({left: `${rect.left}px`, top: `${rect.top}px`});
        setOpen(true);
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

    return <>
        <Button
            disabled={disabledRef.current}
            ref={primaryRef}
            onClick={handleOpen}
            style={style}
        >
            {children[selectedRef.current]}
        </Button>

        {open && <PopOut ref={popOutRef} $position={position} style={{...style, margin: 0}}>
            {children.map((ch, i) =>
                <Choice key={i}
                    onClick={clicker(i)}
                    className={selectedRef.current == i? "selected" : ""}
                >
                    {ch}
                </Choice>
            )}
        </PopOut>}
    </>;
}

export default function Dropdown({disabled, selected, children, ...props}: DropdownProps) {
    // FIXME: this is a hack to make the selection update trigger on the same frame
    return <DropdownImpl key={selected.toString()+(disabled || false).toString()} disabled={disabled} selected={selected} {...props}>
        {children}
    </DropdownImpl>;
}

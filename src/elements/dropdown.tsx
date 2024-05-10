import { CSSProperties, ReactElement, useEffect, useLayoutEffect, useRef, useState } from "react";
import styled, { css } from "styled-components";

import { forceRef } from "Support/nullable";

import BaseStyles from "./base-styles";
import Button from "./button";


export type DropdownProps = {
    disabled?: boolean;
    selected: number;
    onChange?: (newIndex: number, oldIndex: number) => void;
    style?: CSSProperties;
    children: ReactElement[];
};


const PopOutStyles = styled.nav<{$position: {left: number, top: number}}>`
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
            left: ${left}px;
            top: ${top}px;
        `
    }
`;

const PopOut = (props: any) => {
    const ref = useRef<HTMLElement>(null);

    useLayoutEffect(() => {
        const elem = forceRef(ref);
        const elemRect = elem.getBoundingClientRect();
        const screenRect = document.body.getBoundingClientRect();

        elem.style.left = `${Math.min(props.$position.left, screenRect.right - elemRect.width - 5)}px`;
        elem.style.top = `${Math.min(props.$position.top, screenRect.bottom - elemRect.height - 5)}px`;

    }, [...Object.entries(props.$position)]);

    return <PopOutStyles ref={ref} {...props} />;
};

const Choice = styled.div`
    ${BaseStyles.onActivate.stroke}

    cursor: pointer;
    padding: 5px;
`;


export default function Dropdown({disabled, selected, children, onChange, style}: DropdownProps) {
    const [open, setOpen] = useState(false);
    const [isSelected, setIsSelected] = useState(selected);
    const [position, setPosition] = useState({left: 0, top: 0});

    const primaryRef = useRef<HTMLButtonElement>(null);
    const popOutRef = useRef<HTMLDivElement>(null);

    const clicker = (i: number) => (e: React.MouseEvent<any>) => {
        e.preventDefault();
        e.stopPropagation();
        const last = isSelected;
        setOpen(false);
        setTimeout(() => {
            setIsSelected(i);
            if (onChange) onChange(i, last);
        });
    };

    const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled) return;
        e.preventDefault();
        e.stopPropagation();
        const rect = forceRef(primaryRef).getBoundingClientRect();
        setPosition({left: rect.left, top: rect.top});
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
            key={selected.toString()+(disabled??false).toString()}
            disabled={disabled}
            ref={primaryRef}
            onClick={handleOpen}
            style={style}
        >
            {children[selected]}
        </Button>

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

import { CSSProperties, ReactElement, useEffect, useRef, useState } from "react";
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


export default function Dropdown({disabled, selected, children, onChange, style}: DropdownProps) {
    const [open, setOpen] = useState(false);
    const [isSelected, setIsSelected] = useState(selected);
    const [position, setPosition] = useState({left: "0px", top: "0px"});

    const primaryRef = useRef<HTMLButtonElement>(null);
    const popOutRef = useRef<HTMLDivElement>(null);

    const clicker = (i: number) => () => {
        setOpen(false);
        if (onChange && i != isSelected) {
            setTimeout(() => {
                setIsSelected(i);
                onChange(i, selected);
            });
        }
    };

    const handleOpen = () => {
        if (disabled) return;
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

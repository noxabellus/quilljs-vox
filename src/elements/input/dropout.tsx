import { CSSProperties, Dispatch, ReactElement, SetStateAction, useEffect, useLayoutEffect, useRef, useState } from "react";

import { forceRef } from "Support/nullable";

import Button from "./button";
import PopOut from "./popout";


export type DropoutProps = {
    disabled?: boolean;
    style?: CSSProperties;
    folded: ReactElement | ReactElement[];
    onBlur?: () => void;
    unfolded: (setOpen: Dispatch<SetStateAction<boolean>>) => ReactElement | ReactElement[];
};



export default function Dropout({disabled, folded, unfolded, onBlur, style}: DropoutProps) {
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState({left: 0, top: 0});

    const primaryRef = useRef<HTMLButtonElement>(null);
    const popOutRef = useRef<HTMLDivElement>(null);

    const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled) return;

        e.preventDefault();
        e.stopPropagation();

        const rect = forceRef(primaryRef).getBoundingClientRect();
        setPosition({left: rect.left, top: rect.top});

        setOpen(true);
    };

    useLayoutEffect(() => {
        if (popOutRef.current === null) return;

        const elem = popOutRef.current;
        const baseRect = forceRef(primaryRef).getBoundingClientRect();
        const newPosition = {left: baseRect.left, top: baseRect.top};
        const elemRect = elem.getBoundingClientRect();
        const screenRect = document.body.getBoundingClientRect();

        elem.style.left = `${Math.min(newPosition.left, screenRect.right - elemRect.width - 5)}px`;
        elem.style.top = `${Math.min(newPosition.top, screenRect.bottom - elemRect.height - 5)}px`;

    }, [...Object.values(position), popOutRef.current?.getBoundingClientRect(), document.body.getBoundingClientRect()]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (!primaryRef.current?.contains(e.target as Node)
            &&  !popOutRef.current?.contains(e.target as Node)) {
                setOpen(false);
                onBlur?.();
            }
        };

        document.addEventListener("click", handler);

        return () => document.removeEventListener("click", handler);
    }, [primaryRef, popOutRef]);

    return <>
        <Button
            disabled={disabled}
            ref={primaryRef}
            onClick={handleOpen}
            style={style}
        >
            {folded}
        </Button>

        {open && <PopOut ref={popOutRef} $position={position} style={{...style, margin: 0}}>
            {unfolded(setOpen)}
        </PopOut>}
    </>;
}

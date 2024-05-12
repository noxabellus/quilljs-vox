import { useEffect, useLayoutEffect, useRef, useState } from "react";


export default function popOutBuilder() {
    const controlRef = useRef<HTMLElement>(null);
    const popOutRef = useRef<HTMLElement>(null);

    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState({left: 0, top: 0});

    useLayoutEffect(() => {
        const control = controlRef.current;
        const popOut = popOutRef.current;
        if (!(control && popOut)) return;

        let stop = false;
        let handle: number | null = null;

        const observer = (force: any) => {
            const selfRect = control.getBoundingClientRect();
            const popOutRect = popOut.getBoundingClientRect();
            const screenRect = document.body.getBoundingClientRect();

            const newPosition = {
                left: Math.min(selfRect.left, screenRect.right - popOutRect.width - 5),
                top: Math.min(selfRect.top, screenRect.bottom - popOutRect.height - 5)
            };

            setPosition(oldPosition => {
                if (force === true || oldPosition.left != newPosition.left || oldPosition.top != newPosition.top) {
                    return newPosition;
                } else {
                    return oldPosition;
                }
            });

            if (!stop) handle = requestAnimationFrame(observer);
        };

        if (open) {
            observer(true);
        } else {
            stop = true;
        }

        return () => {
            stop = true;
            if (handle !== null) cancelAnimationFrame(handle);
        };
    }, [open]);

    useEffect(() => {
        const popOut = popOutRef.current;
        if (!popOut) return;

        popOut.style.left = `${position.left}px`;
        popOut.style.top = `${position.top}px`;
    }, [position]);

    return [controlRef, popOutRef, open, setOpen] as const;
}

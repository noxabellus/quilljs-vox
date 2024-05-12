import { useLayoutEffect, useRef } from "react";
import styled from "styled-components";

export const CanvasStyle = styled.canvas`
    border-radius: 5px;
    outline: 1px solid rgb(var(--primary-color));
    cursor: none;
    flex-grow: 0;
    flex-shrink: 0;
    align-self: center;
    justify-self: center;
    margin-bottom: 1px;
`;

export type CanvasProps
    = {
        onDraw?: (ctx: CanvasRenderingContext2D) => void,
        drawDeps?: React.DependencyList
    }
    & React.DetailedHTMLProps<React.CanvasHTMLAttributes<HTMLCanvasElement>, HTMLCanvasElement>
    ;

export function Canvas ({onDraw, drawDeps, ...props}: CanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
    }, [canvasRef]);

    if (onDraw) {
        useLayoutEffect(() => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = ctxRef.current == null? ctxRef.current = canvas.getContext("2d") : ctxRef.current;
            if (!ctx) return;

            onDraw(ctx);
        }, drawDeps);
    }

    return <CanvasStyle
        ref={canvasRef}
        {...props}
    />;
}

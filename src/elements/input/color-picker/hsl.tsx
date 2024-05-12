import { useEffect, useState } from "react";

import { Vec2, Vec3, hexToHSL, hslToHex, hslToPosition, hslToRgb, positionToHsl } from "Support/math";

import { Canvas } from "Elements/canvas";
import { Column } from "Elements/layout";

import { ColorComponent, ColorPickerProps, LocalValue } from "./base";


function drawColorSpaceHsl (ctx: CanvasRenderingContext2D, sat: number, width: number, height: number) {
    const imageData = ctx.createImageData(width, height);

    const data = imageData.data;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            const [r, g, b] = hslToRgb(positionToHsl([x, y], sat, width, height));
            data[index + 0] = r;
            data[index + 1] = g;
            data[index + 2] = b;
            data[index + 3] = 255;
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

function drawSelectionHsl(ctx: CanvasRenderingContext2D, hsl: Vec3, x: number, y: number) {
    ctx.fillStyle = `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`;
    ctx.lineWidth = 2.1;
    ctx.strokeStyle = `hsl(${360 - hsl[0]}, ${100 - hsl[1]}%, ${100 - hsl[2]}%)`;
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
}


export default function ColorPickerHsl ({value, onChange, width, height}: ColorPickerProps) {
    const [hsl, setHsl] = useState<Vec3>(hexToHSL(value));
    const [tempHsl, setTempHsl] = useState<Vec3 | null>(null);
    const [mouse, setMouse] = useState<Vec2 | null>(null);

    const draw = (ctx: CanvasRenderingContext2D) => {
        drawColorSpaceHsl(ctx, hsl[1], width, height);
        drawSelectionHsl(ctx, hsl, ...hslToPosition(hsl, width, height));

        if (mouse && tempHsl) {
            drawSelectionHsl(ctx, tempHsl, mouse[0], mouse[1]);
            ctx.fillStyle = ctx.strokeStyle;
            ctx.fillText(`hsl(${tempHsl.join(", ")})`, mouse[0] + 10, mouse[1] + 10);
        }
    };

    const mouseMove = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        const mouse: Vec2 = [e.nativeEvent.offsetX, e.nativeEvent.offsetY];
        setMouse(mouse);

        const newHsl = positionToHsl(mouse, hsl[1], width, height);
        setTempHsl(newHsl.map(n => Math.round(n)) as Vec3);
    };

    const mouseOut = () => {
        setMouse(null);
        setTempHsl(null);
    };

    const mouseClick = () => {
        if (tempHsl == null) return;
        setHsl(tempHsl);
    };

    useEffect(() => {
        setHsl(hexToHSL(value));
    }, [value]);

    useEffect(() => {
        onChange(hslToHex(hsl));
    }, [hsl]);

    return <>
        <Canvas
            width={width}
            height={height}
            drawDeps={[hsl, tempHsl, mouse]}
            onDraw={draw}
            onClick={mouseClick}
            onMouseMove={mouseMove}
            onMouseOut={mouseOut}
        />
        <Column>
            <LocalValue>{`hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`}</LocalValue>
            <ColorComponent color={`hsl(${hsl[0]}, 100%, 50%)`} title="Hue" min={0} max={360} step={1} value={hsl[0]} onChange={v => setHsl([parseInt(v), hsl[1], hsl[2]])} />
            <ColorComponent color={`hsl(300, ${hsl[1]}%, 50%)`} title="Saturation" min={0} max={100} step={1} value={hsl[1]} onChange={v => setHsl([hsl[0], parseInt(v), hsl[2]])} />
            <ColorComponent color={`hsl(0, 0%, ${hsl[2]}%)`} title="Luminance" min={0} max={100} step={1} value={hsl[2]} onChange={v => setHsl([hsl[0], hsl[1], parseInt(v)])} />
        </Column>
    </>;
}

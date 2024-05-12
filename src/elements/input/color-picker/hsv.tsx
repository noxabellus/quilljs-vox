import { useEffect, useState } from "react";

import { Vec2, Vec3, hexToHsv, hsvToHex, hsvToPosition, hsvToRgb, positionToHsv, toFixed } from "Support/math";

import { Canvas } from "Elements/canvas";
import { Column } from "Elements/layout";

import { ColorComponent, ColorPickerProps, LocalValue } from "./base";


function drawColorSpaceHsv (ctx: CanvasRenderingContext2D, sat: number, width: number, height: number) {
    const imageData = ctx.createImageData(width, height);

    const data = imageData.data;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            const [r, g, b] = hsvToRgb(positionToHsv([x, y], sat, width, height));
            data[index + 0] = r;
            data[index + 1] = g;
            data[index + 2] = b;
            data[index + 3] = 255;
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

function drawHsvSelection(ctx: CanvasRenderingContext2D, hsv: Vec3, x: number, y: number) {
    ctx.fillStyle = `rgb(${hsvToRgb(hsv).join(", ")})`;
    ctx.lineWidth = 2.1;
    ctx.strokeStyle = `rgb(${hsvToRgb([360 - hsv[0], 100 - hsv[1], 100 - hsv[2]])})`;
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
}


export default function ColorPickerHsv ({value, onChange, width, height, children}: ColorPickerProps) {
    const [hsv, setHsv] = useState<Vec3>(hexToHsv(value));
    const [tempHsv, setTempHsv] = useState<Vec3 | null>(null);
    const [mouse, setMouse] = useState<Vec2 | null>(null);

    const draw = (ctx: CanvasRenderingContext2D) => {
        drawColorSpaceHsv(ctx, hsv[1], width, height);
        drawHsvSelection(ctx, hsv, ...hsvToPosition(hsv, width, height));

        if (mouse && tempHsv) {
            drawHsvSelection(ctx, tempHsv, mouse[0], mouse[1]);
            ctx.fillStyle = ctx.strokeStyle;
            ctx.fillText(`hsv(${tempHsv.join(", ")})`, mouse[0] + 10, mouse[1] + 10);
        }
    };

    const mouseMove = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        const mouse: Vec2 = [e.nativeEvent.offsetX, e.nativeEvent.offsetY];
        setMouse(mouse);

        const newHsv = positionToHsv(mouse, hsv[1], width, height);
        setTempHsv(newHsv);
    };

    const mouseOut = () => {
        setMouse(null);
        setTempHsv(null);
    };

    const mouseClick = () => {
        if (tempHsv == null) return;
        setHsv(tempHsv);
    };

    useEffect(() => {
        setHsv(hexToHsv(value));
    }, [value]);

    useEffect(() => {
        onChange(hsvToHex(hsv));
    }, [hsv]);

    return <>
        <Canvas
            width={width}
            height={height}
            drawDeps={[hsv, tempHsv, mouse]}
            onDraw={draw}
            onClick={mouseClick}
            onMouseMove={mouseMove}
            onMouseOut={mouseOut}
        />
        <Column>
            <LocalValue>{`hsv(${hsv[0]}, ${hsv[1]}%, ${hsv[2]}%)`}</LocalValue>
            <ColorComponent color={`rgb(${hsvToRgb([hsv[0], 100, 100])})`} title="Hue" min="0.00" max="360.00" step="0.01" value={hsv[0]} onChange={v => setHsv([toFixed(parseFloat(v)), hsv[1], hsv[2]])} />
            <ColorComponent color={`rgb(${hsvToRgb([300, hsv[1], 100])})`} title="Saturation" min="0.00" max="100.00" step="0.01" value={hsv[1]} onChange={v => setHsv([hsv[0], toFixed(parseFloat(v)), hsv[2]])} />
            <ColorComponent color={`rgb(${hsvToRgb([0, 0, hsv[2]])})`} title="Value" min="0.00" max="100.00" step="0.01" value={hsv[2]} onChange={v => setHsv([hsv[0], hsv[1], toFixed(parseFloat(v))])} />
            {children}
        </Column>
    </>;
}

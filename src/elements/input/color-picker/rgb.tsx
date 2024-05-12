import { useEffect, useState } from "react";

import { Vec2, Vec3 } from "Support/math";
import { hexToRgb, hslToRgb, positionToRgb, rgbToHsl, rgbToHex, rgbToPosition } from "Support/color";

import { Canvas } from "Elements/canvas";
import { Column, Row } from "Elements/layout";
import { VerticalSlider } from "Elements/input/slider";

import { ColorComponent, ColorPickerProps, ComponentLabel, LocalValue } from "./base";


function drawColorSpaceRgb (ctx: CanvasRenderingContext2D, sat: number, width: number, height: number) {
    const imageData = ctx.createImageData(width, height);

    const data = imageData.data;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            const [r, g, b] = positionToRgb([x, y], sat, width, height);
            data[index + 0] = r;
            data[index + 1] = g;
            data[index + 2] = b;
            data[index + 3] = 255;
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

function drawSelectionRgb(ctx: CanvasRenderingContext2D, rgb: Vec3, [x, y]: Vec2) {
    ctx.fillStyle = `rgb(${rgb.join(", ")})`;
    ctx.lineWidth = 2.1;
    ctx.strokeStyle = `rgb(${rgb.map(n => 255 - n).join(", ")})`;
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
}


export default function ColorPickerRgb ({value, onChange, width, height, children}: ColorPickerProps) {
    const [rgb, setRgb] = useState<Vec3>(hexToRgb(value));
    const [sat, setSat] = useState(rgbToHsl(rgb)[1]);
    const [tempRgb, setTempRgb] = useState<Vec3 | null>(null);
    const [mouse, setMouse] = useState<Vec2 | null>(null);

    const draw = (ctx: CanvasRenderingContext2D) => {
        drawColorSpaceRgb(ctx, sat, width, height);
        drawSelectionRgb(ctx, rgb, rgbToPosition(rgb, width, height));

        if (mouse && tempRgb) {
            drawSelectionRgb(ctx, tempRgb, mouse);
            ctx.fillStyle = "#fff";
            ctx.fillText(`rgb(${tempRgb.join(", ")})`, mouse[0] + 15, mouse[1] + 10);
        }
    };

    const changeSat = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSat = 100 - parseInt(e.target.value);
        setSat(newSat);

        const newHsl = rgbToHsl(rgb);
        newHsl[1] = newSat;
        setRgb(hslToRgb(newHsl));
    };

    const changeRgb = (newRgb: Vec3) => {
        setSat(rgbToHsl(newRgb)[1]);
        setRgb(newRgb);
    };

    const mouseMove = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        const mouse: Vec2 = [e.nativeEvent.offsetX, e.nativeEvent.offsetY];
        setMouse(mouse);

        const newRgb = positionToRgb(mouse, sat, width, height);
        setTempRgb(newRgb);
    };

    const mouseOut = () => {
        setMouse(null);
        setTempRgb(null);
    };

    const mouseClick = () => {
        if (tempRgb == null) return;
        setRgb(tempRgb);
    };

    useEffect(() => {
        changeRgb(hexToRgb(value));
    }, [value]);

    useEffect(() => {
        onChange(rgbToHex(rgb));
    }, [rgb]);

    return <>
        <Canvas
            drawDeps={[sat, rgb, tempRgb, mouse]}
            width={width}
            height={height}
            onClick={mouseClick}
            onMouseMove={mouseMove}
            onMouseOut={mouseOut}
            onDraw={draw}
        />
        <Row>
            <Column style={{flexGrow: 1}}>
                <LocalValue>{`rgb(${rgb.join(", ")})`}</LocalValue>
                <ColorComponent color={`rgb(${rgb[0]},0,0)`} title="Red" min="0" max="255" step="1" value={rgb[0]} onChange={v => changeRgb([parseInt(v), rgb[1], rgb[2]])} />
                <ColorComponent color={`rgb(0,${rgb[1]},0)`} title="Green" min="0" max="255" step="1" value={rgb[1]} onChange={v => changeRgb([rgb[0], parseInt(v), rgb[2]])} />
                <ColorComponent color={`rgb(0,0,${rgb[2]})`} title="Blue" min="0" max="255" step="1" value={rgb[2]} onChange={v => changeRgb([rgb[0], rgb[1], parseInt(v)])} />
                {children}
            </Column>
            <Column style={{marginLeft: "5px"}}>
                <ComponentLabel color={`hsl(310, ${sat}%, 50%)`} style={{marginBottom: "5px"}}>S</ComponentLabel>
                <VerticalSlider
                    title="Overall Saturation"
                    min="0"
                    max="100"
                    step="1"
                    value={100 - sat}
                    onChange={changeSat}
                    style={{height: `calc(${height}px - 1.2em - 5px)`}}
                />
            </Column>
        </Row>
    </>;
}

import { Color } from "Document/theme";
import baseStyles from "Elements/base-styles";
import ColorDisplay from "Elements/color-display";
import Input from "Elements/input";
import { DetailedHTMLProps, useLayoutEffect, useRef, useState } from "react";
import styled from "styled-components";

function hslToRgb (h: number, s: number, l: number): Color {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number, k: number = (n + h / 30) % 12) =>
    l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  const out = [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)] as Color;

  if (out.some(n => isNaN(n))) {
    console.log(h, s, l, a);
    console.log(out);
    throw "hsl2rgb oopsie";
  }

  return out;
}


function drawColorSpace (ctx: CanvasRenderingContext2D, sat: number, width: number, height: number) {
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            const [r, g, b] = hslToRgb((x && (x / width * 360)) || 0, sat, (y && (1.0 - (y / height))) || 1.0);
            data[index + 0] = r;
            data[index + 1] = g;
            data[index + 2] = b;
            data[index + 3] = 255;
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

function drawSelection(ctx: CanvasRenderingContext2D, rgb: Color, x: number, y: number) {
    ctx.fillStyle = `rgb(${rgb.join(", ")}, 0.5)`;
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, 2 * Math.PI);
    ctx.fill();
    ctx.lineWidth = 2.1;
    ctx.strokeStyle = `rgb(${rgb.map(n => 255 - n).join(", ")})`;
    ctx.stroke();
}

function rgbToHSL (rgb: Color): [number, number, number] {
    const [r, g, b] = rgb;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 510;
    const d = max - min;
    const s = d === 0 ? 0 : d / (255 - Math.abs(max + min - 255));
    let h = (max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4) * 60;
    if (isNaN(h)) h = 0;
    const out = [h, s, l] as [number, number, number];
    if (out.some(n => isNaN(n))) {
        console.log(rgb);
        console.log(out);
        throw "rgb2hsl oopsie";
    }
    return out;
}

function hslToPosition (h: number, _s: number, l: number, width: number, height: number): [number, number] {
    return [(h && (h / 360 * width)) || 0, (l && ((1 - l) * height)) || 0];
}

function rgbToPosition (rgb: Color, width: number, height: number): [number, number] {
    return hslToPosition(...rgbToHSL(rgb), width, height);
}

const SliderStyles = styled.input`
    background: rgb(var(--element-color));
    border: 1px solid rgb(var(--primary-color));
    border-radius: 2px;
    height: 1.2em;
    width: 1.2em;
    appearance: none;

    &::-webkit-slider-thumb {
        appearance: none;
        width: 1.2em;
        height: 1.2em;
        border: 1px solid rgb(var(--accent-color));
        border-radius: 5px;
        background: rgb(var(--element-color));

        cursor: pointer;
        ${baseStyles.activationFx.full}
    }

    // =[
    &:hover::webkit-slider-thumb,
    &::webkit-slider-thumb:hover {
        background: red;
    }

`;

function VerticalSlider({style, ...props}: DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>) {
    return <SliderStyles type="range" {...props} style={{...style, marginLeft: ".35em", width: ".5em", flexGrow: 1, flexShrink: 1, writingMode: "vertical-lr"}} />;
}

function HorizontalSlider({style, ...props}: DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>) {
    return <SliderStyles type="range" {...props} style={{...style, height: ".5em", flexGrow: 1, flexShrink: 1}} />;
}

export default function ColorPicker ({width, height}: {width: number, height: number}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

    const [rgb, setRgb] = useState<Color>([0, 0, 0]);
    const [sat, setSat] = useState(1.0);
    const [tempRgb, setTempRgb] = useState<Color | null>(null);
    const [mouse, setMouse] = useState<{x:number, y:number} | null>(null);

    function draw () {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = ctxRef.current == null? ctxRef.current = canvas.getContext("2d") : ctxRef.current;
        if (!ctx) return;

        drawColorSpace(ctx, sat, width, height);

        drawSelection(ctx, rgb, ...rgbToPosition(rgb, width, height));

        if (mouse && tempRgb) {
            drawSelection(ctx, tempRgb, mouse.x, mouse.y);
            ctx.fillStyle = ctx.strokeStyle;
            ctx.fillText(`rgb(${tempRgb.join(", ")})`, mouse.x + 10, mouse.y + 10);
        }
    }

    function changeSat (e: React.ChangeEvent<HTMLInputElement>) {
        const newSat = 1.0 - parseFloat(e.target.value);
        const hsl = rgbToHSL(rgb);
        setSat(newSat);
        setRgb(hslToRgb(hsl[0], newSat, hsl[2]));
    }

    function changeRgb (newRgb: Color) {
        setSat(rgbToHSL(newRgb)[1]);
        setRgb(newRgb);
    }

    function mouseMove (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
        const mouse = {x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY};
        setMouse(mouse);

        const newRgb = hslToRgb((mouse.x && (mouse.x / width * 360)) || 0, sat, (mouse.y && (1.0 - (mouse.y / height))) || 1.0);
        setTempRgb(newRgb);
    }

    function mouseOut () {
        setMouse(null);
        setTempRgb(null);
    }

    function mouseClick () {
        if (tempRgb == null) return;
        setRgb(tempRgb);
    }

    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = width;
        canvas.height = height;

        draw();
    }, [canvasRef]);

    useLayoutEffect(draw, [mouse, rgb, tempRgb, sat]);

    return <div style={{background: "rgb(var(--element-color))", color: "rgb(var(--primary-color))", fontFamily: "sans-serif", flexGrow: 1}}>
        <div style={{display: "flex", flexDirection: "column", alignItems: "center", margin: "5px"}}>
            <canvas
                style={{outline: "1px solid rgb(var(--primary-color))", cursor: "crosshair"}}
                ref={canvasRef}
                onClick={mouseClick}
                onMouseMove={mouseMove}
                onMouseOut={mouseOut}
            />
            <div style={{display: "flex", flexDirection: "row", alignItems: "stretch", justifyContent: "stretch", marginTop: "5px", width: `${width + 2}px`}}>
                <div style={{display: "flex", flexDirection: "column", alignItems:"stretch", justifyContent: "center", marginRight: "5px"}}>
                    <span style={{userSelect: "none", border: "1px solid white", marginBottom: "5px", borderRadius: "5px", display: "flex", alignSelf: "stretch", justifySelf: "stretch", alignItems: "center", justifyContent: "center", color:"white", background: `hsl(310, ${100 * sat}%, 50%)`, minWidth: "1.2em", height: "1.2em"}}>S</span>
                    <VerticalSlider
                        title="Overall Saturation"
                        min="0"
                        max="1"
                        step="0.01"
                        value={1.0 - sat}
                        onChange={changeSat}
                        style={{height: `calc(${height}px - 1.2em - 5px)`}}
                    />
                </div>
                <div style={{display: "flex", flexDirection: "column", alignItems:"stretch", justifyContent: "stretch", flexGrow: 1}}>
                    <ColorDisplay display={rgb} style={{borderRadius: "5px", border: "1px solid white", flexGrow: 1, height: "2em", alignSelf: "stretch", justifySelf: "stretch", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center"}}>
                        <span style={{borderRadius: ".5em", background:"rgba(0,0,0,0.2)", color:"white"}}>{`rgb(${rgb.join(", ")})`}</span>
                    </ColorDisplay>
                    <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: "5px"}}>
                        <span style={{userSelect: "none", border: "1px solid white", borderRadius: "5px", display: "flex", alignItems: "center", justifyContent: "center", color:"white", background: `rgb(${rgb[0]},0,0)`, width: "1.2em", height: "1.2em"}}>R</span>
                        <Input title="Red" type="number" min="0" max="255" step="1" value={rgb[0]} style={{marginLeft: "5px"}} onChange={e => { changeRgb([parseInt(e.target.value), rgb[1], rgb[2]]); }} />
                        <HorizontalSlider title="Red" min="0" max="255" step="1" value={rgb[0]} style={{marginLeft: "5px"}} onChange={e => { changeRgb([parseInt(e.target.value), rgb[1], rgb[2]]); }} />
                    </div>
                    <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: "5px"}}>
                        <span style={{userSelect: "none", border: "1px solid white", borderRadius: "5px", display: "flex", alignItems: "center", justifyContent: "center", color:"white", background: `rgb(0,${rgb[1]},0)`, width: "1.2em", height: "1.2em"}}>G</span>
                        <Input title="Green" type="number" min="0" max="255" step="1" value={rgb[1]} style={{marginLeft: "5px"}} onChange={e => { changeRgb([rgb[0], parseInt(e.target.value), rgb[2]]); }} />
                        <HorizontalSlider title="Green" min="0" max="255" step="1" value={rgb[1]} style={{marginLeft: "5px"}} onChange={e => { changeRgb([rgb[0], parseInt(e.target.value), rgb[2]]); }} />
                    </div>
                    <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: "5px"}}>
                        <span style={{userSelect: "none", border: "1px solid white", borderRadius: "5px", display: "flex", alignItems: "center", justifyContent: "center", color:"white", background: `rgb(0,0,${rgb[2]})`, width: "1.2em", height: "1.2em"}}>B</span>
                        <Input title="Blue" type="number" min="0" max="255" step="1" value={rgb[2]} style={{marginLeft: "5px"}} onChange={e => { changeRgb([rgb[0], rgb[1], parseInt(e.target.value)]); }} />
                        <HorizontalSlider title="Blue" min="0" max="255" step="1" value={rgb[2]} style={{marginLeft: "5px"}} onChange={e => { changeRgb([rgb[0], rgb[1], parseInt(e.target.value)]); }} />
                    </div>
                </div>
            </div>
        </div>
    </div>;
}


/* eslint-disable @typescript-eslint/no-unused-vars */

import { useLayoutEffect, useRef, useState } from "react";

import { Vec2, hslToHex, hslToPosition, hslToRgb, hsvToPosition, hsvToRgb, rgbToHSL, rgbToPosition } from "Support/math";
import { HexDisplay, HslDisplay, HsvDisplay, RgbDisplay } from "Elements/color-display";
import Input from "Elements/input";
import Dropdown from "Elements/input/dropdown";
import { HorizontalSlider, VerticalSlider } from "Elements/input/slider";

import { Color } from "Document/theme";


function drawColorSpaceRgb (ctx: CanvasRenderingContext2D, sat: number, width: number, height: number) {
    const imageData = ctx.createImageData(width, height);

    const data = imageData.data;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            const [r, g, b] = hslToRgb([(x && (x / width * 360)) || 0, sat, (y && ((1.0 - (y / height)) * 100)) || 100]);
            data[index + 0] = r;
            data[index + 1] = g;
            data[index + 2] = b;
            data[index + 3] = 255;
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

function drawRgbSelection(ctx: CanvasRenderingContext2D, rgb: Color, x: number, y: number) {
    ctx.fillStyle = `rgb(${rgb.join(", ")})`;
    ctx.lineWidth = 2.1;
    ctx.strokeStyle = `rgb(${rgb.map(n => 255 - n).join(", ")})`;
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
}

// function drawColorSpaceHsv (ctx: CanvasRenderingContext2D, sat: number, width: number, height: number) {
//     const imageData = ctx.createImageData(width, height);

//     const data = imageData.data;
//     for (let y = 0; y < height; y++) {
//         for (let x = 0; x < width; x++) {
//             const index = (y * width + x) * 4;
//             const [r, g, b] = hsvToRgb([(x && (x / width * 360)) || 0, sat, (y && ((1.0 - (y / height)) * 100)) || 100]);
//             data[index + 0] = r;
//             data[index + 1] = g;
//             data[index + 2] = b;
//             data[index + 3] = 255;
//         }
//     }

//     ctx.putImageData(imageData, 0, 0);
// }

// function drawHsvSelection(ctx: CanvasRenderingContext2D, hsv: Color, x: number, y: number) {
//     ctx.fillStyle = `rgb(${hsvToRgb(hsv).join(", ")})`;
//     ctx.lineWidth = 2.1;
//     ctx.strokeStyle = `rgb(${hsvToRgb([360 - hsv[0], 100 - hsv[1], 100 - hsv[2]])})`;
//     ctx.beginPath();
//     ctx.arc(x, y, 10, 0, 2 * Math.PI);
//     ctx.fill();
//     ctx.stroke();
// }

// export default function HSVColorPicker ({width, height}: {width: number, height: number}) {
//     const canvasRef = useRef<HTMLCanvasElement>(null);
//     const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

//     const [hsv, setHsv] = useState<Color>([0, 100, 100]);
//     const [tempHsv, setTempHsv] = useState<Color | null>(null);
//     const [mouse, setMouse] = useState<Vec2 | null>(null);

//     const draw = () => {
//         const canvas = canvasRef.current;
//         if (!canvas) return;

//         const ctx = ctxRef.current == null? ctxRef.current = canvas.getContext("2d") : ctxRef.current;
//         if (!ctx) return;

//         drawColorSpaceHsv(ctx, hsv[1], width, height);
//         drawHsvSelection(ctx, hsv, ...hsvToPosition(hsv, width, height));

//         if (mouse && tempHsv) {
//             drawHsvSelection(ctx, tempHsv, mouse[0], mouse[1]);
//             ctx.fillStyle = ctx.strokeStyle;
//             ctx.fillText(`hsv(${tempHsv.join(", ")})`, mouse[0] + 10, mouse[1] + 10);
//         }
//     };

//     const mouseMove = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
//         const mouse: Vec2 = [e.nativeEvent.offsetX, e.nativeEvent.offsetY];
//         setMouse(mouse);

//         const newHsv: Color = [(mouse[0] && ((mouse[0] / width) * 360)) || 0, (mouse[1] && ((1.0 - (mouse[1] / height)) * 100)) || 100, hsv[2]];
//         setTempHsv(newHsv.map(n => Math.round(n)) as Color);
//     };

//     const mouseOut = () => {
//         setMouse(null);
//         setTempHsv(null);
//     };

//     const mouseClick = () => {
//         if (tempHsv == null) return;
//         setHsv(tempHsv);
//     };

//     useLayoutEffect(() => {
//         const canvas = canvasRef.current;
//         if (!canvas) return;

//         canvas.width = width;
//         canvas.height = height;
//     }, [canvasRef]);

//     useLayoutEffect(draw, [mouse, hsv, tempHsv, canvasRef]);

//     return <div style={{background: "rgb(var(--element-color))", color: "rgb(var(--primary-color))", fontFamily: "sans-serif", flexGrow: 1}}>
//         <div style={{display: "flex", flexDirection: "column", alignItems: "center", margin: "5px"}}>
//             <div style={{display: "flex", flexDirection: "column", alignItems: "stretch"}}>
//                 <canvas
//                     style={{borderRadius: "5px", outline: "1px solid rgb(var(--primary-color))", cursor: "crosshair"}}
//                     ref={canvasRef}
//                     onClick={mouseClick}
//                     onMouseMove={mouseMove}
//                     onMouseOut={mouseOut}
//                 />
//                 <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: "5px"}}>
//                     <Dropdown style={{marginRight: "5px"}} selected={2}>
//                         <option>RGB</option>
//                         <option>HSL</option>
//                         <option>HSV</option>
//                     </Dropdown>
//                     <HsvDisplay display={hsv} style={{borderRadius: "5px", border: "1px solid white", flexGrow: 1, height: "2em", alignSelf: "stretch", justifySelf: "stretch", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center"}}>
//                         <span style={{borderRadius: ".5em", background:"rgba(0,0,0,0.2)", color:"white"}}>{`${hsv[0]}, ${hsv[1]}%, ${hsv[2]}%`}</span>
//                     </HsvDisplay>
//                 </div>
//                 <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: "5px"}}>
//                     <span style={{textShadow: "1px 1px 0px black", userSelect: "none", border: "1px solid white", borderRadius: "5px", display: "flex", alignItems: "center", justifyContent: "center", color:"white", background: `rgb(${hsvToRgb([hsv[0], 100, 100])})`, width: "1.2em", height: "1.2em"}}>H</span>
//                     <Input title="Hue" type="number" min="0" max="360" step="1" value={hsv[0]} style={{marginLeft: "5px"}} onChange={e => { setHsv([parseInt(e.target.value), hsv[1], hsv[2]]); }} />
//                     <HorizontalSlider title="Hue" min="0" max="360" step="1" value={hsv[0]} style={{marginLeft: "5px"}} onChange={e => { setHsv([parseInt(e.target.value), hsv[1], hsv[2]]); }} />
//                 </div>
//                 <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: "5px"}}>
//                     <span style={{textShadow: "1px 1px 0px black", userSelect: "none", border: "1px solid white", borderRadius: "5px", display: "flex", alignItems: "center", justifyContent: "center", color:"white", background: `rgb(${hsvToRgb([300, hsv[1], 100])})`, width: "1.2em", height: "1.2em"}}>S</span>
//                     <Input title="Saturation" type="number" min="0" max="100" step="1" value={hsv[1]} style={{marginLeft: "5px"}} onChange={e => { setHsv([hsv[0], parseInt(e.target.value), hsv[2]]); }} />
//                     <HorizontalSlider title="Saturation" min="0" max="100" step="1" value={hsv[1]} style={{marginLeft: "5px"}} onChange={e => { setHsv([hsv[0], parseInt(e.target.value), hsv[2]]); }} />
//                 </div>
//                 <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: "5px"}}>
//                     <span style={{textShadow: "1px 1px 0px black", userSelect: "none", border: "1px solid white", borderRadius: "5px", display: "flex", alignItems: "center", justifyContent: "center", color:"white", background: `rgb(${hsvToRgb([0, 0, hsv[2]])})`, width: "1.2em", height: "1.2em"}}>V</span>
//                     <Input title="Value" type="number" min="0" max="100" step="1" value={hsv[2]} style={{marginLeft: "5px"}} onChange={e => { setHsv([hsv[0], hsv[1], parseInt(e.target.value)]); }} />
//                     <HorizontalSlider title="Value" min="0" max="100" step="1" value={hsv[2]} style={{marginLeft: "5px"}} onChange={e => { setHsv([hsv[0], hsv[1], parseInt(e.target.value)]); }} />
//                 </div>
//             </div>
//         </div>
//     </div>;
// }





function drawColorSpaceHsl (ctx: CanvasRenderingContext2D, sat: number, width: number, height: number) {
    const imageData = ctx.createImageData(width, height);

    const data = imageData.data;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            const [r, g, b] = hslToRgb([(x && (x / width * 360)) || 0, sat, (y && ((1.0 - (y / height)) * 100)) || 100]);
            data[index + 0] = r;
            data[index + 1] = g;
            data[index + 2] = b;
            data[index + 3] = 255;
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

function drawSelectionHsl(ctx: CanvasRenderingContext2D, hsl: Color, x: number, y: number) {
    ctx.fillStyle = `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`;
    ctx.lineWidth = 2.1;
    ctx.strokeStyle = `hsl(${360 - hsl[0]}, ${100 - hsl[1]}%, ${100 - hsl[2]}%)`;
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
}

export default function HSLColorPicker ({width, height}: {width: number, height: number}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

    const [hsl, setHsl] = useState<Color>([0, 100, 50]);
    const [tempHsl, setTempHsl] = useState<Color | null>(null);
    const [mouse, setMouse] = useState<Vec2 | null>(null);
    const [alpha, setAlpha] = useState(1.0);

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = ctxRef.current == null? ctxRef.current = canvas.getContext("2d") : ctxRef.current;
        if (!ctx) return;

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

        const newHsl: Color = [(mouse[0] && (mouse[0] / width * 360)) || 0, (mouse[1] && (1.0 - (mouse[1] / height))) || 1.0, hsl[2]];
        setTempHsl(newHsl.map(n => Math.round(n)) as Color);
    };

    const mouseOut = () => {
        setMouse(null);
        setTempHsl(null);
    };

    const mouseClick = () => {
        if (tempHsl == null) return;
        setHsl(tempHsl);
    };

    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = width;
        canvas.height = height;
    }, [canvasRef]);

    useLayoutEffect(draw, [mouse, hsl, tempHsl, canvasRef]);

    return <div style={{background: "rgb(var(--element-color))", color: "rgb(var(--primary-color))", fontFamily: "sans-serif", flexGrow: 1}}>
        <div style={{display: "flex", flexDirection: "column", alignItems: "center", margin: "5px"}}>
            <div style={{display: "flex", flexDirection: "column", alignItems: "stretch"}}>
                <canvas
                    style={{borderRadius: "5px", outline: "1px solid rgb(var(--primary-color))", cursor: "crosshair"}}
                    ref={canvasRef}
                    onClick={mouseClick}
                    onMouseMove={mouseMove}
                    onMouseOut={mouseOut}
                />
                <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: "5px"}}>
                    <Dropdown style={{marginRight: "5px"}} selected={1}>
                        <option>RGB</option>
                        <option>HSL</option>
                        <option>HSV</option>
                    </Dropdown>
                    <HslDisplay display={hsl} style={{borderRadius: "5px", border: "1px solid white", flexGrow: 1, height: "2em", alignSelf: "stretch", justifySelf: "stretch", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center"}}>
                        <span style={{fontFamily: "monospace", borderRadius: ".5em", background:"rgba(0,0,0,0.2)", color:"white", userSelect: "text"}}>{`${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%`}</span>
                    </HslDisplay>
                </div>
                <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: "5px"}}>
                    <span style={{fontFamily: "monospace", textShadow: "1px 1px 0px black", userSelect: "none", border: "1px solid white", borderRadius: "5px", display: "flex", alignItems: "center", justifyContent: "center", color:"white", background: `hsl(${hsl[0]}, 50%, 50%)`, width: "1.2em", height: "1.2em"}}>H</span>
                    <Input title="Hue" type="number" min="0" max="360" step="1" value={hsl[0]} style={{marginLeft: "5px"}} onChange={e => { setHsl([parseInt(e.target.value), hsl[1], hsl[2]]); }} />
                    <HorizontalSlider title="Hue" min="0" max="360" step="1" value={hsl[0]} style={{marginLeft: "5px"}} onChange={e => { setHsl([parseInt(e.target.value), hsl[1], hsl[2]]); }} />
                </div>
                <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: "5px"}}>
                    <span style={{fontFamily: "monospace", textShadow: "1px 1px 0px black", userSelect: "none", border: "1px solid white", borderRadius: "5px", display: "flex", alignItems: "center", justifyContent: "center", color:"white", background: `hsl(300, ${hsl[1]}%, 50%)`, width: "1.2em", height: "1.2em"}}>S</span>
                    <Input title="Saturation" type="number" min="0" max="100" step="1" value={hsl[1]} style={{marginLeft: "5px"}} onChange={e => { setHsl([hsl[0], parseInt(e.target.value), hsl[2]]); }} />
                    <HorizontalSlider title="Saturation" min="0" max="100" step="1" value={hsl[1]} style={{marginLeft: "5px"}} onChange={e => { setHsl([hsl[0], parseInt(e.target.value), hsl[2]]); }} />
                </div>
                <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: "5px"}}>
                    <span style={{fontFamily: "monospace", textShadow: "1px 1px 0px black", userSelect: "none", border: "1px solid white", borderRadius: "5px", display: "flex", alignItems: "center", justifyContent: "center", color:"white", background: `hsl(0, 0%, ${hsl[2]}%)`, width: "1.2em", height: "1.2em"}}>L</span>
                    <Input title="Luminance" type="number" min="0" max="100" step="1" value={hsl[2]} style={{marginLeft: "5px"}} onChange={e => { setHsl([hsl[0], hsl[1], parseInt(e.target.value)]); }} />
                    <HorizontalSlider title="Luminance" min="0" max="100" step="1" value={hsl[2]} style={{marginLeft: "5px"}} onChange={e => { setHsl([hsl[0], hsl[1], parseInt(e.target.value)]); }} />
                </div>
                <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: "5px"}}>
                    <span style={{fontFamily: "monospace", textShadow: "1px 1px 0px black", userSelect: "none", border: "1px solid white", borderRadius: "5px", display: "flex", alignItems: "center", justifyContent: "center", color:"white", background: `rgb(${Array(3).fill(alpha * 255)})`, width: "1.2em", height: "1.2em"}}>A</span>
                    <Input title="Alpha" type="number" min="0.0" max="1.0" step="0.01" value={alpha} style={{marginLeft: "5px"}} onChange={e => { setAlpha(parseFloat(e.target.value)); }} />
                    <HorizontalSlider title="Alpha" min="0.0" max="1.0" step="0.01" value={alpha} style={{marginLeft: "5px"}} onChange={e => { setAlpha(parseFloat(e.target.value)); }} />
                </div>
                <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: "5px"}}>
                    <HexDisplay display={hslToHex(hsl)+Math.round(alpha * 255).toString(16)} style={{borderRadius: "5px", border: "1px solid white", flexGrow: 1, height: "2em", alignSelf: "stretch", justifySelf: "stretch", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center"}}>
                        <span style={{fontFamily: "monospace", borderRadius: ".5em", background:"rgba(0,0,0,0.2)", color:"white", userSelect: "text"}}>{hslToHex(hsl)+Math.round(alpha * 255).toString(16)}</span>
                    </HexDisplay>
                </div>
            </div>
        </div>
    </div>;
}

// export default function RGBColorPicker ({width, height}: {width: number, height: number}) {
//     const canvasRef = useRef<HTMLCanvasElement>(null);
//     const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

//     const [rgb, setRgb] = useState<Color>([0, 0, 0]);
//     const [sat, setSat] = useState(100);
//     const [tempRgb, setTempRgb] = useState<Color | null>(null);
//     const [mouse, setMouse] = useState<Vec2 | null>(null);

//     const draw = () => {
//         const canvas = canvasRef.current;
//         if (!canvas) return;

//         const ctx = ctxRef.current == null? ctxRef.current = canvas.getContext("2d") : ctxRef.current;
//         if (!ctx) return;

//         drawColorSpace(ctx, sat, width, height);
//         drawRgbSelection(ctx, rgb, ...rgbToPosition(rgb, width, height));

//         if (mouse && tempRgb) {
//             drawRgbSelection(ctx, tempRgb, mouse[0], mouse[1]);
//             ctx.fillStyle = ctx.strokeStyle;
//             ctx.fillText(`rgb(${tempRgb.join(", ")})`, mouse[0] + 10, mouse[1] + 10);
//         }
//     };

//     const changeSat = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const newSat = 100 - parseInt(e.target.value);
//         setSat(newSat);

//         const newHsl = rgbToHSL(rgb);
//         newHsl[1] = newSat;
//         setRgb(hslToRgb(newHsl));
//     };

//     const changeRgb = (newRgb: Color) => {
//         setSat(rgbToHSL(newRgb)[1]);
//         setRgb(newRgb);
//     };

//     const mouseMove = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
//         const mouse: Vec2 = [e.nativeEvent.offsetX, e.nativeEvent.offsetY];
//         setMouse(mouse);

//         const newRgb = hslToRgb([(mouse[0] && (mouse[0] / width * 360)) || 0, sat, (mouse[1] && (1.0 - (mouse[1] / height))) || 1.0]);
//         setTempRgb(newRgb);
//     };

//     const mouseOut = () => {
//         setMouse(null);
//         setTempRgb(null);
//     };

//     const mouseClick = () => {
//         if (tempRgb == null) return;
//         setRgb(tempRgb);
//     };

//     useLayoutEffect(() => {
//         const canvas = canvasRef.current;
//         if (!canvas) return;

//         canvas.width = width;
//         canvas.height = height;
//     }, [canvasRef]);

//     useLayoutEffect(draw, [mouse, rgb, tempRgb, sat, canvasRef]);

//     return <div style={{background: "rgb(var(--element-color))", color: "rgb(var(--primary-color))", fontFamily: "sans-serif", flexGrow: 1}}>
//         <div style={{display: "flex", flexDirection: "column", alignItems: "center", margin: "5px"}}>
//             <canvas
//                 style={{borderRadius: "5px", outline: "1px solid rgb(var(--primary-color))", cursor: "crosshair"}}
//                 ref={canvasRef}
//                 onClick={mouseClick}
//                 onMouseMove={mouseMove}
//                 onMouseOut={mouseOut}
//             />
//             <div style={{display: "flex", flexDirection: "row", alignItems: "stretch", justifyContent: "stretch", marginTop: "5px", width: `${width + 2}px`}}>
//                 <div style={{display: "flex", flexDirection: "column", alignItems:"stretch", justifyContent: "center", marginRight: "5px"}}>
//                     <span style={{userSelect: "none", border: "1px solid white", marginBottom: "5px", borderRadius: "5px", display: "flex", alignSelf: "stretch", justifySelf: "stretch", alignItems: "center", justifyContent: "center", color:"white", background: `hsl(310, ${100 * sat}%, 50%)`, minWidth: "1.2em", height: "1.2em"}}>S</span>
//                     <VerticalSlider
//                         title="Overall Saturation"
//                         min="0"
//                         max="100"
//                         step="1"
//                         value={100 - sat}
//                         onChange={changeSat}
//                         style={{height: `calc(${height}px - 1.2em - 5px)`}}
//                     />
//                 </div>
//                 <div style={{display: "flex", flexDirection: "column", alignItems:"stretch", justifyContent: "stretch", flexGrow: 1}}>
//                     <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center"}}>
//                         <RgbDisplay display={rgb} style={{borderRadius: "5px", border: "1px solid white", flexGrow: 1, height: "2em", alignSelf: "stretch", justifySelf: "stretch", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center"}}>
//                             <span style={{borderRadius: ".5em", background:"rgba(0,0,0,0.2)", color:"white"}}>{rgb.join(", ")}</span>
//                         </RgbDisplay>
//                         <Dropdown style={{marginLeft: "5px"}} selected={0}>
//                             <option>RGB</option>
//                             <option>HSL</option>
//                             <option>HSV</option>
//                         </Dropdown>
//                     </div>
//                     <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: "5px"}}>
//                         <span style={{userSelect: "none", border: "1px solid white", borderRadius: "5px", display: "flex", alignItems: "center", justifyContent: "center", color:"white", background: `rgb(${rgb[0]},0,0)`, width: "1.2em", height: "1.2em"}}>R</span>
//                         <Input title="Red" type="number" min="0" max="255" step="1" value={rgb[0]} style={{marginLeft: "5px"}} onChange={e => { changeRgb([parseInt(e.target.value), rgb[1], rgb[2]]); }} />
//                         <HorizontalSlider title="Red" min="0" max="255" step="1" value={rgb[0]} style={{marginLeft: "5px"}} onChange={e => { changeRgb([parseInt(e.target.value), rgb[1], rgb[2]]); }} />
//                     </div>
//                     <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: "5px"}}>
//                         <span style={{userSelect: "none", border: "1px solid white", borderRadius: "5px", display: "flex", alignItems: "center", justifyContent: "center", color:"white", background: `rgb(0,${rgb[1]},0)`, width: "1.2em", height: "1.2em"}}>G</span>
//                         <Input title="Green" type="number" min="0" max="255" step="1" value={rgb[1]} style={{marginLeft: "5px"}} onChange={e => { changeRgb([rgb[0], parseInt(e.target.value), rgb[2]]); }} />
//                         <HorizontalSlider title="Green" min="0" max="255" step="1" value={rgb[1]} style={{marginLeft: "5px"}} onChange={e => { changeRgb([rgb[0], parseInt(e.target.value), rgb[2]]); }} />
//                     </div>
//                     <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: "5px"}}>
//                         <span style={{userSelect: "none", border: "1px solid white", borderRadius: "5px", display: "flex", alignItems: "center", justifyContent: "center", color:"white", background: `rgb(0,0,${rgb[2]})`, width: "1.2em", height: "1.2em"}}>B</span>
//                         <Input title="Blue" type="number" min="0" max="255" step="1" value={rgb[2]} style={{marginLeft: "5px"}} onChange={e => { changeRgb([rgb[0], rgb[1], parseInt(e.target.value)]); }} />
//                         <HorizontalSlider title="Blue" min="0" max="255" step="1" value={rgb[2]} style={{marginLeft: "5px"}} onChange={e => { changeRgb([rgb[0], rgb[1], parseInt(e.target.value)]); }} />
//                     </div>
//                 </div>
//             </div>
//         </div>
//     </div>;
// }


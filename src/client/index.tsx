import { createRoot } from "react-dom/client";

// import App from "./content/app";

import CanvasColorPicker from "Experimental/canvas-color-picker";


const domNode = document.body.appendChild(document.createElement("div"));
domNode.id = "app-container";

const root = createRoot(domNode);
root.render(<CanvasColorPicker width={200} height={100} />);

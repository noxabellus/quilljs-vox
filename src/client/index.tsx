
import { createRoot } from "react-dom/client";

import App from "./widgets/app";
import { DEFAULT_DOCUMENT_THEME, applyDocumentTheme } from "./support/document-theme";

const domNode = document.body.appendChild(document.createElement("div"));
domNode.style.height = "100vh";
domNode.style.display = "flex";
domNode.style.flexDirection = "column";
domNode.style.justifyContent = "stretch";
domNode.style.alignItems = "stretch";
domNode.style.backgroundColor = "rgb(var(--background-color))";

applyDocumentTheme(domNode, DEFAULT_DOCUMENT_THEME);
const root = createRoot(domNode);
root.render(<App />);


const dbg = document.body.appendChild(document.createElement("input"));

dbg.type = "number";
dbg.value = "960";
dbg.style.position = "absolute";
dbg.style.bottom = "0";
dbg.style.right = "0";
dbg.style.background = "white";
dbg.style.width = "4em";

dbg.addEventListener("change", () => {
    domNode.style.setProperty("--document-width", `${dbg.value}px`);
});


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

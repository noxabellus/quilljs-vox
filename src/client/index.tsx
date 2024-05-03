
import { createRoot } from "react-dom/client";

import App from "./widgets/app";
import { DEFAULT_DOCUMENT_THEME, applyDocumentTheme } from "./support/document-theme";

const domNode = document.body.appendChild(document.createElement("div"));
domNode.id = "app-container";

applyDocumentTheme(domNode, DEFAULT_DOCUMENT_THEME);
const root = createRoot(domNode);
root.render(<App />);

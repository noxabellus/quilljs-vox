
import { createRoot } from "react-dom/client";

import App from "./widgets/app";

const domNode = document.body.appendChild(document.createElement("div"));
domNode.id = "app-container";

const root = createRoot(domNode);
root.render(<App />);

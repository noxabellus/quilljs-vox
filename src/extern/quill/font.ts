import { Scope, StyleAttributor } from "parchment";

const config = {
  scope: Scope.INLINE,
//   whitelist: ["sans-serif", "serif", "monospace"],
};

class FontStyleAttributor extends StyleAttributor {
  value(node: HTMLElement) {
    return super.value(node).replace(/[""]/g, "");
  }
}

export default new FontStyleAttributor("font", "font-family", config);


import * as remote from "@electron/remote";

export const app = {
    on: remote.app.on,
    off: remote.app.off,
    once: remote.app.once,
};

export const terminal = (remote.app as any).console;
export const dialog = remote.dialog;

export default {
    app,
    terminal,
    dialog,
};
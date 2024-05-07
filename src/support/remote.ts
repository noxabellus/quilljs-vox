
import * as remote from "@electron/remote";


export const app = {
    on: remote.app.on,
    off: remote.app.off,
    once: remote.app.once,
    quit: remote.app.quit,
};

export type WindowCloseCallback = ((exit: () => void) => void) | null;

export const terminal: Console = (remote.app as any).console;
export const window: {onClose: WindowCloseCallback} = (remote.app as any).window;
export const dialog = remote.dialog;

terminal.log("remote connected");

export default {
    app,
    terminal,
    dialog,
    window,
};

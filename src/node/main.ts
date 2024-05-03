import { app, BrowserWindow, Menu } from "electron";

import * as remoteMain from "@electron/remote/main";

import path from "path";
import { watch } from "fs/promises";


const clientDir = path.join(__dirname, "./client");

(app as any).console = new console.Console(process.stdout, process.stderr);

Menu.setApplicationMenu(null);

remoteMain.initialize();


await app.whenReady();


const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
    }
});

// hack to get around weird behavior with the close/onbeforeunload events
type OnCloseCallback = ((exit: () => void) => void) | null;

const windowObj: {onClose: OnCloseCallback} = {
    onClose: null
};

(app as any).window = windowObj;

win.on("close", async (e) => {
    const callback = windowObj.onClose;

    if (callback) {
        e.preventDefault();

        callback(() => {
            windowObj.onClose = null;
            win.close();
        });
    }
});

win.loadFile(path.join(clientDir, "index.html"));
win.webContents.session.setSpellCheckerEnabled(false);
// win.setFullScreen(true);
win.webContents.openDevTools();

remoteMain.enable(win.webContents);

let dirty = false;
let needHardReset = false;

(async () => {
    const watcher = watch(clientDir);
    for await (const _ of watcher) {
        dirty = true;
    }
})();

(async () => {
    const watcher = watch(path.join(__dirname, "main.js"));
    for await (const _ of watcher) {
        needHardReset = true;
    }
})();


setInterval(() => {
    if (needHardReset) {
        console.log("need hard reset, reloading electron");
        app.relaunch();
        app.quit();
    }

    if (dirty) {
        console.log("need soft reset, reloading window");
        dirty = false;
        win.reload();
    }
}, 1000);

import { app, BrowserWindow, Menu } from "electron";

import * as remoteMain from "@electron/remote/main";

import path from "path";
import { watch } from "fs/promises";


const clientDir = path.join(__dirname, "./client");

(app as any).console = new console.Console(process.stdout, process.stderr);

Menu.setApplicationMenu(null);

remoteMain.initialize();

app.whenReady().then(() => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            // enableRemoteModule: true,
            contextIsolation: false
        }
    })
  
    win.loadFile(path.join(clientDir, "index.html"));
    win.setFullScreen(true);
    win.webContents.openDevTools();

    remoteMain.enable(win.webContents);

    let dirty = false;

    (async () => {
        try {
            const watcher = watch(clientDir);
            for await (const _ of watcher) {
                dirty = true;
            }
        } catch (err) {
            throw err;
        }
      })();

    setInterval(() => {
        if (dirty) {
            console.log("reloading window");
            dirty = false;
            win.reload();
        }
    }, 1000);
  }).catch(console.error);


import { app, BrowserWindow, Menu } from 'electron';

import * as remoteMain from '@electron/remote/main';

import path from 'path';


app.console = new console.Console(process.stdout, process.stderr);

Menu.setApplicationMenu(null);

remoteMain.initialize();

app.whenReady().then(() => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false
        }
    })
  
    win.loadFile(path.join(__dirname, './client/index.html'));
    win.setFullScreen(true);
    win.webContents.openDevTools();

    remoteMain.enable(win.webContents);
  }).catch(console.error);


import { electronApp, optimizer } from '@electron-toolkit/utils';
// import { autoUpdater } from 'electron-updater';
import { BrowserWindow, Menu, app, ipcMain } from 'electron';

import electronUpdater, { type AppUpdater } from 'electron-updater';

export function getAutoUpdater(): AppUpdater {
  // Using destructuring to access autoUpdater due to the CommonJS module of 'electron-updater'.
  // It is a workaround for ESM compatibility issues, see https://github.com/electron-userland/electron-builder/issues/7976.
  const { autoUpdater } = electronUpdater;
  return autoUpdater;
}

const autoUpdater = getAutoUpdater();

import { registerAPI } from './systems/ipc';

import * as windows from './systems/window';

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  autoUpdater.checkForUpdatesAndNotify();

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // initializeTray();
  registerAPI(ipcMain);

  windows.main.open();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      windows.main.open();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

import { Logger } from '@norviah/logger';

const logger = new Logger({ write: true, dir: app.getPath('desktop') });

const template: any = [];
if (process.platform === 'darwin') {
  // OS X
  const name = app.getName();
  template.unshift({
    label: name,
    submenu: [
      {
        label: 'About ' + name,
        role: 'about',
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click() {
          app.quit();
        },
      },
    ],
  });
}

// let win: BrowserWindow | null = null;

function sendStatusToWindow(text) {
  logger.info(text);
  windows.main.window?.webContents.send('message', text);
}
// function createDefaultWindow() {
//   win = new BrowserWindow({
//     webPreferences: {
//       nodeIntegration: true,
//       contextIsolation: false,
//     },
//   });
//   win.webContents.openDevTools();
//   win.on('closed', () => {
//     win = null;
//   });
//   win.loadURL(`file://${__dirname}/version.html#v${app.getVersion()}`);
//   return win;
// }
autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...');
});
autoUpdater.on('update-available', () => {
  sendStatusToWindow('Update available.');
});
autoUpdater.on('update-not-available', () => {
  sendStatusToWindow('Update not available.');
});
autoUpdater.on('error', (err) => {
  sendStatusToWindow('Error in auto-updater. ' + err);
});
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = 'Download speed: ' + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + '/' + progressObj.total + ')';
  sendStatusToWindow(log_message);
});
autoUpdater.on('update-downloaded', () => {
  sendStatusToWindow('Update downloaded');
});
app.on('ready', () => {
  // Create the Menu
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // createDefaultWindow();
});
app.on('window-all-closed', () => {
  app.quit();
});

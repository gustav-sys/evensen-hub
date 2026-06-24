const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

// Auto-update: Windows production builds only. macOS is unsigned and cannot
// self-update (Apple requires a signed app), and dev runs from a local server.
let autoUpdater = null;
if (!isDev && process.platform === 'win32') {
  try {
    autoUpdater = require('electron-updater').autoUpdater;
  } catch (err) {
    console.error('electron-updater unavailable:', err);
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#F7F4EF',
    title: 'Evensen Campaign Hub',
    show: false,
  });

  win.once('ready-to-show', () => win.show());

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  createWindow();

  // Check for updates in the background; downloads silently and installs on quit.
  if (autoUpdater) {
    autoUpdater
      .checkForUpdatesAndNotify()
      .catch(err => console.error('Update check failed:', err));
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

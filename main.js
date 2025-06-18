const { app, BrowserWindow, shell, Menu } = require('electron');
const path = require('path');

// In dev mode (running via `npm run dev`), app.isPackaged is false.
// In a packaged build, app.isPackaged is true.
const isDev = !app.isPackaged;

function createWindow() {
  // Remove the default application menu
  Menu.setApplicationMenu(null);

  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    autoHideMenuBar: true,   // hide the menu bar by default
    frame: true,             // keep the window frame; set false to remove title bar entirely
    webPreferences: {
      nodeIntegration: false,
    },
  });

  const startURL = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, 'out', 'index.html')}`;

  win.loadURL(startURL);

  // Open all new-window links in the default browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Open any in-page navigations externally
  win.webContents.on('will-navigate', (event, url) => {
    if (url !== startURL) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());

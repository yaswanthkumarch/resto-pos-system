import { app, BrowserWindow, Menu, shell, ipcMain, dialog, screen } from 'electron';
import { autoUpdater } from 'electron-updater';
import * as path from 'path';
import * as isDev from 'electron-is-dev';
import Store from 'electron-store';
import log from 'electron-log';

const store = new Store();

interface WindowState {
  x?: number;
  y?: number;
  width: number;
  height: number;
  isMaximized?: boolean;
  isFullscreen?: boolean;
}

class MainWindow {
  private window: BrowserWindow | null = null;
  private forceQuit = false;

  constructor() {
    this.createWindow();
    this.setupEventHandlers();
    this.setupAutoUpdater();
  }

  private createWindow(): void {
    const defaultState: WindowState = {
      width: 1200,
      height: 800,
      x: undefined,
      y: undefined,
      isMaximized: false,
      isFullscreen: false,
    };

    const savedState = store.get('windowState', defaultState) as WindowState;
    
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    const windowState = {
      ...defaultState,
      ...savedState,
      width: Math.min(savedState.width, width),
      height: Math.min(savedState.height, height),
    };

    this.window = new BrowserWindow({
      ...windowState,
      minWidth: 800,
      minHeight: 600,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, 'preload.js'),
      },
      titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
      icon: path.join(__dirname, 'assets', 'icon.png'),
    });

    if (windowState.isMaximized) {
      this.window.maximize();
    }

    if (windowState.isFullscreen) {
      this.window.setFullScreen(true);
    }

    this.window.once('ready-to-show', () => {
      this.window?.show();
      if (isDev) {
        this.window?.webContents.openDevTools();
      }
    });

    this.window.on('close', (event) => {
      if (process.platform === 'darwin' && !this.forceQuit) {
        event.preventDefault();
        this.window?.hide();
      } else {
        this.saveWindowState();
      }
    });

    this.window.on('closed', () => {
      this.window = null;
    });

    this.window.on('resize', () => {
      this.saveWindowState();
    });

    this.window.on('move', () => {
      this.saveWindowState();
    });

    this.window.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });

    const startUrl = isDev 
      ? 'http://localhost:3000' 
      : `file://${path.join(__dirname, '../frontend/build/index.html')}`;
    
    this.window.loadURL(startUrl);
  }

  private saveWindowState(): void {
    if (!this.window) return;

    const bounds = this.window.getBounds();
    const state: WindowState = {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      isMaximized: this.window.isMaximized(),
      isFullscreen: this.window.isFullScreen(),
    };

    store.set('windowState', state);
  }

  private setupEventHandlers(): void {
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createWindow();
      } else if (this.window) {
        this.window.show();
      }
    });

    app.on('before-quit', () => {
      this.forceQuit = true;
    });

    ipcMain.handle('app-version', () => {
      return app.getVersion();
    });

    ipcMain.handle('check-for-updates', () => {
      if (!isDev) {
        autoUpdater.checkForUpdatesAndNotify();
      }
    });

    ipcMain.handle('restart-app', () => {
      autoUpdater.quitAndInstall();
    });

    ipcMain.handle('show-message-box', async (event, options) => {
      const result = await dialog.showMessageBox(this.window!, options);
      return result;
    });

    ipcMain.handle('show-save-dialog', async (event, options) => {
      const result = await dialog.showSaveDialog(this.window!, options);
      return result;
    });

    ipcMain.handle('show-open-dialog', async (event, options) => {
      const result = await dialog.showOpenDialog(this.window!, options);
      return result;
    });

    ipcMain.handle('get-store-value', (event, key) => {
      return store.get(key);
    });

    ipcMain.handle('set-store-value', (event, key, value) => {
      store.set(key, value);
    });

    ipcMain.handle('delete-store-value', (event, key) => {
      store.delete(key);
    });
  }

  private setupAutoUpdater(): void {
    if (isDev) {
      return;
    }

    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();

    autoUpdater.on('checking-for-update', () => {
      log.info('Checking for updates...');
    });

    autoUpdater.on('update-available', (info) => {
      log.info('Update available:', info);
      this.window?.webContents.send('update-available', info);
    });

    autoUpdater.on('update-not-available', (info) => {
      log.info('Update not available:', info);
    });

    autoUpdater.on('error', (err) => {
      log.error('Error in auto-updater:', err);
    });

    autoUpdater.on('download-progress', (progressObj) => {
      let logMessage = `Download speed: ${progressObj.bytesPerSecond}`;
      logMessage += ` - Downloaded ${progressObj.percent}%`;
      logMessage += ` (${progressObj.transferred}/${progressObj.total})`;
      log.info(logMessage);
      this.window?.webContents.send('download-progress', progressObj);
    });

    autoUpdater.on('update-downloaded', (info) => {
      log.info('Update downloaded:', info);
      this.window?.webContents.send('update-downloaded', info);
    });
  }

  private setupMenu(): void {
    const template: any[] = [
      {
        label: 'File',
        submenu: [
          {
            label: 'New Order',
            accelerator: 'CmdOrCtrl+N',
            click: () => {
              this.window?.webContents.send('menu-new-order');
            },
          },
          {
            label: 'Print Receipt',
            accelerator: 'CmdOrCtrl+P',
            click: () => {
              this.window?.webContents.send('menu-print-receipt');
            },
          },
          { type: 'separator' },
          {
            label: 'Settings',
            accelerator: 'CmdOrCtrl+,',
            click: () => {
              this.window?.webContents.send('menu-settings');
            },
          },
          { type: 'separator' },
          {
            label: 'Quit',
            accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
            click: () => {
              this.forceQuit = true;
              app.quit();
            },
          },
        ],
      },
      {
        label: 'Edit',
        submenu: [
          { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
          { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
          { type: 'separator' },
          { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
          { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
          { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        ],
      },
      {
        label: 'View',
        submenu: [
          { label: 'Reload', accelerator: 'CmdOrCtrl+R', role: 'reload' },
          { label: 'Force Reload', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
          { label: 'Toggle Developer Tools', accelerator: 'F12', role: 'toggleDevTools' },
          { type: 'separator' },
          { label: 'Actual Size', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
          { label: 'Zoom In', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
          { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
          { type: 'separator' },
          { label: 'Toggle Fullscreen', accelerator: 'F11', role: 'togglefullscreen' },
        ],
      },
      {
        label: 'Window',
        submenu: [
          { label: 'Minimize', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
          { label: 'Close', accelerator: 'CmdOrCtrl+W', role: 'close' },
        ],
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'About',
            click: () => {
              this.window?.webContents.send('menu-about');
            },
          },
          {
            label: 'Check for Updates',
            click: () => {
              if (!isDev) {
                autoUpdater.checkForUpdatesAndNotify();
              }
            },
          },
        ],
      },
    ];

    if (process.platform === 'darwin') {
      template.unshift({
        label: app.getName(),
        submenu: [
          { label: 'About ' + app.getName(), role: 'about' },
          { type: 'separator' },
          { label: 'Services', role: 'services', submenu: [] },
          { type: 'separator' },
          { label: 'Hide ' + app.getName(), accelerator: 'Command+H', role: 'hide' },
          { label: 'Hide Others', accelerator: 'Command+Shift+H', role: 'hideothers' },
          { label: 'Show All', role: 'unhide' },
          { type: 'separator' },
          { label: 'Quit', accelerator: 'Command+Q', click: () => app.quit() },
        ],
      });
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }
}

app.whenReady().then(() => {
  new MainWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    new MainWindow();
  }
}); 
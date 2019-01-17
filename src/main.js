import { app, BrowserWindow, Menu, MenuItem, ipcMain } from 'electron';
import { appMenuTemplate } from './appmenu.js';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let isSafeExist = false;
const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
  });

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // 增加主菜单（默认生成的打包后会消失）
  // File菜单下新增New子菜单
  const menu = Menu.buildFromTemplate(appMenuTemplate);
  menu.items[0].submenu.append(new MenuItem({
    label: 'New',
    click() {
      mainWindow.webContents.send('action', 'new'); // 点击后向主页渲染进程发送“新建文件”的命令
    },
    accelerator: 'CmdOrCtrl+N',
  }));
  // 在New菜单后面添加名为Open的同级菜单
  menu.items[0].submenu.append(new MenuItem({
    label: 'Open',
    click() {
      mainWindow.webContents.send('action', 'open'); // 点击后向主页渲染进程发送“打开文件”的命令
    },
    accelerator: 'CmdOrCtrl+O',
  }));
  // 在New菜单后添加名为Save的同级菜单
  menu.items[0].submenu.append(new MenuItem({
    label: 'Save',
    click() {
      mainWindow.webContents.send('action', 'save');
    },
    accelerator: 'CmdOrCtrl+S',
  }));
  // 分隔符
  menu.items[0].submenu.append(new MenuItem({
    type: 'separator',
  }));
  // 退出
  menu.items[0].submenu.append(new MenuItem({
    role: 'quit',
  }));
  Menu.setApplicationMenu(menu);

  mainWindow.on('close', (e) => {
    if (!isSafeExist) {
      e.preventDefault();
      mainWindow.webContents.send('action', 'exiting');
    }
  });

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

ipcMain.on('reqaction', (event, arg) => {
  switch (arg) {
    case 'exit':
      isSafeExist = true;
      app.quit();
      break;
    default : console.log('default');
  }
});

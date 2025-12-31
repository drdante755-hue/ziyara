const { app, BrowserWindow, net, ipcMain } = require("electron");
const path = require("path");

let mainWindow;
let splash;
let attempts = 0;
const maxAttempts = 3;
const retryInterval = 3000; // 3 ثواني

// استماع لطلب غلق التطبيق من Renderer
ipcMain.on("close-app", () => {
  app.quit();
});

// دالة للتحقق من الإنترنت
function checkInternet(callback) {
  const request = net.request("https://www.google.com");
  request.on("response", () => callback(true));
  request.on("error", () => callback(false));
  request.end();
}

function createWindow() {
  // 1. نافذة السبلاش
  splash = new BrowserWindow({
    width: 500,
    height: 400,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    webPreferences: {
      preload: path.join(__dirname, "app", "preload", "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  splash.loadFile(path.join(__dirname, "splash.html"));

  // 2. نافذة التطبيق الرئيسي
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    icon: path.join(__dirname, "public", "images", "Ziyara-logo.png"),
    webPreferences: {
      preload: path.join(__dirname, "app", "preload", "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  mainWindow.loadURL("https://ziyara-tau.vercel.app/");

  function tryShowMainWindow() {
    checkInternet((isOnline) => {
      if (isOnline) {
        splash.destroy();
        mainWindow.show();
      } else {
        attempts++;
        if (attempts >= maxAttempts) {
          console.log("No internet after 3 attempts. Closing app.");
          app.quit();
        } else {
          console.log(`Attempt ${attempts} failed. Retrying in 3s...`);
          setTimeout(tryShowMainWindow, retryInterval);
        }
      }
    });
  }

  mainWindow.once("ready-to-show", () => {
    tryShowMainWindow();
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

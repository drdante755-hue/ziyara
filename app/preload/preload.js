const { ipcRenderer, contextBridge } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  isOnline: () => navigator.onLine,
  closeApp: () => ipcRenderer.send("close-app") // إضافة وظيفة إغلاق التطبيق
});

let attempts = 0;
const maxAttempts = 3;
const checkInterval = 3000; // 3 ثواني

function checkConnection() {
  if (navigator.onLine) {
    console.log("Online!");
  } else {
    attempts++;
    if (attempts >= maxAttempts) {
      console.log("No internet after 3 attempts. Closing app.");
      ipcRenderer.send("close-app"); // إرسال حدث لغلق التطبيق
    } else {
      alert(`Ziyara\n\nانت غير متصل بالانترنت. الرجاء اعادة الاتصال بالانترنت.\nمحاولة ${attempts} من 3`);
      setTimeout(checkConnection, checkInterval);
    }
  }
}

// بدء التحقق بعد ثانية من تحميل Preload
setTimeout(checkConnection, 1000);

window.addEventListener("offline", () => {
  console.log("Went offline!");
  checkConnection();
});

window.addEventListener("online", () => {
  console.log("Back online!");
});

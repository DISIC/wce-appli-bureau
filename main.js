const path = require('path');
const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const { setupScreenSharingMain, initPopupsConfigurationMain, setupAlwaysOnTopMain, setupPowerMonitorMain } = require('@jitsi/electron-sdk');

app.commandLine.appendSwitch('ignore-certificate-errors')
app.commandLine.appendSwitch('disable-site-isolation-trials')



let mainWindow;
let wce_url = null;

wce_url = typeof process.argv[2] === "string" ? process.argv[2].replace('wce-appli-bureau', 'https') : null
wce_url = typeof process.argv[2] === "string" ? wce_url.replace('appel.', '') : null


//les liens autorisés par le protocol
const whiteListedUrls = [
  "https://preprod.webconf.numerique.gouv.fr/",
  "https://appel.preprod.webconf.numerique.gouv.fr/",
  "https://webconf.numerique.gouv.fr/",
  "https://appel.webconf.numerique.gouv.fr/",
]

function createMainWindow(url) {
  mainWindow = new BrowserWindow({
    title: "WebConférence de l'État",
    width: 1000,
    height: 600,
    icon: __dirname + '/favicon.ico',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false
    },
  });
  mainWindow.maximize()

  // initPopupsConfigurationMain(mainWindow);
  setupAlwaysOnTopMain(mainWindow, null, windowOpenHandler);
  setupPowerMonitorMain(mainWindow);
  setupScreenSharingMain(mainWindow, 'jitsi', 'org.jitsi.jitsi-meet');
  mainWindow.loadURL(url);
}

const windowOpenHandler = ({ url, frameName }) => {
  const target = getPopupTarget(url, frameName);

  if (!target || target === 'browser') {
    openExternalLink(url);

    return { action: 'deny' };
  }

  if (target === 'electron') {
    return { action: 'allow' };
  }

  return { action: 'deny' };
};



if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('wce-appli-bureau', process.execPath, [path.resolve(process.argv[1])])
  }
} else {
  app.setAsDefaultProtocolClient('wce-appli-bureau')
}

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    wce_url = typeof process.argv[2] === "string" ? process.argv[2].replace('wce-appli-bureau', 'https') : null
    wce_url = typeof process.argv[2] === "string" ? wce_url.replace('appel.', '') : null
    var exists = whiteListedUrls.findIndex((url) => { return url.startsWith(wce_url); }, wce_url)
    //si quelqu'un refait le deeplinking et la fenetre est deja ouverte on fait un focus sur la fenetre actuelle.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      // 
      // dialog.showErrorBox('Bon retour', `vous etes arrivé depuis: ${commandLine.pop().slice(0, -1)}`)
      mainWindow.focus()
      //app.relaunch({ args: commandLine.pop().slice(0, -1) })
      mainWindow.webContents.send('message', { 'url': commandLine.pop().slice(0, 99).replace('wce-appli-bureau', 'https') });
      // if (exists) {
      //   app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) })
      //   app.exit(0)
      // } else {
      //   app.relaunch()
      //   dialog.showErrorBox('Bonjour', `${wce_url} n'est pas supporté`)
      // }

      // const bounds = mainWindow.getBounds();
      // console.log("url ==============", commandLine.pop().slice(0, -1))
      // // Change the URL of the BrowserView
      // mainWindow.webContents.loadURL(commandLine.pop().slice(0, 99).replace('wce-appli-bureau', 'https'));

      // //Restore the bounds of the BrowserView after the new page is loaded
      // mainWindow.setBounds(bounds);
    } else {

    }
    //dialog.showErrorBox('Bon retour', `vous etes arrivé depuis: ${commandLine.pop().slice(0, -1)}`)
  })





  app.whenReady().then(() => {
    let exists = whiteListedUrls.findIndex((url) => { return url.startsWith(wce_url); }, wce_url)
    if (wce_url === null || exists) {
      wce_url ? createMainWindow(wce_url) : createMainWindow('https://preprod.webconf.numerique.gouv.fr/');
    } else {
      dialog.showErrorBox('Bonjour', `${wce_url} n'est pas supporté`)
    }
  });


  app.on('open-url', (event, url) => {
    dialog.showErrorBox('Bon retour', `vous etes arrivé depuis: ${url}`)
  })
}



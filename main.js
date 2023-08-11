const APP_NAME = "WebConférence de l'État";

const path = require('path');
const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const { setupScreenSharingMain, initPopupsConfigurationMain, setupAlwaysOnTopMain, setupPowerMonitorMain } = require('@jitsi/electron-sdk');
const { autoUpdater, AppUpdater } = require('electron-updater');

//éviter les problèmes de CORS
app.commandLine.appendSwitch('ignore-certificate-errors')
app.commandLine.appendSwitch('disable-site-isolation-trials')

// Object.defineProperty(app, 'isPackaged', {
//   get() {
//     return true;
//   }
// });
//initialisation de l'objet mainWindow
let mainWindow;

autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

autoUpdater.on('checking-for-update', () => {
  console.log('checking-for-update')
})

autoUpdater.on('update-available', (info) => {
  console.log('update-available 1.0.3', 'hhh')
})

autoUpdater.on('download-progress', (info) => {
  console.log('download-progress 1.0.3', 'hhh')
})

autoUpdater.on('update-downloded', (info) => {
  console.log('update-downloded 1.0.1', 'hhh')
})

//le lien qui provient du protocol wce-appli-bureau
let wce_url = null;

//remplacer le protocol par https et si en cas de conférence le lien contient "appel", le lien doit etre normalisé en supprimant "appel."" du lien
wce_url = typeof process.argv[1] === "string" ? process.argv[1].replace('wce-appli-bureau', 'https') : null
wce_url = typeof wce_url === "string" ? wce_url.replace('appel.', '') : null


//les liens autorisés par le protocol
const whiteListedUrls = [
  "https://preprod.webconf.numerique.gouv.fr/",
  "https://appel.preprod.webconf.numerique.gouv.fr/",
  "https://webconf.numerique.gouv.fr/",
  "https://appel.webconf.numerique.gouv.fr/"
]

/*
fonction qui crée une instance mainWindow à partir de l'url qu'on lui passe
et active les différentes fonctionnalités.
@param {string} url
@return {void}
*/
function createMainWindow(url) {
  mainWindow = new BrowserWindow({
    title: APP_NAME,
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

  setupAlwaysOnTopMain(mainWindow, null, ({ url, frameName }) => {
    const target = getPopupTarget(url, frameName);

    if (!target || target === 'browser') {
      openExternalLink(url);
      return { action: 'deny' };
    }

    if (target === 'electron') {
      return { action: 'allow' };
    }

    return { action: 'deny' };
  });
  setupPowerMonitorMain(mainWindow);
  setupScreenSharingMain(mainWindow, APP_NAME, '');
  mainWindow.loadURL(url);
}


//initialiser le protocol après la vérification de l'ouverture de l'application avec l'éxecutable
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('wce-appli-bureau', process.execPath, [path.resolve(process.argv[1])])
  }
} else {
  app.setAsDefaultProtocolClient('wce-appli-bureau')
}

//variable qui retourne false si l'application est ouverte en double instance
const gotTheLock = app.requestSingleInstanceLock()

//ouvrir la seconde instance en remplacant le mainWindow actuel
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    wce_url = commandLine.pop().slice(0, 99999).replace('wce-appli-bureau', 'https')
    //wce_url = typeof wce_url === "string" ? wce_url.replace('appel.', '') : null
    // true si le lien qui provient du protocole est autorisé (commence par un des paramètres du tableau whiteListedUrls)
    let exists
    if (wce_url !== null) {
      exists = whiteListedUrls.findIndex((url) => { return wce_url.startsWith(url); })
      //dialog.showErrorBox('Bon test', `${wce_url} exist ${exists}`)
    }
    //si quelqu'un refait le deeplinking et la fenetre est deja ouverte on fait un focus sur la fenetre actuelle.
    if (mainWindow && exists >= 0) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      // 
      mainWindow.focus()
      mainWindow.webContents.send('message', { 'url': wce_url });

    } else {
      dialog.showErrorBox('Erreur', `L'adresse ${wce_url} n'est pas supportée.`)
    }
  })

  //relance de la première instance
  app.whenReady().then(() => {
    // true si le lien qui provient du protocole est autorisé (commence par un des paramètres du tableau whiteListedUrls)
    let exists
    if (wce_url !== null) {
      exists = whiteListedUrls.findIndex((url) => { return wce_url.startsWith(url); })
    }
    if (wce_url === null || exists >= 0) {
      if (exists >= 0) {
        createMainWindow(wce_url)
      } else {
        createMainWindow('https://preprod.webconf.numerique.gouv.fr/')
      }
    } else {
      dialog.showErrorBox('Erreur', `L'adresse ${wce_url} n'est pas supportée.`)
    }

    autoUpdater.checkForUpdatesAndNotify();
  });

  // app.on('open-url', (event, url) => {
  //   dialog.showErrorBox('Bon retour', `vous etes arrivé depuis: ${url}`)
  // })
}
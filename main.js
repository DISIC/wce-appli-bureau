const path = require('path');
const { app, BrowserWindow, dialog } = require('electron');
const { setupScreenSharingMain, initPopupsConfigurationMain, setupAlwaysOnTopMain, setupPowerMonitorMain } = require('@jitsi/electron-sdk');

app.commandLine.appendSwitch('ignore-certificate-errors')
app.commandLine.appendSwitch('disable-site-isolation-trials')
// app.commandLine.appendSwitch('disable-features', 'BlockInsecurePrivateNetworkRequests')


let mainWindow;
let wce_url = null;

wce_url = typeof process.argv[2] === "string" ? process.argv[2].replace('wce-appli-bureau', 'https') : null

// TODO: transorm links starting with appel.domain to domain
const whiteListedUrls = [
  "https://preprod.webconf.numerique.gouv.fr/",
  "https://appel.preprod.webconf.numerique.gouv.fr/",
  "https://webconf.numerique.gouv.fr/",
  "https://appel.webconf.numerique.gouv.fr/"
]

function createMainWindow(url) {
  mainWindow = new BrowserWindow({
    title: 'jitsi',
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
  // dialog.showErrorBox('Welcome Back', ` ${process.argv[2].replace('wce-appli-bureau', 'https')}`)

  // initPopupsConfigurationMain(mainWindow);
  setupAlwaysOnTopMain(mainWindow, null, windowOpenHandler);
  setupPowerMonitorMain(mainWindow);
  setupScreenSharingMain(mainWindow, 'jitsi', 'org.jitsi.jitsi-meet');
  //mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));

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
  // wce_url = `${commandLine.pop().slice(0, -1)}`
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
    // wce_url = `${commandLine.pop().slice(0, -1)}`

    dialog.showErrorBox('Welcome Back', `You arrived from: ${commandLine.pop().slice(0, -1)}`)
  })


  app.whenReady().then(() => {
    //TODO remplacer "wce_url.startsWith(whiteListedUrls[0]) || wce_url.startsWith(whiteListedUrls[1]) ||..." par un code plus propore => boucle qui reprend les éléments du whiteListedUrls. 
    if (wce_url === null || wce_url.startsWith(whiteListedUrls[0]) || wce_url.startsWith(whiteListedUrls[1]) || wce_url.startsWith(whiteListedUrls[2]) || wce_url.startsWith(whiteListedUrls[3])) {
      wce_url ? createMainWindow(wce_url) : createMainWindow('https://preprod.webconf.numerique.gouv.fr');
    } else {
      dialog.showErrorBox('Welcome', `${wce_url} is not supported`)
    }
  });


  app.on('open-url', (event, url) => {
    dialog.showErrorBox('Welcome Back', `You arrived from: ${url}`)
  })
}



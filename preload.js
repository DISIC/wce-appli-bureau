require('dotenv').config();
const {
  RemoteControl,
  setupScreenSharingRender,
  setupAlwaysOnTopRender,
  initPopupsConfigurationRender,
  setupPowerMonitorRender,
} = require('@jitsi/electron-sdk');
const { ipcRenderer } = require('electron')


ipcRenderer.on('message', function (evt, message) {
  console.log("url====", message.url);
  console.log("href1====", window.location.href)
  //window.location.href = message.url
  window.location.replace(message.url)
  console.log("href2====", window.location.href)
});

function setupRenderer(api, options) {

  initPopupsConfigurationRender(api);

  const iframe = api._frame;

  // activer le mode partage d'ecran
  setupScreenSharingRender(api);

  if (options.enableRemoteControl) {
    new RemoteControl(iframe);
  }

  // permet d'activer la fonctionnalité toujours en dessus.
  if (true) {
    setupAlwaysOnTopRender(api);
  }
  // eviter la mise en veille pendant la conference
  setupPowerMonitorRender(api);

}

window.setupRenderer = setupRenderer;

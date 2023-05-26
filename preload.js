require('dotenv').config();
const {
  RemoteControl,
  setupScreenSharingRender,
  setupAlwaysOnTopRender,
  initPopupsConfigurationRender,
  setupPowerMonitorRender,
} = require('@jitsi/electron-sdk');
const { ipcRenderer } = require('electron')

// eventListner qui repond à l'eventEmitter second-instance de main.js
ipcRenderer.on('message', function (evt, message) {
  window.location.replace(message.url)
});

/*
fonction qui active les différentes fonctionnalités.
@param {Object} api
@param {Object} options
@return {void}
*/
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

//envoi de la fonction avec l'objet global pour etre utilisé par l'application react
window.setupRenderer = setupRenderer;

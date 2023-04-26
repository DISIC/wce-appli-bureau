require('dotenv').config();
const {
  RemoteControl,
  setupScreenSharingRender,
  setupAlwaysOnTopRender,
  initPopupsConfigurationRender,
  setupPowerMonitorRender,
} = require('@jitsi/electron-sdk');


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

require('dotenv').config();
const { desktopCapturer, ipcRenderer, contextBridge } = require('electron');
const {
  RemoteControl,
  setupScreenSharingRender,
  setupAlwaysOnTopRender,
  initPopupsConfigurationRender,
  setupPowerMonitorRender,
} = require('@jitsi/electron-sdk');


/**
 * Open an external URL.
 *
 * @param {string} url - The URL we with to open.
 * @returns {void}
 */
function openExternalLink(url) {
  ipcRenderer.send('jitsi-open-url', url);
}

/**
 * Setup the renderer process.
 *
 * @param {*} api - API object.
 * @param {*} options - Options for what to enable.
 * @returns {void}
 */
function setupRenderer(api, options) {
  console.log('setupRenderer started =====', api);

  initPopupsConfigurationRender(api);

  const iframe = api._frame;

  console.log('setupRenderer iframe =====', api);
  console.log('getIFrame', api.getIFrame());

  setupScreenSharingRender(api);

  if (options.enableRemoteControl) {
    new RemoteControl(iframe); // eslint-disable-line no-new
  }

  // Allow window to be on top if enabled in settings
  if (true) {
    setupAlwaysOnTopRender(api);
  }

  setupPowerMonitorRender(api);
}

window.setupRenderer = setupRenderer;

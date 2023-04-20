const domain = 'appel.preprod.webconf.numerique.gouv.fr';

console.log('shaaaaring ========>', screenSharing);

const options = {
  height: 700,
  parentNode: document.querySelector('div'),
  interfaceConfigOverwrite: {
    filmStripOnly: false,
    SHOW_JITSI_WATERMARK: false,
  },
  configOverwrite: {
    disableSimulcast: false,
    prejoinPageEnabled: false,
  },
  userInfo: {
    displayName: 'displayName',
  },
};

const api = new JitsiMeetExternalAPI(domain, options);
window.setupRenderer(api, {});
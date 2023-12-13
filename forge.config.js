module.exports = {
  packagerConfig: {
    icon: './favicon.ico',
    name: "WebConférence de l'État"
  },
  rebuildConfig: {
    icon: './favicon.ico',
    name: "WebConférence de l'État"
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
};

const { Menu, shell } = require('electron');

const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';

// Mirrors src/examples/demoRegistry.ts. Grouped as submenus under the Demos menu.
const DEMO_GROUPS = [
  {
    label: 'Platform & Windows',
    items: [
      { id: 'platform', label: 'Platform Playground' },
      { id: 'platform-control', label: 'Platform Control' },
      { id: 'docking', label: 'Window Docking' },
    ],
  },
  {
    label: 'Interop (FDC3)',
    items: [
      { id: 'fdc3', label: 'FDC3 Demo' },
      { id: 'fdc3-inspector', label: 'FDC3 Inspector' },
    ],
  },
  {
    label: 'Messaging',
    items: [
      { id: 'messaging', label: 'Messaging (IAB + Channels)' },
      { id: 'external', label: 'External Connections' },
    ],
  },
  {
    label: 'Integration',
    items: [
      { id: 'integration', label: 'Clipboard & Hotkeys' },
      { id: 'dragdrop', label: 'Drag & Drop' },
    ],
  },
  {
    label: 'Workspace Components',
    items: [
      { id: 'palette', label: 'Command Palette' },
      { id: 'dock', label: 'Dock / App Bar' },
      { id: 'store', label: 'App Store' },
      { id: 'browser', label: 'Browser' },
      { id: 'notifications', label: 'Notification Center' },
    ],
  },
  {
    label: 'Theming & Shells',
    items: [
      { id: 'theme', label: 'Theme Engine' },
      { id: 'minimal', label: 'Launcher Workspace' },
      { id: 'full', label: 'Full Workspace' },
    ],
  },
];

/**
 * Build the application menu, including a Demos menu that navigates the main window to each
 * built-in demo (`?test=<id>`). Standard roles are preserved so the native menu keeps working.
 */
function buildAppMenu(getMainWindow) {
  const open = (route) => {
    const win = getMainWindow();
    if (win) win.loadURL(`${VITE_DEV_SERVER_URL}/${route}`);
  };

  const demoSubmenu = [
    { label: 'Demo Gallery', accelerator: 'CmdOrCtrl+Shift+D', click: () => open('?test=demos') },
    { label: 'Workspace (Home)', click: () => open('') },
    { type: 'separator' },
    ...DEMO_GROUPS.map((group) => ({
      label: group.label,
      submenu: group.items.map((item) => ({
        label: item.label,
        click: () => open(`?test=${item.id}`),
      })),
    })),
  ];

  const template = [
    { role: 'fileMenu' },
    { role: 'editMenu' },
    { role: 'viewMenu' },
    { label: 'Demos', submenu: demoSubmenu },
    { role: 'windowMenu' },
    {
      role: 'help',
      submenu: [
        { label: 'FinDesktop on GitHub', click: () => shell.openExternal('https://github.com/finos') },
      ],
    },
  ];

  return Menu.buildFromTemplate(template);
}

module.exports = { buildAppMenu };

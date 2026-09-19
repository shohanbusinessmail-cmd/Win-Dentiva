const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('dentiva', {
  isDesktop: true,
  load: () => ipcRenderer.invoke('state:load'),
  save: state => ipcRenderer.invoke('state:save', state),
  hashPassword: password => ipcRenderer.invoke('security:hash', password),
  systemInfo: () => ipcRenderer.invoke('system:info'),
  saveBackup: payload => ipcRenderer.invoke('dialog:saveBackup', payload),
  openBackup: () => ipcRenderer.invoke('dialog:openBackup'),
  openFile: target => ipcRenderer.invoke('file:open', target),
  print: options => ipcRenderer.invoke('print:window', options)
});

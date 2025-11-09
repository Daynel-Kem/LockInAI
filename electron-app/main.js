const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let pyProcess = null;

function createWindow() {
  const win = new BrowserWindow({
    width: 2560,
    height: 1600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

    win.loadURL('http://localhost:3000');

}

app.whenReady().then(() => {
  const backendScript = path.join(__dirname, '../src/functions/server.py');
  console.log('Starting Python backend...');

  pyProcess = spawn('python3', [backendScript]);

  pyProcess.stdout.on('data', (data) => {
    console.log(`PYTHON: ${data}`);
  });

  pyProcess.stderr.on('data', (data) => {
    console.error(`PYTHON ERROR: ${data}`);
  });

  pyProcess.on('close', (code) => {
    console.log(`Python backend exited with code ${code}`);
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (pyProcess) {
    console.log('Stopping Python backend...');
    pyProcess.kill();
  }
  if (process.platform !== 'darwin') app.quit();
});
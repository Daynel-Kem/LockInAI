const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let pyProcess = null;
let nextProcess = null;

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

  pyProcess.stdout.on('data', (data) => console.log(`PYTHON: ${data}`));
  pyProcess.stderr.on('data', (data) => console.error(`PYTHON ERROR: ${data}`));

  const isDev = !app.isPackaged;

  if (isDev) {
    const frontendDir = path.join(__dirname, '../frontend');
    console.log('Starting Next.js frontend...');
    nextProcess = spawn('npm', ['run', 'dev'], { cwd: frontendDir, shell: true });
    nextProcess.stdout.on('data', (data) => console.log(`NEXT: ${data}`));
    nextProcess.stderr.on('data', (data) => console.error(`NEXT ERROR: ${data}`));
  } else {
    console.log('Packaged mode: please start Next.js manually before running the app.');
  }

  setTimeout(() => createWindow(), 5000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  console.log('Shutting down...');
  if (pyProcess) pyProcess.kill();
  if (nextProcess) nextProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});
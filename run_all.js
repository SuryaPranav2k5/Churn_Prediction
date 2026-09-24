const { spawn } = require('child_process');
const path = require('path');

console.log('\x1b[36m%s\x1b[0m', '🚀 Starting ChurnMux Full-Stack Application (Backend + Frontend)...');

// 1. Start Flask Backend
const backend = spawn('uv', ['run', 'python', 'Server/app.py'], {
  cwd: __dirname,
  shell: true,
  stdio: 'pipe',
});

backend.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[36m[Backend]\x1b[0m ${data}`);
});

backend.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[36m[Backend]\x1b[0m ${data}`);
});

backend.on('error', (err) => {
  console.error('\x1b[31m%s\x1b[0m', `[Backend Error] Failed to start backend: ${err.message}`);
});

// 2. Start Vite Frontend Client
const clientDir = path.join(__dirname, 'Client');
const frontend = spawn('npm', ['run', 'dev'], {
  cwd: clientDir,
  shell: true,
  stdio: 'pipe',
});

frontend.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[32m[Frontend]\x1b[0m ${data}`);
});

frontend.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[32m[Frontend]\x1b[0m ${data}`);
});

frontend.on('error', (err) => {
  console.error('\x1b[31m%s\x1b[0m', `[Frontend Error] Failed to start frontend: ${err.message}`);
});

// Clean shutdown on Ctrl+C
const cleanExit = () => {
  console.log('\n\x1b[33m%s\x1b[0m', 'Shutting down backend and frontend services...');
  if (backend && !backend.killed) {
    try {
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', backend.pid.toString(), '/f', '/t']);
      } else {
        backend.kill('SIGTERM');
      }
    } catch (_) {}
  }
  if (frontend && !frontend.killed) {
    try {
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', frontend.pid.toString(), '/f', '/t']);
      } else {
        frontend.kill('SIGTERM');
      }
    } catch (_) {}
  }
  process.exit(0);
};

process.on('SIGINT', cleanExit);
process.on('SIGTERM', cleanExit);
process.on('exit', cleanExit);

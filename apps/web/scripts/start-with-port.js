#!/usr/bin/env node
const { spawn } = require('child_process');

// Usage:
// npm run start:port -- 4000
// OR
// PORT=4000 npm run start:port

const argPort = process.argv[2];
const envPort = process.env.PORT;
const port = argPort || envPort || '3000';

console.log(`Starting Next.js on port ${port}...`);

const child = spawn('npx', ['next', 'start', '-p', port], { stdio: 'inherit', shell: true });

child.on('close', (code) => {
  process.exit(code);
});

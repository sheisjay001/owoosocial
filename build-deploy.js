const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const clientDir = path.join(rootDir, 'client');
const serverDir = path.join(rootDir, 'server');
const clientDistDir = path.join(clientDir, 'dist');

function runCommand(command, cwd) {
  console.log(`Running: ${command} in ${cwd}`);
  try {
    // Force use of shell option for cross-platform compatibility
    execSync(command, { stdio: 'inherit', cwd, shell: true });
  } catch (error) {
    console.error(`Command failed: ${command}`);
    console.error(`Error details: ${error.message}`);
    if (error.stdout) console.log(`Stdout: ${error.stdout.toString()}`);
    if (error.stderr) console.error(`Stderr: ${error.stderr.toString()}`);
    throw error;
  }
}

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  console.log('--- Starting Build Process ---');
  console.log(`Node Version: ${process.version}`);

  // 1. Build Client
  console.log('--- Building Client ---');
  
  // Clean install to avoid lockfile issues on Vercel
  if (process.env.VERCEL) {
      console.log('Vercel environment detected. Using clean install.');
      // Remove package-lock.json if it exists to prevent platform conflicts
      const lockFile = path.join(clientDir, 'package-lock.json');
      if (fs.existsSync(lockFile)) {
          // fs.unlinkSync(lockFile); // Optional: unsafe to delete committed files, better to just run install
      }
  }

  runCommand('npm install', clientDir);
  
  // Verify index.html exists before building
  const indexHtml = path.join(clientDir, 'index.html');
  if (!fs.existsSync(indexHtml)) {
      console.error('CRITICAL ERROR: client/index.html is missing!');
      console.log('Listing client directory content:');
      console.log(fs.readdirSync(clientDir));
      process.exit(1);
  } else {
      console.log('SUCCESS: client/index.html found.');
  }

  runCommand('npm run build', clientDir);

  // 2. Copy Client Build to public/ (Clean Output Directory)
  const publicDir = path.join(rootDir, 'public');
  console.log('--- Copying Client Build to public/ ---');
  
  // Clean public dir to ensure no stale files
  if (fs.existsSync(publicDir)) {
    fs.rmSync(publicDir, { recursive: true, force: true });
  }
  fs.mkdirSync(publicDir);

  if (fs.existsSync(clientDistDir)) {
    // Copy everything from dist to public
    copyDir(clientDistDir, publicDir);
    console.log('Client build copied to public/ successfully.');
  } else {
    throw new Error('Client dist directory not found! Build failed?');
  }

  // 3. Install Server Dependencies
  console.log('--- Installing Server Dependencies ---');
  runCommand('npm install', serverDir);

  console.log('--- Build Complete ---');
} catch (error) {
  console.error('Build Failed:', error);
  process.exit(1);
}

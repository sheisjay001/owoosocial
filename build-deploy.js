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
  
  // List files in client directory for debugging
  console.log('--- Listing Client Directory Before Build ---');
  try {
      const files = fs.readdirSync(clientDir);
      console.log('Files in client:', files);
  } catch (e) {
      console.error('Error listing client files:', e);
  }

  runCommand('npm run build', clientDir);

  // 2. Copy Client Build to Root
  console.log('--- Copying Client Build to Root ---');
  if (fs.existsSync(clientDistDir)) {
    const distFiles = fs.readdirSync(clientDistDir);
    for (const file of distFiles) {
        const srcPath = path.join(clientDistDir, file);
        const destPath = path.join(rootDir, file);
        
        // Only copy standard Vite build artifacts
        if (file === 'index.html' || file === 'assets' || file === 'vite.svg' || file.endsWith('.js') || file.endsWith('.css')) {
            console.log(`Copying ${file} to root...`);
            if (fs.lstatSync(srcPath).isDirectory()) {
                copyDir(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        }
    }
    console.log('Client build copied to root successfully.');
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

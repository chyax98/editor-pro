import { execSync } from 'child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { resolve, join } from 'path';
import { homedir } from 'os';

// Read Manifest to get Plugin ID
const manifest = JSON.parse(readFileSync('manifest.json', 'utf-8'));
const PLUGIN_ID = manifest.id;

// Default vault path (expanded from ~/note-vsc)
const DEFAULT_VAULT = join(homedir(), 'note-vsc');

// Get target from arg or default
let targetArg = process.argv[2];
let targetPath;

if (targetArg) {
    // Basic expansion for ~ if passed as string (though shell usually expands it)
    if (targetArg.startsWith('~/')) {
        targetArg = join(homedir(), targetArg.slice(2));
    }
    targetPath = resolve(targetArg);
} else {
    targetPath = DEFAULT_VAULT;
}

// Check if targetPath is the plugin folder itself or the vault root
// Heuristic: Check if look like a vault (has .obsidian)
let destDir = targetPath;
if (existsSync(join(targetPath, '.obsidian'))) {
    destDir = join(targetPath, '.obsidian', 'plugins', PLUGIN_ID);
} else if (targetPath.endsWith(PLUGIN_ID)) {
    // Assumed to be the full path
    destDir = targetPath;
} else if (!targetArg) {
    // specific logic for the default case if .obsidian doesn't exist yet (e.g. new vault)
    // We assume standard structure
    destDir = join(targetPath, '.obsidian', 'plugins', PLUGIN_ID);
} else {
    // If user provided a custom path like ./dist, just dump there?
    // The user said "build + cp".
    // Let's assume if it's not a vault, we simply copy to that folder.
    // But for safety, let's log.
    console.log(`Target does not look like a vault root (no .obsidian). Copying directly to: ${destDir}`);
}

console.log(`Deploying ${PLUGIN_ID} to: ${destDir}`);

// Build
console.log('Running build...');
try {
    execSync('npm run build', { stdio: 'inherit' });
} catch (e) {
    console.error('Build failed.');
    process.exit(1);
}

// Create destination if needed
if (!existsSync(destDir)) {
    console.log(`Creating directory: ${destDir}`);
    mkdirSync(destDir, { recursive: true });
}

// Copy files
const files = ['main.js', 'manifest.json', 'styles.css'];
for (const file of files) {
    const src = resolve(file);
    const dest = join(destDir, file);
    if (existsSync(src)) {
        copyFileSync(src, dest);
        console.log(`Copied ${file}`);
    } else {
        console.warn(`Warning: ${file} not found.`);
    }
}

console.log('Deployment complete!');

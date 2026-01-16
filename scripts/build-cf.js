const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Files to temporarily hide during build
const filesToHide = [
    'app/api/admin/content/route.ts',
    // Add other admin routes if they cause issues
];

const renameMap = new Map();

try {
    // 1. Rename files to hide them
    console.log('Preparing build: Hiding Admin API routes...');
    for (const file of filesToHide) {
        if (fs.existsSync(file)) {
            const backup = file + '.bak';
            fs.renameSync(file, backup);
            renameMap.set(file, backup);
            console.log(`Renamed ${file} -> ${backup}`);
        }
    }

    // 2. Run the build command
    console.log('Running @cloudflare/next-on-pages...');
    execSync('npx @cloudflare/next-on-pages', { stdio: 'inherit' });

} catch (error) {
    console.error('Build failed:', error.message);
    process.exit(1);
} finally {
    // 3. Restore files
    console.log('Restoring Admin API routes...');
    for (const [original, backup] of renameMap) {
        if (fs.existsSync(backup)) {
            try {
                fs.renameSync(backup, original);
                console.log(`Restored ${original}`);
            } catch (err) {
                console.error(`Failed to restore ${original}:`, err);
            }
        }
    }
}

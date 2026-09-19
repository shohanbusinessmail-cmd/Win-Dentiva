const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
for (const file of ['src/index.html', 'src/styles.css', 'src/app.js', 'electron/main.cjs', 'assets/dentiva.ico']) {
  if (!fs.existsSync(path.join(root, file))) throw new Error(`Missing release file: ${file}`);
}
console.log('Dentiva release sources are present and ready for Electron Builder.');

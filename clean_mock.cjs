const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

const pagesDir = path.join(__dirname, 'src', 'pages');

walkDir(pagesDir, (filePath) => {
  if (filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace multiline mock arrays: const MOCK_NAME = [ ... ];
    content = content.replace(/const\s+(MOCK_[A-Z0-9_]+)\s*=\s*\[[\s\S]*?\];/g, 'const $1 = [];');
    
    // Replace Array.from mocks
    content = content.replace(/const\s+(MOCK_[A-Z0-9_]+)\s*=\s*Array\.from\([\s\S]*?\}\);/g, 'const $1 = [];');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Cleaned mock data in: ${path.basename(filePath)}`);
    }
  }
});

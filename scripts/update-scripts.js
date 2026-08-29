const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (file === 'node_modules' || file === 'dist' || file === '.git' || file === 'scripts') continue;
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (file.endsWith('.html')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      content = content.replace(/<script src="\/js\//g, '<script type="module" src="/js/');
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log('Updated:', fullPath);
    }
  }
}

processDir('.');
console.log('All HTML files updated with type="module" scripts.');

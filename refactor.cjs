const fs = require('fs');
const path = require('path');

const cssDir = path.join(__dirname, 'src', 'styles', 'admin');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const colorMap = {
  // Whites & Backgrounds -> Variables
  '#ffffff': 'var(--card-bg)',
  '#fff': 'var(--card-bg)',
  'white': 'var(--card-bg)', // Need to be careful with this one
  '#f9fafb': 'var(--bg-primary)',
  '#f8fafc': 'var(--bg-primary)',
  '#f3f4f6': 'var(--bg-tertiary)',
  '#f1f5f9': 'var(--bg-tertiary)',
  
  // Borders
  '#e5e7eb': 'var(--border-primary)',
  '#e2e8f0': 'var(--border-primary)',
  '#d1d5db': 'var(--border-secondary)',
  '#cbd5e1': 'var(--border-secondary)',
  
  // Text Colors (Dark Grays/Black)
  '#111827': 'var(--text-primary)',
  '#0f172a': 'var(--text-primary)',
  '#1e293b': 'var(--text-primary)', // sometimes used as bg too
  '#4b5563': 'var(--text-secondary)',
  '#334155': 'var(--text-secondary)',
  '#6b7280': 'var(--text-tertiary)',
  '#475569': 'var(--text-tertiary)',
  '#9ca3af': 'var(--text-muted)',
  '#94a3b8': 'var(--text-muted)',
  
  // Special Cases / Accents (Keep as is usually, but good to know)
  // '#2563eb': 'var(--brand-primary)',
  // '#ef4444': 'var(--danger)',
  // '#10b981': 'var(--success)',
  // '#f59e0b': 'var(--warning)',
  // '#f97316': '#f97316', // Orange
  // '#3b82f6': '#3b82f6', // Light Blue
};

walkDir(cssDir, (filePath) => {
  if (filePath.endsWith('.css') && !filePath.endsWith('theme-variables.css') && !filePath.endsWith('custom-dropdown.css')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Smart replacements
    
    // 1. color: #hex -> var
    content = content.replace(/color:\s*(#[0-9a-fA-F]{3,6}|white|black);/g, (match, p1) => {
      const lower = p1.toLowerCase();
      if (lower === 'white' || lower === '#fff' || lower === '#ffffff') return 'color: var(--text-inverse);';
      if (lower === 'black' || lower === '#000' || lower === '#000000') return 'color: var(--text-primary);';
      return `color: ${colorMap[lower] || lower};`;
    });

    // 2. background: #hex -> var
    content = content.replace(/(?:background|background-color):\s*(#[0-9a-fA-F]{3,6}|white|black);/g, (match, p1) => {
      const lower = p1.toLowerCase();
      if (lower === 'white' || lower === '#fff' || lower === '#ffffff') {
          // If it's a page bg, it should be bg-primary, if it's a card, card-bg. 
          // Usually in admin css, white is card-bg or input-bg.
          return match.replace(p1, 'var(--card-bg)');
      }
      return match.replace(p1, colorMap[lower] || lower);
    });

    // 3. border: 1px solid #hex -> var
    content = content.replace(/border(?:-[a-z]+)?:\s*([^;]+)(#[0-9a-fA-F]{3,6}|white|black)/g, (match, p1, p2) => {
      const lower = p2.toLowerCase();
      if (lower === 'white' || lower === '#fff' || lower === '#ffffff') {
          return match.replace(p2, 'var(--card-bg)');
      }
      return match.replace(p2, colorMap[lower] || lower);
    });
    
    // 4. border-color: #hex -> var
    content = content.replace(/border-color:\s*(#[0-9a-fA-F]{3,6}|white|black);/g, (match, p1) => {
      const lower = p1.toLowerCase();
      return `border-color: ${colorMap[lower] || lower};`;
    });
    
    // 5. box-shadow
    content = content.replace(/box-shadow:\s*0 1px (?:2|3)px (?:0 )?rgba\(0,\s*0,\s*0,\s*0\.[0-9]+\)(?:,\s*0 1px 2px -1px rgba\(0,\s*0,\s*0,\s*0\.[0-9]+\))?;/g, 'box-shadow: var(--card-shadow);');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Refactored: ${filePath}`);
    }
  }
});

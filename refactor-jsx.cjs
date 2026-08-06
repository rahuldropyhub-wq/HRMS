const fs = require('fs');
const path = require('path');

const targetDir = 'c:/Users/jayan/Desktop/projects/HRMS_Portal/src/pages/admin';

const classMap = [
  { regex: /\btext-gray-900\b/g, replacement: 'text-primary' },
  { regex: /\btext-gray-800\b/g, replacement: 'text-primary' },
  { regex: /\btext-gray-700\b/g, replacement: 'text-secondary' },
  { regex: /\btext-gray-600\b/g, replacement: 'text-tertiary' },
  { regex: /\btext-gray-500\b/g, replacement: 'text-tertiary' },
  { regex: /\btext-gray-400\b/g, replacement: 'text-muted' },
  
  { regex: /\bbg-white\b/g, replacement: 'bg-card' },
  { regex: /\bbg-gray-50\b/g, replacement: 'bg-primary' },
  { regex: /\bbg-gray-100\b/g, replacement: 'bg-secondary' },
  { regex: /\bbg-gray-200\b/g, replacement: 'bg-tertiary' },
  
  { regex: /\bborder-gray-200\b/g, replacement: 'border-primary' },
  { regex: /\bborder-gray-300\b/g, replacement: 'border-secondary' },
  { regex: /\bborder-gray-100\b/g, replacement: 'border-primary' },
];

const inlineMap = [
  { regex: /'#ffffff'/gi, replacement: "'var(--card-bg)'" },
  { regex: /'white'/gi, replacement: "'var(--card-bg)'" },
  { regex: /'#f9fafb'/gi, replacement: "'var(--bg-primary)'" },
  { regex: /'#f3f4f6'/gi, replacement: "'var(--bg-tertiary)'" },
  { regex: /'#111827'/gi, replacement: "'var(--text-primary)'" },
  { regex: /'#1f2937'/gi, replacement: "'var(--text-primary)'" },
  { regex: /'#374151'/gi, replacement: "'var(--text-secondary)'" },
  { regex: /'#4b5563'/gi, replacement: "'var(--text-secondary)'" },
  { regex: /'#6b7280'/gi, replacement: "'var(--text-tertiary)'" },
  { regex: /'#9ca3af'/gi, replacement: "'var(--text-muted)'" },
  { regex: /'#e5e7eb'/gi, replacement: "'var(--border-primary)'" },
  { regex: /'#d1d5db'/gi, replacement: "'var(--border-secondary)'" },
];

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.jsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(targetDir);
let changedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;
  
  classMap.forEach(map => {
    newContent = newContent.replace(map.regex, map.replacement);
  });
  
  inlineMap.forEach(map => {
    newContent = newContent.replace(map.regex, map.replacement);
  });
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    changedCount++;
    console.log(`Refactored JSX: ${file}`);
  }
});

console.log(`Successfully refactored ${changedCount} JSX files.`);

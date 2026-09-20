const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) { 
      results.push(file);
    }
  });
  return results;
}

const files = walk('src');
let changed = 0;

for (const file of files) {
  const normFile = file.replace(/\\/g, '/');
  if (normFile === 'src/lib/prisma.ts') continue;
  
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('new PrismaClient()')) {
    content = content.replace(/import\s+\{\s*PrismaClient\s*\}\s+from\s+['"]@prisma\/client['"];?\r?\n?/g, 'import { prisma } from \'@/lib/prisma\';\n');
    content = content.replace(/const\s+prisma\s*=\s*new\s*PrismaClient\(\)?;?\r?\n?/g, '');
    fs.writeFileSync(file, content);
    changed++;
    console.log('Fixed', normFile);
  }
}

console.log('Total fixed:', changed);

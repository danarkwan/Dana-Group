const fs = require('fs');
const path = require('path');

const actionsDir = path.join(__dirname, '../src/lib/actions');
const files = fs.readdirSync(actionsDir);

for (const f of files) {
  if (!f.endsWith('.ts')) continue;
  let filePath = path.join(actionsDir, f);
  let content = fs.readFileSync(filePath, 'utf8');
  let lines = content.split('\n');
  
  // Find 'use server' and 'import { getTranslations }'
  let useServerIndex = -1;
  let getTranslationsIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("'use server'") || lines[i].includes('"use server"')) {
      useServerIndex = i;
    }
    if (lines[i].includes("import { getTranslations } from 'next-intl/server'")) {
      getTranslationsIndex = i;
    }
  }
  
  if (useServerIndex > 0 && getTranslationsIndex >= 0 && getTranslationsIndex < useServerIndex) {
    // They are out of order, let's fix it by making 'use server' the very first line (or after comments)
    // Actually, simply doing string replacement is easiest.
    let newContent = content.replace("import { getTranslations } from 'next-intl/server';\n'use server'", "'use server';\nimport { getTranslations } from 'next-intl/server';");
    newContent = newContent.replace("import { getTranslations } from 'next-intl/server'\n'use server'", "'use server';\nimport { getTranslations } from 'next-intl/server';");
    
    // Fallback if there are multiple newlines:
    if (newContent === content) {
      // Let's just remove the getTranslations import and put it after use server
      const lines2 = content.split('\n');
      const filtered = lines2.filter(l => !l.includes("import { getTranslations } from 'next-intl/server'"));
      const finalLines = [];
      let foundUseServer = false;
      for (const l of filtered) {
          finalLines.push(l);
          if ((l.includes("'use server'") || l.includes('"use server"')) && !foundUseServer) {
              finalLines.push("import { getTranslations } from 'next-intl/server';");
              foundUseServer = true;
          }
      }
      newContent = finalLines.join('\n');
    }
    
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Fixed ${f}`);
  }
}

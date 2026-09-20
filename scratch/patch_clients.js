const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

function patchClientComponents() {
  walkDir(path.join(srcDir, 'app', '[locale]', '(dashboard)'), (filePath) => {
    if (filePath.endsWith('.tsx')) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      let modified = false;
      
      if (content.includes('alert(')) {
        if (!content.includes("from 'sonner'") && !content.includes('from "sonner"')) {
           content = "import { toast } from 'sonner';\n" + content;
        }
        
        content = content.replace(/alert\(result\.error\);?/g, "toast.error(result.error);");
        content = content.replace(/alert\('لینکی وەسڵەکە کۆپی کرا بۆ فۆنەکەت!'\);?/g, "toast.success('لینکی وەسڵەکە کۆپی کرا بۆ فۆنەکەت!');");
        
        modified = true;
      }
      
      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Patched client: ${filePath}`);
      }
    }
  });
}

function patchServerActions() {
  const actionsDir = path.join(srcDir, 'lib', 'actions');
  const files = fs.readdirSync(actionsDir);
  
  for (const f of files) {
    if (!f.endsWith('.ts')) continue;
    let filePath = path.join(actionsDir, f);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add getTranslations import if not present
    if (!content.includes("from 'next-intl/server'")) {
      content = "import { getTranslations } from 'next-intl/server';\n" + content;
    }
    
    // This part requires understanding the AST, regex might be too error-prone for updating every action manually
    // So for server actions, I'll just write a custom script or update them via replace_file_content 
  }
}

patchClientComponents();

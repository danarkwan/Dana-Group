const fs = require('fs');
const files = [
  'src/lib/actions/inventory.ts',
  'src/lib/actions/invoices.ts',
  'src/lib/actions/products.ts',
  'src/lib/actions/settings.ts',
  'src/lib/actions/transactions.ts'
];
const importStmt = "import { verifyServerActionAccess } from '@/lib/permissions';\n";
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes("import { verifyServerActionAccess }")) {
    content = content.replace(/['"]use server['"];?\n/, "'use server';\n" + importStmt);
    fs.writeFileSync(file, content);
    console.log('Added to ' + file);
  }
}

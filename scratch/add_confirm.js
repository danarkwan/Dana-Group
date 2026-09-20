const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');

const filesToPatch = [
  'app/[locale]/(dashboard)/transactions/TransactionsClient.tsx',
  'app/[locale]/(dashboard)/customers/CustomersClient.tsx',
  'app/[locale]/(dashboard)/suppliers/SuppliersClient.tsx',
  'app/[locale]/(dashboard)/purchases/PurchaseRowActions.tsx',
  'app/[locale]/(dashboard)/products/ProductsClient.tsx',
  'app/[locale]/(dashboard)/invoices/InvoiceRowActions.tsx',
  'app/[locale]/(dashboard)/users/UsersClient.tsx'
];

for (const relPath of filesToPatch) {
  const filePath = path.join(srcDir, relPath);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('import ConfirmDialog')) continue; // Already patched
  
  // 1. Add import
  content = content.replace(/import \{.*\} from 'react';?/g, match => {
     if (!match.includes('useState')) {
        return match.replace('{', '{ useState,');
     }
     return match;
  });
  
  // Add import ConfirmDialog
  content = `import ConfirmDialog from '@/components/ui/ConfirmDialog';\n` + content;
  
  // 2. Inject state
  // We need to find the component declaration. Usually:
  // export default function ComponentName(props) {
  // or export default function ComponentName({ ... }) {
  // Let's use regex to find `export default function [A-Za-z]+\(.*\) \{`
  const compRegex = /(export default function [A-Za-z0-9_]+\([^)]*\)\s*\{)/;
  
  const stateStr = `\n  const [confirmState, setConfirmState] = useState<{isOpen: boolean, message: string, onConfirm: () => void}>({ isOpen: false, message: '', onConfirm: () => {} });\n`;
  
  content = content.replace(compRegex, `$1${stateStr}`);
  
  // 3. Replace confirm()
  // There are patterns like: if (confirm('دڵنیایت...')) { ... }
  // We need to extract the message and the body.
  // Actually, this is very tricky with regex because body can contain nested braces.
  // An easier way: replace `if (confirm('message')) { body }` 
  // Wait, the body is exactly what follows the `{`.
  // Another way: replace `if (confirm('msg'))` with a function call.
  // Or simply replace it with `setConfirmState({ isOpen: true, message: 'msg', onConfirm: () => {`
  // and manually close it? No, automatic closing of nested braces is impossible with simple regex.
  
  // Let's print out the exact confirm lines to see if we can hardcode it or do multi-line regex for the specific files.
}

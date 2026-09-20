const fs = require('fs');
const path = require('path');

const actionsDir = path.join(__dirname, '../src/lib/actions');
const files = fs.readdirSync(actionsDir);

const replacements = [
  {
    find: /return \{ success: false, error: 'Failed to create customer' \};/g,
    replace: "const t = await getTranslations('Errors');\n    if (error.code === 'P2002') {\n      if (error.meta?.target?.includes('email')) return { success: false, error: t('emailExists') };\n      if (error.meta?.target?.includes('phone')) return { success: false, error: t('phoneExists') };\n    }\n    return { success: false, error: t('saveFailed') };"
  },
  {
    find: /return \{ success: false, error: 'Failed to update customer' \};/g,
    replace: "const t = await getTranslations('Errors');\n    if (error.code === 'P2002') {\n      if (error.meta?.target?.includes('email')) return { success: false, error: t('emailExists') };\n      if (error.meta?.target?.includes('phone')) return { success: false, error: t('phoneExists') };\n    }\n    return { success: false, error: t('saveFailed') };"
  },
  {
    find: /return \{ success: false, error: 'Failed to delete customer' \};/g,
    replace: "const t = await getTranslations('Errors');\n    return { success: false, error: t('deleteFailed') };"
  },
  {
    find: /return \{ success: false, error: 'Failed to create supplier' \};/g,
    replace: "const t = await getTranslations('Errors');\n    if (error.code === 'P2002') {\n      if (error.meta?.target?.includes('email')) return { success: false, error: t('emailExists') };\n      if (error.meta?.target?.includes('phone')) return { success: false, error: t('phoneExists') };\n    }\n    return { success: false, error: t('saveFailed') };"
  },
  {
    find: /return \{ success: false, error: 'Failed to update supplier' \};/g,
    replace: "const t = await getTranslations('Errors');\n    if (error.code === 'P2002') {\n      if (error.meta?.target?.includes('email')) return { success: false, error: t('emailExists') };\n      if (error.meta?.target?.includes('phone')) return { success: false, error: t('phoneExists') };\n    }\n    return { success: false, error: t('saveFailed') };"
  },
  {
    find: /return \{ success: false, error: 'Failed to delete supplier' \};/g,
    replace: "const t = await getTranslations('Errors');\n    return { success: false, error: t('deleteFailed') };"
  },
  {
    find: /throw new Error\('Name is required'\);/g,
    replace: "const t = await getTranslations('Errors');\n      throw new Error(t('requiredFields'));"
  },
  {
    find: /throw new Error\('All fields are required'\);/g,
    replace: "const t = await getTranslations('Errors');\n      throw new Error(t('requiredFields'));"
  },
  {
    find: /throw new Error\('Missing required fields'\);/g,
    replace: "const t = await getTranslations('Errors');\n      throw new Error(t('requiredFields'));"
  }
];

for (const f of files) {
  if (!f.endsWith('.ts')) continue;
  let filePath = path.join(actionsDir, f);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  for (const rep of replacements) {
    if (content.match(rep.find)) {
      content = content.replace(rep.find, (match) => {
        return rep.replace;
      });
      modified = true;
    }
  }
  
  // generic replacements for other actions
  const genericCatch = /return \{ success: false, error: '([^']+)' \};/g;
  if (content.match(genericCatch)) {
      content = content.replace(genericCatch, (match, p1) => {
          if (p1 === 'Failed to create customer' || p1 === 'Failed to update customer' || p1 === 'Failed to delete customer' ||
              p1 === 'Failed to create supplier' || p1 === 'Failed to update supplier' || p1 === 'Failed to delete supplier') {
              return match; // already handled
          }
          if (p1.toLowerCase().includes('delete')) {
              modified = true;
              return "const t = await getTranslations('Errors');\n    return { success: false, error: t('deleteFailed') };";
          }
          modified = true;
          return "const t = await getTranslations('Errors');\n    return { success: false, error: t('saveFailed') };";
      });
  }

  // Ensure imports are available
  if (modified && !content.includes("from 'next-intl/server'")) {
    content = "import { getTranslations } from 'next-intl/server';\n" + content;
  }
  
  // To handle the `catch (error: any)` typescript types if not already typed,
  // we'll replace `catch (error) {` with `catch (error: any) {` so `error.code` compiles.
  if (modified) {
     content = content.replace(/catch \(error\) \{/g, "catch (error: any) {");
     fs.writeFileSync(filePath, content, 'utf8');
     console.log(`Patched action: ${f}`);
  }
}

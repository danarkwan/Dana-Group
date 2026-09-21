import { PrismaClient } from '@prisma/client'; 
const prisma = new PrismaClient(); 
async function main() { 
  try { 
    const t = await prisma.transaction.findMany(); 
    console.log('success, count:', t.length); 
  } catch (e) { 
    console.error(e); 
  } finally { 
    await prisma.$disconnect(); 
  } 
} 
main();

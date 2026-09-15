import { getSuppliers } from '@/lib/actions/suppliers';
import { getProducts } from '@/lib/actions/products';
import CreatePurchaseClient from './CreatePurchaseClient';

export default async function CreatePurchasePage() {
  const suppliers = await getSuppliers();
  const productsResponse = await getProducts();
  const products = productsResponse.success ? productsResponse.products : [];
  
  return <CreatePurchaseClient initialSuppliers={suppliers} initialProducts={products} />;
}

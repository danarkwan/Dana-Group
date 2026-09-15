import { getCustomers } from '@/lib/actions/customers';
import { getProducts } from '@/lib/actions/products';
import CreateInvoiceClient from './CreateInvoiceClient';

export default async function CreateInvoicePage() {
  const customers = await getCustomers();
  const productsResponse = await getProducts();
  const products = productsResponse.success ? productsResponse.products : [];
  
  return <CreateInvoiceClient initialCustomers={customers} initialProducts={products} />;
}
 

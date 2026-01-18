import { useQuery } from '@tanstack/react-query';
import { getProducts } from '@/data/products';
import { Product } from '@/types/product';

export function useProducts() {
  return useQuery<Product[], Error>({
    queryKey: ['products'],
    queryFn: getProducts,
  });
}
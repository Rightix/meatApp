import { useQuery } from '@tanstack/react-query';
import type { Product, StoreAdapter } from '../types';

// Принимает любой адаптер — хук не знает, какой конкретно магазин.
// category — slug категории; адаптер сам решает как его использовать.
// adapter.storeId + category = уникальный ключ кеша для каждой пары магазин/категория.
export const useStoreProducts = (adapter: StoreAdapter, category: string) =>
  useQuery<Product[], Error>({
    queryKey: ['products', adapter.storeId, category],
    queryFn: () => adapter.fetchProducts(category),
  });



import { useQuery } from '@tanstack/react-query';
import type { Product, StoreAdapter } from '../types';

// Принимает любой адаптер — хук не знает, какой конкретно магазин.
// adapter.storeId гарантирует отдельный кеш TanStack Query для каждого магазина.
export const useStoreProducts = (adapter: StoreAdapter) =>
  useQuery<Product[], Error>({
    queryKey: ['products', adapter.storeId],
    queryFn: () => adapter.fetchProducts(),
  });

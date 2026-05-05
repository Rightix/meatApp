import { useQuery } from '@tanstack/react-query';
import type { Product, StoreAdapter } from '../types';

// useStoreProduct — универсальный хук для получения одного товара по ID.
// enabled: false пока id пустой — запрос не уйдёт раньше времени.
export const useStoreProduct = (adapter: StoreAdapter, id: string) =>
  useQuery<Product, Error>({
    queryKey: ['product', adapter.storeId, id],
    // Явная аннотация `: Promise<Product>` устраняет ложное срабатывание
    // @typescript-eslint/no-unsafe-call при вызове метода через интерфейс StoreAdapter.
    queryFn: (): Promise<Product> => adapter.fetchProductById(id),
    enabled: id.length > 0,
  });



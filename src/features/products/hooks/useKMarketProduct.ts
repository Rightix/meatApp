import { kMarketAdapter } from '../api/k-market';
import { useStoreProduct } from './useStoreProduct';

// Хук для страниц, которым нужен один товар K-Market по ID.
// Пример: useKMarketProduct('6409620014444')
export const useKMarketProduct = (id: string) =>
  useStoreProduct(kMarketAdapter, id);



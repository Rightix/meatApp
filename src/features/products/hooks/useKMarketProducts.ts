import { kMarketAdapter, type KMarketCategory } from '../api/k-market';
import { useStoreProducts } from './useStoreProducts';

// Хук для страниц, которым нужны товары K-Market.
// Страница вызывает useKMarketProducts('beef') и не знает про адаптеры.
export const useKMarketProducts = (category: KMarketCategory) =>
  useStoreProducts(kMarketAdapter, category);

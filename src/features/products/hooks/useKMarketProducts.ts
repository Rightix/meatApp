import { kMarketAdapter } from '../api/k-market';
import { useStoreProducts } from './useStoreProducts';

// Хук для страниц, которым нужны товары K-Market.
// Страница вызывает useKMarketProducts() и не знает про адаптеры.
export const useKMarketProducts = () => useStoreProducts(kMarketAdapter);


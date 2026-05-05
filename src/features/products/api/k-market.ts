import type { KMarketResultItem, KMarketSearchResponse, Product, StoreAdapter } from '../types';

import beefRaw    from '@/mocked-data/beef.json';
import groundRaw  from '@/mocked-data/ground.json';
import porkRaw    from '@/mocked-data/porkj.json';
import proteinRaw from '@/mocked-data/protein.json';

// ─── Категории ────────────────────────────────────────────────────────────────
// Строковый union гарантирует автодополнение и ошибку компилятора при опечатке.
export type KMarketCategory = 'beef' | 'ground' | 'pork' | 'protein';

export const K_MARKET_CATEGORIES: KMarketCategory[] = ['beef', 'ground', 'pork', 'protein'];

// ─── Данные ───────────────────────────────────────────────────────────────────
// Статический импорт JSON — Vite встраивает данные в бандл.
// Структура файлов идентична ответу K-Market API.
// Когда придёт время: заменить на fetch-вызовы, остальной код менять не нужно.
const CATEGORY_DATA: Record<KMarketCategory, KMarketSearchResponse> = {
  beef:    beefRaw    as KMarketSearchResponse,
  ground:  groundRaw  as KMarketSearchResponse,
  pork:    porkRaw    as KMarketSearchResponse,
  protein: proteinRaw as KMarketSearchResponse,
};

// ─── Маппер ───────────────────────────────────────────────────────────────────
export const mapKMarketDtoToProduct = (item: KMarketResultItem): Product => {
  const { product } = item;

  const imageUrl =
    product.images?.[0] ??
    product.productAttributes?.image?.url ??
    '';

  const pricing = product.mobilescan?.pricing.normal;

  return {
    id: product.id,
    name: product.localizedName.finnish,
    price: pricing?.price ?? 0,
    unitPrice: pricing?.unitPrice.value ?? 0,
    imageUrl,
    brand: product.brand?.name ?? 'Unknown',
  };
};

// ─── Имитация задержки сети ───────────────────────────────────────────────────
// Убрать sleep() при переходе на реальный fetch — TanStack Query корректно
// покажет состояния loading/success/error независимо от задержки.
const NETWORK_DELAY_MS = 600;
const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

// ─── Реализация методов адаптера ──────────────────────────────────────────────
const fetchProducts = async (category: string): Promise<Product[]> => {
  await sleep(NETWORK_DELAY_MS);

  const data = CATEGORY_DATA[category as KMarketCategory];
  if (!data) {
    throw new Error(
      `K-Market: unknown category "${category}". Available: ${K_MARKET_CATEGORIES.join(', ')}`
    );
  }

  // Явное приведение: статический анализ JSON-импорта может вернуть более широкий тип.
  const items = data.result as KMarketResultItem[];
  return items.map(mapKMarketDtoToProduct);
};

const fetchProductById = async (id: string): Promise<Product> => {
  await sleep(NETWORK_DELAY_MS);

  for (const data of Object.values(CATEGORY_DATA)) {
    const items = data.result as KMarketResultItem[];
    const item = items.find(r => r.id === id);
    if (item) return mapKMarketDtoToProduct(item);
  }

  throw new Error(`K-Market: product with id "${id}" not found`);
};

// ─── Адаптер ──────────────────────────────────────────────────────────────────
export const kMarketAdapter: StoreAdapter = {
  storeId: 'k-market',
  fetchProducts,
  fetchProductById,
};


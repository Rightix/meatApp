import { KMarketResultItem, KMarketSearchResponse, Product, StoreAdapter } from '../types';

// Относительный путь → в dev Vite проксирует на k-ruoka.fi (см. vite.config.ts).
// В production нужен свой backend-прокси или serverless function.
const K_MARKET_URL =
  '/kr-api/v2/product-search/?offset=0&language=en' +
  '&categoryPath=liha-ja-kasviproteiinit%2Fnauta%2Fpaistit-fileet-ja-pihvit' +
  '&storeId=N106&limit=10';

const mapKMarketDtoToProduct = (item: KMarketResultItem): Product => {
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

const fetchProducts = async (): Promise<Product[]> => {
  const response = await fetch(K_MARKET_URL);

  if (!response.ok) {
    throw new Error(`K-Market API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json() as KMarketSearchResponse;

  return data.result.map(mapKMarketDtoToProduct);
};

export const kMarketAdapter: StoreAdapter = {
  storeId: 'k-market',
  fetchProducts,
};



// ─── UI Model ────────────────────────────────────────────────────────────────
// Плоская модель, которую используют компоненты и хуки.
// Все адаптеры магазинов обязаны маппить свои DTO в этот тип.

export interface Product {
  id: string;
  name: string;
  price: number;      // цена за единицу товара (kpl — штука)
  unitPrice: number;  // цена за кг — нужна для сравнения между магазинами
  imageUrl: string;
  brand: string;
}

// ─── Store Adapter Contract ───────────────────────────────────────────────────
// Контракт, которому обязан соответствовать каждый магазин.
// Добавить новый магазин = создать объект, реализующий StoreAdapter.
// Хуки и компоненты знают только этот интерфейс — не конкретный магазин.

export interface StoreAdapter {
  // Уникальный ID магазина — ключ кеша в TanStack Query.
  // Два магазина с одинаковым storeId делили бы один кеш, что было бы багом.
  storeId: string;
  fetchProducts: () => Promise<Product[]>;
}

// ─── K-Market DTOs ────────────────────────────────────────────────────────────
// Структура ответа K-Market API «как она есть».
// Типизируем только поля, нужные для маппинга в Product (YAGNI).
// ? означает: поле может отсутствовать, маппер обязан использовать ?? fallback.

export interface KMarketSearchResponse {
  result: KMarketResultItem[];
  totalHits: number;
}

export interface KMarketResultItem {
  id: string;
  product: KMarketProductDTO;
}

export interface KMarketProductDTO {
  id: string;
  localizedName: {
    finnish: string;
    english: string;
  };
  images?: string[];
  productAttributes?: {
    image?: {
      url: string;
    };
  };
  mobilescan?: {
    pricing: {
      normal: {
        price: number;
        unitPrice: {
          value: number;
          unit: string;
        };
      };
    };
  };
  brand?: {
    name: string;
  };
}

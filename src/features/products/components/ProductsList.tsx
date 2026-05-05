import type { Product } from '../types';
import { ProductCard } from './ProductCard';

interface ProductsListProps {
  products: Product[];
  isLoading: boolean;
  error: Error | null;
}

// Early returns держат «счастливый путь» (список карточек) внизу и незамусоренным.
// Компонент не знает откуда данные — это забота страницы и хука.
export const ProductsList = ({ products, isLoading, error }: ProductsListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <p className="text-gray-500 animate-pulse">Loading products…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-20">
        <p className="text-red-500">Failed to load products: {error.message}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <p className="text-gray-400">No products found.</p>
      </div>
    );
  }

  return (
    <section>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Beef products</h1>
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 list-none p-0">
        {products.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  );
};

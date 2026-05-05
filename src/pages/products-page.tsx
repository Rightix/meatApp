import { useKMarketProducts } from '../features/products/hooks/useKMarketProducts';
import { ProductsList } from '../features/products/components/ProductsList';

// pages/ — thin orchestrator. Calls hooks, composes components.
export const ProductsPage = () => {
  const { data: products = [], isLoading, error } = useKMarketProducts('beef');

  return (
    <ProductsList
      products={products}
      isLoading={isLoading}
      error={error}
    />
  );
};

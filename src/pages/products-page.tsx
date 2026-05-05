import { useKMarketProducts } from '../features/products/hooks/useKMarketProducts';
import { ProductsList } from '../features/products/components/ProductsList';

// pages/ — thin orchestrator. Calls hooks, composes components.
// No direct API calls here — that belongs in src/hooks/.
export const ProductsPage = () => {
  const { data: products = [], isLoading, error } = useKMarketProducts();

  return (
    <ProductsList
      products={products}
      isLoading={isLoading}
      error={error}
    />
  );
};

import type { Product } from '../types';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: Product;
}

// Dumb component — получает данные через props, ничего не знает об API.
// Вся логика загрузки данных остаётся в хуке и передаётся через ProductsList.
// Используем полную композицию Card от shadcn: CardHeader / CardContent / CardFooter
// и семантические цвета темы (bg-card, text-muted-foreground) вместо сырых значений.
export const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      {/* Изображение идёт ПЕРВЫМ ребёнком Card — Card автоматически скруглит верх */}
      <div className="flex h-48 items-center justify-center bg-muted p-4">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          // Заглушка на случай отсутствующей картинки — не роняем компонент
          <span className="text-sm text-muted-foreground">No image</span>
        )}
      </div>

      <CardHeader>
        {/* Badge вместо сырого <span> — используем outline-вариант для бренда */}
        {product.brand && (
          <Badge variant="outline" className="w-fit">
            {product.brand}
          </Badge>
        )}
        <CardTitle className="line-clamp-2 text-sm font-medium leading-snug">
          {product.name}
        </CardTitle>
      </CardHeader>

      <CardContent />

      {/* CardFooter — цена и цена за кг */}
      <CardFooter className="flex items-end justify-between">
        <span className="text-lg font-bold text-foreground">
          {product.price.toFixed(2)} €
        </span>
        <span className="text-xs text-muted-foreground">
          {product.unitPrice.toFixed(2)} €/kg
        </span>
      </CardFooter>
    </Card>
  );
};


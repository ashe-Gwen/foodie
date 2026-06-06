import type { MenuItem } from '../types';
import MenuCard from './MenuCard';

interface MenuGridProps {
  items: MenuItem[];
  onItemClick: (item: MenuItem) => void;
  getCartQty: (id: string) => number;
  onAddToCart: (item: MenuItem) => void;
  onUpdateQty: (id: string, qty: number) => void;
}

export default function MenuGrid({
  items,
  onItemClick,
  getCartQty,
  onAddToCart,
  onUpdateQty,
}: MenuGridProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-24" style={{ color: 'var(--color-muted)' }}>
        <p
          className="text-xs tracking-[0.25em] uppercase"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          No items found
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
      {items.map((item, i) => (
        <MenuCard
          key={item.id}
          item={item}
          onClick={onItemClick}
          style={{ animationDelay: `${i * 50}ms` }}
          cartQuantity={getCartQty(item.id)}
          onAddToCart={() => onAddToCart(item)}
          onUpdateQty={(qty) => onUpdateQty(item.id, qty)}
        />
      ))}
    </div>
  );
}

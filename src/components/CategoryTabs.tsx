import type { Category } from '../types';

interface CategoryTabsProps {
  categories: Category[];
  activeCategory: Category;
  onSelect: (category: Category) => void;
}

export default function CategoryTabs({ categories, activeCategory, onSelect }: CategoryTabsProps) {
  return (
    <div
      className="flex gap-2 pt-5 pb-3 overflow-x-auto"
      style={{ scrollbarWidth: 'none' }}
    >
      {categories.map((cat) => {
        const active = cat === activeCategory;
        return (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            aria-pressed={active}
            className="relative flex-shrink-0 text-[12px] font-semibold transition-all duration-200 focus-visible:outline-none"
            style={{
              fontFamily: 'var(--font-sans)',
              color: active ? '#fff' : 'var(--color-muted)',
              background: active ? '#E23744' : '#fff',
              border: active ? '1.5px solid #E23744' : '1.5px solid #E8E8E8',
              borderRadius: '20px',
              padding: '6px 16px',
              cursor: 'pointer',
              letterSpacing: '0.01em',
              boxShadow: active ? '0 2px 8px rgba(226,55,68,0.25)' : 'none',
            }}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}

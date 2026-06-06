import { useMemo } from 'react';
import { MENU_ITEMS } from '../data/menu';
import type { Category, MenuItem } from '../types';

export function useMenu(activeCategory: Category): MenuItem[] {
  return useMemo(
    () => MENU_ITEMS.filter((item) => item.category === activeCategory),
    [activeCategory]
  );
}

export type Category = 'Starters' | 'Mains' | 'Sides' | 'Desserts' | 'Drinks';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  imageUrl: string;
  allergens: string[];
  isVegetarian?: boolean;
  isVegan?: boolean;
  isPopular?: boolean;
  discountPercent?: number;
  offerLabel?: string;
}

export interface CartEntry {
  item: MenuItem;
  quantity: number;
}

export interface ComboOffer {
  id: string;
  name: string;
  tagline: string;
  itemIds: string[];
  originalPrice: number;
  comboPrice: number;
  accentColor: string;
}

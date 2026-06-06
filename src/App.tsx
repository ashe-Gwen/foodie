import { useState, useMemo, useCallback } from 'react';
import { CATEGORIES, MENU_ITEMS, COMBO_OFFERS } from './data/menu';
import CategoryTabs from './components/CategoryTabs';
import MenuGrid from './components/MenuGrid';
import ItemModal from './components/ItemModal';
import OffersSection from './components/OffersSection';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import CartDrawer from './components/CartDrawer';
import AdminDashboard from './components/AdminDashboard';
import type { Category, MenuItem, CartEntry, ComboOffer } from './types';

const CATEGORY_EMOJI: Record<string, string> = {
  Starters: '🥗', Mains: '🍛', Sides: '🥙', Desserts: '🍮', Drinks: '🥤',
};

export default function App() {
  const [currentView, setCurrentView] = useState<'menu' | 'admin'>('menu');
  const [activeCategory, setActiveCategory] = useState<Category>('Starters');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState<CartEntry[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const [customItems, setCustomItems] = useState<MenuItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('foodiego_customItems') ?? '[]'); }
    catch { return []; }
  });

  const [removedIds, setRemovedIds] = useState<Set<string>>(() => {
    try { return new Set<string>(JSON.parse(localStorage.getItem('foodiego_removedIds') ?? '[]')); }
    catch { return new Set<string>(); }
  });

  const [discountOverrides, setDiscountOverrides] = useState<Record<string, { discountPercent: number; offerLabel: string }>>(() => {
    try { return JSON.parse(localStorage.getItem('foodiego_discountOverrides') ?? '{}'); }
    catch { return {}; }
  });

  const [customCombos, setCustomCombos] = useState<ComboOffer[]>(() => {
    try { return JSON.parse(localStorage.getItem('foodiego_customCombos') ?? '[]'); }
    catch { return []; }
  });

  const allBaseItems = useMemo(() => [...MENU_ITEMS, ...customItems], [customItems]);

  const allItems = useMemo(() =>
    allBaseItems
      .filter((i) => !removedIds.has(i.id))
      .map((i) => {
        const ov = discountOverrides[i.id];
        if (!ov) return i;
        return {
          ...i,
          discountPercent: ov.discountPercent > 0 ? ov.discountPercent : undefined,
          offerLabel: ov.offerLabel || undefined,
        };
      }),
    [allBaseItems, removedIds, discountOverrides]
  );

  const allCombos = useMemo(() => [...COMBO_OFFERS, ...customCombos], [customCombos]);

  const visibleItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      return allItems.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q)
      );
    }
    return allItems.filter((i) => i.category === activeCategory);
  }, [allItems, activeCategory, searchQuery]);

  const cartCount = cartItems.reduce((s, e) => s + e.quantity, 0);
  const discountedCount = visibleItems.filter((i) => i.discountPercent).length;

  // ── Cart helpers ──────────────────────────────────────────────────
  const getCartQty = useCallback(
    (itemId: string) => cartItems.find((e) => e.item.id === itemId)?.quantity ?? 0,
    [cartItems]
  );

  const addToCart = useCallback((item: MenuItem) => {
    setCartItems((prev) => {
      const existing = prev.find((e) => e.item.id === item.id);
      if (existing) return prev.map((e) => e.item.id === item.id ? { ...e, quantity: e.quantity + 1 } : e);
      return [...prev, { item, quantity: 1 }];
    });
  }, []);

  const updateCartQty = useCallback((itemId: string, qty: number) => {
    setCartItems((prev) =>
      qty <= 0 ? prev.filter((e) => e.item.id !== itemId)
               : prev.map((e) => e.item.id === itemId ? { ...e, quantity: qty } : e)
    );
  }, []);

  const placeOrder = useCallback(() => {
    setCartItems([]);
    setIsCartOpen(false);
    setOrderPlaced(true);
    setTimeout(() => setOrderPlaced(false), 3500);
  }, []);

  // ── Admin helpers ─────────────────────────────────────────────────
  const addCustomItem = useCallback((item: MenuItem) => {
    setCustomItems((prev) => {
      const next = [...prev, item];
      localStorage.setItem('foodiego_customItems', JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteItem = useCallback((id: string) => {
    setRemovedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem('foodiego_removedIds', JSON.stringify([...next]));
      return next;
    });
  }, []);

  const restoreItem = useCallback((id: string) => {
    setRemovedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      localStorage.setItem('foodiego_removedIds', JSON.stringify([...next]));
      return next;
    });
  }, []);

  const setDiscount = useCallback((id: string, pct: number, label: string) => {
    setDiscountOverrides((prev) => {
      const next = { ...prev, [id]: { discountPercent: pct, offerLabel: label } };
      localStorage.setItem('foodiego_discountOverrides', JSON.stringify(next));
      return next;
    });
  }, []);

  const clearDiscount = useCallback((id: string) => {
    setDiscountOverrides((prev) => {
      const next = { ...prev };
      delete next[id];
      localStorage.setItem('foodiego_discountOverrides', JSON.stringify(next));
      return next;
    });
  }, []);

  const addCombo = useCallback((combo: ComboOffer) => {
    setCustomCombos((prev) => {
      const next = [...prev, combo];
      localStorage.setItem('foodiego_customCombos', JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteCombo = useCallback((id: string) => {
    setCustomCombos((prev) => {
      const next = prev.filter((c) => c.id !== id);
      localStorage.setItem('foodiego_customCombos', JSON.stringify(next));
      return next;
    });
  }, []);

  const isSearching = searchQuery.trim().length > 0;
  const sectionLabel = isSearching
    ? `${visibleItems.length} result${visibleItems.length !== 1 ? 's' : ''} for "${searchQuery.trim()}"`
    : activeCategory;

  const navbar = (
    <Navbar
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      cartCount={cartCount}
      onCartOpen={() => setIsCartOpen(true)}
      currentView={currentView}
      onAdminNav={() => setCurrentView((v) => (v === 'menu' ? 'admin' : 'menu'))}
      allItems={allItems}
      onSuggestionClick={setSelectedItem}
    />
  );

  // ── Admin view ────────────────────────────────────────────────────
  if (currentView === 'admin') {
    return (
      <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
        {navbar}
        <AdminDashboard
          allBaseItems={allBaseItems}
          removedIds={removedIds}
          discountOverrides={discountOverrides}
          customCombos={customCombos}
          onAddItem={addCustomItem}
          onDeleteItem={deleteItem}
          onRestoreItem={restoreItem}
          onSetDiscount={setDiscount}
          onClearDiscount={clearDiscount}
          onAddCombo={addCombo}
          onDeleteCombo={deleteCombo}
          onBack={() => setCurrentView('menu')}
        />
      </div>
    );
  }

  // ── Menu view ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      {navbar}

      <HeroBanner />

      <OffersSection combos={allCombos} />

      <main className="max-w-5xl mx-auto px-4 pb-16">
        <div
          style={{
            opacity: isSearching ? 0.4 : 1,
            pointerEvents: isSearching ? 'none' : 'auto',
            transition: 'opacity 0.2s',
          }}
        >
          <CategoryTabs
            categories={CATEGORIES}
            activeCategory={activeCategory}
            onSelect={(cat) => { setActiveCategory(cat); setSearchQuery(''); }}
          />
        </div>

        <div className="mt-6 mb-4">
          <div
            className="flex items-center gap-3"
            style={!isSearching ? { borderLeft: '3px solid #E23744', paddingLeft: '12px' } : undefined}
          >
            <h2
              key={isSearching ? 'search' : activeCategory}
              className="card-reveal"
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                fontSize: '1.4rem',
                color: 'var(--color-text)',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              {isSearching ? '🔍 ' : `${CATEGORY_EMOJI[activeCategory] ?? ''} `}
              {isSearching ? sectionLabel : activeCategory}
            </h2>
            {!isSearching && (
              <span
                className="text-[11px] font-medium px-2.5 py-0.5 rounded-full"
                style={{
                  background: '#F0F0F0',
                  color: 'var(--color-muted)',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {visibleItems.length} {visibleItems.length === 1 ? 'item' : 'items'}
              </span>
            )}
            {!isSearching && discountedCount > 0 && (
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background: 'rgba(229,64,48,0.12)',
                  color: 'var(--color-red)',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {discountedCount} on offer
              </span>
            )}
          </div>
          <div style={{ height: '1px', background: '#F0F0F0', marginTop: '12px' }} />
        </div>

        <MenuGrid
          key={isSearching ? 'search' : activeCategory}
          items={visibleItems}
          onItemClick={setSelectedItem}
          getCartQty={getCartQty}
          onAddToCart={addToCart}
          onUpdateQty={updateCartQty}
        />
      </main>

      {selectedItem && (
        <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}

      {isCartOpen && (
        <CartDrawer
          entries={cartItems}
          onClose={() => setIsCartOpen(false)}
          onUpdateQty={updateCartQty}
          onPlaceOrder={placeOrder}
        />
      )}

      {orderPlaced && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl z-50 flex items-center gap-2"
          style={{
            background: 'var(--color-green)',
            color: '#FFFFFF',
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
            fontSize: '0.875rem',
            boxShadow: '0 8px 32px rgba(26,107,74,0.3)',
            animation: 'content-in 0.4s cubic-bezier(0.22,1,0.36,1) both',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="2 8 6 12 14 4" />
          </svg>
          Order placed! We'll have it ready shortly.
        </div>
      )}
    </div>
  );
}

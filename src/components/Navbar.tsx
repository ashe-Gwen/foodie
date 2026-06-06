import { useState } from 'react';
import type { MenuItem } from '../types';
import { formatPrice, discountedPrice } from '../utils/format';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  cartCount: number;
  onCartOpen: () => void;
  currentView: 'menu' | 'admin';
  onAdminNav: () => void;
  allItems?: MenuItem[];
  onSuggestionClick?: (item: MenuItem) => void;
}

function SuggestionRow({
  item,
  onClick,
}: {
  item: MenuItem;
  onClick: () => void;
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const hasDiscount = !!item.discountPercent;
  const finalPrice = hasDiscount
    ? discountedPrice(item.price, item.discountPercent!)
    : item.price;

  return (
    <button
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="w-full flex items-center gap-3 text-left"
      style={{
        padding: '8px 12px',
        background: hovered ? 'var(--color-raised)' : 'transparent',
        border: 'none',
        cursor: 'pointer',
        transition: 'background 0.15s',
      }}
    >
      {/* Thumbnail */}
      <div
        className="flex-shrink-0 relative overflow-hidden"
        style={{ width: 40, height: 40, borderRadius: 8 }}
      >
        <div className="absolute inset-0 img-skeleton" />
        <img
          src={item.imageUrl}
          alt={item.name}
          onLoad={() => setImgLoaded(true)}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://placehold.co/80x80/E9E6E0/9B9690?text=';
            setImgLoaded(true);
          }}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.3s ease' }}
        />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p
          className="truncate"
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
            fontSize: '0.8rem',
            color: 'var(--color-text)',
            lineHeight: 1.3,
          }}
        >
          {item.name}
        </p>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.68rem',
            color: 'var(--color-muted)',
            marginTop: 1,
          }}
        >
          {item.category}
        </p>
      </div>

      {/* Price */}
      <div className="flex flex-col items-end flex-shrink-0">
        {hasDiscount && (
          <span
            className="line-through"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.65rem',
              color: 'var(--color-muted)',
            }}
          >
            {formatPrice(item.price)}
          </span>
        )}
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 700,
            fontSize: '0.78rem',
            color: hasDiscount ? 'var(--color-red)' : 'var(--color-green)',
          }}
        >
          {formatPrice(finalPrice)}
        </span>
      </div>
    </button>
  );
}

export default function Navbar({
  searchQuery,
  onSearchChange,
  cartCount,
  onCartOpen,
  currentView,
  onAdminNav,
  allItems = [],
  onSuggestionClick,
}: NavbarProps) {
  const inAdmin = currentView === 'admin';
  const [isFocused, setIsFocused] = useState(false);

  const q = searchQuery.trim().toLowerCase();
  const suggestions = q
    ? allItems
        .filter(
          (i) =>
            i.name.toLowerCase().includes(q) ||
            i.category.toLowerCase().includes(q)
        )
        .slice(0, 5)
    : [];

  const showDropdown = isFocused && suggestions.length > 0;

  return (
    <nav
      className="sticky top-0 z-40"
      style={{
        background: 'rgba(250,250,248,0.92)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
      }}
    >
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
        {/* Logo */}
        <span className="flex-shrink-0 select-none flex items-center gap-1.5">
          <svg
            width="26"
            height="26"
            viewBox="0 0 26 26"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle cx="8.5" cy="10.5" r="4" fill="var(--color-green)" />
            <circle cx="13" cy="8.5" r="4.8" fill="var(--color-green)" />
            <circle cx="17.5" cy="10.5" r="4" fill="var(--color-green)" />
            <rect x="8" y="12" width="10" height="5.5" fill="var(--color-green)" />
            <rect x="5.5" y="17.5" width="15" height="3.5" rx="1.8" fill="var(--color-green)" />
            <rect x="5.5" y="17.5" width="15" height="1.2" rx="1" fill="white" opacity="0.2" />
          </svg>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '1.18rem',
              letterSpacing: '-0.01em',
              color: 'var(--color-green)',
            }}
          >
            Foodiego
          </span>
        </span>

        {/* Separator dot */}
        <span
          className="flex-shrink-0"
          style={{
            width: 3,
            height: 3,
            borderRadius: '50%',
            background: 'var(--color-green)',
            opacity: 0.35,
            display: 'block',
          }}
        />

        {/* Search — hidden in admin view */}
        {!inAdmin && (
          <div className="flex-1 relative" style={{ maxWidth: '340px' }}>
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              width="12"
              height="12"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: 'var(--color-muted)' }}
            >
              <circle cx="9" cy="9" r="7" />
              <line x1="15" y1="15" x2="20" y2="20" />
            </svg>
            <input
              type="text"
              placeholder="Search menu…"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 150)}
              className="w-full rounded-full text-sm focus:outline-none"
              style={{
                background: 'rgba(0,0,0,0.05)',
                color: 'var(--color-text)',
                fontFamily: 'var(--font-sans)',
                border: '1px solid rgba(0,0,0,0.1)',
                paddingLeft: '2.2rem',
                paddingRight: '0.75rem',
                paddingTop: '0.38rem',
                paddingBottom: '0.38rem',
              }}
            />

            {/* Suggestions dropdown */}
            {showDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  right: 0,
                  background: 'var(--color-surface)',
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '14px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  overflow: 'hidden',
                  zIndex: 50,
                  animation: 'content-in 0.2s cubic-bezier(0.22,1,0.36,1) both',
                }}
              >
                {suggestions.map((item) => (
                  <SuggestionRow
                    key={item.id}
                    item={item}
                    onClick={() => {
                      onSuggestionClick?.(item);
                      setIsFocused(false);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Right controls */}
        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
          {/* Admin toggle */}
          <button
            onClick={onAdminNav}
            className="px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all duration-200"
            style={{
              fontFamily: 'var(--font-sans)',
              letterSpacing: '0.04em',
              background: inAdmin ? 'rgba(233,162,10,0.15)' : 'transparent',
              color: inAdmin ? 'var(--color-amber)' : 'var(--color-muted)',
              border: `1px solid ${inAdmin ? 'rgba(184,136,14,0.35)' : 'rgba(0,0,0,0.12)'}`,
            }}
          >
            {inAdmin ? '← Menu' : 'Admin'}
          </button>

          {/* Cart — hidden in admin */}
          {!inAdmin && (
            <button
              onClick={onCartOpen}
              className="relative flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 flex-shrink-0"
              style={{
                background: cartCount > 0 ? 'var(--color-green)' : 'rgba(0,0,0,0.05)',
                color: cartCount > 0 ? '#FFFFFF' : 'var(--color-muted)',
                border: cartCount > 0 ? 'none' : '1px solid rgba(0,0,0,0.1)',
              }}
              aria-label={`Cart, ${cartCount} items`}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1"
                  style={{
                    background: 'var(--color-red)',
                    color: '#fff',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '9px',
                    fontWeight: 700,
                  }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

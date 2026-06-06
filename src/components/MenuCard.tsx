import { useState } from 'react';
import type { CSSProperties } from 'react';
import type { MenuItem } from '../types';
import { formatPrice, discountedPrice } from '../utils/format';

interface MenuCardProps {
  item: MenuItem;
  onClick: (item: MenuItem) => void;
  style?: CSSProperties;
  cartQuantity: number;
  onAddToCart: () => void;
  onUpdateQty: (qty: number) => void;
}

export default function MenuCard({
  item,
  onClick,
  style,
  cartQuantity,
  onAddToCart,
  onUpdateQty,
}: MenuCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const hasDiscount = !!item.discountPercent;
  const finalPrice = hasDiscount
    ? discountedPrice(item.price, item.discountPercent!)
    : item.price;

  return (
    <div
      className="card-reveal group relative overflow-hidden rounded-2xl flex flex-col"
      style={{
        ...style,
        background: 'var(--color-surface)',
        border: `1px solid ${hovered ? 'rgba(0,0,0,0.14)' : 'rgba(0,0,0,0.07)'}`,
        boxShadow: hovered
          ? '0 16px 48px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.2)'
          : '0 2px 14px rgba(0,0,0,0.07)',
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Clickable area */}
      <button
        className="w-full text-left flex-1 flex flex-col focus-visible:outline-none"
        onClick={() => onClick(item)}
      >
        {/* Image */}
        <div className="relative overflow-hidden flex-shrink-0" style={{ aspectRatio: '4/3' }}>
          <div className="absolute inset-0 img-skeleton" />
          <img
            src={item.imageUrl}
            alt={item.name}
            onLoad={() => setImgLoaded(true)}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://placehold.co/400x300/E9E6E0/9B9690?text=';
              setImgLoaded(true);
            }}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              opacity: imgLoaded ? 1 : 0,
              transition: 'opacity 0.4s ease, transform 0.55s ease',
              transform: hovered ? 'scale(1.06)' : 'scale(1)',
            }}
          />

          {/* Bottom gradient */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)',
            }}
          />

          {/* Discount badge */}
          {hasDiscount && (
            <div
              className="badge-pop absolute top-2.5 right-2.5 text-[9px] font-bold px-2 py-0.5 rounded"
              style={{
                background: 'var(--color-red)',
                color: '#fff',
                fontFamily: 'var(--font-sans)',
                letterSpacing: '0.05em',
              }}
            >
              {item.discountPercent}% OFF
            </div>
          )}

          {/* Popular badge */}
          {item.isPopular && !hasDiscount && (
            <div
              className="badge-pulse absolute top-2.5 left-2.5 text-[9px] font-bold px-2 py-0.5 rounded"
              style={{
                background: 'rgba(17,17,17,0.88)',
                color: '#FFFFFF',
                fontFamily: 'var(--font-sans)',
                letterSpacing: '0.04em',
              }}
            >
              ★ Popular
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-3.5 pt-3 pb-2 flex-1">
          {item.offerLabel && (
            <p
              className="text-[8px] font-bold tracking-[0.25em] uppercase mb-1"
              style={{ color: 'var(--color-red)', fontFamily: 'var(--font-sans)' }}
            >
              ✦ {item.offerLabel}
            </p>
          )}
          <h3
            className="leading-snug mb-2"
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              fontSize: '0.88rem',
              color: 'var(--color-text)',
              letterSpacing: '-0.015em',
            }}
          >
            {item.name}
          </h3>
          <div className="flex items-center gap-2">
            {hasDiscount && (
              <span
                className="text-xs line-through"
                style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-sans)' }}
              >
                {formatPrice(item.price)}
              </span>
            )}
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: '0.95rem',
                color: hasDiscount ? 'var(--color-red)' : 'var(--color-green)',
                letterSpacing: '-0.01em',
              }}
            >
              {formatPrice(finalPrice)}
            </span>
          </div>

          {/* Dietary */}
          <div className="flex gap-1.5 mt-2">
            {item.isVegan && (
              <span
                className="text-[8px] font-medium px-1.5 py-0.5 rounded"
                style={{
                  background: 'rgba(0,0,0,0.07)',
                  color: 'var(--color-green)',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Vegan
              </span>
            )}
            {!item.isVegan && item.isVegetarian && (
              <span
                className="text-[8px] font-medium px-1.5 py-0.5 rounded"
                style={{
                  background: 'rgba(0,0,0,0.07)',
                  color: 'var(--color-green)',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Veggie
              </span>
            )}
          </div>
        </div>
      </button>

      {/* Cart controls */}
      <div
        className="px-3.5 pb-3.5"
        style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '0.5rem' }}
      >
        {cartQuantity === 0 ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart();
            }}
            className="w-full py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200"
            style={{
              border: '1px solid rgba(226,55,68,0.4)',
              background: 'transparent',
              color: 'var(--color-green)',
              fontFamily: 'var(--font-sans)',
              letterSpacing: '0.06em',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = 'var(--color-green)';
              el.style.color = '#FFFFFF';
              el.style.border = '1px solid var(--color-green)';
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = 'transparent';
              el.style.color = 'var(--color-green)';
              el.style.border = '1px solid rgba(226,55,68,0.4)';
            }}
          >
            + Add to Cart
          </button>
        ) : (
          <div className="flex items-center justify-between">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUpdateQty(cartQuantity - 1);
              }}
              className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: 'var(--color-raised)', color: 'var(--color-text)' }}
              aria-label="Decrease"
            >
              −
            </button>
            <span
              className="text-xs font-semibold"
              style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-muted)' }}
            >
              {cartQuantity} in cart
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUpdateQty(cartQuantity + 1);
              }}
              className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: 'var(--color-green)', color: '#FFFFFF' }}
              aria-label="Increase"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

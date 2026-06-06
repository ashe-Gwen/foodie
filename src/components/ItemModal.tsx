import { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import type { MenuItem } from '../types';
import { formatPrice, discountedPrice } from '../utils/format';

interface ItemModalProps {
  item: MenuItem;
  onClose: () => void;
}

export default function ItemModal({ item, onClose }: ItemModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  const hasDiscount = !!item.discountPercent;
  const finalPrice = hasDiscount
    ? discountedPrice(item.price, item.discountPercent!)
    : item.price;

  useEffect(() => {
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const modal = (
    <div
      className="modal-backdrop-in fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(22,20,13,0.6)', backdropFilter: 'blur(10px)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="modal-panel-in relative w-full sm:max-w-[860px] flex flex-col sm:flex-row overflow-hidden"
        style={{
          background: 'var(--color-surface)',
          borderRadius: '16px',
          boxShadow: '0 24px 60px rgba(22,20,13,0.3), 0 0 0 1px rgba(22,20,13,0.06)',
          maxHeight: '92vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Image column ─────────────────────── */}
        <div className="relative sm:w-[45%] flex-shrink-0">
          <div className="relative h-60 sm:h-full" style={{ minHeight: '380px' }}>
            {/* Skeleton */}
            <div className="absolute inset-0 img-skeleton" />

            {/* Image */}
            <img
              src={item.imageUrl}
              alt={item.name}
              onLoad={() => setImgLoaded(true)}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://placehold.co/500x600/EDE8DC/807869?text=';
                setImgLoaded(true);
              }}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ display: 'block', opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.5s ease' }}
            />

            {/* Right-edge fade to white on desktop */}
            <div
              className="absolute inset-0 hidden sm:block"
              style={{
                background: 'linear-gradient(to right, transparent 55%, var(--color-surface) 100%)',
              }}
            />
            {/* Bottom fade on mobile */}
            <div
              className="absolute inset-0 sm:hidden"
              style={{
                background: 'linear-gradient(to top, var(--color-surface) 0%, transparent 55%)',
              }}
            />

            {/* Discount badge on image */}
            {hasDiscount && (
              <div
                className="badge-pop absolute top-4 left-4 text-[11px] font-bold px-2.5 py-1 rounded"
                style={{ background: 'var(--color-red)', color: '#fff', fontFamily: 'var(--font-sans)' }}
              >
                {item.discountPercent}% OFF
              </div>
            )}
          </div>
        </div>

        {/* ── Content column ───────────────────── */}
        <div
          className="flex-1 flex flex-col overflow-y-auto"
          style={{ padding: '2rem 2.25rem 2.5rem' }}
        >
          {/* Close */}
          <div className="flex justify-end mb-1">
            <button
              ref={closeRef}
              onClick={onClose}
              aria-label="Close"
              className="w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
              style={{ background: 'var(--color-raised)', color: 'var(--color-muted)' }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.color = 'var(--color-text)')
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.color = 'var(--color-muted)')
              }
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="1" y1="1" x2="9" y2="9" />
                <line x1="9" y1="1" x2="1" y2="9" />
              </svg>
            </button>
          </div>

          {/* Category */}
          <p
            className="content-in text-[9px] tracking-[0.3em] uppercase font-semibold mb-3"
            style={{
              color: 'var(--color-green)',
              fontFamily: 'var(--font-sans)',
              animationDelay: '60ms',
            }}
          >
            {item.category}
          </p>

          {/* Name */}
          <h2
            id="modal-title"
            className="content-in leading-tight mb-2"
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
  
              fontWeight: 700,
              color: 'var(--color-text)',
              animationDelay: '120ms',
            }}
          >
            {item.name}
          </h2>

          {/* Price */}
          <div className="content-in flex items-center gap-3 mb-1" style={{ animationDelay: '180ms' }}>
            {hasDiscount && (
              <span
                className="text-lg line-through"
                style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-heading)' }}
              >
                {formatPrice(item.price)}
              </span>
            )}
            <span
              className="text-2xl font-bold"
              style={{
                fontFamily: 'var(--font-heading)',
                color: hasDiscount ? 'var(--color-red)' : 'var(--color-green)',
              }}
            >
              {formatPrice(finalPrice)}
            </span>
          </div>

          {/* Offer label */}
          {item.offerLabel && (
            <div
              className="content-in flex items-center gap-2 mt-2 mb-4 px-3 py-2 rounded-lg"
              style={{
                background: 'rgba(0,0,0,0.05)',
                animationDelay: '230ms',
              }}
            >
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded"
                style={{ background: 'var(--color-red)', color: '#fff', fontFamily: 'var(--font-sans)' }}
              >
                OFFER
              </span>
              <span
                className="text-xs font-medium"
                style={{ color: 'var(--color-red)', fontFamily: 'var(--font-sans)' }}
              >
                {item.offerLabel}
              </span>
            </div>
          )}

          {/* Accent line */}
          <span
            className="content-in accent-line mb-5"
            style={{ animationDelay: '270ms' }}
          />

          {/* Description */}
          <p
            className="content-in leading-relaxed text-sm"
            style={{
              color: 'var(--color-muted)',
              fontFamily: 'var(--font-sans)',
              fontWeight: 300,
              animationDelay: '320ms',
            }}
          >
            {item.description}
          </p>

          {/* Dietary */}
          {(item.isVegan || item.isVegetarian) && (
            <div className="content-in flex gap-2 mt-4" style={{ animationDelay: '370ms' }}>
              {item.isVegan && (
                <span
                  className="text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(0,0,0,0.07)', color: 'var(--color-green)', fontFamily: 'var(--font-sans)' }}
                >
                  Vegan
                </span>
              )}
              {!item.isVegan && item.isVegetarian && (
                <span
                  className="text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(0,0,0,0.07)', color: 'var(--color-green)', fontFamily: 'var(--font-sans)' }}
                >
                  Vegetarian
                </span>
              )}
            </div>
          )}

          {/* Allergens */}
          {item.allergens.length > 0 && (
            <div className="content-in mt-5" style={{ animationDelay: '420ms' }}>
              <p
                className="text-[9px] tracking-[0.3em] uppercase font-semibold mb-2.5"
                style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-sans)', opacity: 0.6 }}
              >
                Allergens
              </p>
              <div className="flex flex-wrap gap-1.5">
                {item.allergens.map((a) => (
                  <span
                    key={a}
                    className="text-[11px] px-2.5 py-0.5 rounded"
                    style={{
                      background: 'var(--color-raised)',
                      color: 'var(--color-muted)',
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {item.allergens.length === 0 && (
            <p
              className="content-in mt-5 text-xs italic"
              style={{
                color: 'var(--color-muted)',
                opacity: 0.55,
                fontFamily: 'var(--font-heading)',
                animationDelay: '420ms',
              }}
            >
              No major allergens.
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
}

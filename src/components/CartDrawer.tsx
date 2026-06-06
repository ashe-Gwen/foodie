import { useEffect } from 'react';
import ReactDOM from 'react-dom';
import type { CartEntry } from '../types';
import { formatPrice, discountedPrice } from '../utils/format';

interface CartDrawerProps {
  entries: CartEntry[];
  onClose: () => void;
  onUpdateQty: (itemId: string, qty: number) => void;
  onPlaceOrder: () => void;
}

export default function CartDrawer({ entries, onClose, onUpdateQty, onPlaceOrder }: CartDrawerProps) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const total = entries.reduce((sum, e) => {
    const unitPrice = e.item.discountPercent
      ? discountedPrice(e.item.price, e.item.discountPercent)
      : e.item.price;
    return sum + unitPrice * e.quantity;
  }, 0);

  const drawer = (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Your order"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(22,20,13,0.5)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="cart-drawer relative flex flex-col"
        style={{
          background: 'var(--color-surface)',
          width: 'min(420px, 100vw)',
          height: '100%',
          boxShadow: '-8px 0 40px rgba(22,20,13,0.2)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(22,20,13,0.08)' }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '1.25rem',
              color: 'var(--color-text)',
            }}
          >
            Your Order
          </h2>
          <button
            onClick={onClose}
            aria-label="Close cart"
            className="w-8 h-8 flex items-center justify-center rounded-full"
            style={{ background: 'var(--color-raised)', color: 'var(--color-muted)' }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="1" y1="1" x2="9" y2="9" />
              <line x1="9" y1="1" x2="1" y2="9" />
            </svg>
          </button>
        </div>

        {/* Item list */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {entries.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center h-full gap-3"
              style={{ color: 'var(--color-muted)' }}
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ opacity: 0.3 }}
              >
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              <p
                className="text-sm"
                style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-muted)' }}
              >
                Your basket is empty
              </p>
            </div>
          ) : (
            <ul className="space-y-4 py-2">
              {entries.map(({ item, quantity }) => {
                const unitPrice = item.discountPercent
                  ? discountedPrice(item.price, item.discountPercent)
                  : item.price;
                return (
                  <li key={item.id} className="flex items-center gap-3">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="rounded-lg flex-shrink-0 object-cover"
                      style={{ width: 56, height: 56 }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://placehold.co/56x56/EDE8DC/807869?text=';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-semibold truncate"
                        style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--color-text)' }}
                      >
                        {item.name}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-sans)' }}
                      >
                        {formatPrice(unitPrice)} each
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => onUpdateQty(item.id, quantity - 1)}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-colors"
                        style={{ background: 'var(--color-raised)', color: 'var(--color-text)' }}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span
                        className="text-sm font-semibold w-5 text-center"
                        style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-text)' }}
                      >
                        {quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQty(item.id, quantity + 1)}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-colors"
                        style={{ background: 'var(--color-green)', color: '#fff' }}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <span
                      className="text-sm font-semibold flex-shrink-0 w-16 text-right"
                      style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--color-text)' }}
                    >
                      {formatPrice(unitPrice * quantity)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-5 py-4 flex-shrink-0"
          style={{ borderTop: '1px solid rgba(22,20,13,0.08)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <span
              className="text-sm font-medium"
              style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-muted)' }}
            >
              Total
            </span>
            <span
              className="text-2xl font-bold"
              style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--color-text)' }}
            >
              {formatPrice(total)}
            </span>
          </div>
          <button
            onClick={onPlaceOrder}
            disabled={entries.length === 0}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity"
            style={{
              background: entries.length > 0 ? 'var(--color-green)' : 'var(--color-raised)',
              color: entries.length > 0 ? '#fff' : 'var(--color-muted)',
              fontFamily: 'var(--font-sans)',
              opacity: entries.length > 0 ? 1 : 0.5,
              cursor: entries.length > 0 ? 'pointer' : 'not-allowed',
            }}
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(drawer, document.body);
}

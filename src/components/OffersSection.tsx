import { useState } from 'react';
import { MENU_ITEMS } from '../data/menu';
import { formatPrice } from '../utils/format';
import type { ComboOffer } from '../types';

function isVegCombo(combo: ComboOffer): boolean {
  return combo.itemIds
    .map((id) => MENU_ITEMS.find((m) => m.id === id))
    .every((item) => item?.isVegetarian || item?.isVegan);
}

function DietDot({ isVeg }: { isVeg: boolean }) {
  return (
    <span
      className="inline-flex items-center justify-center w-[14px] h-[14px] rounded-sm flex-shrink-0"
      style={{
        background: '#fff',
        border: `1.5px solid ${isVeg ? '#388E3C' : '#7B2D00'}`,
      }}
    >
      <span
        className="w-[7px] h-[7px] rounded-full"
        style={{ background: isVeg ? '#388E3C' : '#E23744' }}
      />
    </span>
  );
}

function ComboCard({ combo, index }: { combo: ComboOffer; index: number }) {
  const isVeg = isVegCombo(combo);
  const items = combo.itemIds.map(
    (id) => MENU_ITEMS.find((m) => m.id === id)?.name ?? ''
  );
  const savings = combo.originalPrice - combo.comboPrice;
  const savingsPct = Math.round((savings / combo.originalPrice) * 100);

  return (
    <div
      className="offer-in flex-shrink-0 w-68 flex flex-col overflow-hidden"
      style={{
        width: '272px',
        background: '#FFFFFF',
        border: '1px solid #E8E8E8',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        borderRadius: '16px',
        scrollSnapAlign: 'start',
        animationDelay: `${index * 80}ms`,
      }}
    >
      {/* Zomato-style colored top strip */}
      <div style={{ height: '4px', background: combo.accentColor }} />

      {/* Card header */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between mb-1">
          <span
            className="text-[9px] font-semibold tracking-[0.25em] uppercase"
            style={{ color: '#E23744', fontFamily: 'var(--font-sans)' }}
          >
            Combo Deal
          </span>
          <span
            className="flex items-center gap-1 text-[9px] font-medium"
            style={{ color: isVeg ? '#388E3C' : '#7B2D00', fontFamily: 'var(--font-sans)' }}
          >
            <DietDot isVeg={isVeg} />
            {isVeg ? 'Veg' : 'Non-Veg'}
          </span>
        </div>
        <h3
          className="text-[17px] font-bold leading-snug"
          style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)', fontWeight: 700 }}
        >
          {combo.name}
        </h3>
        <p
          className="text-[12px] mt-0.5"
          style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-sans)' }}
        >
          {combo.tagline}
        </p>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: '#F0F0F0', margin: '0 16px' }} />

      {/* Items list */}
      <div className="px-4 py-3 flex-1">
        <ul className="space-y-1.5">
          {items.map((name, i) => (
            <li
              key={i}
              className="flex items-center gap-2 text-[12px]"
              style={{ color: 'var(--color-text)', fontFamily: 'var(--font-sans)' }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: '#E23744' }}
              />
              {name}
            </li>
          ))}
        </ul>
      </div>

      {/* Pricing footer */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderTop: '1px solid #F0F0F0', background: '#FAFAFA', borderRadius: '0 0 16px 16px' }}
      >
        <div>
          <span
            className="text-[11px] line-through block leading-none mb-0.5"
            style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-sans)' }}
          >
            {formatPrice(combo.originalPrice)}
          </span>
          <span
            className="text-[20px] font-bold leading-none"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', fontWeight: 700 }}
          >
            {formatPrice(combo.comboPrice)}
          </span>
        </div>
        <div className="text-right">
          <span
            className="badge-pop text-[10px] font-bold px-2.5 py-1 rounded-full block"
            style={{
              background: '#E23744',
              color: '#fff',
              fontFamily: 'var(--font-sans)',
              animationDelay: `${index * 80 + 300}ms`,
            }}
          >
            SAVE {formatPrice(savings)}
          </span>
          <p
            className="text-[10px] mt-1"
            style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-sans)' }}
          >
            {savingsPct}% off
          </p>
        </div>
      </div>
    </div>
  );
}

type FilterType = 'all' | 'veg' | 'nonveg';

const TABS: { key: FilterType; label: string; activeBg: string }[] = [
  { key: 'all',    label: 'All',      activeBg: '#E23744' },
  { key: 'veg',    label: '🌿 Veg',   activeBg: '#388E3C' },
  { key: 'nonveg', label: '🍗 Non-Veg', activeBg: '#E23744' },
];

interface OffersSectionProps {
  combos: ComboOffer[];
}

export default function OffersSection({ combos }: OffersSectionProps) {
  const [filter, setFilter] = useState<FilterType>('all');

  if (combos.length === 0) return null;

  const filtered = combos.filter((c) => {
    if (filter === 'veg') return isVegCombo(c);
    if (filter === 'nonveg') return !isVegCombo(c);
    return true;
  });

  const maxSavingPct = Math.max(
    ...combos.map((c) => Math.round(((c.originalPrice - c.comboPrice) / c.originalPrice) * 100))
  );

  return (
    <section
      style={{
        background: '#F8F8F8',
        borderTop: '4px solid #E23744',
      }}
    >
      <div className="max-w-5xl mx-auto px-4 py-7">
        {/* Section header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p
              className="text-[9px] tracking-[0.3em] uppercase font-semibold mb-1.5"
              style={{ color: '#E23744', fontFamily: 'var(--font-sans)' }}
            >
              Limited Time
            </p>
            <h2
              className="text-[26px] font-bold leading-none"
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                color: 'var(--color-text)',
              }}
            >
              Combo Deals
            </h2>
            <span className="accent-line mt-2" />
          </div>
          <span
            className="text-[11px] font-semibold px-3 py-1.5 rounded-full mt-1"
            style={{
              background: '#E23744',
              color: '#fff',
              fontFamily: 'var(--font-sans)',
            }}
          >
            Save up to {maxSavingPct}%
          </span>
        </div>

        {/* Veg / Non-Veg filter tabs */}
        <div className="flex gap-2 mb-5">
          {TABS.map((tab) => {
            const isActive = filter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className="text-[12px] font-semibold px-4 py-1.5 rounded-full transition-all"
                style={{
                  fontFamily: 'var(--font-sans)',
                  background: isActive ? tab.activeBg : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : 'var(--color-muted)',
                  border: isActive ? `1.5px solid ${tab.activeBg}` : '1.5px solid #E8E8E8',
                  cursor: 'pointer',
                  letterSpacing: '0.01em',
                  boxShadow: isActive ? '0 2px 8px rgba(226,55,68,0.2)' : 'none',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Scrollable cards */}
        {filtered.length > 0 ? (
          <div
            className="flex gap-4 overflow-x-auto pb-2"
            style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}
          >
            {filtered.map((combo, i) => (
              <ComboCard key={combo.id} combo={combo} index={i} />
            ))}
            <div className="flex-shrink-0 w-1" />
          </div>
        ) : (
          <p
            className="text-sm py-8 text-center"
            style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-sans)' }}
          >
            No combos in this category.
          </p>
        )}

        {/* Hint */}
        <p
          className="text-[10px] mt-4 tracking-wide"
          style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-sans)', opacity: 0.7 }}
        >
          ✦ Look for discounted items marked with % badges throughout the menu
        </p>
      </div>
    </section>
  );
}

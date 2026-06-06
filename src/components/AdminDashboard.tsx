import { useState } from 'react';
import type { MenuItem, ComboOffer } from '../types';
import { formatPrice } from '../utils/format';
import { COMBO_OFFERS } from '../data/menu';
import AddItemModal from './AddItemModal';

const ACCENT_COLORS = ['#1B3D2F', '#D63020', '#E9A20A', '#2563EB', '#7C3AED', '#0891B2'];

type AdminTab = 'items' | 'discounts' | 'combos';

interface AdminDashboardProps {
  allBaseItems: MenuItem[];
  removedIds: Set<string>;
  discountOverrides: Record<string, { discountPercent: number; offerLabel: string }>;
  customCombos: ComboOffer[];
  onAddItem: (item: MenuItem) => void;
  onDeleteItem: (id: string) => void;
  onRestoreItem: (id: string) => void;
  onSetDiscount: (id: string, pct: number, label: string) => void;
  onClearDiscount: (id: string) => void;
  onAddCombo: (combo: ComboOffer) => void;
  onDeleteCombo: (id: string) => void;
  onBack: () => void;
}

// ── Per-item discount editor row ─────────────────────────────
function DiscountRow({
  item,
  override,
  onSave,
  onClear,
}: {
  item: MenuItem;
  override: { discountPercent: number; offerLabel: string } | undefined;
  onSave: (id: string, pct: number, label: string) => void;
  onClear: (id: string) => void;
}) {
  const [pct, setPct] = useState(
    override
      ? String(override.discountPercent)
      : item.discountPercent
        ? String(item.discountPercent)
        : ''
  );
  const [label, setLabel] = useState(
    override ? override.offerLabel : (item.offerLabel ?? '')
  );

  const hasAny = !!(override || item.discountPercent);

  const inp: React.CSSProperties = {
    background: 'var(--color-raised)',
    color: 'var(--color-text)',
    fontFamily: 'var(--font-sans)',
    border: 'none',
    borderRadius: 6,
    padding: '0.35rem 0.5rem',
    fontSize: '0.8rem',
    outline: 'none',
  };

  return (
    <tr>
      <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(22,20,13,0.07)' }}>
        <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)' }}>
          {item.name}
        </p>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.7rem', color: 'var(--color-muted)', marginTop: 2 }}>
          {item.category} · {formatPrice(item.price)}
        </p>
      </td>
      <td style={{ padding: '0.75rem 0.5rem', borderBottom: '1px solid rgba(22,20,13,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <input
            type="number"
            min="0"
            max="99"
            value={pct}
            onChange={(e) => setPct(e.target.value)}
            placeholder="0"
            style={{ ...inp, width: 52 }}
          />
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'var(--color-muted)' }}>%</span>
        </div>
      </td>
      <td style={{ padding: '0.75rem 0.5rem', borderBottom: '1px solid rgba(22,20,13,0.07)' }}>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. Happy Hour"
          style={{ ...inp, width: 150 }}
        />
      </td>
      <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(22,20,13,0.07)' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => onSave(item.id, Number(pct) || 0, label)}
            style={{
              background: 'var(--color-green)',
              color: '#fff',
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              fontSize: '0.75rem',
              padding: '0.3rem 0.75rem',
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Save
          </button>
          {hasAny && (
            <button
              onClick={() => {
                onClear(item.id);
                setPct('');
                setLabel('');
              }}
              style={{
                background: 'var(--color-raised)',
                color: 'var(--color-muted)',
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                fontSize: '0.75rem',
                padding: '0.3rem 0.75rem',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Clear
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

// ── Main Admin Dashboard ──────────────────────────────────────
export default function AdminDashboard({
  allBaseItems,
  removedIds,
  discountOverrides,
  customCombos,
  onAddItem,
  onDeleteItem,
  onRestoreItem,
  onSetDiscount,
  onClearDiscount,
  onAddCombo,
  onDeleteCombo,
  onBack,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('items');
  const [showAddItem, setShowAddItem] = useState(false);
  const [showComboForm, setShowComboForm] = useState(false);

  // Combo form state
  const [comboName, setComboName] = useState('');
  const [comboTagline, setComboTagline] = useState('');
  const [comboSelectedIds, setComboSelectedIds] = useState<string[]>([]);
  const [comboPrice, setComboPrice] = useState('');
  const [comboColor, setComboColor] = useState(ACCENT_COLORS[0]);

  const activeItems = allBaseItems.filter((i) => !removedIds.has(i.id));

  const comboOriginalPrice = comboSelectedIds.reduce((sum, id) => {
    const item = allBaseItems.find((i) => i.id === id);
    return sum + (item?.price ?? 0);
  }, 0);

  const toggleComboItem = (id: string) =>
    setComboSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleAddCombo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comboName.trim() || comboSelectedIds.length < 2 || !comboPrice) return;
    const cp = Math.round(parseFloat(comboPrice) * 100);
    if (cp <= 0 || cp >= comboOriginalPrice) return;
    onAddCombo({
      id: crypto.randomUUID(),
      name: comboName.trim(),
      tagline: comboTagline.trim(),
      itemIds: comboSelectedIds,
      originalPrice: comboOriginalPrice,
      comboPrice: cp,
      accentColor: comboColor,
    });
    setComboName('');
    setComboTagline('');
    setComboSelectedIds([]);
    setComboPrice('');
    setComboColor(ACCENT_COLORS[0]);
    setShowComboForm(false);
  };

  const getItemName = (id: string) =>
    allBaseItems.find((i) => i.id === id)?.name ?? id;

  // ── Shared table styles ─────────────────────────────────────
  const cell: React.CSSProperties = {
    padding: '0.75rem 1rem',
    borderBottom: '1px solid rgba(22,20,13,0.07)',
  };
  const th: React.CSSProperties = {
    ...cell,
    fontFamily: 'var(--font-sans)',
    fontSize: '0.62rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: 'var(--color-muted)',
    background: 'var(--color-raised)',
    textAlign: 'left',
  };

  const card: React.CSSProperties = {
    background: 'var(--color-surface)',
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(22,20,13,0.06)',
  };

  const tabs: { key: AdminTab; label: string }[] = [
    { key: 'items', label: 'Menu Items' },
    { key: 'discounts', label: 'Discounts & Offers' },
    { key: 'combos', label: 'Combo Deals' },
  ];

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      {/* Dashboard header bar */}
      <div
        style={{
          background: 'var(--color-surface)',
          borderBottom: '1px solid rgba(22,20,13,0.1)',
          padding: '0.875rem 0',
        }}
      >
        <div
          className="max-w-5xl mx-auto px-4"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-green)',
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="14 18 8 12 14 6" />
            </svg>
            Back to Menu
          </button>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: '1.2rem',
              color: 'var(--color-text)',
              letterSpacing: '-0.01em',
            }}
          >
            Admin Dashboard
          </h1>
          <div style={{ width: 120 }} />
        </div>
      </div>

      {/* Tab strip */}
      <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid rgba(22,20,13,0.08)' }}>
        <div className="max-w-5xl mx-auto px-4" style={{ display: 'flex' }}>
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                fontSize: '0.875rem',
                padding: '0.75rem 1.25rem',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === key
                  ? '2px solid var(--color-green)'
                  : '2px solid transparent',
                color: activeTab === key ? 'var(--color-green)' : 'var(--color-muted)',
                cursor: 'pointer',
                transition: 'color 0.15s',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-7">

        {/* ── Tab: Menu Items ──────────────────────────────── */}
        {activeTab === 'items' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.15rem', color: 'var(--color-text)' }}>
                  Menu Items
                </h2>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'var(--color-muted)', marginTop: 3 }}>
                  {activeItems.length} active · {removedIds.size} removed
                </p>
              </div>
              <button
                onClick={() => setShowAddItem(true)}
                style={{
                  background: 'var(--color-green)',
                  color: '#fff',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  padding: '0.55rem 1.1rem',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                + Add New Item
              </button>
            </div>

            <div style={card}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={th}>Name</th>
                    <th style={th}>Category</th>
                    <th style={th}>Price</th>
                    <th style={th}>Status</th>
                    <th style={th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allBaseItems.map((item) => {
                    const isRemoved = removedIds.has(item.id);
                    return (
                      <tr key={item.id}>
                        <td style={{ ...cell, opacity: isRemoved ? 0.55 : 1 }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-heading)',
                              fontWeight: 700,
                              fontSize: '0.9rem',
                              color: 'var(--color-text)',
                              textDecoration: isRemoved ? 'line-through' : 'none',
                            }}
                          >
                            {item.name}
                          </span>
                        </td>
                        <td style={{ ...cell, fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'var(--color-muted)' }}>
                          {item.category}
                        </td>
                        <td style={{ ...cell, fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)' }}>
                          {formatPrice(item.price)}
                        </td>
                        <td style={cell}>
                          <span
                            style={{
                              fontFamily: 'var(--font-sans)',
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              padding: '0.2rem 0.6rem',
                              borderRadius: 20,
                              background: isRemoved ? 'rgba(214,48,32,0.1)' : 'rgba(27,61,47,0.1)',
                              color: isRemoved ? 'var(--color-red)' : 'var(--color-green)',
                            }}
                          >
                            {isRemoved ? 'Removed' : 'Active'}
                          </span>
                        </td>
                        <td style={cell}>
                          {isRemoved ? (
                            <button
                              onClick={() => onRestoreItem(item.id)}
                              style={{
                                background: 'rgba(27,61,47,0.08)',
                                color: 'var(--color-green)',
                                fontFamily: 'var(--font-sans)',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                padding: '0.3rem 0.75rem',
                                borderRadius: 6,
                                border: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              Restore
                            </button>
                          ) : (
                            <button
                              onClick={() => onDeleteItem(item.id)}
                              style={{
                                background: 'rgba(214,48,32,0.08)',
                                color: 'var(--color-red)',
                                fontFamily: 'var(--font-sans)',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                padding: '0.3rem 0.75rem',
                                borderRadius: 6,
                                border: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Tab: Discounts & Offers ────────────────────── */}
        {activeTab === 'discounts' && (
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.15rem', color: 'var(--color-text)' }}>
                Discounts & Offers
              </h2>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'var(--color-muted)', marginTop: 3 }}>
                Set a discount % and offer label per item. Changes appear on the menu immediately.
              </p>
            </div>
            <div style={card}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={th}>Item</th>
                    <th style={th}>Discount %</th>
                    <th style={th}>Offer Label</th>
                    <th style={th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeItems.map((item) => (
                    <DiscountRow
                      key={item.id}
                      item={item}
                      override={discountOverrides[item.id]}
                      onSave={onSetDiscount}
                      onClear={onClearDiscount}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Tab: Combo Deals ──────────────────────────── */}
        {activeTab === 'combos' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.15rem', color: 'var(--color-text)' }}>
                  Combo Deals
                </h2>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'var(--color-muted)', marginTop: 3 }}>
                  {COMBO_OFFERS.length} built-in · {customCombos.length} custom
                </p>
              </div>
              {!showComboForm && (
                <button
                  onClick={() => setShowComboForm(true)}
                  style={{
                    background: 'var(--color-green)',
                    color: '#fff',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    padding: '0.55rem 1.1rem',
                    borderRadius: 8,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  + Add Combo
                </button>
              )}
            </div>

            {/* Combo list */}
            <div style={{ ...card, marginBottom: 20 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={th}>Name</th>
                    <th style={th}>Items</th>
                    <th style={th}>Combo Price</th>
                    <th style={th}>Saves</th>
                    <th style={th}>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {[...COMBO_OFFERS, ...customCombos].map((combo) => {
                    const isCustom = customCombos.some((c) => c.id === combo.id);
                    const savings = combo.originalPrice - combo.comboPrice;
                    return (
                      <tr key={combo.id}>
                        <td style={cell}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div
                              style={{
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                background: combo.accentColor,
                                flexShrink: 0,
                              }}
                            />
                            <div>
                              <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)' }}>
                                {combo.name}
                              </p>
                              {combo.tagline && (
                                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.7rem', color: 'var(--color-muted)', marginTop: 1 }}>
                                  {combo.tagline}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td
                          style={{
                            ...cell,
                            fontFamily: 'var(--font-sans)',
                            fontSize: '0.78rem',
                            color: 'var(--color-muted)',
                            maxWidth: 220,
                          }}
                        >
                          {combo.itemIds.map((id) => getItemName(id)).join(', ')}
                        </td>
                        <td style={{ ...cell, fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)' }}>
                          {formatPrice(combo.comboPrice)}
                        </td>
                        <td style={{ ...cell, fontFamily: 'var(--font-sans)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-red)' }}>
                          {formatPrice(savings)}
                        </td>
                        <td style={cell}>
                          {isCustom ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span
                                style={{
                                  fontFamily: 'var(--font-sans)',
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  padding: '0.2rem 0.6rem',
                                  borderRadius: 20,
                                  background: 'rgba(233,162,10,0.1)',
                                  color: 'var(--color-amber)',
                                }}
                              >
                                Custom
                              </span>
                              <button
                                onClick={() => onDeleteCombo(combo.id)}
                                style={{
                                  background: 'rgba(214,48,32,0.08)',
                                  color: 'var(--color-red)',
                                  fontFamily: 'var(--font-sans)',
                                  fontWeight: 600,
                                  fontSize: '0.75rem',
                                  padding: '0.3rem 0.75rem',
                                  borderRadius: 6,
                                  border: 'none',
                                  cursor: 'pointer',
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          ) : (
                            <span
                              style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                padding: '0.2rem 0.6rem',
                                borderRadius: 20,
                                background: 'rgba(27,61,47,0.08)',
                                color: 'var(--color-green)',
                              }}
                            >
                              Built-in
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Add Combo form */}
            {showComboForm && (
              <div
                style={{
                  background: 'var(--color-surface)',
                  borderRadius: 12,
                  padding: '1.5rem',
                  boxShadow: '0 2px 8px rgba(22,20,13,0.06)',
                  border: '1.5px solid rgba(27,61,47,0.15)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)' }}>
                    New Combo Deal
                  </h3>
                  <button
                    onClick={() => setShowComboForm(false)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', fontFamily: 'var(--font-sans)', fontSize: '0.8rem' }}
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleAddCombo}>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '0.62rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted)', marginBottom: 4 }}>
                        Name *
                      </label>
                      <input
                        type="text"
                        value={comboName}
                        onChange={(e) => setComboName(e.target.value)}
                        required
                        placeholder="e.g. Family Feast"
                        style={{ background: 'var(--color-raised)', color: 'var(--color-text)', fontFamily: 'var(--font-sans)', border: 'none', borderRadius: 8, padding: '0.5rem 0.75rem', fontSize: '0.875rem', width: '100%', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '0.62rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted)', marginBottom: 4 }}>
                        Tagline
                      </label>
                      <input
                        type="text"
                        value={comboTagline}
                        onChange={(e) => setComboTagline(e.target.value)}
                        placeholder="e.g. Perfect for sharing"
                        style={{ background: 'var(--color-raised)', color: 'var(--color-text)', fontFamily: 'var(--font-sans)', border: 'none', borderRadius: 8, padding: '0.5rem 0.75rem', fontSize: '0.875rem', width: '100%', outline: 'none' }}
                      />
                    </div>
                  </div>

                  {/* Item selector */}
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '0.62rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted)', marginBottom: 6 }}>
                      Select Items * (min 2)
                    </label>
                    <div
                      style={{
                        background: 'var(--color-raised)',
                        borderRadius: 8,
                        padding: '0.75rem',
                        maxHeight: 190,
                        overflowY: 'auto',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                        gap: '0.35rem',
                      }}
                    >
                      {activeItems.map((item) => (
                        <label
                          key={item.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            cursor: 'pointer',
                            padding: '0.3rem 0.5rem',
                            borderRadius: 6,
                            background: comboSelectedIds.includes(item.id)
                              ? 'rgba(27,61,47,0.12)'
                              : 'transparent',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={comboSelectedIds.includes(item.id)}
                            onChange={() => toggleComboItem(item.id)}
                            style={{ accentColor: 'var(--color-green)', width: 13, height: 13 }}
                          />
                          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'var(--color-text)', flex: 1 }}>
                            {item.name}
                          </span>
                          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                            {formatPrice(item.price)}
                          </span>
                        </label>
                      ))}
                    </div>
                    {comboSelectedIds.length > 0 && (
                      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: 6 }}>
                        {comboSelectedIds.length} selected · Original total:{' '}
                        <strong style={{ color: 'var(--color-text)' }}>{formatPrice(comboOriginalPrice)}</strong>
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div>
                      <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '0.62rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted)', marginBottom: 4 }}>
                        Combo Price (£) *
                      </label>
                      <input
                        type="number"
                        value={comboPrice}
                        onChange={(e) => setComboPrice(e.target.value)}
                        required
                        min="0.01"
                        step="0.01"
                        placeholder="0.00"
                        style={{ background: 'var(--color-raised)', color: 'var(--color-text)', fontFamily: 'var(--font-sans)', border: 'none', borderRadius: 8, padding: '0.5rem 0.75rem', fontSize: '0.875rem', width: '100%', outline: 'none' }}
                      />
                      {comboPrice && comboOriginalPrice > 0 && (() => {
                        const cp = Math.round(parseFloat(comboPrice) * 100);
                        const savings = comboOriginalPrice - cp;
                        if (savings > 0) return (
                          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.7rem', color: 'var(--color-green)', marginTop: 5 }}>
                            Saves {formatPrice(savings)} · {Math.round((savings / comboOriginalPrice) * 100)}% off
                          </p>
                        );
                        if (savings <= 0) return (
                          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.7rem', color: 'var(--color-red)', marginTop: 5 }}>
                            Must be less than {formatPrice(comboOriginalPrice)}
                          </p>
                        );
                      })()}
                    </div>
                    <div>
                      <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '0.62rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted)', marginBottom: 8 }}>
                        Accent Colour
                      </label>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {ACCENT_COLORS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setComboColor(color)}
                            title={color}
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: '50%',
                              background: color,
                              border: comboColor === color ? `3px solid var(--color-text)` : '3px solid transparent',
                              cursor: 'pointer',
                              boxShadow: comboColor === color ? `0 0 0 2px white inset` : 'none',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => setShowComboForm(false)}
                      style={{
                        flex: 1,
                        padding: '0.65rem',
                        borderRadius: 8,
                        background: 'var(--color-raised)',
                        color: 'var(--color-muted)',
                        fontFamily: 'var(--font-sans)',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={comboSelectedIds.length < 2 || !comboName.trim() || !comboPrice}
                      style={{
                        flex: 1,
                        padding: '0.65rem',
                        borderRadius: 8,
                        background:
                          comboSelectedIds.length >= 2 && comboName.trim() && comboPrice
                            ? 'var(--color-green)'
                            : 'var(--color-raised)',
                        color:
                          comboSelectedIds.length >= 2 && comboName.trim() && comboPrice
                            ? '#fff'
                            : 'var(--color-muted)',
                        fontFamily: 'var(--font-sans)',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        border: 'none',
                        cursor:
                          comboSelectedIds.length >= 2 && comboName.trim() && comboPrice
                            ? 'pointer'
                            : 'not-allowed',
                      }}
                    >
                      Create Combo
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {showAddItem && (
        <AddItemModal
          onAdd={(item) => {
            onAddItem(item);
            setShowAddItem(false);
          }}
          onClose={() => setShowAddItem(false)}
        />
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import type { MenuItem, Category } from '../types';
import { CATEGORIES } from '../data/menu';

interface AddItemModalProps {
  onAdd: (item: MenuItem) => void;
  onClose: () => void;
}

const inputStyle: React.CSSProperties = {
  background: 'var(--color-raised)',
  color: 'var(--color-text)',
  fontFamily: 'var(--font-sans)',
  borderRadius: '8px',
  border: 'none',
  outline: 'none',
  padding: '0.5rem 0.75rem',
  fontSize: '0.875rem',
  width: '100%',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.65rem',
  fontWeight: 600,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  marginBottom: '0.3rem',
  color: 'var(--color-muted)',
  fontFamily: 'var(--font-sans)',
};

export default function AddItemModal({ onAdd, onClose }: AddItemModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('Starters');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [allergens, setAllergens] = useState('');
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [isVegan, setIsVegan] = useState(false);
  const [isPopular, setIsPopular] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;
    onAdd({
      id: crypto.randomUUID(),
      name: name.trim(),
      category,
      price: Math.round(parseFloat(price) * 100),
      description: description.trim(),
      imageUrl: imageUrl.trim() || 'https://placehold.co/600x450/EDE8DC/807869?text=New+Item',
      allergens: allergens.split(',').map((a) => a.trim()).filter(Boolean),
      isVegetarian: isVegetarian || isVegan,
      isVegan,
      isPopular,
    });
    onClose();
  };

  const modal = (
    <div
      className="modal-backdrop-in fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Add menu item"
    >
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(22,20,13,0.6)', backdropFilter: 'blur(10px)' }}
        onClick={onClose}
      />
      <div
        className="modal-panel-in relative w-full overflow-y-auto"
        style={{
          background: 'var(--color-surface)',
          borderRadius: '16px',
          maxWidth: '520px',
          maxHeight: '90vh',
          boxShadow: '0 24px 60px rgba(22,20,13,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid rgba(22,20,13,0.08)' }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '1.2rem',
              color: 'var(--color-text)',
            }}
          >
            Add New Item
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 flex items-center justify-center rounded-full"
            style={{ background: 'var(--color-raised)', color: 'var(--color-muted)' }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="1" y1="1" x2="9" y2="9" />
              <line x1="9" y1="1" x2="1" y2="9" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Name */}
          <div>
            <label style={labelStyle}>Item Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Grilled Sea Bass"
              style={inputStyle}
            />
          </div>

          {/* Category + Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                style={inputStyle}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Price (£) *</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min="0"
                step="0.01"
                placeholder="0.00"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Brief description of the dish…"
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* Image URL */}
          <div>
            <label style={labelStyle}>Image URL (optional)</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/…"
              style={inputStyle}
            />
          </div>

          {/* Allergens */}
          <div>
            <label style={labelStyle}>Allergens (comma-separated)</label>
            <input
              type="text"
              value={allergens}
              onChange={(e) => setAllergens(e.target.value)}
              placeholder="e.g. Gluten, Dairy, Nuts"
              style={inputStyle}
            />
          </div>

          {/* Dietary flags */}
          <div className="flex flex-wrap gap-5">
            {(
              [
                ['Vegetarian', isVegetarian, setIsVegetarian],
                ['Vegan', isVegan, setIsVegan],
                ['Popular', isPopular, setIsPopular],
              ] as [string, boolean, (v: boolean) => void][]
            ).map(([label, value, set]) => (
              <label key={label} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => set(e.target.checked)}
                  style={{ accentColor: 'var(--color-green)', width: 14, height: 14 }}
                />
                <span
                  style={{
                    fontSize: '0.85rem',
                    fontFamily: 'var(--font-sans)',
                    color: 'var(--color-text)',
                  }}
                >
                  {label}
                </span>
              </label>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold"
              style={{
                background: 'var(--color-raised)',
                color: 'var(--color-muted)',
                fontFamily: 'var(--font-sans)',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold"
              style={{
                background: 'var(--color-green)',
                color: '#fff',
                fontFamily: 'var(--font-sans)',
              }}
            >
              Add to Menu
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
}

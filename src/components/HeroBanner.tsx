import { useState, useEffect } from 'react';

const IMAGES = [
  'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1567337710282-00832b415979?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=1600&q=80',
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent(i => (i + 1) % IMAGES.length);
    }, 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="relative overflow-hidden w-full header-in"
      style={{ height: 'clamp(300px, 52vw, 580px)' }}
    >
      {/* Cycling background images */}
      {IMAGES.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            filter: 'brightness(0.45) saturate(0.85)',
            opacity: i === current ? 1 : 0,
            transition: 'opacity 0.5s ease-in-out',
          }}
        />
      ))}

      {/* Gradient layers */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(120deg, rgba(13,10,7,0.95) 0%, rgba(13,10,7,0.35) 55%, rgba(13,10,7,0.1) 100%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to top, rgba(13,10,7,0.9) 0%, transparent 45%)',
        }}
      />

      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-5xl w-full mx-auto px-4 sm:px-6">
          {/* Eyebrow */}
          <div
            className="flex items-center gap-3 mb-5"
            style={{ animation: 'content-in 0.7s 0.1s both' }}
          >
            <div
              style={{
                width: '1.75rem',
                height: '1px',
                background: 'var(--color-green)',
                opacity: 0.8,
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.6rem',
                letterSpacing: '0.42em',
                textTransform: 'uppercase',
                color: 'var(--color-green)',
                fontWeight: 500,
              }}
            >
              Est. 2024 · Fine Dining
            </span>
          </div>

          {/* Main heading */}
          <div style={{ animation: 'content-in 0.8s 0.2s both' }}>
            <h1
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                fontSize: 'clamp(2.4rem, 8vw, 5.5rem)',
                color: '#FFFFFF',
                lineHeight: 0.93,
                letterSpacing: '-0.04em',
                marginBottom: '0.15em',
              }}
            >
              A Culinary
            </h1>
            <h1
              className="gold-text"
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                fontSize: 'clamp(2.4rem, 8vw, 5.5rem)',
                lineHeight: 0.93,
                letterSpacing: '-0.04em',
              }}
            >
              Experience
            </h1>
          </div>

          {/* Divider */}
          <div
            style={{
              width: '48px',
              height: '1px',
              background: 'var(--color-green)',
              opacity: 0.6,
              margin: '1.6rem 0 1.2rem',
              animation: 'content-in 0.7s 0.35s both',
            }}
          />

          {/* Tagline */}
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 300,
              fontSize: 'clamp(0.875rem, 2vw, 1.05rem)',
              color: 'rgba(238,230,212,0.55)',
              letterSpacing: '0.04em',
              animation: 'content-in 0.7s 0.45s both',
            }}
          >
            The Essence of South Indian Flavours
          </p>
        </div>
      </div>

    </div>
  );
}

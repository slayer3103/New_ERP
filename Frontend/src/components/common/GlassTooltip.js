import React from 'react';
import { tokens } from '../../theme/paletteTokens';

/**
 * Glassmorphism-styled Recharts custom tooltip.
 *
 * @param {boolean}  active        – provided by Recharts
 * @param {Array}    payload       – provided by Recharts
 * @param {string}   label         – provided by Recharts
 * @param {function} [formatValue] – optional value formatter (defaults to currency)
 */
export default function GlassTooltip({ active, payload, label, formatValue }) {
  if (!active || !payload?.length) return null;

  const defaultFormat = (v) =>
    typeof v === 'number' && v > 100
      ? `₹${new Intl.NumberFormat('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v)}`
      : v;

  const fmt = formatValue || defaultFormat;

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.82)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.45)',
        borderRadius: '14px',
        padding: '14px 18px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)',
        minWidth: 170,
      }}
    >
      {label && (
        <div
          style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            color: tokens.textPrimary,
            marginBottom: 8,
            letterSpacing: '0.02em',
          }}
        >
          {label}
        </div>
      )}
      {payload.map((p, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: i < payload.length - 1 ? 5 : 0,
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: p.color,
              display: 'inline-block',
              flexShrink: 0,
              boxShadow: `0 0 6px ${p.color}60`,
            }}
          />
          <span style={{ fontSize: '0.72rem', color: tokens.textSecondary }}>
            {p.name}:
          </span>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: tokens.textPrimary, marginLeft: 'auto' }}>
            {fmt(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

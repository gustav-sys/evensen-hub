import React, { useState } from 'react';
import { PRIORITY_CONFIG, PRIORITY_ORDER } from '../data/priorities';

export const PriorityLegend: React.FC = () => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'absolute',
        left: 20,
        bottom: 80,
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
        padding: '10px 12px',
        borderRadius: 8,
        background: hovered ? 'rgba(0,0,0,0.03)' : 'transparent',
        border: `1px solid ${hovered ? 'rgba(0,0,0,0.1)' : 'transparent'}`,
        opacity: hovered ? 1 : 0.7,
        transition: 'opacity 0.2s ease, background 0.2s ease, border-color 0.2s ease',
        zIndex: 4,
        pointerEvents: 'auto',
        userSelect: 'none',
      }}
    >
      {PRIORITY_ORDER.map(p => {
        const cfg = PRIORITY_CONFIG[p];
        return (
          <div
            key={p}
            style={{ display: 'flex', alignItems: 'center', gap: 7 }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: cfg.bg,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 10,
                color: '#6E655C',
                letterSpacing: '0.04em',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ color: '#8B6E52', fontWeight: 600 }}>{p}</span>
              {' — '}
              {cfg.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

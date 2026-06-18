import React, { useState } from 'react';

interface Props {
  onSubmit: (name: string) => void;
}

export const NamePrompt: React.FC<Props> = ({ onSubmit }) => {
  const [name, setName] = useState('');

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(40,36,32,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        style={{
          width: 380,
          background: '#FFFFFF',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: 12,
          padding: '40px 36px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
        }}
      >
        {/* Brand heading */}
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.22em',
            color: '#8B6E52',
            textTransform: 'uppercase',
            marginBottom: 28,
          }}
        >
          EVENSEN 1916
        </div>

        {/* Main question */}
        <div
          style={{
            fontSize: 24,
            fontWeight: 600,
            color: '#1F1D1A',
            letterSpacing: '-0.01em',
            lineHeight: 1.25,
            marginBottom: 10,
          }}
        >
          What's your name?
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 13,
            color: '#6E655C',
            lineHeight: 1.5,
            marginBottom: 28,
          }}
        >
          So your team knows who's working on what.
        </div>

        {/* Input */}
        <input
          autoFocus
          placeholder="Your name"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          style={{
            background: '#F7F4EF',
            border: '1px solid rgba(0,0,0,0.12)',
            borderRadius: 6,
            outline: 'none',
            color: '#1F1D1A',
            fontSize: 14,
            padding: '10px 14px',
            fontFamily: 'inherit',
            width: '100%',
            boxSizing: 'border-box',
            marginBottom: 16,
            transition: 'border-color 0.15s',
          }}
          onFocus={e => {
            (e.currentTarget as HTMLInputElement).style.borderColor = 'rgba(139,110,82,0.5)';
          }}
          onBlur={e => {
            (e.currentTarget as HTMLInputElement).style.borderColor = 'rgba(0,0,0,0.12)';
          }}
        />

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={!name.trim()}
          style={{
            background: name.trim() ? '#1F1D1A' : 'rgba(31,29,26,0.12)',
            color: name.trim() ? '#F7F4EF' : '#9A9087',
            border: 'none',
            borderRadius: 6,
            padding: '11px 20px',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.06em',
            cursor: name.trim() ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit',
            transition: 'background 0.15s, color 0.15s',
            textTransform: 'uppercase',
          }}
          onMouseEnter={e => {
            if (name.trim()) (e.currentTarget as HTMLElement).style.background = '#36322D';
          }}
          onMouseLeave={e => {
            if (name.trim()) (e.currentTarget as HTMLElement).style.background = '#1F1D1A';
          }}
        >
          Join Campaign
        </button>
      </div>
    </div>
  );
};

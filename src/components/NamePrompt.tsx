import React, { useState } from 'react';

interface Props {
  onSubmit: (name: string, email: string) => void;
  /** Names already taken (the existing profile names). */
  existingNames: string[];
  /** Maximum number of users allowed in this campaign. */
  cap: number;
  /** Optional pre-fill for the name input (existing name-only users). */
  initialName?: string;
  /** False until the profiles directory has loaded — gates submit to avoid a cap race. */
  ready?: boolean;
}

// Basic email shape check — non-empty local part, @, domain with a dot.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INPUT_STYLE: React.CSSProperties = {
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
};

export const NamePrompt: React.FC<Props> = ({
  onSubmit,
  existingNames,
  cap,
  initialName,
  ready = true,
}) => {
  const [name, setName] = useState(initialName ?? '');
  const [email, setEmail] = useState('');

  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const nameValid = trimmedName.length > 0;
  const emailValid = EMAIL_RE.test(trimmedEmail);

  // Is this a brand-new name (not already in the directory)?
  const isExistingName = existingNames.some(
    n => n.trim().toLowerCase() === trimmedName.toLowerCase()
  );
  // Campaign is full only blocks *new* names once the cap is reached.
  const isFull = !isExistingName && existingNames.length >= cap;

  const canSubmit = nameValid && emailValid && !isFull && ready;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(trimmedName, trimmedEmail);
  };

  const focusBorder = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'rgba(139,110,82,0.5)';
  };
  const blurBorder = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)';
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
          Your name and work email, so teammates can assign you and you get
          deadline reminders.
        </div>

        {/* Name input */}
        <input
          autoFocus
          placeholder="Your name"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          style={INPUT_STYLE}
          onFocus={focusBorder}
          onBlur={blurBorder}
        />

        {/* Work email input */}
        <input
          type="email"
          placeholder="Your work email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          style={INPUT_STYLE}
          onFocus={focusBorder}
          onBlur={blurBorder}
        />

        {/* Campaign-full notice */}
        {isFull && (
          <div
            style={{
              fontSize: 12,
              color: '#B4463C',
              lineHeight: 1.5,
              marginBottom: 16,
            }}
          >
            This campaign is full ({cap} users max).
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          style={{
            background: canSubmit ? '#1F1D1A' : 'rgba(31,29,26,0.12)',
            color: canSubmit ? '#F7F4EF' : '#9A9087',
            border: 'none',
            borderRadius: 6,
            padding: '11px 20px',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.06em',
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit',
            transition: 'background 0.15s, color 0.15s',
            textTransform: 'uppercase',
          }}
          onMouseEnter={e => {
            if (canSubmit) (e.currentTarget as HTMLElement).style.background = '#36322D';
          }}
          onMouseLeave={e => {
            if (canSubmit) (e.currentTarget as HTMLElement).style.background = '#1F1D1A';
          }}
        >
          Join Campaign
        </button>
      </div>
    </div>
  );
};

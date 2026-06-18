import React, { useState, useRef, useEffect } from 'react';

interface Props {
  campaignName: string;
  onNameChange: (name: string) => void;
}

export const CenterNode: React.FC<Props> = ({ campaignName, onNameChange }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(campaignName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(campaignName);
  }, [campaignName]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim() || campaignName;
    setDraft(trimmed);
    onNameChange(trimmed);
  };

  return (
    <div
      className="center-pulse"
      style={{
        position: 'relative',
        width: 160,
        height: 160,
        borderRadius: '50%',
        background: '#0F0E0D',
        border: '1.5px solid rgba(0, 0, 0, 0.18)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        zIndex: 10,
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.18)',
      }}
    >
      {/* Brand name — fixed */}
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.18em',
          color: '#C8B89A',
          textTransform: 'uppercase',
        }}
      >
        Evensen 1916
      </span>

      {/* Divider */}
      <div
        style={{
          width: 32,
          height: 1,
          background: 'rgba(200, 184, 154, 0.25)',
        }}
      />

      {/* Campaign name — editable */}
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={e => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') {
              setDraft(campaignName);
              setEditing(false);
            }
          }}
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#E8E0D5',
            fontSize: 10,
            fontWeight: 500,
            textAlign: 'center',
            width: 120,
            letterSpacing: '0.06em',
            borderBottom: '1px solid rgba(200, 184, 154, 0.35)',
          }}
        />
      ) : (
        <span
          onClick={() => setEditing(true)}
          title="Click to edit campaign name"
          style={{
            fontSize: 10,
            fontWeight: 500,
            color: '#A09080',
            cursor: 'text',
            letterSpacing: '0.06em',
            textAlign: 'center',
            maxWidth: 120,
            padding: '2px 4px',
            borderRadius: 2,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background =
              'rgba(200, 184, 154, 0.08)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
          }}
        >
          {campaignName}
        </span>
      )}
    </div>
  );
};

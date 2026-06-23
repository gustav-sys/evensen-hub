import React, { useState, useRef, useEffect } from 'react';

interface Props {
  brandName: string;
  campaignName: string;
  onBrandNameChange: (name: string) => void;
  onNameChange: (name: string) => void;
}

export const CenterNode: React.FC<Props> = ({
  brandName,
  campaignName,
  onBrandNameChange,
  onNameChange,
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(campaignName);
  const inputRef = useRef<HTMLInputElement>(null);

  const [brandEditing, setBrandEditing] = useState(false);
  const [brandDraft, setBrandDraft] = useState(brandName);
  const brandInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(campaignName);
  }, [campaignName]);

  useEffect(() => {
    setBrandDraft(brandName);
  }, [brandName]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  useEffect(() => {
    if (brandEditing && brandInputRef.current) {
      brandInputRef.current.focus();
      brandInputRef.current.select();
    }
  }, [brandEditing]);

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim() || campaignName;
    setDraft(trimmed);
    onNameChange(trimmed);
  };

  const commitBrand = () => {
    setBrandEditing(false);
    const trimmed = brandDraft.trim() || brandName;
    setBrandDraft(trimmed);
    onBrandNameChange(trimmed);
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
      {/* Brand name — editable */}
      {brandEditing ? (
        <input
          ref={brandInputRef}
          value={brandDraft}
          onChange={e => setBrandDraft(e.target.value)}
          onBlur={commitBrand}
          onKeyDown={e => {
            if (e.key === 'Enter') commitBrand();
            if (e.key === 'Escape') {
              setBrandDraft(brandName);
              setBrandEditing(false);
            }
          }}
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#C8B89A',
            fontSize: 11,
            fontWeight: 600,
            textAlign: 'center',
            width: 130,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            borderBottom: '1px solid rgba(200, 184, 154, 0.35)',
          }}
        />
      ) : (
        <span
          onClick={() => setBrandEditing(true)}
          title="Click to edit brand name"
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.18em',
            color: '#C8B89A',
            textTransform: 'uppercase',
            cursor: 'text',
            textAlign: 'center',
            maxWidth: 130,
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
          {brandName}
        </span>
      )}

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

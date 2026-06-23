import React from 'react';
import type { PresenceUser } from '../hooks/usePresence';

interface Props {
  users: PresenceUser[];
}

const MAX_AVATARS = 5;

// Deterministic HSL color from a name, so each person keeps a stable hue.
function colorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 55%, 45%)`;
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

const AVATAR = 22;

export const PresenceBar: React.FC<Props> = ({ users }) => {
  if (users.length === 0) return null;

  const shown = users.slice(0, MAX_AVATARS);
  const overflow = users.length - shown.length;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {/* Count label */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          fontSize: 11,
          color: '#6E655C',
          letterSpacing: '0.04em',
          whiteSpace: 'nowrap',
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#50A05A',
            flexShrink: 0,
          }}
        />
        {users.length} online
      </div>

      {/* Avatar stack */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {shown.map((u, i) => (
          <div
            key={u.clientId}
            title={u.isSelf ? `${u.name} (you)` : u.name}
            style={{
              width: AVATAR,
              height: AVATAR,
              borderRadius: '50%',
              background: colorForName(u.name),
              color: '#FFFFFF',
              fontSize: 9,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1.5px solid #FFFFFF',
              outline: u.isSelf ? '2px solid #8B6E52' : 'none',
              outlineOffset: u.isSelf ? -1 : 0,
              marginLeft: i === 0 ? 0 : -6,
              boxSizing: 'border-box',
              flexShrink: 0,
              letterSpacing: '0.02em',
              position: 'relative',
              zIndex: shown.length - i,
            }}
          >
            {initialsOf(u.name)}
          </div>
        ))}

        {overflow > 0 && (
          <div
            title={`${overflow} more online`}
            style={{
              width: AVATAR,
              height: AVATAR,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.06)',
              color: '#6E655C',
              fontSize: 9,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1.5px solid #FFFFFF',
              marginLeft: -6,
              boxSizing: 'border-box',
              flexShrink: 0,
              position: 'relative',
              zIndex: 0,
            }}
          >
            +{overflow}
          </div>
        )}
      </div>
    </div>
  );
};

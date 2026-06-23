import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, Plus, X } from 'lucide-react';
import type { Phase } from '../types';

interface Props {
  phases: Phase[];
  currentPhaseId: string;
  onSelectPhase: (phaseId: string) => void;
  panelOpen: boolean;
  onPhaseTitleChange: (phaseId: string, title: string) => void;
  onUpdatePhaseItem: (phaseId: string, index: number, text: string) => void;
  onDeletePhaseItem: (phaseId: string, index: number) => void;
  onAddPhaseItem: (phaseId: string) => void;
}

const stop = (e: React.SyntheticEvent) => e.stopPropagation();

// An editable item row inside the popover: click-to-edit text + delete button.
const PopoverItem: React.FC<{
  text: string;
  onCommit: (value: string) => void;
  onDelete: () => void;
}> = ({ text, onCommit, onDelete }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(text);
  }, [text]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commit = () => {
    setEditing(false);
    onCommit(draft);
  };

  return (
    <li
      onClick={stop}
      onMouseDown={stop}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 7,
        fontSize: 11,
        color: '#6E655C',
        lineHeight: 1.4,
      }}
    >
      <span
        style={{
          width: 4,
          height: 4,
          borderRadius: '50%',
          background: '#8B6E52',
          flexShrink: 0,
          marginTop: 6,
        }}
      />
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onClick={stop}
          onMouseDown={stop}
          onBlur={commit}
          onKeyDown={e => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') {
              setDraft(text);
              setEditing(false);
            }
          }}
          style={{
            flex: 1,
            minWidth: 0,
            background: '#FFFFFF',
            border: '1px solid rgba(0,0,0,0.12)',
            borderRadius: 4,
            outline: 'none',
            color: '#1F1D1A',
            fontSize: 11,
            padding: '2px 5px',
            fontFamily: 'inherit',
            lineHeight: 1.4,
          }}
        />
      ) : (
        <span
          onClick={e => {
            e.stopPropagation();
            setEditing(true);
          }}
          style={{ flex: 1, minWidth: 0, cursor: 'text' }}
        >
          {text}
        </span>
      )}
      {!editing && (
        <button
          onClick={e => {
            e.stopPropagation();
            onDelete();
          }}
          onMouseDown={stop}
          title="Remove item"
          style={{
            flexShrink: 0,
            background: 'none',
            border: 'none',
            color: '#9A9087',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            marginTop: 1,
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#B4463C')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#9A9087')}
        >
          <X size={11} />
        </button>
      )}
    </li>
  );
};

// The phase chip title — single click selects the phase (handled by the parent
// button), double-click switches to an inline editor.
const PhaseTitle: React.FC<{
  phaseId: string;
  title: string;
  isCurrent: boolean;
  onCommit: (value: string) => void;
}> = ({ phaseId, title, isCurrent, onCommit }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(title);
  }, [title]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commit = () => {
    setEditing(false);
    onCommit(draft);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onClick={stop}
        onMouseDown={stop}
        onDoubleClick={stop}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') {
            setDraft(title);
            setEditing(false);
          }
        }}
        style={{
          background: '#FFFFFF',
          border: '1px solid rgba(0,0,0,0.18)',
          borderRadius: 4,
          outline: 'none',
          color: '#1F1D1A',
          fontSize: 11,
          letterSpacing: '0.01em',
          padding: '1px 5px',
          fontFamily: 'inherit',
          width: Math.max(70, draft.length * 7),
          maxWidth: 180,
        }}
      />
    );
  }

  return (
    <span
      onDoubleClick={e => {
        e.stopPropagation();
        setDraft(title);
        setEditing(true);
      }}
      title="Double-click to rename"
      data-phase-title={phaseId}
      style={{
        fontSize: 11,
        color: isCurrent ? '#1F1D1A' : '#9A9087',
        letterSpacing: '0.01em',
      }}
    >
      {title}
    </span>
  );
};

export const Timeline: React.FC<Props> = ({
  phases,
  currentPhaseId,
  onSelectPhase,
  onPhaseTitleChange,
  onUpdatePhaseItem,
  onDeletePhaseItem,
  onAddPhaseItem,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleClick = (phaseId: string) => {
    onSelectPhase(phaseId);
    setExpandedId(prev => (prev === phaseId ? null : phaseId));
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 64,
        background: 'rgba(0,0,0,0.025)',
        borderTop: '1px solid rgba(0,0,0,0.08)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 20px',
        zIndex: 20,
      }}
    >
      {/* Section label */}
      <span
        style={{
          position: 'absolute',
          left: 20,
          top: 9,
          fontSize: 9,
          fontWeight: 600,
          letterSpacing: '0.16em',
          color: '#9A9087',
          textTransform: 'uppercase',
        }}
      >
        Tidslinje (Overordnet)
      </span>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          flexWrap: 'nowrap',
          maxWidth: '100%',
          overflow: 'visible',
        }}
      >
        {phases.map((phase, i) => {
          const isCurrent = phase.id === currentPhaseId;
          const isExpanded = phase.id === expandedId;

          return (
            <React.Fragment key={phase.id}>
              <div style={{ position: 'relative' }}>
                {/* Popover above */}
                {isExpanded && (
                  <div
                    onClick={stop}
                    onMouseDown={stop}
                    style={{
                      position: 'absolute',
                      bottom: 'calc(100% + 12px)',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      minWidth: 200,
                      maxWidth: 260,
                      background: '#FFFFFF',
                      border: '1px solid rgba(0,0,0,0.1)',
                      borderRadius: 8,
                      padding: '12px 14px',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                      zIndex: 60,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: '0.14em',
                        color: '#1F1D1A',
                        textTransform: 'uppercase',
                        marginBottom: 8,
                      }}
                    >
                      Fase {phase.number} — {phase.title}
                    </div>
                    <ul
                      style={{
                        margin: 0,
                        padding: 0,
                        listStyle: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                      }}
                    >
                      {phase.items.map((item, idx) => (
                        <PopoverItem
                          key={idx}
                          text={item}
                          onCommit={value => onUpdatePhaseItem(phase.id, idx, value)}
                          onDelete={() => onDeletePhaseItem(phase.id, idx)}
                        />
                      ))}
                    </ul>

                    {/* Add item */}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onAddPhaseItem(phase.id);
                      }}
                      onMouseDown={stop}
                      style={{
                        marginTop: phase.items.length ? 10 : 2,
                        background: 'none',
                        border: 'none',
                        color: '#9A9087',
                        fontSize: 11,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: 0,
                        fontFamily: 'inherit',
                        transition: 'color 0.15s',
                      }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#8B6E52')}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#9A9087')}
                    >
                      <Plus size={12} />
                      Add item
                    </button>

                    {/* Pointer */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%) rotate(45deg)',
                        width: 8,
                        height: 8,
                        background: '#FFFFFF',
                        borderRight: '1px solid rgba(0,0,0,0.1)',
                        borderBottom: '1px solid rgba(0,0,0,0.1)',
                        marginTop: -4,
                      }}
                    />
                  </div>
                )}

                {/* Phase chip */}
                <button
                  onClick={() => handleClick(phase.id)}
                  title={`Fase ${phase.number} — ${phase.title}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    padding: '7px 11px',
                    borderRadius: 7,
                    background: isCurrent ? 'rgba(139,110,82,0.08)' : 'transparent',
                    border: `1px solid ${isCurrent ? '#8B6E52' : 'rgba(0,0,0,0.12)'}`,
                    boxShadow: isCurrent ? '0 2px 10px rgba(139,110,82,0.12)' : 'none',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    whiteSpace: 'nowrap',
                    transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
                    opacity: isCurrent ? 1 : 0.55,
                  }}
                  onMouseEnter={e => {
                    if (!isCurrent) (e.currentTarget as HTMLElement).style.opacity = '0.85';
                  }}
                  onMouseLeave={e => {
                    if (!isCurrent) (e.currentTarget as HTMLElement).style.opacity = '0.55';
                  }}
                >
                  {/* Dot */}
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: isCurrent ? '#8B6E52' : 'transparent',
                      border: `1px solid ${isCurrent ? '#8B6E52' : 'rgba(0,0,0,0.25)'}`,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: '0.1em',
                      color: isCurrent ? '#1F1D1A' : '#9A9087',
                      textTransform: 'uppercase',
                    }}
                  >
                    Fase {phase.number}
                  </span>
                  <PhaseTitle
                    phaseId={phase.id}
                    title={phase.title}
                    isCurrent={isCurrent}
                    onCommit={value => onPhaseTitleChange(phase.id, value)}
                  />
                </button>
              </div>

              {/* Connector arrow */}
              {i < phases.length - 1 && (
                <ChevronRight
                  size={14}
                  strokeWidth={1.5}
                  style={{ color: 'rgba(31,29,26,0.25)', flexShrink: 0 }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

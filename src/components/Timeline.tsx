import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import type { Phase } from '../types';

interface Props {
  phases: Phase[];
  currentPhaseId: string;
  onSelectPhase: (phaseId: string) => void;
  panelOpen: boolean;
}

export const Timeline: React.FC<Props> = ({ phases, currentPhaseId, onSelectPhase }) => {
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
                    style={{
                      position: 'absolute',
                      bottom: 'calc(100% + 12px)',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      minWidth: 180,
                      maxWidth: 240,
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
                      {phase.items.map(item => (
                        <li
                          key={item}
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
                              marginTop: 5,
                            }}
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
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
                  <span
                    style={{
                      fontSize: 11,
                      color: isCurrent ? '#1F1D1A' : '#9A9087',
                      letterSpacing: '0.01em',
                    }}
                  >
                    {phase.title}
                  </span>
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

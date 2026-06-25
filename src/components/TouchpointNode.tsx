import React, { useState, useRef, useEffect } from 'react';
import {
  BookOpen, Package, Box, Store, Monitor, Share2, Mail, Newspaper, Star,
} from 'lucide-react';
import type { NodeData } from '../types';
import { ShoeIcon } from './ShoeIcon';
import { nodeUrgency, URGENCY_COLORS } from '../utils/dueDate';

const iconMap: Record<string, React.FC<{ size?: number; strokeWidth?: number }>> = {
  BookOpen,
  Package,
  Box,
  Store,
  Monitor,
  Share2,
  Mail,
  Newspaper,
  Star,
  Shoe: ShoeIcon,
};

interface Props {
  node: NodeData;
  x: number;
  y: number;
  isActive: boolean;
  onClick: () => void;
  onLabelChange: (label: string) => void;
  onEditStart: () => void;
}

export const TouchpointNode: React.FC<Props> = ({
  node,
  x,
  y,
  isActive,
  onClick,
  onLabelChange,
  onEditStart,
}) => {
  const Icon = iconMap[node.icon] || Star;
  const doneCount = node.deliverables.filter(d => d.status === 'done').length;
  const total = node.deliverables.length;
  const urgency = nodeUrgency(node.deliverables);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(node.shortLabel);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(node.shortLabel);
  }, [node.shortLabel]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (!trimmed) {
      setDraft(node.shortLabel); // empty/whitespace cancels — keep previous
      return;
    }
    setDraft(trimmed);
    onLabelChange(trimmed);
  };

  const startEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditStart(); // close any open panel from the preceding single click
    setDraft(node.shortLabel);
    setEditing(true);
  };

  return (
    <div
      className="node-circle"
      onClick={editing ? undefined : onClick}
      onDoubleClick={startEditing}
      style={{
        position: 'absolute',
        left: x - 45,
        top: y - 45,
        width: 90,
        height: 90,
        borderRadius: '50%',
        background: node.color,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        cursor: 'pointer',
        boxShadow: isActive
          ? `0 0 0 2px ${node.color}, 0 0 24px ${node.color}55`
          : `0 6px 20px rgba(0,0,0,0.10)`,
        zIndex: 5,
        userSelect: 'none',
      }}
    >
      {/* Deadline urgency dot — bottom-center edge of the circle */}
      {urgency && (
        <span
          title={urgency === 'overdue' ? 'Has overdue deliverables' : 'Has deliverables due soon'}
          style={{
            position: 'absolute',
            bottom: -3,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: URGENCY_COLORS[urgency],
            border: '1.5px solid #FFFFFF',
            boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
            zIndex: 6,
          }}
        />
      )}

      {/* White icon outline — lucide icons + the shoe both use currentColor */}
      <span style={{ color: '#FFFFFF', display: 'flex' }}>
        <Icon size={node.icon === 'Shoe' ? 30 : 18} strokeWidth={1.5} />
      </span>
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onClick={e => e.stopPropagation()}
          onMouseDown={e => e.stopPropagation()}
          onDoubleClick={e => e.stopPropagation()}
          onKeyDown={e => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') {
              setDraft(node.shortLabel);
              setEditing(false);
            }
          }}
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            borderBottom: '1px solid rgba(255,255,255,0.5)',
            color: 'rgba(255,255,255,0.95)',
            fontSize: 10,
            fontWeight: 600,
            textAlign: 'center',
            letterSpacing: '0.04em',
            lineHeight: 1.1,
            padding: '0 4px',
            maxWidth: 76,
            width: 76,
            textShadow: '0 1px 2px rgba(0,0,0,0.28)',
          }}
        />
      ) : (
        <span
          title="Double-click to rename"
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.95)',
            textAlign: 'center',
            letterSpacing: '0.04em',
            lineHeight: 1.1,
            padding: '0 4px',
            maxWidth: 76,
            whiteSpace: 'normal',
            wordBreak: 'normal',
            overflowWrap: 'normal',
            textShadow: '0 1px 2px rgba(0,0,0,0.28)',
          }}
        >
          {node.shortLabel}
        </span>
      )}
      {doneCount > 0 && (
        <span
          style={{
            fontSize: 8,
            color: 'rgba(255,255,255,0.6)',
            fontWeight: 500,
          }}
        >
          {doneCount}/{total}
        </span>
      )}
    </div>
  );
};

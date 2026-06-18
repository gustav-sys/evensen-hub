import React from 'react';
import {
  BookOpen, Package, Box, Store, Monitor, Share2, Mail, Newspaper, Star,
} from 'lucide-react';
import type { NodeData } from '../types';
import { PRIORITY_CONFIG } from '../data/priorities';
import { ShoeIcon } from './ShoeIcon';

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
}

export const TouchpointNode: React.FC<Props> = ({ node, x, y, isActive, onClick }) => {
  const Icon = iconMap[node.icon] || Star;
  const doneCount = node.deliverables.filter(d => d.status === 'done').length;
  const total = node.deliverables.length;
  const priority = PRIORITY_CONFIG[node.priority];

  return (
    <div
      className="node-circle"
      onClick={onClick}
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
      {/* Priority badge — top-right edge of the circle */}
      {priority && (
        <span
          style={{
            position: 'absolute',
            top: -2,
            right: -2,
            minWidth: 18,
            height: 18,
            padding: '0 5px',
            borderRadius: 9,
            background: priority.bg,
            color: 'rgba(255,255,255,0.96)',
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.02em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1.5px solid #FFFFFF',
            boxShadow: '0 1px 4px rgba(0,0,0,0.20)',
            zIndex: 6,
          }}
        >
          {node.priority}
        </span>
      )}

      <Icon size={node.icon === 'Shoe' ? 30 : 18} strokeWidth={1.5} />
      <span
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

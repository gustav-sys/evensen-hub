import React from 'react';
import { X, Plus } from 'lucide-react';
import {
  BookOpen, Package, Box, Store, Monitor, Share2, Mail, Newspaper, Star,
} from 'lucide-react';
import type { NodeData } from '../types';
import { DeliverableItem } from './DeliverableItem';
import { PRIORITY_CONFIG } from '../data/priorities';
import { ShoeIcon } from './ShoeIcon';

const iconMap: Record<string, React.FC<{ size?: number; strokeWidth?: number }>> = {
  BookOpen, Package, Box, Store, Monitor, Share2, Mail, Newspaper, Star, Shoe: ShoeIcon,
};

interface Props {
  node: NodeData | undefined;
  onClose: () => void;
  onCycleStatus: (nodeId: string, deliverableId: string) => void;
  onUpdateTitle: (nodeId: string, deliverableId: string, title: string) => void;
  onUpdateAssignee: (nodeId: string, deliverableId: string, assignee: string) => void;
  onAddDeliverable: (nodeId: string) => void;
  onDeleteDeliverable: (nodeId: string, deliverableId: string) => void;
  onAddComment: (nodeId: string, deliverableId: string, text: string) => void;
}

export const DetailPanel: React.FC<Props> = ({
  node,
  onClose,
  onCycleStatus,
  onUpdateTitle,
  onUpdateAssignee,
  onAddDeliverable,
  onDeleteDeliverable,
  onAddComment,
}) => {
  if (!node) return null;

  const Icon = iconMap[node.icon] || Star;
  const doneCount = node.deliverables.filter(d => d.status === 'done').length;
  const total = node.deliverables.length;
  const progress = total > 0 ? (doneCount / total) * 100 : 0;
  const priority = PRIORITY_CONFIG[node.priority];

  return (
    <div
      className="panel-enter"
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: 420,
        height: '100%',
        background: '#FFFFFF',
        borderLeft: '1px solid rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        boxShadow: '-12px 0 40px rgba(0,0,0,0.10)',
      }}
    >
      {/* Panel header */}
      <div
        style={{
          padding: '24px 24px 20px',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: node.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon size={18} strokeWidth={1.5} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#1F1D1A',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {node.title}
                </h2>
                {priority && (
                  <span
                    title={`${node.priority} — ${priority.label}`}
                    style={{
                      minWidth: 18,
                      height: 18,
                      padding: '0 6px',
                      borderRadius: 9,
                      background: priority.bg,
                      color: 'rgba(255,255,255,0.96)',
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: '0.02em',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {node.priority}
                  </span>
                )}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: '#9A9087',
                  marginTop: 2,
                }}
              >
                {doneCount} of {total} completed
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#9A9087',
              cursor: 'pointer',
              padding: 4,
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#1F1D1A')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#9A9087')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress bar */}
        <div
          style={{
            height: 3,
            background: 'rgba(0,0,0,0.08)',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: node.color,
              borderRadius: 2,
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      </div>

      {/* Deliverables list */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 24px',
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.1em',
            color: '#9A9087',
            textTransform: 'uppercase',
            marginBottom: 12,
          }}
        >
          Deliverables
        </div>

        {node.deliverables.map(d => (
          <DeliverableItem
            key={d.id}
            deliverable={d}
            nodeColor={node.color}
            onCycleStatus={() => onCycleStatus(node.id, d.id)}
            onUpdateTitle={title => onUpdateTitle(node.id, d.id, title)}
            onUpdateAssignee={assignee => onUpdateAssignee(node.id, d.id, assignee)}
            onDelete={() => onDeleteDeliverable(node.id, d.id)}
            onAddComment={text => onAddComment(node.id, d.id, text)}
          />
        ))}

        {/* Add deliverable */}
        <button
          onClick={() => onAddDeliverable(node.id)}
          style={{
            width: '100%',
            marginTop: 4,
            background: 'none',
            border: '1px dashed rgba(0,0,0,0.18)',
            borderRadius: 8,
            color: '#9A9087',
            fontSize: 12,
            cursor: 'pointer',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: 'inherit',
            transition: 'border-color 0.15s, color 0.15s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(139,110,82,0.5)';
            (e.currentTarget as HTMLElement).style.color = '#8B6E52';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,0,0,0.18)';
            (e.currentTarget as HTMLElement).style.color = '#9A9087';
          }}
        >
          <Plus size={14} />
          Add deliverable
        </button>
      </div>

      {/* Footer accent line */}
      <div
        style={{
          height: 2,
          background: `linear-gradient(90deg, ${node.color}44, transparent)`,
          flexShrink: 0,
        }}
      />
    </div>
  );
};

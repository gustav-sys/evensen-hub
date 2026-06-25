import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, ChevronDown, ChevronUp, Send, Trash2, Calendar, X, Check } from 'lucide-react';
import type { Deliverable, Status } from '../types';
import type { Profile } from '../hooks/useProfiles';
import { initialsFor, colorFor } from '../utils/avatar';
import { assigneesOf, nameKey } from '../utils/assignees';
import { urgencyFor, dueLabel, URGENCY_COLORS } from '../utils/dueDate';

const STATUS_CONFIG: Record<Status, { label: string; bg: string; color: string }> = {
  'not-started': { label: 'Not Started', bg: 'rgba(140,130,121,0.18)', color: '#8C8279' },
  'in-progress': { label: 'In Progress', bg: 'rgba(200,150,60,0.18)', color: '#C8963C' },
  done: { label: 'Done', bg: 'rgba(80,160,90,0.18)', color: '#50A05A' },
  blocked: { label: 'Blocked', bg: 'rgba(180,70,60,0.18)', color: '#B4463C' },
};

interface Props {
  deliverable: Deliverable;
  profiles: Profile[];
  nodeColor: string;
  onCycleStatus: () => void;
  onUpdateTitle: (title: string) => void;
  onUpdateAssignees: (assignees: string[]) => void;
  onUpdateDueDate: (dueDate: string) => void;
  onDelete: () => void;
  onAddComment: (text: string) => void;
  onDeleteComment: (commentId: string) => void;
}

export const DeliverableItem: React.FC<Props> = ({
  deliverable,
  profiles,
  nodeColor,
  onCycleStatus,
  onUpdateTitle,
  onUpdateAssignees,
  onUpdateDueDate,
  onDelete,
  onAddComment,
  onDeleteComment,
}) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(deliverable.title);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const assigneeRef = useRef<HTMLDivElement>(null);
  const dueDateRef = useRef<HTMLInputElement>(null);

  const status = STATUS_CONFIG[deliverable.status];

  // The current set of assignee profile names (resolves legacy single-assignee
  // data via assigneesOf). Names are rendered even when no longer in the
  // profiles list (a stale assignment), so they still display gracefully.
  const assigneeNames = assigneesOf(deliverable);

  // Toggle a profile in/out of the assignee list, comparing by normalized
  // identity (so a legacy "sofia" and a roster "Sofia" are the same person).
  // Preserves existing order and appends newly-added names at the end.
  const toggleAssignee = (name: string) => {
    const exists = assigneeNames.some(n => nameKey(n) === nameKey(name));
    const next = exists
      ? assigneeNames.filter(n => nameKey(n) !== nameKey(name))
      : [...assigneeNames, name];
    onUpdateAssignees(next);
  };

  const urgency = urgencyFor(deliverable.dueDate, deliverable.status);
  const dueColor = URGENCY_COLORS[urgency];

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showAssigneeDropdown) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (assigneeRef.current && !assigneeRef.current.contains(e.target as Node)) {
        setShowAssigneeDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAssigneeDropdown]);

  const submitComment = () => {
    const text = newComment.trim();
    if (!text) return;
    onAddComment(text);
    setNewComment('');
  };

  return (
    <div
      style={{
        background: '#FAF8F4',
        borderRadius: 8,
        padding: '12px 14px',
        border: '1px solid rgba(0,0,0,0.06)',
        marginBottom: 8,
      }}
    >
      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        {/* Color accent dot */}
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: nodeColor,
            flexShrink: 0,
            marginTop: 5,
          }}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          {editingTitle ? (
            <input
              autoFocus
              value={titleDraft}
              onChange={e => setTitleDraft(e.target.value)}
              onBlur={() => {
                setEditingTitle(false);
                onUpdateTitle(titleDraft.trim() || deliverable.title);
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  setEditingTitle(false);
                  onUpdateTitle(titleDraft.trim() || deliverable.title);
                }
                if (e.key === 'Escape') {
                  setEditingTitle(false);
                  setTitleDraft(deliverable.title);
                }
              }}
              style={{
                background: '#FFFFFF',
                border: '1px solid rgba(0,0,0,0.12)',
                borderRadius: 4,
                outline: 'none',
                color: '#1F1D1A',
                fontSize: 13,
                fontWeight: 500,
                width: '100%',
                padding: '3px 6px',
                fontFamily: 'inherit',
              }}
            />
          ) : (
            <div
              onClick={() => setEditingTitle(true)}
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: '#1F1D1A',
                cursor: 'text',
                lineHeight: 1.4,
              }}
            >
              {deliverable.title}
            </div>
          )}

          {/* Assignee selector (multi-select) */}
          <div ref={assigneeRef} style={{ position: 'relative', marginTop: 5 }}>
            <button
              onClick={() => setShowAssigneeDropdown(v => !v)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontFamily: 'inherit',
              }}
            >
              {assigneeNames.length > 0 ? (
                <>
                  {/* Overlapping initials circles for every current assignee */}
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {assigneeNames.map((name, i) => (
                      <div
                        key={name}
                        title={name}
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          background: colorFor(name),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 8,
                          fontWeight: 700,
                          color: '#FFFFFF',
                          flexShrink: 0,
                          letterSpacing: '0.02em',
                          border: '1.5px solid #FAF8F4',
                          marginLeft: i === 0 ? 0 : -7,
                          zIndex: assigneeNames.length - i,
                        }}
                      >
                        {initialsFor(name)}
                      </div>
                    ))}
                  </div>
                  <span style={{ fontSize: 11, color: '#9A9087' }}>
                    {assigneeNames.length === 1
                      ? assigneeNames[0]
                      : `${assigneeNames.length} assignees`}
                  </span>
                </>
              ) : (
                <>
                  {/* Dashed unassigned circle */}
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      border: '1.5px dashed rgba(154,144,135,0.6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      color: '#9A9087',
                      flexShrink: 0,
                    }}
                  >
                    +
                  </div>
                  <span style={{ fontSize: 11, color: '#9A9087' }}>Assign</span>
                </>
              )}
            </button>

            {/* Dropdown — clicking a profile toggles it and keeps the menu open */}
            {showAssigneeDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: 4,
                  background: '#FFFFFF',
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: 6,
                  padding: '4px 0',
                  zIndex: 100,
                  minWidth: 180,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                }}
              >
                {profiles.length === 0 && (
                  <div
                    style={{
                      padding: '6px 12px',
                      fontSize: 11,
                      color: '#9A9087',
                      lineHeight: 1.4,
                    }}
                  >
                    No teammates yet.
                  </div>
                )}
                {profiles.map(profile => {
                  const selected = assigneeNames.some(
                    n => nameKey(n) === nameKey(profile.name)
                  );
                  return (
                    <button
                      key={profile.name}
                      onClick={() => toggleAssignee(profile.name)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        width: '100%',
                        background: selected ? 'rgba(139,110,82,0.08)' : 'none',
                        border: 'none',
                        padding: '6px 12px',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        textAlign: 'left',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.04)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = selected
                          ? 'rgba(139,110,82,0.08)'
                          : 'none';
                      }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          background: colorFor(profile.name),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 8,
                          fontWeight: 700,
                          color: '#FFFFFF',
                          flexShrink: 0,
                          letterSpacing: '0.02em',
                        }}
                      >
                        {initialsFor(profile.name)}
                      </div>
                      <span style={{ fontSize: 12, color: '#1F1D1A', flex: 1 }}>
                        {profile.name}
                      </span>
                      {selected && <Check size={13} color="#8B6E52" strokeWidth={2.5} />}
                    </button>
                  );
                })}

                {/* Assigned names no longer in the profiles roster — still toggleable */}
                {assigneeNames
                  .filter(name => !profiles.some(p => nameKey(p.name) === nameKey(name)))
                  .map(name => (
                    <button
                      key={`stale-${name}`}
                      onClick={() => toggleAssignee(name)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        width: '100%',
                        background: 'rgba(139,110,82,0.08)',
                        border: 'none',
                        padding: '6px 12px',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        textAlign: 'left',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.04)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(139,110,82,0.08)';
                      }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          background: colorFor(name),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 8,
                          fontWeight: 700,
                          color: '#FFFFFF',
                          flexShrink: 0,
                          letterSpacing: '0.02em',
                        }}
                      >
                        {initialsFor(name)}
                      </div>
                      <span style={{ fontSize: 12, color: '#1F1D1A', flex: 1 }}>
                        {name}
                        <span style={{ color: '#9A9087', marginLeft: 4 }}>(not in team)</span>
                      </span>
                      <Check size={13} color="#8B6E52" strokeWidth={2.5} />
                    </button>
                  ))}

                {/* Clear all */}
                {assigneeNames.length > 0 && (
                  <button
                    onClick={() => onUpdateAssignees([])}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      borderTop: '1px solid rgba(0,0,0,0.08)',
                      padding: '6px 12px',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      marginTop: 2,
                      paddingTop: 8,
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.04)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = 'none';
                    }}
                  >
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        border: '1.5px dashed rgba(154,144,135,0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        color: '#9A9087',
                        flexShrink: 0,
                      }}
                    >
                      ×
                    </div>
                    <span style={{ fontSize: 12, color: '#9A9087' }}>Clear all</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Due date: a visible colored label opens the native picker (via showPicker);
              the actual date input is hidden but holds the value. Explicit × clears it. */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 5,
              position: 'relative',
            }}
          >
            <input
              ref={dueDateRef}
              type="date"
              value={deliverable.dueDate ?? ''}
              onChange={e => onUpdateDueDate(e.target.value)}
              tabIndex={-1}
              aria-hidden
              style={{
                position: 'absolute',
                left: 0,
                bottom: 0,
                width: 1,
                height: 1,
                opacity: 0,
                padding: 0,
                border: 'none',
                pointerEvents: 'none',
                colorScheme: 'light',
              }}
            />
            <button
              onClick={() => {
                const el = dueDateRef.current;
                if (el && typeof el.showPicker === 'function') el.showPicker();
                else el?.focus();
              }}
              title={deliverable.dueDate ? 'Change due date' : 'Set due date'}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontFamily: 'inherit',
                fontSize: 11,
                fontWeight: deliverable.dueDate && urgency !== 'normal' ? 600 : 400,
                color: deliverable.dueDate ? dueColor : '#9A9087',
              }}
            >
              <Calendar size={12} />
              {deliverable.dueDate
                ? dueLabel(deliverable.dueDate, deliverable.status)
                : 'Set due date'}
            </button>
            {deliverable.dueDate && (
              <button
                onClick={() => onUpdateDueDate('')}
                title="Clear due date"
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  color: '#9A9087',
                  display: 'flex',
                  alignItems: 'center',
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#B4463C')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#9A9087')}
              >
                <X size={11} />
              </button>
            )}
          </div>
        </div>

        {/* Right-side controls: status badge + delete, or inline delete confirm */}
        {confirmingDelete ? (
          <div
            style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: '#6E655C',
                whiteSpace: 'nowrap',
              }}
            >
              Delete?
            </span>
            <button
              onClick={() => {
                onDelete();
                setConfirmingDelete(false);
              }}
              style={{
                background: '#B4463C',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 4,
                padding: '3px 8px',
                fontSize: 10,
                fontWeight: 600,
                cursor: 'pointer',
                letterSpacing: '0.04em',
                whiteSpace: 'nowrap',
                fontFamily: 'inherit',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '0.85')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}
            >
              Delete
            </button>
            <button
              onClick={() => setConfirmingDelete(false)}
              style={{
                background: 'transparent',
                color: '#9A9087',
                border: '1px solid rgba(0,0,0,0.12)',
                borderRadius: 4,
                padding: '3px 8px',
                fontSize: 10,
                fontWeight: 600,
                cursor: 'pointer',
                letterSpacing: '0.04em',
                whiteSpace: 'nowrap',
                fontFamily: 'inherit',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#1F1D1A')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#9A9087')}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div
            style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {/* Status badge */}
            <button
              onClick={onCycleStatus}
              title="Click to cycle status"
              style={{
                background: status.bg,
                color: status.color,
                border: 'none',
                borderRadius: 4,
                padding: '3px 8px',
                fontSize: 10,
                fontWeight: 600,
                cursor: 'pointer',
                letterSpacing: '0.04em',
                whiteSpace: 'nowrap',
                fontFamily: 'inherit',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '0.75')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}
            >
              {status.label}
            </button>

            {/* Delete (trash) — two-step confirm */}
            <button
              onClick={() => setConfirmingDelete(true)}
              title="Delete deliverable"
              style={{
                background: 'none',
                border: 'none',
                color: '#9A9087',
                cursor: 'pointer',
                padding: 2,
                display: 'flex',
                alignItems: 'center',
                borderRadius: 4,
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#B4463C')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#9A9087')}
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}
      </div>

      {/* Comment toggle */}
      <div style={{ marginTop: 8, paddingLeft: 15 }}>
        <button
          onClick={() => setShowComments(v => !v)}
          style={{
            background: 'none',
            border: 'none',
            color: '#9A9087',
            fontSize: 11,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: 0,
            fontFamily: 'inherit',
          }}
        >
          <MessageCircle size={11} />
          {deliverable.comments.length > 0
            ? `${deliverable.comments.length} comment${deliverable.comments.length !== 1 ? 's' : ''}`
            : 'Add comment'}
          {deliverable.comments.length > 0 &&
            (showComments ? <ChevronUp size={11} /> : <ChevronDown size={11} />)}
        </button>

        {showComments && (
          <div style={{ marginTop: 8 }}>
            {deliverable.comments.map(c => (
              <div
                key={c.id}
                className="comment-row"
                style={{
                  marginBottom: 8,
                  fontSize: 11,
                  color: '#6E655C',
                  lineHeight: 1.5,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#1F1D1A', fontWeight: 600 }}>{c.author}</span>
                  <span style={{ color: '#9A9087' }}>·</span>
                  <span style={{ flex: 1 }}>{c.timestamp}</span>
                  <button
                    onClick={() => onDeleteComment(c.id)}
                    title="Delete comment"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#9A9087',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      flexShrink: 0,
                    }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#B4463C')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#9A9087')}
                  >
                    <X size={11} />
                  </button>
                </div>
                <div style={{ color: '#6E655C', marginTop: 2 }}>{c.text}</div>
              </div>
            ))}

            {/* New comment input */}
            <div
              style={{
                display: 'flex',
                gap: 6,
                alignItems: 'center',
                marginTop: 6,
              }}
            >
              <input
                placeholder="Write a comment…"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submitComment()}
                style={{
                  flex: 1,
                  background: '#FFFFFF',
                  border: '1px solid rgba(0,0,0,0.12)',
                  borderRadius: 4,
                  outline: 'none',
                  color: '#1F1D1A',
                  fontSize: 11,
                  padding: '5px 8px',
                  fontFamily: 'inherit',
                }}
              />
              <button
                onClick={submitComment}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#8B6E52',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Send size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

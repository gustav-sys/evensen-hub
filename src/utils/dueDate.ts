import type { Deliverable } from '../types';

export type Urgency = 'overdue' | 'soon' | 'normal';

export const URGENCY_COLORS: Record<Urgency, string> = {
  overdue: '#B4463C', // red
  soon: '#C8963C', // amber
  normal: '#9A9087', // muted
};

const SOON_DAYS = 7;

// Local-midnight timestamp for a 'YYYY-MM-DD' string (no timezone shift).
function startOfDayFromISO(iso: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).getTime();
}

function todayStart(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

// Whole-day difference (dueDate - today). Negative = past, 0 = today.
export function daysUntil(dueDate: string): number | null {
  const due = startOfDayFromISO(dueDate);
  if (due === null) return null;
  const diffMs = due - todayStart();
  return Math.round(diffMs / 86400000);
}

// Urgency for a deliverable. 'done' work is never urgent (always 'normal').
export function urgencyFor(dueDate: string | undefined, status: string): Urgency {
  if (!dueDate) return 'normal';
  const diff = daysUntil(dueDate);
  if (diff === null || status === 'done') return 'normal';
  if (diff < 0) return 'overdue';
  if (diff <= SOON_DAYS) return 'soon';
  return 'normal';
}

// Human label for a deliverable's due date.
export function dueLabel(dueDate: string, status: string): string {
  const diff = daysUntil(dueDate);
  const monthDay = (() => {
    const ts = startOfDayFromISO(dueDate);
    if (ts === null) return dueDate;
    return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  })();

  if (diff === null || status === 'done') return `Due ${monthDay}`;
  if (diff < 0) {
    const n = Math.abs(diff);
    return n === 1 ? 'Overdue by 1 day' : `Overdue by ${n} days`;
  }
  if (diff === 0) return 'Due today';
  if (diff === 1) return 'Due tomorrow';
  if (diff <= SOON_DAYS) return `Due in ${diff} days`;
  return `Due ${monthDay}`;
}

// Node-level indicator: 'overdue' if any non-done deliverable is overdue,
// else 'soon' if any is due within the soon window, else null.
export function nodeUrgency(deliverables: Deliverable[]): 'overdue' | 'soon' | null {
  let soon = false;
  for (const d of deliverables) {
    const u = urgencyFor(d.dueDate, d.status);
    if (u === 'overdue') return 'overdue';
    if (u === 'soon') soon = true;
  }
  return soon ? 'soon' : null;
}

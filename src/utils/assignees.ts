import type { Deliverable } from '../types';

/**
 * Normalized identity key for an assignee / profile name (trim + lowercase).
 * Use this whenever comparing two names for "same person", so a legacy
 * lowercased "sofia" and a roster-cased "Sofia" are treated as one.
 * Mirrors nameKeyFor in useProfiles.ts.
 */
export function nameKey(name: string): string {
  return name.trim().toLowerCase();
}

// Single source of truth for reading a deliverable's assignees.
//
// Going forward assignees are stored in the `assignees` array. Older saved data
// (and older single-assignee clients) only have the legacy `assignee` string,
// so resolve that into a one-element list. Blank/whitespace entries are dropped
// and the rest trimmed; if that leaves nothing, fall back to the legacy field.
export function assigneesOf(
  deliverable: Pick<Deliverable, 'assignees' | 'assignee'>
): string[] {
  const cleaned = Array.isArray(deliverable.assignees)
    ? deliverable.assignees
        .filter(name => typeof name === 'string' && name.trim() !== '')
        .map(name => name.trim())
    : [];
  if (cleaned.length > 0) return cleaned;

  const legacy =
    typeof deliverable.assignee === 'string' ? deliverable.assignee.trim() : '';
  return legacy ? [legacy] : [];
}

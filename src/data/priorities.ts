import type { Priority } from '../types';

export const PRIORITY_CONFIG: Record<Priority, { bg: string; label: string }> = {
  P1: { bg: '#B5714A', label: 'Critical' },
  P2: { bg: '#C8963C', label: 'Important' },
  P3: { bg: '#7A7268', label: 'Ongoing' },
};

export const PRIORITY_ORDER: Priority[] = ['P1', 'P2', 'P3'];

import type { Phase } from './data/phases';

export type { Phase };

export type Status = 'not-started' | 'in-progress' | 'done' | 'blocked';

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface Deliverable {
  id: string;
  title: string;
  status: Status;
  assignee: string;
  comments: Comment[];
}

export type Priority = 'P1' | 'P2' | 'P3';

export interface NodeData {
  id: string;
  title: string;
  shortLabel: string;
  priority: Priority;
  color: string;
  icon: string;
  deliverables: Deliverable[];
}

export interface AppState {
  campaignName: string;
  nodes: NodeData[];
  phases: Phase[];
  currentPhaseId: string;
}

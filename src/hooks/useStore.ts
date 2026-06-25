import { useState, useEffect, useCallback, useRef } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { AppState, NodeData, Deliverable, Status, Comment } from '../types';
import { initialNodes } from '../data/nodes';
import { initialPhases } from '../data/phases';

const STORAGE_KEY = 'evensen-hub-v1';
const FIRESTORE_DEBOUNCE_MS = 500;
const FIRESTORE_FALLBACK_MS = 1500;

function defaultState(): AppState {
  return {
    appTitle: 'Evensen Hub',
    brandName: 'EVENSEN 1916',
    campaignName: 'Campaign SS27',
    nodes: initialNodes,
    phases: initialPhases,
    currentPhaseId: 'fase-1',
  };
}

// Merge persisted state onto the code-defined structure. Node identity and
// presentation (which nodes exist, their color/icon) come from the
// seed in code, so edits to them take effect for everyone. Genuine user data —
// the brand name, campaign name, the user-editable node title/shortLabel,
// per-node deliverables, and the ENTIRE phases list (added/removed/renamed
// phases + their items) plus the currently-selected phase — is carried over
// from localStorage / Firestore.
function migrateState(partial: Partial<AppState> | null | undefined): AppState {
  const base = defaultState();
  if (!partial) return base;

  const persistedNodes = Array.isArray(partial.nodes) ? partial.nodes : [];

  const nodes: NodeData[] = initialNodes.map(seed => {
    const saved = persistedNodes.find(n => n.id === seed.id);
    return {
      ...seed, // color, icon always from code
      // user-editable: node label (title + shortLabel) persists across reloads
      title: saved?.title ?? seed.title,
      shortLabel: saved?.shortLabel ?? seed.shortLabel,
      deliverables:
        saved && Array.isArray(saved.deliverables)
          ? saved.deliverables // user-owned: statuses, assignees, comments, added items
          : seed.deliverables,
    };
  });

  // user-editable: the whole phases list (add/remove/rename + items) persists;
  // fall back to the seed only when nothing has been persisted yet
  const phases =
    Array.isArray(partial.phases) && partial.phases.length
      ? partial.phases
      : base.phases;

  // Clamp the selection to a phase that still exists — another client may have
  // removed the previously-selected phase since this state was written.
  const selectedId = partial.currentPhaseId ?? base.currentPhaseId;
  const currentPhaseId = phases.some(p => p.id === selectedId)
    ? selectedId
    : phases[0]?.id ?? base.currentPhaseId;

  return {
    appTitle: partial.appTitle ?? base.appTitle,
    brandName: partial.brandName ?? base.brandName,
    campaignName: partial.campaignName ?? base.campaignName,
    nodes,
    phases,
    currentPhaseId,
  };
}

function loadLocalState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return migrateState(JSON.parse(raw));
  } catch {}
  return defaultState();
}

function saveLocalState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function useStore() {
  const [state, setState] = useState<AppState>(loadLocalState);
  const [isSyncing, setIsSyncing] = useState(true);

  // Track if Firestore has delivered its first snapshot yet
  const firestoreReady = useRef(false);
  // Debounce timer for Firestore writes
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Latest state ref so the debounced write never uses a stale closure
  const latestState = useRef<AppState>(state);

  useEffect(() => {
    latestState.current = state;
  }, [state]);

  // Firestore real-time subscription
  useEffect(() => {
    const hubDoc = doc(db, 'hub', 'state');

    // Fallback: if Firestore hasn't responded in time, show localStorage data
    const fallbackTimer = setTimeout(() => {
      if (!firestoreReady.current) {
        setIsSyncing(false);
      }
    }, FIRESTORE_FALLBACK_MS);

    const unsubscribe = onSnapshot(
      hubDoc,
      snapshot => {
        clearTimeout(fallbackTimer);

        if (snapshot.exists()) {
          const data = migrateState(snapshot.data() as Partial<AppState>);
          setState(data);
          saveLocalState(data);
        } else {
          // First launch — seed Firestore with current local state
          const initial = loadLocalState();
          setDoc(hubDoc, initial).catch(console.error);
        }

        firestoreReady.current = true;
        setIsSyncing(false);
      },
      error => {
        console.warn('Firestore onSnapshot error:', error);
        clearTimeout(fallbackTimer);
        firestoreReady.current = true;
        setIsSyncing(false);
      }
    );

    return () => {
      clearTimeout(fallbackTimer);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      unsubscribe();
    };
  }, []);

  // Write new state to localStorage immediately and schedule a Firestore write
  const persistState = useCallback((newState: AppState) => {
    saveLocalState(newState);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      const hubDoc = doc(db, 'hub', 'state');
      setDoc(hubDoc, latestState.current).catch(console.error);
    }, FIRESTORE_DEBOUNCE_MS);
  }, []);

  const setAppTitle = useCallback((title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setState(s => {
      const next = { ...s, appTitle: trimmed };
      persistState(next);
      return next;
    });
  }, [persistState]);

  const setCampaignName = useCallback((name: string) => {
    setState(s => {
      const next = { ...s, campaignName: name };
      persistState(next);
      return next;
    });
  }, [persistState]);

  const setBrandName = useCallback((name: string) => {
    setState(s => {
      const next = { ...s, brandName: name };
      persistState(next);
      return next;
    });
  }, [persistState]);

  const setNodeLabel = useCallback((nodeId: string, label: string) => {
    const trimmed = label.trim();
    if (!trimmed) return;
    setState(s => {
      const next = {
        ...s,
        nodes: s.nodes.map(n =>
          n.id !== nodeId ? n : { ...n, title: trimmed, shortLabel: trimmed }
        ),
      };
      persistState(next);
      return next;
    });
  }, [persistState]);

  const setCurrentPhase = useCallback((phaseId: string) => {
    setState(s => {
      const next = { ...s, currentPhaseId: phaseId };
      persistState(next);
      return next;
    });
  }, [persistState]);

  const setPhaseTitle = useCallback((phaseId: string, title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setState(s => {
      const next = {
        ...s,
        phases: s.phases.map(p =>
          p.id !== phaseId ? p : { ...p, title: trimmed }
        ),
      };
      persistState(next);
      return next;
    });
  }, [persistState]);

  const addPhaseItem = useCallback((phaseId: string) => {
    setState(s => {
      const next = {
        ...s,
        phases: s.phases.map(p =>
          p.id !== phaseId ? p : { ...p, items: [...p.items, 'New item'] }
        ),
      };
      persistState(next);
      return next;
    });
  }, [persistState]);

  const updatePhaseItem = useCallback(
    (phaseId: string, index: number, text: string) => {
      const trimmed = text.trim();
      setState(s => {
        const next = {
          ...s,
          phases: s.phases.map(p => {
            if (p.id !== phaseId) return p;
            const items = trimmed
              ? p.items.map((it, i) => (i === index ? trimmed : it))
              : p.items.filter((_, i) => i !== index);
            return { ...p, items };
          }),
        };
        persistState(next);
        return next;
      });
    },
    [persistState]
  );

  const deletePhaseItem = useCallback((phaseId: string, index: number) => {
    setState(s => {
      const next = {
        ...s,
        phases: s.phases.map(p =>
          p.id !== phaseId
            ? p
            : { ...p, items: p.items.filter((_, i) => i !== index) }
        ),
      };
      persistState(next);
      return next;
    });
  }, [persistState]);

  // Append a new phase to the end of the timeline. Number is sequential.
  const addPhase = useCallback(() => {
    setState(s => {
      const newPhase = {
        id: `phase-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        number: s.phases.length + 1,
        title: 'Ny fase',
        items: [] as string[],
      };
      const next = { ...s, phases: [...s.phases, newPhase] };
      persistState(next);
      return next;
    });
  }, [persistState]);

  // Remove a phase, then resequence the remaining phase numbers (1..N). Always
  // keep at least one phase. If the removed phase was selected, move selection
  // to the nearest remaining phase.
  const deletePhase = useCallback((phaseId: string) => {
    setState(s => {
      if (s.phases.length <= 1) return s;
      const removedIdx = s.phases.findIndex(p => p.id === phaseId);
      if (removedIdx === -1) return s;

      const phases = s.phases
        .filter(p => p.id !== phaseId)
        .map((p, i) => ({ ...p, number: i + 1 }));

      let currentPhaseId = s.currentPhaseId;
      if (currentPhaseId === phaseId) {
        const neighbor = phases[Math.min(removedIdx, phases.length - 1)];
        currentPhaseId = neighbor ? neighbor.id : phases[0].id;
      }

      const next = { ...s, phases, currentPhaseId };
      persistState(next);
      return next;
    });
  }, [persistState]);

  const updateDeliverable = useCallback(
    (nodeId: string, deliverableId: string, updates: Partial<Deliverable>) => {
      setState(s => {
        const next = {
          ...s,
          nodes: s.nodes.map(n =>
            n.id !== nodeId
              ? n
              : {
                  ...n,
                  deliverables: n.deliverables.map(d =>
                    d.id !== deliverableId ? d : { ...d, ...updates }
                  ),
                }
          ),
        };
        persistState(next);
        return next;
      });
    },
    [persistState]
  );

  const cycleStatus = useCallback((nodeId: string, deliverableId: string) => {
    const order: Status[] = ['not-started', 'in-progress', 'done', 'blocked'];
    setState(s => {
      const next = {
        ...s,
        nodes: s.nodes.map(n =>
          n.id !== nodeId
            ? n
            : {
                ...n,
                deliverables: n.deliverables.map(d => {
                  if (d.id !== deliverableId) return d;
                  const idx = order.indexOf(d.status);
                  return { ...d, status: order[(idx + 1) % order.length] };
                }),
              }
        ),
      };
      persistState(next);
      return next;
    });
  }, [persistState]);

  const addDeliverable = useCallback((nodeId: string) => {
    const newD: Deliverable = {
      id: `d-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title: 'New deliverable',
      status: 'not-started',
      assignees: [],
      assignee: '',
      comments: [],
    };
    setState(s => {
      const next = {
        ...s,
        nodes: s.nodes.map(n =>
          n.id !== nodeId ? n : { ...n, deliverables: [...n.deliverables, newD] }
        ),
      };
      persistState(next);
      return next;
    });
  }, [persistState]);

  const deleteDeliverable = useCallback(
    (nodeId: string, deliverableId: string) => {
      setState(s => {
        const next = {
          ...s,
          nodes: s.nodes.map(n =>
            n.id !== nodeId
              ? n
              : {
                  ...n,
                  deliverables: n.deliverables.filter(d => d.id !== deliverableId),
                }
          ),
        };
        persistState(next);
        return next;
      });
    },
    [persistState]
  );

  const addComment = useCallback(
    (nodeId: string, deliverableId: string, text: string, author: string) => {
      const comment: Comment = {
        id: `c-${Date.now()}`,
        author: author || 'Anonymous',
        text,
        timestamp: new Date().toLocaleString('no-NO', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setState(s => {
        const next = {
          ...s,
          nodes: s.nodes.map(n =>
            n.id !== nodeId
              ? n
              : {
                  ...n,
                  deliverables: n.deliverables.map(d =>
                    d.id !== deliverableId
                      ? d
                      : { ...d, comments: [...d.comments, comment] }
                  ),
                }
          ),
        };
        persistState(next);
        return next;
      });
    },
    [persistState]
  );

  const getNode = useCallback(
    (nodeId: string): NodeData | undefined =>
      state.nodes.find(n => n.id === nodeId),
    [state.nodes]
  );

  return {
    state,
    isSyncing,
    setAppTitle,
    setCampaignName,
    setBrandName,
    setNodeLabel,
    setCurrentPhase,
    setPhaseTitle,
    addPhase,
    deletePhase,
    addPhaseItem,
    updatePhaseItem,
    deletePhaseItem,
    updateDeliverable,
    cycleStatus,
    addDeliverable,
    deleteDeliverable,
    addComment,
    getNode,
  };
}

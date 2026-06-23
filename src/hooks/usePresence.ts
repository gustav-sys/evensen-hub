import { useState, useEffect, useRef } from 'react';
import {
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  deleteField,
} from 'firebase/firestore';
import { db } from '../firebase';

const CLIENT_ID_KEY = 'evensen-hub-clientid';
const HEARTBEAT_MS = 20000;
const ONLINE_WINDOW_MS = 45000;

export interface PresenceUser {
  clientId: string;
  name: string;
  isSelf: boolean;
}

// Raw shape of an entry in the hub/presence doc
interface PresenceEntry {
  name: string;
  lastSeen: number;
}

// Stable per-install client id, created once and reused across reloads.
function getClientId(): string {
  try {
    const existing = localStorage.getItem(CLIENT_ID_KEY);
    if (existing) return existing;
    const id = `c-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    localStorage.setItem(CLIENT_ID_KEY, id);
    return id;
  } catch {
    // localStorage unavailable — fall back to an ephemeral id
    return `c-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
  }
}

export function usePresence(username: string | null): PresenceUser[] {
  const [online, setOnline] = useState<PresenceUser[]>([]);
  const clientIdRef = useRef<string | null>(null);
  if (clientIdRef.current === null) clientIdRef.current = getClientId();
  const clientId = clientIdRef.current;

  useEffect(() => {
    if (!username) {
      setOnline([]);
      return;
    }

    const presenceDoc = doc(db, 'hub', 'presence');

    const beat = () => {
      setDoc(
        presenceDoc,
        { [clientId]: { name: username, lastSeen: Date.now() } },
        { merge: true }
      ).catch(() => {});
    };

    // Immediate heartbeat, then on an interval.
    beat();
    const interval = setInterval(beat, HEARTBEAT_MS);

    const unsubscribe = onSnapshot(presenceDoc, snap => {
      const data = (snap.data() as Record<string, PresenceEntry> | undefined) ?? {};
      const now = Date.now();
      const seen = new Set<string>();
      const users: PresenceUser[] = [];

      for (const [id, entry] of Object.entries(data)) {
        if (!entry || typeof entry.lastSeen !== 'number') continue;
        if (now - entry.lastSeen > ONLINE_WINDOW_MS) continue;
        if (seen.has(id)) continue; // de-dupe by clientId
        seen.add(id);
        users.push({
          clientId: id,
          name: entry.name || 'Anonymous',
          isSelf: id === clientId,
        });
      }

      // Self first, then others alphabetically by name.
      users.sort((a, b) => {
        if (a.isSelf !== b.isSelf) return a.isSelf ? -1 : 1;
        return a.name.localeCompare(b.name);
      });

      setOnline(users);
    });

    const removeSelf = () => {
      updateDoc(presenceDoc, { [clientId]: deleteField() }).catch(() => {});
    };

    window.addEventListener('beforeunload', removeSelf);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', removeSelf);
      unsubscribe();
      removeSelf();
    };
  }, [username, clientId]);

  return online;
}

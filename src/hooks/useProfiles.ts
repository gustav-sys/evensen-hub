import { useState, useEffect, useCallback } from 'react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

// Persistent directory of everyone who has joined this campaign.
//
// Stored as a single Firestore doc — hub/profiles — whose shape is a map
// keyed by nameKey (name trimmed + lowercased) with { name, email } values.
// This is SEPARATE from presence (which is ephemeral online status); profiles
// is the durable roster that powers the assignee dropdown and the daily
// deadline-reminder email job.

export interface Profile {
  name: string;
  email: string;
}

/** name trimmed + lowercased — the map key used in the profiles doc. */
function nameKeyFor(name: string): string {
  return name.trim().toLowerCase();
}

export interface UseProfilesResult {
  profiles: Profile[];
  count: number;
  /** False until the first Firestore snapshot arrives. Gate the join/cap on this. */
  loaded: boolean;
  addProfile: (name: string, email: string) => void;
  hasProfile: (name: string) => boolean;
}

export function useProfiles(): UseProfilesResult {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const profilesDoc = doc(db, 'hub', 'profiles');

    const unsubscribe = onSnapshot(
      profilesDoc,
      snap => {
        const data = (snap.data() as Record<string, Profile> | undefined) ?? {};
        const list: Profile[] = [];

        for (const entry of Object.values(data)) {
          if (!entry || typeof entry.name !== 'string') continue;
          list.push({ name: entry.name, email: entry.email ?? '' });
        }

        list.sort((a, b) => a.name.localeCompare(b.name));
        setProfiles(list);
        setLoaded(true);
      },
      () => setLoaded(true) // even on error, unblock the prompt
    );

    return () => unsubscribe();
  }, []);

  // Write only this user under their nameKey with merge, so we never clobber
  // other people's entries in the shared profiles doc.
  const addProfile = useCallback((name: string, email: string) => {
    const trimmedName = name.trim();
    const key = nameKeyFor(trimmedName);
    if (!key) return;
    const profilesDoc = doc(db, 'hub', 'profiles');
    setDoc(
      profilesDoc,
      { [key]: { name: trimmedName, email: email.trim() } },
      { merge: true }
    ).catch(() => {});
  }, []);

  const hasProfile = useCallback(
    (name: string) => {
      const key = nameKeyFor(name);
      return profiles.some(p => nameKeyFor(p.name) === key);
    },
    [profiles]
  );

  return { profiles, count: profiles.length, loaded, addProfile, hasProfile };
}

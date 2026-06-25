import { useState, useEffect, useRef } from 'react';
import { MapView } from './components/MapView';
import { DetailPanel } from './components/DetailPanel';
import { NamePrompt } from './components/NamePrompt';
import { Timeline } from './components/Timeline';
import { PresenceBar } from './components/PresenceBar';
import { useStore } from './hooks/useStore';
import { usePresence } from './hooks/usePresence';
import { useProfiles } from './hooks/useProfiles';

const USERNAME_KEY = 'evensen-hub-username';
const EMAIL_KEY = 'evensen-hub-email';
const USER_CAP = 20;

function App() {
  const {
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
    deleteComment,
    getNode,
  } = useStore();

  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(() => {
    return localStorage.getItem(USERNAME_KEY);
  });
  const [email, setEmail] = useState<string | null>(() => {
    return localStorage.getItem(EMAIL_KEY);
  });

  const { profiles, addProfile, loaded: profilesLoaded } = useProfiles();

  // Inline click-to-edit state for the top-left app title
  const [titleEditing, setTitleEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState(state.appTitle);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitleDraft(state.appTitle);
  }, [state.appTitle]);

  useEffect(() => {
    if (titleEditing && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [titleEditing]);

  const commitTitle = () => {
    setTitleEditing(false);
    const trimmed = titleDraft.trim() || state.appTitle;
    setTitleDraft(trimmed);
    setAppTitle(trimmed);
  };

  const onlineUsers = usePresence(username);

  useEffect(() => {
    if (username) {
      localStorage.setItem(USERNAME_KEY, username);
    }
  }, [username]);

  useEffect(() => {
    if (email) {
      localStorage.setItem(EMAIL_KEY, email);
    }
  }, [email]);

  // Called when the user completes the name + email prompt.
  const handleJoin = (name: string, workEmail: string) => {
    addProfile(name, workEmail);
    setUsername(name);
    setEmail(workEmail);
  };

  const handleNodeClick = (id: string) => {
    setActiveNodeId(prev => (prev === id ? null : id));
  };

  const handlePanelClose = () => setActiveNodeId(null);

  const activeNode = activeNodeId ? getNode(activeNodeId) : undefined;

  // Loading / connecting screen shown while Firestore responds
  if (isSyncing) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          background: '#F7F4EF',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.2em',
            color: '#8B6E52',
            textTransform: 'uppercase',
          }}
        >
          EVENSEN HUB
        </span>
        <span
          style={{
            fontSize: 11,
            color: '#9A9087',
            letterSpacing: '0.08em',
          }}
        >
          Connecting…
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: '#F7F4EF',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Name + email prompt — shown until both a name and an email exist.
          Existing name-only users get asked once for their email. */}
      {(!username || !email) && (
        <NamePrompt
          onSubmit={handleJoin}
          existingNames={profiles.map(p => p.name)}
          cap={USER_CAP}
          initialName={username ?? undefined}
          ready={profilesLoaded}
        />
      )}

      {/* Top bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 48,
          background: 'rgba(247,244,239,0.8)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          zIndex: 50,
          justifyContent: 'space-between',
        }}
      >
        {/* Left: logo + brand + live sync dot */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: 'rgba(139,110,82,0.12)',
              border: '1px solid rgba(139,110,82,0.30)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#8B6E52',
              }}
            />
          </div>
          {titleEditing ? (
            <input
              ref={titleInputRef}
              value={titleDraft}
              onChange={e => setTitleDraft(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={e => {
                if (e.key === 'Enter') commitTitle();
                if (e.key === 'Escape') {
                  setTitleDraft(state.appTitle);
                  setTitleEditing(false);
                }
              }}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid rgba(139,110,82,0.4)',
                outline: 'none',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.15em',
                color: '#8B6E52',
                textTransform: 'uppercase',
                width: 240,
                padding: '2px 0',
              }}
            />
          ) : (
            <span
              onClick={() => setTitleEditing(true)}
              title="Click to edit title"
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.15em',
                color: '#8B6E52',
                textTransform: 'uppercase',
                cursor: 'text',
              }}
            >
              {state.appTitle}
            </span>
          )}

          {/* Sync status dot: green = live, amber = loading */}
          <div
            title={isSyncing ? 'Connecting…' : 'Live sync active'}
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#50A05A',
              marginLeft: 2,
              transition: 'background 0.4s',
            }}
          />
        </div>

        {/* Right: completion stats + greeting */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 11, color: '#9A9087', letterSpacing: '0.06em' }}>
            {state.nodes.reduce(
              (acc, n) => acc + n.deliverables.filter(d => d.status === 'done').length,
              0
            )}{' '}
            /{' '}
            {state.nodes.reduce((acc, n) => acc + n.deliverables.length, 0)} done
          </div>

          {/* Online presence cluster */}
          <PresenceBar users={onlineUsers} />

          {username && (
            <div
              style={{
                fontSize: 11,
                color: '#6E655C',
                letterSpacing: '0.04em',
              }}
            >
              Hi,{' '}
              <span style={{ color: '#1F1D1A', fontWeight: 600 }}>{username}</span>
            </div>
          )}
        </div>
      </div>

      {/* Radial glow background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(ellipse at 50% 55%, transparent 0%, rgba(0,0,0,0.015) 100%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Map area */}
      <div
        style={{
          position: 'absolute',
          top: 48,
          left: 0,
          right: activeNodeId ? 420 : 0,
          bottom: 0,
          transition: 'right 0.32s cubic-bezier(0.16, 1, 0.3, 1)',
          zIndex: 1,
        }}
      >
        {/* Circular map — leaves room for the timeline strip at the bottom */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 64,
          }}
        >
          <MapView
            nodes={state.nodes}
            brandName={state.brandName}
            campaignName={state.campaignName}
            activeNodeId={activeNodeId}
            onNodeClick={handleNodeClick}
            onNameChange={setCampaignName}
            onBrandNameChange={setBrandName}
            onNodeLabelChange={setNodeLabel}
            onNodeEditStart={handlePanelClose}
          />
        </div>

        {/* Timeline — pinned to the bottom of the map area, shrinks with the panel */}
        <Timeline
          phases={state.phases}
          currentPhaseId={state.currentPhaseId}
          onSelectPhase={setCurrentPhase}
          panelOpen={!!activeNodeId}
          onPhaseTitleChange={setPhaseTitle}
          onUpdatePhaseItem={updatePhaseItem}
          onDeletePhaseItem={deletePhaseItem}
          onAddPhaseItem={addPhaseItem}
          onAddPhase={addPhase}
          onDeletePhase={deletePhase}
        />
      </div>

      {/* Detail panel */}
      {activeNodeId && activeNode && (
        <DetailPanel
          node={activeNode}
          profiles={profiles}
          onClose={handlePanelClose}
          onCycleStatus={cycleStatus}
          onUpdateTitle={(nodeId, deliverableId, title) =>
            updateDeliverable(nodeId, deliverableId, { title })
          }
          onUpdateAssignees={(nodeId, deliverableId, assignees) =>
            updateDeliverable(nodeId, deliverableId, {
              assignees,
              // Keep the legacy single-assignee field in sync so older
              // single-assignee clients still show someone during the rollout.
              assignee: assignees[0] ?? '',
            })
          }
          onUpdateDueDate={(nodeId, did, dueDate) =>
            updateDeliverable(nodeId, did, { dueDate })
          }
          onAddDeliverable={addDeliverable}
          onDeleteDeliverable={deleteDeliverable}
          onAddComment={(nodeId, deliverableId, text) =>
            addComment(nodeId, deliverableId, text, username ?? 'Anonymous')
          }
          onDeleteComment={(nodeId, deliverableId, commentId) =>
            deleteComment(nodeId, deliverableId, commentId)
          }
        />
      )}
    </div>
  );
}

export default App;

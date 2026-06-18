import { useState, useEffect } from 'react';
import { MapView } from './components/MapView';
import { DetailPanel } from './components/DetailPanel';
import { NamePrompt } from './components/NamePrompt';
import { Timeline } from './components/Timeline';
import { PriorityLegend } from './components/PriorityLegend';
import { useStore } from './hooks/useStore';

const USERNAME_KEY = 'evensen-hub-username';

function App() {
  const {
    state,
    isSyncing,
    setCampaignName,
    setCurrentPhase,
    updateDeliverable,
    cycleStatus,
    addDeliverable,
    deleteDeliverable,
    addComment,
    getNode,
  } = useStore();

  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(() => {
    return localStorage.getItem(USERNAME_KEY);
  });

  useEffect(() => {
    if (username) {
      localStorage.setItem(USERNAME_KEY, username);
    }
  }, [username]);

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
          EVENSEN 1916
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
      {/* Name prompt overlay — shown on first launch */}
      {!username && (
        <NamePrompt onSubmit={name => setUsername(name)} />
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
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.15em',
              color: '#8B6E52',
              textTransform: 'uppercase',
            }}
          >
            Evensen 1916 — Campaign Hub
          </span>

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
            campaignName={state.campaignName}
            activeNodeId={activeNodeId}
            onNodeClick={handleNodeClick}
            onNameChange={setCampaignName}
          />
        </div>

        {/* Priority legend — bottom-left, sits just above the timeline */}
        <PriorityLegend />

        {/* Timeline — pinned to the bottom of the map area, shrinks with the panel */}
        <Timeline
          phases={state.phases}
          currentPhaseId={state.currentPhaseId}
          onSelectPhase={setCurrentPhase}
          panelOpen={!!activeNodeId}
        />
      </div>

      {/* Detail panel */}
      {activeNodeId && activeNode && (
        <DetailPanel
          node={activeNode}
          onClose={handlePanelClose}
          onCycleStatus={cycleStatus}
          onUpdateTitle={(nodeId, deliverableId, title) =>
            updateDeliverable(nodeId, deliverableId, { title })
          }
          onUpdateAssignee={(nodeId, deliverableId, assignee) =>
            updateDeliverable(nodeId, deliverableId, { assignee })
          }
          onAddDeliverable={addDeliverable}
          onDeleteDeliverable={deleteDeliverable}
          onAddComment={(nodeId, deliverableId, text) =>
            addComment(nodeId, deliverableId, text, username ?? 'Anonymous')
          }
        />
      )}
    </div>
  );
}

export default App;

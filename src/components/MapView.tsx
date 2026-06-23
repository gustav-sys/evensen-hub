import React, { useRef, useEffect, useState } from 'react';
import type { NodeData } from '../types';
import { CenterNode } from './CenterNode';
import { TouchpointNode } from './TouchpointNode';

interface Props {
  nodes: NodeData[];
  brandName: string;
  campaignName: string;
  activeNodeId: string | null;
  onNodeClick: (id: string) => void;
  onNameChange: (name: string) => void;
  onBrandNameChange: (name: string) => void;
  onNodeLabelChange: (nodeId: string, label: string) => void;
  onNodeEditStart: () => void;
}

export const MapView: React.FC<Props> = ({
  nodes,
  brandName,
  campaignName,
  activeNodeId,
  onNodeClick,
  onNameChange,
  onBrandNameChange,
  onNodeLabelChange,
  onNodeEditStart,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 700 });

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setSize({
          w: containerRef.current.offsetWidth,
          h: containerRef.current.offsetHeight,
        });
      }
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const cx = size.w / 2;
  const cy = size.h / 2;
  const radius = Math.min(size.w, size.h) * 0.34;

  const nodePositions = nodes.map((node, i) => {
    const angle = (i / nodes.length) * 2 * Math.PI - Math.PI / 2;
    return {
      node,
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  });

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* SVG connection lines */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        {nodePositions.map(({ node, x, y }) => (
          <line
            key={node.id}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke={activeNodeId === node.id ? node.color : 'rgba(31,29,26,0.13)'}
            strokeWidth={activeNodeId === node.id ? 1.5 : 1}
            strokeDasharray={activeNodeId === node.id ? 'none' : '4 6'}
            style={{ transition: 'stroke 0.3s ease, stroke-width 0.3s ease' }}
          />
        ))}
      </svg>

      {/* Touchpoint nodes */}
      {nodePositions.map(({ node, x, y }) => (
        <TouchpointNode
          key={node.id}
          node={node}
          x={x}
          y={y}
          isActive={activeNodeId === node.id}
          onClick={() => onNodeClick(node.id)}
          onLabelChange={label => onNodeLabelChange(node.id, label)}
          onEditStart={onNodeEditStart}
        />
      ))}

      {/* Center node */}
      <div
        style={{
          position: 'absolute',
          left: cx - 80,
          top: cy - 80,
          zIndex: 10,
        }}
      >
        <CenterNode
          brandName={brandName}
          campaignName={campaignName}
          onBrandNameChange={onBrandNameChange}
          onNameChange={onNameChange}
        />
      </div>
    </div>
  );
};

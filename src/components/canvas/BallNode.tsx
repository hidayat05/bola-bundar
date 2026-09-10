import React from 'react';
import { Group, Circle } from 'react-konva';
import Konva from 'konva';
import { BallToken } from '../../types/tactics';
import { PitchLayout, normToCanvas, canvasToNorm } from '../../utils/pitchGeometry';

import { useTacticsStore } from '../../store/useTacticsStore';

interface BallNodeProps {
  ball: BallToken;
  layout: PitchLayout;
  onUpdatePosition: (x: number, y: number) => void;
  setIsDragging: (dragging: boolean) => void;
}

export const BallNode: React.FC<BallNodeProps> = ({
  ball,
  layout,
  onUpdatePosition,
  setIsDragging,
}) => {
  const { activeTool, isPlaying, frames, activeFrameIndex } = useTacticsStore();
  const isInteractive = activeTool === 'select' && !isPlaying;
  const currentFrame = frames[activeFrameIndex];

  const radius = Math.max(7, Math.min(11, layout.pitchRect.width * 0.01));
  const canvasPos = normToCanvas(ball.x, ball.y, false, 'neutral', layout);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    setIsDragging(false);
    const dropX = e.target.x();
    const dropY = e.target.y();

    // Magnetic snap to nearby player's feet (within 36px)
    const activePlayers = currentFrame?.players.filter((p) => !p.isBench) || [];
    let closestPlayer = null;
    let closestDist = Infinity;

    for (const p of activePlayers) {
      const pPos = normToCanvas(p.x, p.y, false, p.team, layout);
      const d = Math.hypot(dropX - pPos.x, dropY - pPos.y);
      if (d < closestDist) {
        closestDist = d;
        closestPlayer = { player: p, pos: pPos };
      }
    }

    if (closestPlayer && closestDist < 36) {
      // Snap slightly ahead of player based on their facing angle
      const rad = (closestPlayer.player.rotation * Math.PI) / 180;
      const snapDist = 17;
      const snappedCanvasX = closestPlayer.pos.x + Math.cos(rad) * snapDist;
      const snappedCanvasY = closestPlayer.pos.y + Math.sin(rad) * snapDist;
      const { normX, normY } = canvasToNorm(snappedCanvasX, snappedCanvasY, layout);
      onUpdatePosition(normX, normY);
    } else {
      const { normX, normY } = canvasToNorm(dropX, dropY, layout);
      onUpdatePosition(normX, normY);
    }
  };

  return (
    <Group
      x={canvasPos.x}
      y={canvasPos.y}
      draggable={isInteractive}
      listening={isInteractive}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Outer shadow */}
      <Circle
        radius={radius}
        fill="#ffffff"
        stroke="#1e293b"
        strokeWidth={1.5}
        shadowColor="#000000"
        shadowBlur={5}
        shadowOpacity={0.6}
        shadowOffset={{ x: 0, y: 2 }}
      />
      {/* Center soccer pentagon */}
      <Circle
        radius={radius * 0.38}
        fill="#0f172a"
        listening={false}
      />
      {/* Subtle soccer ball seam accents */}
      <Circle
        radius={radius * 0.8}
        stroke="#475569"
        strokeWidth={0.75}
        dash={[2, 3]}
        listening={false}
      />
    </Group>
  );
};

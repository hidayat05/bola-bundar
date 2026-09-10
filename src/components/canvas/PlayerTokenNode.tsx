import React, { useRef } from 'react';
import { Group, Circle, Text, Line, Arrow, Rect } from 'react-konva';
import Konva from 'konva';
import { PlayerToken, TeamConfig } from '../../types/tactics';
import { PitchLayout, normToCanvas, canvasToNorm } from '../../utils/pitchGeometry';
import { useTacticsStore } from '../../store/useTacticsStore';

interface PlayerTokenNodeProps {
  player: PlayerToken;
  teamConfig: TeamConfig;
  layout: PitchLayout;
  isSelected: boolean;
  isHovered: boolean;
  isSwapTarget: boolean;
  allPlayers: PlayerToken[];
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  onUpdatePosition: (id: string, x: number, y: number, isBench: boolean) => void;
  onUpdateRotation: (id: string, rotation: number) => void;
  onSwapWith: (playerAId: string, playerBId: string) => void;
  setSwapTarget: (id: string | null) => void;
  setIsDragging: (dragging: boolean) => void;
}

export const PlayerTokenNode: React.FC<PlayerTokenNodeProps> = ({
  player,
  teamConfig,
  layout,
  isSelected,
  isHovered,
  isSwapTarget,
  allPlayers,
  onSelect,
  onHover,
  onUpdatePosition,
  onUpdateRotation,
  onSwapWith,
  setSwapTarget,
  setIsDragging,
}) => {
  const groupRef = useRef<Konva.Group>(null);
  const handleRef = useRef<Konva.Circle>(null);

  // Responsive radius
  const radius = Math.max(14, Math.min(22, layout.pitchRect.width * 0.019));

  // Determine token colors
  let fillColor = teamConfig.primaryColor;
  let strokeColor = teamConfig.secondaryColor;
  let textColor = teamConfig.textColor;

  if (player.isGoalkeeper) {
    fillColor = teamConfig.goalkeeperColor;
    strokeColor = '#ffffff';
  }
  if (player.customColor) {
    fillColor = player.customColor;
  }
  if (player.customTextColor) {
    textColor = player.customTextColor;
  }

  // Position in canvas coordinates
  const canvasPos = normToCanvas(
    player.x,
    player.y,
    player.isBench,
    player.team,
    layout
  );

  // Facing angle vector
  const rad = (player.rotation * Math.PI) / 180;
  const pointerLength = radius + 9;
  const pointerX = Math.cos(rad) * pointerLength;
  const pointerY = Math.sin(rad) * pointerLength;

  // Handle position for rotation anchor
  const handleDist = radius + 18;
  const handleX = Math.cos(rad) * handleDist;
  const handleY = Math.sin(rad) * handleDist;

  // Drag handlers for player token
  const handleDragStart = () => {
    setIsDragging(true);
    onSelect(player.id);
  };

  const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const currentX = e.target.x();
    const currentY = e.target.y();

    // Check proximity to other players for swap indicator
    let closestTargetId: string | null = null;
    let minDist = radius * 2.2;

    for (const other of allPlayers) {
      if (other.id === player.id) continue;
      const otherPos = normToCanvas(
        other.x,
        other.y,
        other.isBench,
        other.team,
        layout
      );
      const dist = Math.hypot(otherPos.x - currentX, otherPos.y - currentY);
      if (dist < minDist) {
        minDist = dist;
        closestTargetId = other.id;
      }
    }

    setSwapTarget(closestTargetId);
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    setIsDragging(false);
    const dropX = e.target.x();
    const dropY = e.target.y();

    // Check if dropping onto another player for position swap
    let targetPlayer: PlayerToken | null = null;
    let minDist = radius * 2.2;

    for (const other of allPlayers) {
      if (other.id === player.id) continue;
      const otherPos = normToCanvas(
        other.x,
        other.y,
        other.isBench,
        other.team,
        layout
      );
      const dist = Math.hypot(otherPos.x - dropX, otherPos.y - dropY);
      if (dist < minDist) {
        minDist = dist;
        targetPlayer = other;
      }
    }

    if (targetPlayer) {
      onSwapWith(player.id, targetPlayer.id);
      return;
    }

    // Normal movement: convert drop coordinates back to normalized coordinates
    const { normX, normY, isBench } = canvasToNorm(dropX, dropY, layout);
    onUpdatePosition(player.id, normX, normY, isBench);
  };

  // Rotation Handle Drag handlers
  const handleAnchorDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    e.cancelBubble = true;
    const stage = e.target.getStage();
    if (!stage || !groupRef.current) return;

    // Center of player in canvas
    const playerCanvasX = canvasPos.x;
    const playerCanvasY = canvasPos.y;

    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) return;

    const dx = pointerPos.x - playerCanvasX;
    const dy = pointerPos.y - playerCanvasY;
    let angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
    angleDeg = ((angleDeg % 360) + 360) % 360;

    onUpdateRotation(player.id, Math.round(angleDeg));
  };

  const { activeTool, isPlaying } = useTacticsStore();
  const isInteractive = activeTool === 'select' && !isPlaying;

  return (
    <Group
      ref={groupRef}
      x={canvasPos.x}
      y={canvasPos.y}
      draggable={isInteractive}
      listening={isInteractive}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onClick={() => onSelect(player.id)}
      onTap={() => onSelect(player.id)}
      onMouseEnter={() => onHover(player.id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Swap target highlight effect */}
      {isSwapTarget && (
        <Circle
          radius={radius + 10}
          stroke="#f59e0b"
          strokeWidth={3}
          dash={[5, 5]}
          opacity={0.9}
        />
      )}

      {/* Selected aura ring */}
      {isSelected && (
        <Circle
          radius={radius + 6}
          stroke="#38bdf8"
          strokeWidth={2.5}
          dash={[4, 4]}
          opacity={0.85}
        />
      )}

      {/* Hover glow */}
      {isHovered && !isSelected && (
        <Circle
          radius={radius + 4}
          stroke="rgba(255, 255, 255, 0.6)"
          strokeWidth={2}
          opacity={0.7}
        />
      )}

      {/* Facing direction pointer chevron/arrow */}
      {!player.isBench && (
        <Group listening={false}>
          {/* Subtle directional cone */}
          <Line
            points={[0, 0, pointerX, pointerY]}
            stroke={isSelected ? '#38bdf8' : strokeColor}
            strokeWidth={3}
            lineCap="round"
          />
          <Arrow
            points={[0, 0, pointerX * 1.15, pointerY * 1.15]}
            pointerLength={6}
            pointerWidth={6}
            fill={isSelected ? '#38bdf8' : strokeColor}
            stroke={isSelected ? '#38bdf8' : strokeColor}
            strokeWidth={1}
          />
        </Group>
      )}

      {/* Main Player Jersey Circle */}
      <Circle
        radius={radius}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={player.isGoalkeeper ? 3 : 2}
        shadowColor="#000000"
        shadowBlur={6}
        shadowOpacity={0.4}
        shadowOffset={{ x: 0, y: 2 }}
      />

      {/* Goalkeeper indicator inner ring */}
      {player.isGoalkeeper && (
        <Circle
          radius={radius - 4}
          stroke="rgba(255, 255, 255, 0.6)"
          strokeWidth={1}
          listening={false}
        />
      )}

      {/* Player Number */}
      <Text
        text={String(player.number)}
        fontSize={radius * 0.95}
        fontFamily="system-ui, -apple-system, sans-serif"
        fontStyle="bold"
        fill={textColor}
        align="center"
        verticalAlign="middle"
        width={radius * 2}
        height={radius * 2}
        offsetX={radius}
        offsetY={radius}
        listening={false}
      />

      {/* Name / Role Label Pill under player */}
      <Group y={radius + 8} listening={false}>
        <Rect
          x={-28}
          y={0}
          width={56}
          height={14}
          fill="rgba(15, 23, 42, 0.85)"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth={0.5}
          cornerRadius={4}
        />
        <Text
          text={player.name}
          fontSize={9}
          fontFamily="system-ui, sans-serif"
          fontStyle="bold"
          fill="#f1f5f9"
          align="center"
          width={56}
          offsetX={28}
          y={2}
        />
      </Group>

      {/* Interactive Rotation Handle Anchor (visible when selected) */}
      {isSelected && !player.isBench && (
        <Group>
          {/* Connector dashed line */}
          <Line
            points={[0, 0, handleX, handleY]}
            stroke="#38bdf8"
            strokeWidth={1.5}
            dash={[2, 2]}
            listening={false}
          />
          {/* Drag Knob */}
          <Circle
            ref={handleRef}
            x={handleX}
            y={handleY}
            radius={7}
            fill="#38bdf8"
            stroke="#ffffff"
            strokeWidth={2}
            draggable
            onDragStart={(e) => {
              e.cancelBubble = true;
              setIsDragging(true);
            }}
            onDragMove={handleAnchorDragMove}
            onDragEnd={(e) => {
              e.cancelBubble = true;
              setIsDragging(false);
              // Reset local handle offset back to rotated origin
              e.target.position({ x: handleX, y: handleY });
            }}
            shadowColor="#000"
            shadowBlur={4}
            shadowOpacity={0.5}
          />
        </Group>
      )}
    </Group>
  );
};

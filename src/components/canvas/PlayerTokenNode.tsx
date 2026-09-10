import React, { useRef, useState, useEffect } from 'react';
import { Group, Circle, Text, Line, Arrow, Rect, Path, Ellipse, Image as KonvaImage } from 'react-konva';
import Konva from 'konva';
import { PlayerToken, TeamConfig } from '../../types/tactics';
import { PitchLayout, normToCanvas, canvasToNorm } from '../../utils/pitchGeometry';
import { useTacticsStore } from '../../store/useTacticsStore';
import {
  getTintedJerseyCanvas,
  onJerseyTemplateLoaded,
  adjustColorBrightness,
  getContrastingTextColor,
} from '../../utils/jersey3dTexture';

// 3D Realistic Athletic T-Shirt / Match Kit Silhouette (Ghost Mannequin Front View)
const JERSEY_PATH =
  'M -6,-17 ' +
  'Q 0,-18.5 6,-17 ' +
  'Q 9.5,-15.5 13,-14 ' +
  'Q 15.5,-9 16.5,-2 ' +
  'L 11,-0.5 ' +
  'L 9.5,-6.5 ' +
  'L 8.5,4 ' +
  'L 9,17 ' +
  'Q 0,18.5 -9,17 ' +
  'L -8.5,4 ' +
  'L -9.5,-6.5 ' +
  'L -11,-0.5 ' +
  'L -16.5,-2 ' +
  'Q -15.5,-9 -13,-14 ' +
  'Q -9.5,-15.5 -6,-17 Z';

// Round inner neck cavity (hollow inside of back collar)
const JERSEY_INNER_NECK_PATH =
  'M -5.5,-16.2 ' +
  'Q 0,-18.8 5.5,-16.2 ' +
  'Q 0,-12 -5.5,-16.2 Z';

// Front ribbed crew-neck collar band
const JERSEY_CREW_COLLAR_PATH =
  'M -6,-16.5 ' +
  'Q 0,-10 6,-16.5 ' +
  'Q 0,-12.8 -6,-16.5 Z';

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

export const PlayerTokenNode: React.FC<PlayerTokenNodeProps> = React.memo(({
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
  const tokenStyle = useTacticsStore((s) => s.tokenStyle);

  // Subscribe to 3D jersey template load
  const [, setTemplateVersion] = useState(0);
  useEffect(() => {
    return onJerseyTemplateLoaded(() => {
      setTemplateVersion((v) => v + 1);
    });
  }, []);

  // Responsive radius adaptive for short landscape and compact screens
  const isShortScreen = layout.containerHeight <= 520;
  const minRadius = isShortScreen ? 11 : 13.5;
  const maxRadius = 22;
  const radius = Math.max(minRadius, Math.min(maxRadius, layout.pitchRect.height * 0.046));

  // Determine token colors
  let fillColor = teamConfig.primaryColor;
  let strokeColor = teamConfig.secondaryColor;

  if (player.isGoalkeeper) {
    fillColor = teamConfig.goalkeeperColor;
    strokeColor = '#ffffff';
  }
  if (player.customColor) {
    fillColor = player.customColor;
  }

  // Intelligent contrast squad number and collar colors (auto-adjusts so it's always crystal clear)
  const textColor = player.customTextColor || getContrastingTextColor(fillColor);
  const roundCollarColor = getContrastingTextColor(fillColor);
  const isNumberDark = textColor === '#0f172a';
  const numberShadowColor = isNumberDark ? 'rgba(255, 255, 255, 0.75)' : 'rgba(0, 0, 0, 0.65)';

  // 3D volumetric lighting color variations
  const scale = radius / 14;
  const highlightColor = adjustColorBrightness(fillColor, 24);
  const midLightColor = adjustColorBrightness(fillColor, 10);
  const shadowSideColor = adjustColorBrightness(fillColor, -18);
  const deepShadowColor = adjustColorBrightness(fillColor, -32);
  const innerNeckColor = adjustColorBrightness(fillColor, -55);
  const tintedJerseyCanvas = getTintedJerseyCanvas(fillColor);

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
  const pointerLength = tokenStyle === 'jersey' ? radius * 1.5 + 8 : radius + 9;
  const pointerX = Math.cos(rad) * pointerLength;
  const pointerY = Math.sin(rad) * pointerLength;

  // Handle position for rotation anchor
  const handleDist = tokenStyle === 'jersey' ? radius * 1.55 + 14 : radius + 18;
  const handleX = Math.cos(rad) * handleDist;
  const handleY = Math.sin(rad) * handleDist;

  const currentSwapTargetRef = useRef<string | null>(null);
  const otherPositionsRef = useRef<{ id: string; x: number; y: number }[]>([]);

  // Drag handlers for player token
  const handleDragStart = () => {
    setIsDragging(true);
    onSelect(player.id);
    currentSwapTargetRef.current = null;
    otherPositionsRef.current = allPlayers
      .filter((other) => other.id !== player.id)
      .map((other) => {
        const pos = normToCanvas(
          other.x,
          other.y,
          other.isBench,
          other.team,
          layout
        );
        return { id: other.id, x: pos.x, y: pos.y };
      });
  };

  const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const currentX = e.target.x();
    const currentY = e.target.y();

    // Fast distance check without coordinate transformations
    let closestTargetId: string | null = null;
    let minDist = radius * 2.2;

    for (const other of otherPositionsRef.current) {
      const dist = Math.hypot(other.x - currentX, other.y - currentY);
      if (dist < minDist) {
        minDist = dist;
        closestTargetId = other.id;
      }
    }

    if (closestTargetId !== currentSwapTargetRef.current) {
      currentSwapTargetRef.current = closestTargetId;
      setSwapTarget(closestTargetId);
    }
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    setIsDragging(false);
    currentSwapTargetRef.current = null;
    setSwapTarget(null);
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

  const activeTool = useTacticsStore((s) => s.activeTool);
  const isPlaying = useTacticsStore((s) => s.isPlaying);
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
          radius={tokenStyle === 'jersey' ? radius * 1.5 + 6 : radius + 10}
          stroke="#f59e0b"
          strokeWidth={3}
          dash={[5, 5]}
          opacity={0.9}
        />
      )}

      {/* Selected aura ring */}
      {isSelected && (
        <Circle
          radius={tokenStyle === 'jersey' ? radius * 1.42 + 4 : radius + 6}
          stroke="#38bdf8"
          strokeWidth={2.5}
          dash={[4, 4]}
          opacity={0.85}
        />
      )}

      {/* Hover glow */}
      {isHovered && !isSelected && (
        <Circle
          radius={tokenStyle === 'jersey' ? radius * 1.38 + 2 : radius + 4}
          stroke="rgba(255, 255, 255, 0.6)"
          strokeWidth={2}
          opacity={0.7}
        />
      )}

      {/* Facing direction pointer chevron/arrow */}
      {!player.isBench && (
        <Group listening={false}>
          <Arrow
            points={[0, 0, pointerX, pointerY]}
            pointerLength={7}
            pointerWidth={7}
            fill={isSelected ? '#38bdf8' : strokeColor}
            stroke={isSelected ? '#38bdf8' : strokeColor}
            strokeWidth={2.5}
          />
        </Group>
      )}

      {/* 3D Realistic Jersey Kit Shape or Classic Circle Token */}
      {tokenStyle === 'jersey' ? (
        <Group>
          {/* 1. Pitch Ground Shadow (Dual-layer soft ambient occlusion without expensive CPU Gaussian blur) */}
          <Ellipse
            x={0}
            y={18 * scale}
            radiusX={14 * scale}
            radiusY={5 * scale}
            fill="rgba(0, 0, 0, 0.16)"
            listening={false}
          />
          <Ellipse
            x={0}
            y={18 * scale}
            radiusX={9.5 * scale}
            radiusY={3.2 * scale}
            fill="rgba(0, 0, 0, 0.28)"
            listening={false}
          />

          {tintedJerseyCanvas ? (
            <>
              {/* Photorealistic 3D Studio-Lit Jersey Mockup with Natural Folds & Lighting */}
              <KonvaImage
                image={tintedJerseyCanvas}
                x={-21 * scale}
                y={-21.5 * scale}
                width={42 * scale}
                height={42 * scale}
                listening={false}
              />

              {/* Modern Athletic Round Crew-Neck Collar (Model Kerah Bulat 3D Kontras Putih/Hitam) */}
              <Group listening={false}>
                {/* 1. Back Collar Band (Tengkuk Belakang Leher Dalam) */}
                <Path
                  data="M -4.6,-17.8 Q 0,-19.6 4.6,-17.8 Q 0,-18.6 -4.6,-17.8 Z"
                  fill={adjustColorBrightness(roundCollarColor, -28)}
                  stroke="rgba(0, 0, 0, 0.2)"
                  strokeWidth={0.4 * scale}
                  scaleX={scale}
                  scaleY={scale}
                />

                {/* 2. Inner Neck Shadow Cavity (Rongga Dalam Leher) */}
                <Path
                  data="M -4.2,-17.6 Q 0,-18.6 4.2,-17.6 Q 0,-16.0 -4.2,-17.6 Z"
                  fill="rgba(0, 0, 0, 0.55)"
                  scaleX={scale}
                  scaleY={scale}
                />

                {/* 3. Front Ribbed Round Collar Band (Lingkar Kerah Bulat Kontras) */}
                <Path
                  data="M -4.6,-17.8 Q 0,-14.2 4.6,-17.8 Q 0,-15.8 -4.6,-17.8 Z"
                  fill={roundCollarColor}
                  stroke="rgba(0, 0, 0, 0.25)"
                  strokeWidth={0.5 * scale}
                  scaleX={scale}
                  scaleY={scale}
                />

                {/* 4. Subtle Specular Highlight Rim */}
                <Path
                  data="M -4.4,-17.5 Q 0,-14.4 4.4,-17.5"
                  stroke={roundCollarColor === '#ffffff' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.2)'}
                  strokeWidth={0.5 * scale}
                  scaleX={scale}
                  scaleY={scale}
                />
              </Group>
            </>
          ) : (
            <>
              {/* 2. Inner Neck Cavity (Hollow opening with inner collar depth & label seam) */}
              <Path
                data={JERSEY_INNER_NECK_PATH}
                fill={innerNeckColor}
                scaleX={scale}
                scaleY={scale}
                listening={false}
              />
              <Path
                data="M -4.5,-16.8 Q 0,-18.2 4.5,-16.8"
                stroke="rgba(255, 255, 255, 0.22)"
                strokeWidth={0.8 * scale}
                scaleX={scale}
                scaleY={scale}
                listening={false}
              />

              {/* 3. Main Athletic Jersey Body with Volumetric 3D Light Gradient & Studio Shadow */}
              <Path
                data={JERSEY_PATH}
                fillPriority="linear-gradient"
                fillLinearGradientStartPoint={{ x: -16 * scale, y: -16 * scale }}
                fillLinearGradientEndPoint={{ x: 16 * scale, y: 16 * scale }}
                fillLinearGradientColorStops={[
                  0, highlightColor,
                  0.25, midLightColor,
                  0.55, fillColor,
                  0.85, shadowSideColor,
                  1, deepShadowColor,
                ]}
                stroke={strokeColor}
                strokeWidth={player.isGoalkeeper ? 2.2 : 1.4}
                scaleX={scale}
                scaleY={scale}
                shadowColor="#000000"
                shadowBlur={isSelected ? 12 : 6}
                shadowOpacity={isSelected ? 0.85 : 0.45}
                shadowOffset={{ x: 0, y: 2.5 }}
              />

              {/* 4. Front Ribbed Crew-Neck Collar Band */}
              <Path
                data={JERSEY_CREW_COLLAR_PATH}
                fill={strokeColor}
                stroke="rgba(0, 0, 0, 0.25)"
                strokeWidth={0.6 * scale}
                scaleX={scale}
                scaleY={scale}
                listening={false}
              />
            </>
          )}

          {/* 12. 3D Heat-Pressed Vinyl Squad Number with crisp drop shadow (Hardware-accelerated) */}
          <Text
            text={String(player.number)}
            fontSize={radius * 0.88}
            fontFamily="system-ui, -apple-system, sans-serif"
            fontStyle="bold"
            fill={numberShadowColor}
            align="center"
            verticalAlign="middle"
            width={radius * 1.8}
            height={radius * 1.6}
            offsetX={(radius * 1.8) / 2}
            offsetY={(radius * 1.6) / 2 - radius * 0.15 - (isNumberDark ? 1.0 : 1.2) * scale}
            listening={false}
          />
          <Text
            text={String(player.number)}
            fontSize={radius * 0.88}
            fontFamily="system-ui, -apple-system, sans-serif"
            fontStyle="bold"
            fill={textColor}
            align="center"
            verticalAlign="middle"
            width={radius * 1.8}
            height={radius * 1.6}
            offsetX={(radius * 1.8) / 2}
            offsetY={(radius * 1.6) / 2 - radius * 0.15}
            listening={false}
          />
        </Group>
      ) : (
        <>
          {/* Classic Circle Token */}
          <Circle
            radius={radius}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={player.isGoalkeeper ? 3 : 2}
            hitStrokeWidth={14}
            shadowColor="#000000"
            shadowBlur={6}
            shadowOpacity={0.4}
            shadowOffset={{ x: 0, y: 2 }}
          />

          {player.isGoalkeeper && (
            <Circle
              radius={radius - 4}
              stroke="rgba(255, 255, 255, 0.6)"
              strokeWidth={1}
              listening={false}
            />
          )}

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
        </>
      )}

      {/* Invisible Touch Hit Area for smooth tapping & dragging */}
      <Circle
        radius={tokenStyle === 'jersey' ? radius * 1.4 : radius * 1.3}
        fill="rgba(0, 0, 0, 0.001)"
        hitStrokeWidth={16}
      />

      {/* Name / Role Label Pill under player (clean on compact screens, expands on select/hover) */}
      {(!isShortScreen || isSelected || isHovered) && (
        <Group y={tokenStyle === 'jersey' ? radius * 1.35 + (isShortScreen ? 4 : 8) : radius + (isShortScreen ? 4 : 8)} listening={false}>
          <Rect
            x={isShortScreen ? -18 : -28}
            y={0}
            width={isShortScreen ? 36 : 56}
            height={isShortScreen ? 12 : 14}
            fill="rgba(15, 23, 42, 0.88)"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth={0.5}
            cornerRadius={3}
          />
          <Text
            text={player.name}
            fontSize={isShortScreen ? 7.5 : 9}
            fontFamily="system-ui, sans-serif"
            fontStyle="bold"
            fill="#f1f5f9"
            align="center"
            width={isShortScreen ? 36 : 56}
            offsetX={isShortScreen ? 18 : 28}
            y={isShortScreen ? 1.5 : 2}
          />
        </Group>
      )}

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
          {/* Drag Knob (with large touch hit area for mobile) */}
          <Circle
            ref={handleRef}
            x={handleX}
            y={handleY}
            radius={8}
            fill="#38bdf8"
            stroke="#ffffff"
            strokeWidth={2}
            hitStrokeWidth={24}
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
});

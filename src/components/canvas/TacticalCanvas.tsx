import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Group, Line } from 'react-konva';
import Konva from 'konva';
import { useTacticsStore } from '../../store/useTacticsStore';
import { calculatePitchLayout, normToCanvas } from '../../utils/pitchGeometry';
import { PitchBackground } from './PitchBackground';
import { PlayerTokenNode } from './PlayerTokenNode';
import { BallNode } from './BallNode';
import { DrawingLayer } from './DrawingLayer';
import { DrawingToolbar } from '../toolbar/DrawingToolbar';
import { DistanceBarrierNode } from './DistanceBarrierNode';
import { TargetZonesNode } from './TargetZonesNode';
import { SetpieceAssistantBar } from '../setpiece/SetpieceAssistantBar';
import { getDefaultBarrierDistance } from '../../utils/setpieceUtils';

// High-DPI canvas rendering capped at 2 for optimal Retina clarity and 60 FPS mobile performance
if (typeof window !== 'undefined') {
  Konva.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
}

interface TacticalCanvasProps {
  stageRef?: React.RefObject<Konva.Stage>;
}

export const TacticalCanvas: React.FC<TacticalCanvasProps> = ({ stageRef }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  const {
    pitchType,
    pitchView,
    pitchSurface,
    showGrid,
    gridColor,
    showZones,
    zoneColor,
    teamDisplayMode,
    soloTeamSide,
    homeTeam,
    awayTeam,
    frames,
    activeFrameIndex,
    selectedPlayerId,
    hoveredPlayerId,
    swapTargetPlayerId,
    activeTool,
    isPlaying,
    interpolatedFrame,
    isSetpieceMode,
    showDistanceBarrier,
    barrierDistance,
    setpieceAttackingTeam,
    showTargetZones,
    activeTargetZone,
    setActiveTargetZone,
    selectPlayer,
    setHoveredPlayer,
    setSwapTargetPlayer,
    setIsDragging,
    updatePlayerPosition,
    updatePlayerRotation,
    swapPlayers,
    updateBallPosition,
  } = useTacticsStore();

  const effectiveBarrierDistance = barrierDistance ?? getDefaultBarrierDistance(pitchType);

  // During animation playback, display interpolated frame; otherwise current active frame
  const currentFrame =
    isPlaying && interpolatedFrame
      ? interpolatedFrame
      : frames[activeFrameIndex] || frames[0];

  // Observe container dimensions for responsive canvas
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleResize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 50 && rect.height > 50) {
        setDimensions({
          width: Math.floor(rect.width),
          height: Math.floor(rect.height),
        });
      }
    };

    handleResize();

    const observer = new ResizeObserver(() => {
      handleResize();
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Compute responsive layout
  const layout = calculatePitchLayout(
    dimensions.width,
    dimensions.height,
    pitchType,
    pitchView
  );

  // Click background to deselect
  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (e.target === e.target.getStage() && activeTool === 'select') {
      selectPlayer(null);
    }
  };

  // Filter players based on teamDisplayMode (both teams vs 1 solo team)
  const visiblePlayers = currentFrame.players.filter((player) => {
    if (teamDisplayMode === 'single') {
      return player.team === soloTeamSide;
    }
    return true;
  });

  // Sort players so selected/hovered token renders above others
  const sortedPlayers = [...visiblePlayers].sort((a, b) => {
    if (a.id === selectedPlayerId) return 1;
    if (b.id === selectedPlayerId) return -1;
    if (a.id === hoveredPlayerId) return 1;
    if (b.id === hoveredPlayerId) return -1;
    return 0;
  });

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center overflow-hidden bg-slate-950 select-none ${
        activeTool !== 'select' ? 'cursor-crosshair' : 'cursor-default'
      }`}
    >
      {/* Floating Drawing Tools Bar */}
      <DrawingToolbar />

      {/* Floating Setpiece Assistant Controls Bar */}
      <SetpieceAssistantBar />

      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        onClick={handleStageClick}
        onTap={handleStageClick}
      >
        {/* Layer 1: Pitch grass, markings, grid, and dugouts */}
        <Layer listening={false}>
          <PitchBackground
            layout={layout}
            pitchType={pitchType}
            pitchView={pitchView}
            pitchSurface={pitchSurface}
            showGrid={showGrid}
            gridColor={gridColor}
            showZones={showZones}
            zoneColor={zoneColor}
            homeTeamName={homeTeam.name}
            awayTeamName={awayTeam.name}
            teamDisplayMode={teamDisplayMode}
            soloTeamSide={soloTeamSide}
          />
        </Layer>

        {/* Layer 2: Player Tokens & Ball */}
        <Layer>
          {/* Target Zones Landing Markers */}
          {isSetpieceMode && showTargetZones && (
            <TargetZonesNode
              layout={layout}
              pitchType={pitchType}
              pitchView={pitchView}
              ball={currentFrame.ball}
              activeTargetZone={activeTargetZone}
              onSelectZone={setActiveTargetZone}
            />
          )}

          {/* Setpiece Legal Distance Barrier Circle (Hidden once ball has been passed / in play) */}
          {showDistanceBarrier && !isPlaying && activeFrameIndex === 0 && (
            <DistanceBarrierNode
              ball={currentFrame.ball}
              layout={layout}
              pitchType={pitchType}
              pitchView={pitchView}
              players={currentFrame.players}
              attackingTeam={setpieceAttackingTeam}
              barrierDistanceMeters={effectiveBarrierDistance}
            />
          )}

          {/* Defensive Wall Bracket Indicator */}
          {(() => {
            const wallPlayers = visiblePlayers.filter((p) => p.isWall && !p.isBench);
            if (wallPlayers.length < 2) return null;
            const pts = wallPlayers.flatMap((p) => {
              const pos = normToCanvas(p.x, p.y, false, p.team, layout);
              return [pos.x, pos.y];
            });
            return (
              <Group listening={false}>
                <Line
                  points={pts}
                  stroke="rgba(245, 158, 11, 0.35)"
                  strokeWidth={28}
                  lineCap="round"
                  lineJoin="round"
                />
                <Line
                  points={pts}
                  stroke="#fbbf24"
                  strokeWidth={2}
                  dash={[4, 4]}
                  lineCap="round"
                  lineJoin="round"
                />
              </Group>
            );
          })()}

          {/* Draggable Ball */}
          <BallNode
            ball={currentFrame.ball}
            layout={layout}
            onUpdatePosition={updateBallPosition}
            setIsDragging={setIsDragging}
          />

          {/* Player Tokens */}
          {sortedPlayers.map((player) => {
            const teamConfig = player.team === 'home' ? homeTeam : awayTeam;
            return (
              <PlayerTokenNode
                key={player.id}
                player={player}
                teamConfig={teamConfig}
                layout={layout}
                isSelected={player.id === selectedPlayerId}
                isHovered={player.id === hoveredPlayerId}
                isSwapTarget={player.id === swapTargetPlayerId}
                allPlayers={currentFrame.players}
                onSelect={selectPlayer}
                onHover={setHoveredPlayer}
                onUpdatePosition={updatePlayerPosition}
                onUpdateRotation={updatePlayerRotation}
                onSwapWith={swapPlayers}
                setSwapTarget={setSwapTargetPlayer}
                setIsDragging={setIsDragging}
              />
            );
          })}
        </Layer>

        {/* Layer 3: Tactical Drawings (Zones, Passing Arrows, Running Lines, Dribbles) */}
        <Layer>
          <DrawingLayer
            layout={layout}
            drawings={currentFrame.drawings || []}
          />
        </Layer>
      </Stage>

      {/* Floating Tactical Hint / Swap Badge */}
      {swapTargetPlayerId && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 font-bold px-3 py-1 rounded-full shadow-lg text-xs pointer-events-none animate-bounce z-30">
          Drop to Swap Positions
        </div>
      )}
    </div>
  );
};

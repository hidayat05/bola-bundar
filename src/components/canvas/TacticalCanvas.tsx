import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Group, Line, Rect, Text } from 'react-konva';
import Konva from 'konva';
import { useShallow } from 'zustand/react/shallow';
import { useTacticsStore } from '../../store/useTacticsStore';
import { calculatePitchLayout, normToCanvas } from '../../utils/pitchGeometry';
import { PitchBackground } from './PitchBackground';
import { PlayerTokenNode } from './PlayerTokenNode';
import { BallNode } from './BallNode';
import { DrawingLayer } from './DrawingLayer';
import { DrawingToolbar } from '../toolbar/DrawingToolbar';
import { DistanceBarrierNode } from './DistanceBarrierNode';
import { TargetZonesNode } from './TargetZonesNode';
import { EquipmentNode } from './EquipmentNode';
import { ActionSpotlightLayer } from './ActionSpotlightLayer';
import { TacticalStrategyHUD } from './TacticalStrategyHUD';
import { EquipmentToolbar } from '../training/EquipmentToolbar';
import { SetpieceAssistantBar } from '../setpiece/SetpieceAssistantBar';
import { getDefaultBarrierDistance } from '../../utils/setpieceUtils';
import { getPitchSpec } from '../../utils/pitchConfig';
import {
  getConvexHull,
  calculateMetricPolygonArea,
  getPolygonCentroid,
  getCompactnessRating,
  getDefensiveChain,
} from '../../utils/spatialCalculations';

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
    showCompactness,
    showDefensiveLines,
    showPlayerFOV,
    showActionSpotlight,
    equipment,
    selectedEquipmentId,
    setActiveTargetZone,
    selectPlayer,
    setHoveredPlayer,
    setSwapTargetPlayer,
    setIsDragging,
    updatePlayerPosition,
    updatePlayerRotation,
    swapPlayers,
    updateBallPosition,
    updateEquipmentPosition,
    updateEquipmentRotation,
    deleteEquipment,
    setSelectedEquipmentId,
  } = useTacticsStore(
    useShallow((s) => ({
      pitchType: s.pitchType,
      pitchView: s.pitchView,
      pitchSurface: s.pitchSurface,
      showGrid: s.showGrid,
      gridColor: s.gridColor,
      showZones: s.showZones,
      zoneColor: s.zoneColor,
      teamDisplayMode: s.teamDisplayMode,
      soloTeamSide: s.soloTeamSide,
      homeTeam: s.homeTeam,
      awayTeam: s.awayTeam,
      frames: s.frames,
      activeFrameIndex: s.activeFrameIndex,
      selectedPlayerId: s.selectedPlayerId,
      hoveredPlayerId: s.hoveredPlayerId,
      swapTargetPlayerId: s.swapTargetPlayerId,
      activeTool: s.activeTool,
      isPlaying: s.isPlaying,
      interpolatedFrame: s.interpolatedFrame,
      isSetpieceMode: s.isSetpieceMode,
      showDistanceBarrier: s.showDistanceBarrier,
      barrierDistance: s.barrierDistance,
      setpieceAttackingTeam: s.setpieceAttackingTeam,
      showTargetZones: s.showTargetZones,
      activeTargetZone: s.activeTargetZone,
      showCompactness: s.showCompactness,
      showDefensiveLines: s.showDefensiveLines,
      showPlayerFOV: s.showPlayerFOV,
      showActionSpotlight: s.showActionSpotlight,
      equipment: s.equipment,
      selectedEquipmentId: s.selectedEquipmentId,
      setActiveTargetZone: s.setActiveTargetZone,
      selectPlayer: s.selectPlayer,
      setHoveredPlayer: s.setHoveredPlayer,
      setSwapTargetPlayer: s.setSwapTargetPlayer,
      setIsDragging: s.setIsDragging,
      updatePlayerPosition: s.updatePlayerPosition,
      updatePlayerRotation: s.updatePlayerRotation,
      swapPlayers: s.swapPlayers,
      updateBallPosition: s.updateBallPosition,
      updateEquipmentPosition: s.updateEquipmentPosition,
      updateEquipmentRotation: s.updateEquipmentRotation,
      deleteEquipment: s.deleteEquipment,
      setSelectedEquipmentId: s.setSelectedEquipmentId,
    }))
  );

  const effectiveBarrierDistance = barrierDistance ?? getDefaultBarrierDistance(pitchType);

  // During animation playback, display interpolated frame; otherwise current active frame
  const currentFrame =
    isPlaying && interpolatedFrame
      ? interpolatedFrame
      : frames[activeFrameIndex] || frames[0];

  // Active keyframe segment calculation for 100% synchronous spotlight tracking
  const activeSegmentIdx =
    isPlaying && interpolatedFrame && typeof interpolatedFrame.activeSegmentIndex === 'number'
      ? interpolatedFrame.activeSegmentIndex
      : activeFrameIndex;

  const segFrameA = frames[activeSegmentIdx] || frames[0];
  const segFrameB = frames[activeSegmentIdx + 1] || (activeSegmentIdx > 0 ? frames[activeSegmentIdx] : null);
  const segProgress =
    isPlaying && interpolatedFrame && typeof interpolatedFrame.rawProgress === 'number'
      ? interpolatedFrame.rawProgress
      : 0;

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

  const isShortScreen = layout.containerHeight <= 520;
  const minRadius = isShortScreen ? 11 : 13.5;
  const maxRadius = 22;
  const tokenRadius = Math.max(minRadius, Math.min(maxRadius, layout.pitchRect.height * 0.046));

  // Click background to deselect
  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (e.target === e.target.getStage() && activeTool === 'select') {
      selectPlayer(null);
      setSelectedEquipmentId(null);
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

      {/* Floating Equipment Toolbar */}
      <EquipmentToolbar />

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

        {/* Layer 1.5: Spatial Tactical Intelligence (Convex Hull Compactness & Defensive Lines) */}
        <Layer listening={false}>
          {/* Convex Hull Compactness Polygons */}
          {showCompactness !== 'none' && (() => {
            const renderTeamHull = (side: 'home' | 'away') => {
              const activeOutfield = currentFrame.players.filter(
                (p) => p.team === side && !p.isBench && !p.isGoalkeeper
              );
              if (activeOutfield.length < 3) return null;

              const teamConfig = side === 'home' ? homeTeam : awayTeam;
              const points = activeOutfield.map((p) => ({ x: p.x, y: p.y }));
              const hullNorm = getConvexHull(points);
              const areaM2 = calculateMetricPolygonArea(hullNorm, pitchType);
              const rating = getCompactnessRating(areaM2, pitchType);
              const centroid = getPolygonCentroid(hullNorm);

              const canvasPoints = hullNorm.flatMap((p) => {
                const c = normToCanvas(p.x, p.y, false, side, layout);
                return [c.x, c.y];
              });
              const centerPos = normToCanvas(centroid.x, centroid.y, false, side, layout);

              return (
                <Group key={`hull-${side}`}>
                  {/* Poligon pembungkus */}
                  <Line
                    points={canvasPoints}
                    closed
                    fill={`${teamConfig.primaryColor}22`}
                    stroke={teamConfig.primaryColor}
                    strokeWidth={2}
                    dash={[6, 4]}
                  />
                  {/* Floating Metric Badge */}
                  <Group x={centerPos.x} y={centerPos.y}>
                    <Rect
                      x={-62}
                      y={-11}
                      width={124}
                      height={22}
                      cornerRadius={6}
                      fill="rgba(15, 23, 42, 0.9)"
                      stroke={rating.color}
                      strokeWidth={1}
                      shadowColor="#000"
                      shadowBlur={6}
                      shadowOpacity={0.4}
                    />
                    <Text
                      text={`${Math.round(areaM2)} m² • ${rating.rating}`}
                      x={-62}
                      y={-5}
                      width={124}
                      align="center"
                      fontSize={9}
                      fontFamily="system-ui, sans-serif"
                      fontStyle="bold"
                      fill="#ffffff"
                    />
                  </Group>
                </Group>
              );
            };

            return (
              <Group>
                {(showCompactness === 'home' || showCompactness === 'both') && renderTeamHull('home')}
                {(showCompactness === 'away' || showCompactness === 'both') && renderTeamHull('away')}
              </Group>
            );
          })()}

          {/* Defensive Lines / Chains */}
          {showDefensiveLines && (() => {
            const spec = getPitchSpec(pitchType);
            const pitchLength = spec.lengthMeters;
            const pitchWidth = spec.widthMeters;

            const renderChain = (side: 'home' | 'away') => {
              const chain = getDefensiveChain(currentFrame.players, side);
              if (chain.length < 2) return null;
              const teamConfig = side === 'home' ? homeTeam : awayTeam;

              const canvasChain = chain.map((p) => ({
                player: p,
                pos: normToCanvas(p.x, p.y, false, side, layout),
              }));

              const linePts = canvasChain.flatMap((c) => [c.pos.x, c.pos.y]);

              return (
                <Group key={`def-chain-${side}`}>
                  <Line
                    points={linePts}
                    stroke={teamConfig.primaryColor}
                    strokeWidth={2.5}
                    dash={[5, 4]}
                    lineCap="round"
                    lineJoin="round"
                  />
                  {/* Inter-player distance markers */}
                  {canvasChain.slice(0, -1).map((curr, idx) => {
                    const next = canvasChain[idx + 1];
                    const midX = (curr.pos.x + next.pos.x) / 2;
                    const midY = (curr.pos.y + next.pos.y) / 2;

                    // Calculate distance in real meters
                    const dxMeters = ((next.player.x - curr.player.x) / 100) * pitchLength;
                    const dyMeters = ((next.player.y - curr.player.y) / 100) * pitchWidth;
                    const distMeters = Math.hypot(dxMeters, dyMeters);

                    return (
                      <Group key={`dist-${idx}`} x={midX} y={midY}>
                        <Rect
                          x={-18}
                          y={-7}
                          width={36}
                          height={14}
                          cornerRadius={3}
                          fill="rgba(15, 23, 42, 0.88)"
                          stroke="rgba(255,255,255,0.2)"
                          strokeWidth={0.5}
                        />
                        <Text
                          text={`${distMeters.toFixed(1)}m`}
                          x={-18}
                          y={-4.5}
                          width={36}
                          align="center"
                          fontSize={8}
                          fontStyle="bold"
                          fill="#f8fafc"
                        />
                      </Group>
                    );
                  })}
                </Group>
              );
            };

            return (
              <Group>
                {renderChain('home')}
                {renderChain('away')}
              </Group>
            );
          })()}
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
        </Layer>

        {/* Layer 2A: Action Spotlight Layer (Hardware-accelerated Ground Beacons & Lasers, listening=false) */}
        {showActionSpotlight && (
          <Layer listening={false}>
            <ActionSpotlightLayer
              layout={layout}
              pitchType={pitchType}
              pitchView={pitchView}
              homeTeam={homeTeam}
              awayTeam={awayTeam}
              tokenRadius={tokenRadius}
              currentPlayers={currentFrame.players}
              currentBall={currentFrame.ball}
              segFrameA={segFrameA}
              segFrameB={segFrameB}
              progress={segProgress}
            />
          </Layer>
        )}

        {/* Layer 2B: Interactive Player Tokens and Draggable Ball */}
        <Layer>
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
                showPlayerFOV={showPlayerFOV}
              />
            );
          })}
        </Layer>

        {/* Layer 2.5: Training Ground Equipment */}
        <Layer>
          {equipment.map((item) => (
            <EquipmentNode
              key={item.id}
              item={item}
              layout={layout}
              isSelected={item.id === selectedEquipmentId}
              onSelect={setSelectedEquipmentId}
              onUpdatePosition={updateEquipmentPosition}
              onUpdateRotation={updateEquipmentRotation}
              onDelete={deleteEquipment}
              setIsDragging={setIsDragging}
            />
          ))}
        </Layer>

        {/* Layer 3: Tactical Drawings (Zones, Passing Arrows, Running Lines, Dribbles) */}
        <Layer>
          <DrawingLayer
            layout={layout}
            drawings={currentFrame.drawings || []}
          />
        </Layer>
      </Stage>

      {/* Dynamic Tactical Strategy HUD (Phase & Strategy Name & Player Instruction) */}
      <TacticalStrategyHUD />

      {/* Floating Tactical Hint / Swap Badge */}
      {swapTargetPlayerId && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 font-bold px-3 py-1 rounded-full shadow-lg text-xs pointer-events-none animate-bounce z-30">
          Drop to Swap Positions
        </div>
      )}
    </div>
  );
};

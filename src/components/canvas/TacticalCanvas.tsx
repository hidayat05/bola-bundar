import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer } from 'react-konva';
import Konva from 'konva';
import { useTacticsStore } from '../../store/useTacticsStore';
import { calculatePitchLayout } from '../../utils/pitchGeometry';
import { PitchBackground } from './PitchBackground';
import { PlayerTokenNode } from './PlayerTokenNode';
import { BallNode } from './BallNode';
import { DrawingLayer } from './DrawingLayer';
import { DrawingToolbar } from '../toolbar/DrawingToolbar';

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
    showZones,
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
    selectPlayer,
    setHoveredPlayer,
    setSwapTargetPlayer,
    setIsDragging,
    updatePlayerPosition,
    updatePlayerRotation,
    swapPlayers,
    updateBallPosition,
  } = useTacticsStore();

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

  // Sort players so selected/hovered token renders above others
  const sortedPlayers = [...currentFrame.players].sort((a, b) => {
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

      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        onClick={handleStageClick}
        onTap={handleStageClick}
      >
        {/* Layer 1: Pitch grass, markings, grid, and dugouts */}
        <Layer>
          <PitchBackground
            layout={layout}
            pitchType={pitchType}
            pitchView={pitchView}
            pitchSurface={pitchSurface}
            showGrid={showGrid}
            showZones={showZones}
            homeTeamName={homeTeam.name}
            awayTeamName={awayTeam.name}
          />
        </Layer>

        {/* Layer 2: Player Tokens & Ball */}
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

import React from 'react';
import { Group, Circle, Line, Rect, Text } from 'react-konva';
import { BallToken, PitchType, PitchView, PlayerToken } from '../../types/tactics';
import { PitchLayout, normToCanvas } from '../../utils/pitchGeometry';
import {
  calculatePlayerDistancesToBall,
  getBarrierRadiusPixels,
} from '../../utils/setpieceUtils';

import { useTacticsStore } from '../../store/useTacticsStore';

interface DistanceBarrierNodeProps {
  ball: BallToken;
  layout: PitchLayout;
  pitchType: PitchType;
  pitchView: PitchView;
  players: PlayerToken[];
  attackingTeam: 'home' | 'away';
  barrierDistanceMeters: number;
}

export const DistanceBarrierNode: React.FC<DistanceBarrierNodeProps> = React.memo(({
  ball,
  layout,
  pitchType,
  pitchView,
  players,
  attackingTeam,
  barrierDistanceMeters,
}) => {
  const isPlaying = useTacticsStore((s) => s.isPlaying);
  const activeFrameIndex = useTacticsStore((s) => s.activeFrameIndex);

  // If ball has already been passed / animation playing, hide barrier to avoid clutter
  if (isPlaying || activeFrameIndex > 0) return null;

  const ballCanvas = normToCanvas(ball.x, ball.y, false, 'neutral', layout);
  const radius = getBarrierRadiusPixels(barrierDistanceMeters, layout, pitchType, pitchView);

  // Safety check: ensure radius is a valid positive number
  if (!radius || radius <= 0) return null;

  const { violatingDefenders } = calculatePlayerDistancesToBall(
    players,
    ball,
    barrierDistanceMeters,
    attackingTeam,
    layout,
    pitchType,
    pitchView
  );

  const hasViolations = violatingDefenders.length > 0;
  const strokeColor = hasViolations ? '#f43f5e' : '#38bdf8';
  const fillColor = hasViolations ? 'rgba(244, 63, 94, 0.09)' : 'rgba(56, 189, 248, 0.07)';

  // Angle for radius measurement indicator (pointing top-right at -35 degrees)
  const angleRad = (-35 * Math.PI) / 180;
  const edgeX = ballCanvas.x + radius * Math.cos(angleRad);
  const edgeY = ballCanvas.y + radius * Math.sin(angleRad);

  const sportLabel = pitchType === 'futsal' ? 'Futsal 5m' : pitchType === 'mini-soccer' ? 'Mini 7m' : '11v11 9.15m';
  const badgeText = `${barrierDistanceMeters}m (${sportLabel}) ${hasViolations ? '⚠️ PELANGGARAN' : 'JARAK LEGAL'}`;
  const badgeWidth = badgeText.length * 6.5 + 16;
  const badgeHeight = 20;

  return (
    <Group listening={false}>
      {/* 1. Translucent Distance Barrier Fill & Dashed Outer Border - Bulat Sempurna (Circle) */}
      <Circle
        x={ballCanvas.x}
        y={ballCanvas.y}
        radius={radius}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={1.75}
        dash={[8, 6]}
        shadowColor={hasViolations ? '#f43f5e' : '#38bdf8'}
        shadowBlur={10}
        shadowOpacity={0.35}
      />

      {/* 2. Concentric guide ring at 50% radius */}
      <Circle
        x={ballCanvas.x}
        y={ballCanvas.y}
        radius={radius * 0.5}
        stroke={strokeColor}
        strokeWidth={0.75}
        dash={[4, 6]}
        opacity={0.35}
      />

      {/* 3. Measurement Radius Line from Ball to Perimeter */}
      <Line
        points={[ballCanvas.x, ballCanvas.y, edgeX, edgeY]}
        stroke={strokeColor}
        strokeWidth={1.5}
        dash={[4, 4]}
        opacity={0.8}
      />

      {/* 4. Distance Label Pill at the edge of the barrier */}
      <Group x={edgeX + 4} y={edgeY - badgeHeight / 2}>
        <Rect
          width={badgeWidth}
          height={badgeHeight}
          fill="#090d16"
          stroke={strokeColor}
          strokeWidth={1.2}
          cornerRadius={6}
          shadowColor="#000000"
          shadowBlur={6}
          shadowOpacity={0.7}
        />
        <Text
          x={8}
          y={4.5}
          text={badgeText}
          fontSize={10}
          fontFamily="system-ui, sans-serif"
          fontStyle="bold"
          fill={hasViolations ? '#fda4af' : '#7dd3fc'}
        />
      </Group>

      {/* 5. Warning Highlights on Defending Players Standing Inside the Barrier */}
      {violatingDefenders.map((check) => {
        const warnText = `⚠️ ${check.distanceMeters}m (<${barrierDistanceMeters}m)`;
        const warnWidth = warnText.length * 6.5 + 12;
        const warnHeight = 18;

        return (
          <Group key={`violator-${check.player.id}`}>
            {/* Pulsating red alert ring around player token */}
            <Circle
              x={check.canvasX}
              y={check.canvasY}
              radius={24}
              stroke="#ef4444"
              strokeWidth={2}
              dash={[4, 4]}
              fill="rgba(239, 68, 68, 0.2)"
            />

            {/* Distance warning badge floating above the player */}
            <Group x={check.canvasX - warnWidth / 2} y={check.canvasY - 38}>
              <Rect
                width={warnWidth}
                height={warnHeight}
                fill="#ef4444"
                cornerRadius={5}
                shadowColor="#000000"
                shadowBlur={6}
                shadowOpacity={0.8}
              />
              <Text
                x={6}
                y={3.5}
                text={warnText}
                fontSize={9.5}
                fontFamily="system-ui, sans-serif"
                fontStyle="bold"
                fill="#ffffff"
              />
            </Group>
          </Group>
        );
      })}
    </Group>
  );
});

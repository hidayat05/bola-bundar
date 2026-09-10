import React from 'react';
import { Group, Rect, Line, Circle, Arc, Text } from 'react-konva';
import { PitchSurface, PitchType, PitchView } from '../../types/tactics';
import { PitchLayout } from '../../utils/pitchGeometry';

interface PitchBackgroundProps {
  layout: PitchLayout;
  pitchType: PitchType;
  pitchView: PitchView;
  pitchSurface: PitchSurface;
  showGrid: boolean;
  showZones: boolean;
  zoneColor?: string;
  homeTeamName: string;
  awayTeamName: string;
  teamDisplayMode?: 'both' | 'single';
  soloTeamSide?: 'home' | 'away';
}

export const PitchBackground: React.FC<PitchBackgroundProps> = ({
  layout,
  pitchType,
  pitchView,
  pitchSurface,
  showGrid,
  showZones,
  zoneColor = '#fbbf24',
  homeTeamName,
  awayTeamName,
  teamDisplayMode = 'both',
  soloTeamSide = 'home',
}) => {
  const { pitchRect, benchRectHome, benchRectAway } = layout;
  const { x, y, width: w, height: h } = pitchRect;

  // Surface colors
  let baseColor = '#1f6f38';
  let stripeColor = '#247a3e';
  let lineColor = '#ffffff';
  let lineOpacity = 0.85;
  let hasStripes = true;

  if (pitchSurface === 'full-green') {
    baseColor = '#238636'; // Rich solid vibrant green grass
    stripeColor = '#238636';
    hasStripes = false;
  } else if (pitchSurface === 'turf') {
    baseColor = '#1b5e20';
    stripeColor = '#2e7d32';
  } else if (pitchSurface === 'blue') {
    baseColor = '#1e3a8a';
    stripeColor = '#1d4ed8';
    lineColor = '#ffffff';
  } else if (pitchSurface === 'wood') {
    baseColor = '#b45309';
    stripeColor = '#d97706';
  }

  const lineWidth = Math.max(1.5, Math.round(w * 0.003));
  const centerRadius = pitchType === 'futsal' ? h * 0.15 : h * 0.18;
  const penaltyBoxDepth =
    pitchType === 'futsal' ? w * 0.15 : pitchType === 'mini-soccer' ? w * 0.2 : w * 0.165;
  const penaltyBoxHeight =
    pitchType === 'futsal' ? h * 0.5 : pitchType === 'mini-soccer' ? h * 0.65 : h * 0.6;
  const goalAreaDepth = w * 0.055;
  const goalAreaHeight = h * 0.3;
  const penaltySpotDist =
    pitchType === 'futsal' ? w * 0.15 : pitchType === 'mini-soccer' ? w * 0.15 : w * 0.11;
  const secondPenaltyDist = w * 0.25; // Futsal 10m mark
  const cornerArcRadius = Math.max(8, w * 0.02);

  // Mowed lawn stripes (vertical strips)
  const stripeCount = pitchType === 'futsal' ? 8 : 12;
  const stripeW = w / stripeCount;
  const stripes = [];
  if (hasStripes) {
    for (let i = 0; i < stripeCount; i++) {
      if (i % 2 === 1) {
        stripes.push(
          <Rect
            key={`stripe-${i}`}
            x={x + i * stripeW}
            y={y}
            width={stripeW}
            height={h}
            fill={stripeColor}
            listening={false}
          />
        );
      }
    }
  }

  return (
    <Group listening={false}>
      {/* Outer Pitch Run-off Ground */}
      <Rect
        x={x - 12}
        y={y - 12}
        width={w + 24}
        height={h + 24}
        fill={baseColor}
        cornerRadius={8}
        shadowColor="#000000"
        shadowBlur={16}
        shadowOpacity={0.4}
        shadowOffset={{ x: 0, y: 4 }}
      />

      {/* Main Pitch Grass/Floor */}
      <Rect
        x={x}
        y={y}
        width={w}
        height={h}
        fill={baseColor}
        stroke="#0f3b1c"
        strokeWidth={1}
      />

      {/* Alternating Stripes */}
      {stripes}

      {/* Outer Boundary Touchlines */}
      <Rect
        x={x}
        y={y}
        width={w}
        height={h}
        stroke={lineColor}
        strokeWidth={lineWidth}
        opacity={lineOpacity}
      />

      {/* Full Pitch Mode Markings */}
      {pitchView === 'full' ? (
        <>
          {/* Halfway Line */}
          <Line
            points={[x + w / 2, y, x + w / 2, y + h]}
            stroke={lineColor}
            strokeWidth={lineWidth}
            opacity={lineOpacity}
          />

          {/* Center Circle & Spot */}
          <Circle
            x={x + w / 2}
            y={y + h / 2}
            radius={centerRadius}
            stroke={lineColor}
            strokeWidth={lineWidth}
            opacity={lineOpacity}
          />
          <Circle
            x={x + w / 2}
            y={y + h / 2}
            radius={lineWidth * 1.5}
            fill={lineColor}
            opacity={lineOpacity}
          />

          {/* Left Penalty Area */}
          <Rect
            x={x}
            y={y + (h - penaltyBoxHeight) / 2}
            width={penaltyBoxDepth}
            height={penaltyBoxHeight}
            stroke={lineColor}
            strokeWidth={lineWidth}
            opacity={lineOpacity}
          />

          {/* Right Penalty Area */}
          <Rect
            x={x + w - penaltyBoxDepth}
            y={y + (h - penaltyBoxHeight) / 2}
            width={penaltyBoxDepth}
            height={penaltyBoxHeight}
            stroke={lineColor}
            strokeWidth={lineWidth}
            opacity={lineOpacity}
          />

          {/* Left Penalty Spot */}
          <Circle
            x={x + penaltySpotDist}
            y={y + h / 2}
            radius={lineWidth * 1.4}
            fill={lineColor}
            opacity={lineOpacity}
          />

          {/* Right Penalty Spot */}
          <Circle
            x={x + w - penaltySpotDist}
            y={y + h / 2}
            radius={lineWidth * 1.4}
            fill={lineColor}
            opacity={lineOpacity}
          />

          {/* Football/Mini-Soccer specific: Goal areas (6 yard box) & Penalty Arcs (D) */}
          {pitchType !== 'futsal' && (
            <>
              {/* Left 6-yard Goal Area */}
              <Rect
                x={x}
                y={y + (h - goalAreaHeight) / 2}
                width={goalAreaDepth}
                height={goalAreaHeight}
                stroke={lineColor}
                strokeWidth={lineWidth}
                opacity={lineOpacity}
              />

              {/* Right 6-yard Goal Area */}
              <Rect
                x={x + w - goalAreaDepth}
                y={y + (h - goalAreaHeight) / 2}
                width={goalAreaDepth}
                height={goalAreaHeight}
                stroke={lineColor}
                strokeWidth={lineWidth}
                opacity={lineOpacity}
              />

              {/* Left Penalty Arc (D) */}
              <Arc
                x={x + penaltySpotDist}
                y={y + h / 2}
                innerRadius={centerRadius}
                outerRadius={centerRadius}
                angle={100}
                rotation={-50}
                stroke={lineColor}
                strokeWidth={lineWidth}
                opacity={lineOpacity}
              />

              {/* Right Penalty Arc (D) */}
              <Arc
                x={x + w - penaltySpotDist}
                y={y + h / 2}
                innerRadius={centerRadius}
                outerRadius={centerRadius}
                angle={100}
                rotation={130}
                stroke={lineColor}
                strokeWidth={lineWidth}
                opacity={lineOpacity}
              />
            </>
          )}

          {/* Futsal Specific: 10m Second Penalty Marks */}
          {pitchType === 'futsal' && (
            <>
              <Circle
                x={x + secondPenaltyDist}
                y={y + h / 2}
                radius={lineWidth * 1.2}
                fill={lineColor}
                opacity={lineOpacity}
              />
              <Circle
                x={x + w - secondPenaltyDist}
                y={y + h / 2}
                radius={lineWidth * 1.2}
                fill={lineColor}
                opacity={lineOpacity}
              />
            </>
          )}

          {/* Corner Arcs */}
          <Arc
            x={x}
            y={y}
            innerRadius={cornerArcRadius}
            outerRadius={cornerArcRadius}
            angle={90}
            rotation={0}
            stroke={lineColor}
            strokeWidth={lineWidth}
            opacity={lineOpacity}
          />
          <Arc
            x={x}
            y={y + h}
            innerRadius={cornerArcRadius}
            outerRadius={cornerArcRadius}
            angle={90}
            rotation={270}
            stroke={lineColor}
            strokeWidth={lineWidth}
            opacity={lineOpacity}
          />
          <Arc
            x={x + w}
            y={y}
            innerRadius={cornerArcRadius}
            outerRadius={cornerArcRadius}
            angle={90}
            rotation={90}
            stroke={lineColor}
            strokeWidth={lineWidth}
            opacity={lineOpacity}
          />
          <Arc
            x={x + w}
            y={y + h}
            innerRadius={cornerArcRadius}
            outerRadius={cornerArcRadius}
            angle={90}
            rotation={180}
            stroke={lineColor}
            strokeWidth={lineWidth}
            opacity={lineOpacity}
          />

          {/* Left Goal Net Frame */}
          <Rect
            x={x - w * 0.024}
            y={y + (h - goalAreaHeight * 0.8) / 2}
            width={w * 0.024}
            height={goalAreaHeight * 0.8}
            stroke="rgba(255, 255, 255, 0.6)"
            strokeWidth={1.5}
            fill="rgba(255, 255, 255, 0.08)"
          />

          {/* Right Goal Net Frame */}
          <Rect
            x={x + w}
            y={y + (h - goalAreaHeight * 0.8) / 2}
            width={w * 0.024}
            height={goalAreaHeight * 0.8}
            stroke="rgba(255, 255, 255, 0.6)"
            strokeWidth={1.5}
            fill="rgba(255, 255, 255, 0.08)"
          />
        </>
      ) : (
        /* Half Pitch Mode Markings */
        <>
          {/* Attacking Goal End (Right Side) */}
          <Rect
            x={x + w - penaltyBoxDepth * 1.5}
            y={y + (h - penaltyBoxHeight) / 2}
            width={penaltyBoxDepth * 1.5}
            height={penaltyBoxHeight}
            stroke={lineColor}
            strokeWidth={lineWidth}
            opacity={lineOpacity}
          />
          <Circle
            x={x + w - penaltySpotDist * 1.5}
            y={y + h / 2}
            radius={lineWidth * 1.4}
            fill={lineColor}
            opacity={lineOpacity}
          />
          {/* Halfway Arc from left boundary */}
          <Arc
            x={x}
            y={y + h / 2}
            innerRadius={centerRadius * 1.3}
            outerRadius={centerRadius * 1.3}
            angle={180}
            rotation={-90}
            stroke={lineColor}
            strokeWidth={lineWidth}
            opacity={lineOpacity}
          />
          {/* Right Goal Post */}
          <Rect
            x={x + w}
            y={y + (h - goalAreaHeight) / 2}
            width={w * 0.03}
            height={goalAreaHeight}
            stroke="rgba(255, 255, 255, 0.7)"
            strokeWidth={1.5}
            fill="rgba(255, 255, 255, 0.1)"
          />
        </>
      )}

      {/* Tactical Zones Overlay (18-Zone grid / Half-spaces) */}
      {showZones && (
        <Group listening={false}>
          {/* 6 horizontal zones (5 dividing lines) */}
          {[1, 2, 3, 4, 5].map((idx) => (
            <Line
              key={`zone-col-${idx}`}
              points={[x + (idx * w) / 6, y, x + (idx * w) / 6, y + h]}
              stroke={zoneColor}
              strokeWidth={1.5}
              dash={[6, 6]}
              opacity={0.65}
            />
          ))}
          {/* 3 vertical zones (Flanks & Central/Half-spaces - 2 dividing lines) */}
          {[1, 2].map((idx) => (
            <Line
              key={`zone-row-${idx}`}
              points={[x, y + (idx * h) / 3, x + w, y + (idx * h) / 3]}
              stroke={zoneColor}
              strokeWidth={1.5}
              dash={[6, 6]}
              opacity={0.65}
            />
          ))}

          {/* 18 Individual Zone Numbers & Subtle Labels */}
          {Array.from({ length: 6 }).map((_, c) =>
            Array.from({ length: 3 }).map((_, r) => {
              const zoneNum = c * 3 + r + 1;
              const cellW = w / 6;
              const cellH = h / 3;
              const cellX = x + c * cellW;
              const cellY = y + r * cellH;
              const isZone14 = zoneNum === 14;

              return (
                <Group key={`zone-cell-${zoneNum}`}>
                  {/* Subtle tint for Zone 14 (Golden Playmaker zone) */}
                  {isZone14 && (
                    <Rect
                      x={cellX + 2}
                      y={cellY + 2}
                      width={cellW - 4}
                      height={cellH - 4}
                      fill={zoneColor}
                      opacity={0.12}
                      cornerRadius={4}
                    />
                  )}
                  {/* Zone Number */}
                  <Text
                    x={cellX}
                    y={cellY + cellH * 0.4}
                    width={cellW}
                    text={isZone14 ? '14 ★' : `${zoneNum}`}
                    align="center"
                    fontSize={Math.max(10, Math.min(18, Math.round(cellW * 0.15)))}
                    fontStyle="bold"
                    fill={zoneColor}
                    opacity={isZone14 ? 0.9 : 0.5}
                  />
                </Group>
              );
            })
          )}
        </Group>
      )}

      {/* Grid Overlay */}
      {showGrid && (
        <Group opacity={0.2}>
          {Array.from({ length: 19 }).map((_, i) => (
            <Line
              key={`grid-x-${i}`}
              points={[x + (i + 1) * (w / 20), y, x + (i + 1) * (w / 20), y + h]}
              stroke="#94a3b8"
              strokeWidth={0.75}
              dash={[3, 3]}
            />
          ))}
          {Array.from({ length: 9 }).map((_, i) => (
            <Line
              key={`grid-y-${i}`}
              points={[x, y + (i + 1) * (h / 10), x + w, y + (i + 1) * (h / 10)]}
              stroke="#94a3b8"
              strokeWidth={0.75}
              dash={[3, 3]}
            />
          ))}
        </Group>
      )}

      {/* Sideline Bench Areas */}
      {/* Home Bench */}
      {(teamDisplayMode === 'both' || soloTeamSide === 'home') && (
        <Group>
          <Rect
            x={benchRectHome.x}
            y={benchRectHome.y}
            width={teamDisplayMode === 'single' ? pitchRect.width : benchRectHome.width}
            height={benchRectHome.height}
            fill="rgba(15, 23, 42, 0.75)"
            stroke="rgba(239, 68, 68, 0.4)"
            strokeWidth={1.5}
            cornerRadius={8}
          />
          <Text
            x={benchRectHome.x + 12}
            y={benchRectHome.y + 6}
            text={`${homeTeamName} Dugout (Bench)`}
            fontSize={11}
            fontFamily="system-ui, sans-serif"
            fontStyle="bold"
            fill="rgba(252, 165, 165, 0.9)"
          />
        </Group>
      )}

      {/* Away Bench */}
      {(teamDisplayMode === 'both' || soloTeamSide === 'away') && (
        <Group>
          <Rect
            x={teamDisplayMode === 'single' ? benchRectHome.x : benchRectAway.x}
            y={benchRectAway.y}
            width={teamDisplayMode === 'single' ? pitchRect.width : benchRectAway.width}
            height={benchRectAway.height}
            fill="rgba(15, 23, 42, 0.75)"
            stroke="rgba(59, 130, 246, 0.4)"
            strokeWidth={1.5}
            cornerRadius={8}
          />
          <Text
            x={(teamDisplayMode === 'single' ? benchRectHome.x : benchRectAway.x) + 12}
            y={benchRectAway.y + 6}
            text={`${awayTeamName} Dugout (Bench)`}
            fontSize={11}
            fontFamily="system-ui, sans-serif"
            fontStyle="bold"
            fill="rgba(147, 197, 253, 0.9)"
          />
        </Group>
      )}
    </Group>
  );
};

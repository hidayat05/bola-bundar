import React from 'react';
import { Group, Rect, Line, Circle, Arc, Text, Shape } from 'react-konva';
import { PitchSurface, PitchType, PitchView } from '../../types/tactics';
import { PitchLayout } from '../../utils/pitchGeometry';
import { getSportPitchMarkings } from '../../utils/setpieceUtils';
import { calculateTacticalZones } from '../../utils/pitchConfig';

interface PitchBackgroundProps {
  layout: PitchLayout;
  pitchType: PitchType;
  pitchView: PitchView;
  pitchSurface: PitchSurface;
  showGrid: boolean;
  gridColor?: string;
  showZones: boolean;
  zoneColor?: string;
  homeTeamName: string;
  awayTeamName: string;
  teamDisplayMode?: 'both' | 'single';
  soloTeamSide?: 'home' | 'away';
}

interface PenaltyArcHelperProps {
  boxLineX: number;
  spotY: number;
  radius: number;
  side: 'left' | 'right';
  pitchType: PitchType;
  lineColor: string;
  lineWidth: number;
  lineOpacity: number;
}

/**
 * Renders the D-arc (Penalty Arc) outside the penalty area.
 * Radius is strictly scaled to the official pitch ratio (9.15m for 11v11, 7.0m for Mini Soccer),
 * guaranteeing that both ends meet the vertical penalty box edge precisely without overlapping inside.
 */
const PenaltyArcHelper: React.FC<PenaltyArcHelperProps> = ({
  boxLineX,
  spotY,
  radius,
  side,
  pitchType,
  lineColor,
  lineWidth,
  lineOpacity,
}) => {
  if (pitchType === 'futsal') return null; // Futsal has no D-arc
  if (radius <= 1) return null;

  // Real-world physical ratio: distance from penalty mark to penalty area line is 5.5m (11v11) or 4.0m (Mini Soccer)
  const dRatio = pitchType === 'mini-soccer' ? 4.0 / 7.0 : 5.5 / 9.15;
  const d = radius * dRatio;

  // Center of the circle (penalty spot):
  // If side === 'left': penalty box is to the right, arc curves to the left, spot is at boxLineX + d
  // If side === 'right': penalty box is to the left, arc curves to the right, spot is at boxLineX - d
  const spotX = side === 'left' ? boxLineX + d : boxLineX - d;

  // Exact angle alpha where circle of radius R intersects vertical line at distance d from center:
  // cos(alpha) = d / radius = dRatio
  const cosAlpha = Math.min(0.999, Math.max(0.001, dRatio));
  const alphaDeg = (Math.acos(cosAlpha) * 180) / Math.PI;

  const rotation = side === 'left' ? 180 - alphaDeg : -alphaDeg;
  const sweepAngle = 2 * alphaDeg;

  return (
    <Arc
      x={spotX}
      y={spotY}
      innerRadius={radius}
      outerRadius={radius}
      angle={sweepAngle}
      rotation={rotation}
      stroke={lineColor}
      strokeWidth={lineWidth}
      opacity={lineOpacity}
      lineCap="butt"
      listening={false}
    />
  );
};

interface FutsalPenaltyAreaProps {
  side: 'left' | 'right';
  goalLineX: number;
  pitchY: number;
  pitchH: number;
  goalWidth: number;
  radiusX: number; // 6m in pixels X
  radiusY: number; // 6m in pixels Y
  lineColor: string;
  lineWidth: number;
  lineOpacity: number;
}

/**
 * Official FIFA Futsal 6-meter Penalty Area:
 * Formed by two quarter-circles of radius 6m radiating from the outer edge of each goalpost,
 * connected by a 3m line parallel to the goal line between the posts.
 */
const FutsalPenaltyArea: React.FC<FutsalPenaltyAreaProps> = ({
  side,
  goalLineX,
  pitchY,
  pitchH,
  goalWidth,
  radiusX,
  radiusY,
  lineColor,
  lineWidth,
  lineOpacity,
}) => {
  const centerY = pitchY + pitchH / 2;
  const topPostY = centerY - goalWidth / 2;
  const btmPostY = centerY + goalWidth / 2;

  return (
    <Shape
      sceneFunc={(context, shape) => {
        context.beginPath();
        if (side === 'left') {
          // Top quarter circle from goal line down to 6m line
          context.ellipse(goalLineX, topPostY, radiusX, radiusY, 0, -Math.PI / 2, 0, false);
          // 3m straight line connecting posts at 6m depth
          context.lineTo(goalLineX + radiusX, btmPostY);
          // Bottom quarter circle from 6m line back to goal line
          context.ellipse(goalLineX, btmPostY, radiusX, radiusY, 0, 0, Math.PI / 2, false);
        } else {
          // Right goal
          // Top quarter circle radiating to the left
          context.ellipse(goalLineX, topPostY, radiusX, radiusY, 0, -Math.PI / 2, Math.PI, true);
          // 3m straight line connecting posts at 6m depth
          context.lineTo(goalLineX - radiusX, btmPostY);
          // Bottom quarter circle radiating back to goal line
          context.ellipse(goalLineX, btmPostY, radiusX, radiusY, 0, Math.PI, Math.PI / 2, true);
        }
        context.fillStrokeShape(shape);
      }}
      stroke={lineColor}
      strokeWidth={lineWidth}
      opacity={lineOpacity}
      listening={false}
    />
  );
};

interface GoalFrameProps {
  side: 'left' | 'right';
  goalLineX: number;
  pitchY: number;
  pitchH: number;
  goalWidth: number;
  goalDepth: number;
  lineWidth: number;
}

/**
 * Renders physical goal frame (posts & net) strictly proportioned to sport standards:
 * - Sepak Bola (11v11): 7.32m width x 2.44m depth
 * - Mini Soccer: 5.0m width x 1.8m depth
 * - Futsal: 3.0m width x 1.0m depth
 */
const GoalFrame: React.FC<GoalFrameProps> = ({
  side,
  goalLineX,
  pitchY,
  pitchH,
  goalWidth,
  goalDepth,
  lineWidth,
}) => {
  const topPostY = pitchY + (pitchH - goalWidth) / 2;
  const btmPostY = topPostY + goalWidth;
  const netX = side === 'left' ? goalLineX - goalDepth : goalLineX;
  const postRadius = Math.max(2.5, lineWidth * 1.1);

  // Subtle internal net gridlines
  const netGridLines = [];
  const horizSteps = 3;
  for (let i = 1; i < horizSteps; i++) {
    const yLine = topPostY + (goalWidth * i) / horizSteps;
    netGridLines.push(
      <Line
        key={`net-h-${i}`}
        points={[netX, yLine, netX + goalDepth, yLine]}
        stroke="rgba(255, 255, 255, 0.22)"
        strokeWidth={1}
        listening={false}
      />
    );
  }
  const vertSteps = Math.max(2, Math.round(goalDepth / 6));
  for (let i = 1; i < vertSteps; i++) {
    const xLine = netX + (goalDepth * i) / vertSteps;
    netGridLines.push(
      <Line
        key={`net-v-${i}`}
        points={[xLine, topPostY, xLine, btmPostY]}
        stroke="rgba(255, 255, 255, 0.18)"
        strokeWidth={1}
        listening={false}
      />
    );
  }

  return (
    <Group listening={false}>
      {/* Translucent net back mesh */}
      <Rect
        x={netX}
        y={topPostY}
        width={goalDepth}
        height={goalWidth}
        fill="rgba(255, 255, 255, 0.12)"
        stroke="rgba(255, 255, 255, 0.75)"
        strokeWidth={1.5}
        cornerRadius={side === 'left' ? [4, 0, 0, 4] : [0, 4, 4, 0]}
      />
      {/* Net gridlines */}
      {netGridLines}
      {/* Physical Goal Posts on the Goal Line */}
      <Circle
        x={goalLineX}
        y={topPostY}
        radius={postRadius}
        fill="#ffffff"
        stroke="#1e293b"
        strokeWidth={1}
      />
      <Circle
        x={goalLineX}
        y={btmPostY}
        radius={postRadius}
        fill="#ffffff"
        stroke="#1e293b"
        strokeWidth={1}
      />
    </Group>
  );
};

export const PitchBackground: React.FC<PitchBackgroundProps> = React.memo(({
  layout,
  pitchType,
  pitchView,
  pitchSurface,
  showGrid,
  gridColor = '#94a3b8',
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
  const lineOpacity = 0.85;
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
  const markings = getSportPitchMarkings(pitchType, pitchView, w, h);
  const futsalRadiusY = h * (6.0 / 20.0);

  // Mowed lawn stripes (vertical strips proportional to physical pitch length)
  const stripeCount =
    pitchView === 'third'
      ? (pitchType === 'futsal' ? 2 : pitchType === 'mini-soccer' ? 3 : 4)
      : pitchView === 'half'
      ? (pitchType === 'futsal' ? 4 : pitchType === 'mini-soccer' ? 4 : 6)
      : pitchType === 'futsal'
      ? 6
      : pitchType === 'mini-soccer'
      ? 8
      : 12;
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
            radius={markings.centerRadius}
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

          {/* Penalty Areas & Goals */}
          {markings.isFutsalPenaltyArea ? (
            <>
              {/* Futsal Left Penalty Area (6m D-shape) */}
              <FutsalPenaltyArea
                side="left"
                goalLineX={x}
                pitchY={y}
                pitchH={h}
                goalWidth={markings.goalWidth}
                radiusX={markings.penaltySpotDist}
                radiusY={futsalRadiusY}
                lineColor={lineColor}
                lineWidth={lineWidth}
                lineOpacity={lineOpacity}
              />

              {/* Futsal Right Penalty Area (6m D-shape) */}
              <FutsalPenaltyArea
                side="right"
                goalLineX={x + w}
                pitchY={y}
                pitchH={h}
                goalWidth={markings.goalWidth}
                radiusX={markings.penaltySpotDist}
                radiusY={futsalRadiusY}
                lineColor={lineColor}
                lineWidth={lineWidth}
                lineOpacity={lineOpacity}
              />

              {/* Futsal Left 10m Second Penalty Mark */}
              <Circle
                x={x + markings.secondPenaltyDist}
                y={y + h / 2}
                radius={lineWidth * 1.3}
                fill={lineColor}
                opacity={lineOpacity}
              />

              {/* Futsal Right 10m Second Penalty Mark */}
              <Circle
                x={x + w - markings.secondPenaltyDist}
                y={y + h / 2}
                radius={lineWidth * 1.3}
                fill={lineColor}
                opacity={lineOpacity}
              />
            </>
          ) : (
            <>
              {/* Left Penalty Area */}
              <Rect
                x={x}
                y={y + (h - markings.penaltyBoxWidth) / 2}
                width={markings.penaltyBoxDepth}
                height={markings.penaltyBoxWidth}
                stroke={lineColor}
                strokeWidth={lineWidth}
                opacity={lineOpacity}
              />

              {/* Right Penalty Area */}
              <Rect
                x={x + w - markings.penaltyBoxDepth}
                y={y + (h - markings.penaltyBoxWidth) / 2}
                width={markings.penaltyBoxDepth}
                height={markings.penaltyBoxWidth}
                stroke={lineColor}
                strokeWidth={lineWidth}
                opacity={lineOpacity}
              />

              {/* Left & Right 6-yard Goal Area */}
              {markings.hasGoalArea && (
                <>
                  <Rect
                    x={x}
                    y={y + (h - markings.goalAreaWidth) / 2}
                    width={markings.goalAreaDepth}
                    height={markings.goalAreaWidth}
                    stroke={lineColor}
                    strokeWidth={lineWidth}
                    opacity={lineOpacity}
                  />
                  <Rect
                    x={x + w - markings.goalAreaDepth}
                    y={y + (h - markings.goalAreaWidth) / 2}
                    width={markings.goalAreaDepth}
                    height={markings.goalAreaWidth}
                    stroke={lineColor}
                    strokeWidth={lineWidth}
                    opacity={lineOpacity}
                  />
                </>
              )}

              {/* Left Penalty Arc (D) */}
              <PenaltyArcHelper
                boxLineX={x + markings.penaltyBoxDepth}
                spotY={y + h / 2}
                radius={markings.centerRadius}
                side="right"
                pitchType={pitchType}
                lineColor={lineColor}
                lineWidth={lineWidth}
                lineOpacity={lineOpacity}
              />

              {/* Right Penalty Arc (D) */}
              <PenaltyArcHelper
                boxLineX={x + w - markings.penaltyBoxDepth}
                spotY={y + h / 2}
                radius={markings.centerRadius}
                side="left"
                pitchType={pitchType}
                lineColor={lineColor}
                lineWidth={lineWidth}
                lineOpacity={lineOpacity}
              />
            </>
          )}

          {/* Left Penalty Spot */}
          <Circle
            x={x + markings.penaltySpotDist}
            y={y + h / 2}
            radius={lineWidth * 1.4}
            fill={lineColor}
            opacity={lineOpacity}
          />

          {/* Right Penalty Spot */}
          <Circle
            x={x + w - markings.penaltySpotDist}
            y={y + h / 2}
            radius={lineWidth * 1.4}
            fill={lineColor}
            opacity={lineOpacity}
          />

          {/* Left Goal Frame */}
          <GoalFrame
            side="left"
            goalLineX={x}
            pitchY={y}
            pitchH={h}
            goalWidth={markings.goalWidth}
            goalDepth={markings.goalDepth}
            lineWidth={lineWidth}
          />

          {/* Right Goal Frame */}
          <GoalFrame
            side="right"
            goalLineX={x + w}
            pitchY={y}
            pitchH={h}
            goalWidth={markings.goalWidth}
            goalDepth={markings.goalDepth}
            lineWidth={lineWidth}
          />

          {/* Corner Arcs */}
          <Arc
            x={x}
            y={y}
            innerRadius={markings.cornerArcRadius}
            outerRadius={markings.cornerArcRadius}
            angle={90}
            rotation={0}
            stroke={lineColor}
            strokeWidth={lineWidth}
            opacity={lineOpacity}
          />
          <Arc
            x={x}
            y={y + h}
            innerRadius={markings.cornerArcRadius}
            outerRadius={markings.cornerArcRadius}
            angle={90}
            rotation={270}
            stroke={lineColor}
            strokeWidth={lineWidth}
            opacity={lineOpacity}
          />
          <Arc
            x={x + w}
            y={y}
            innerRadius={markings.cornerArcRadius}
            outerRadius={markings.cornerArcRadius}
            angle={90}
            rotation={90}
            stroke={lineColor}
            strokeWidth={lineWidth}
            opacity={lineOpacity}
          />
          <Arc
            x={x + w}
            y={y + h}
            innerRadius={markings.cornerArcRadius}
            outerRadius={markings.cornerArcRadius}
            angle={90}
            rotation={180}
            stroke={lineColor}
            strokeWidth={lineWidth}
            opacity={lineOpacity}
          />
        </>
      ) : pitchView === 'third' ? (
        /* Final-Third (Box Zoom) Mode Markings */
        <>
          {/* Left Final-Third Boundary Line */}
          <Line
            points={[x, y, x, y + h]}
            stroke={lineColor}
            strokeWidth={lineWidth}
            opacity={lineOpacity}
          />

          {/* Penalty Area */}
          {markings.isFutsalPenaltyArea ? (
            <>
              {/* Futsal Right Penalty Area (6m D-shape) */}
              <FutsalPenaltyArea
                side="right"
                goalLineX={x + w}
                pitchY={y}
                pitchH={h}
                goalWidth={markings.goalWidth}
                radiusX={markings.penaltySpotDist}
                radiusY={futsalRadiusY}
                lineColor={lineColor}
                lineWidth={lineWidth}
                lineOpacity={lineOpacity}
              />
              {/* Futsal 10m Second Penalty Mark (if within final third view) */}
              {x + w - markings.secondPenaltyDist >= x && (
                <Circle
                  x={x + w - markings.secondPenaltyDist}
                  y={y + h / 2}
                  radius={lineWidth * 1.3}
                  fill={lineColor}
                  opacity={lineOpacity}
                />
              )}
            </>
          ) : (
            <>
              {/* Penalty Box (18-yard box) */}
              <Rect
                x={x + w - markings.penaltyBoxDepth}
                y={y + (h - markings.penaltyBoxWidth) / 2}
                width={markings.penaltyBoxDepth}
                height={markings.penaltyBoxWidth}
                stroke={lineColor}
                strokeWidth={lineWidth}
                opacity={lineOpacity}
              />

              {/* 6-yard Goal Area */}
              {markings.hasGoalArea && (
                <Rect
                  x={x + w - markings.goalAreaDepth}
                  y={y + (h - markings.goalAreaWidth) / 2}
                  width={markings.goalAreaDepth}
                  height={markings.goalAreaWidth}
                  stroke={lineColor}
                  strokeWidth={lineWidth}
                  opacity={lineOpacity}
                />
              )}

              {/* Penalty Arc (D) */}
              <PenaltyArcHelper
                boxLineX={x + w - markings.penaltyBoxDepth}
                spotY={y + h / 2}
                radius={markings.centerRadius}
                side="left"
                pitchType={pitchType}
                lineColor={lineColor}
                lineWidth={lineWidth}
                lineOpacity={lineOpacity}
              />
            </>
          )}

          {/* Penalty Spot */}
          <Circle
            x={x + w - markings.penaltySpotDist}
            y={y + h / 2}
            radius={lineWidth * 1.4}
            fill={lineColor}
            opacity={lineOpacity}
          />

          {/* Corner Arcs (Top-Right & Bottom-Right) */}
          <Arc
            x={x + w}
            y={y}
            innerRadius={markings.cornerArcRadius}
            outerRadius={markings.cornerArcRadius}
            angle={90}
            rotation={90}
            stroke={lineColor}
            strokeWidth={lineWidth}
            opacity={lineOpacity}
          />
          <Arc
            x={x + w}
            y={y + h}
            innerRadius={markings.cornerArcRadius}
            outerRadius={markings.cornerArcRadius}
            angle={90}
            rotation={180}
            stroke={lineColor}
            strokeWidth={lineWidth}
            opacity={lineOpacity}
          />

          {/* Right Goal Frame */}
          <GoalFrame
            side="right"
            goalLineX={x + w}
            pitchY={y}
            pitchH={h}
            goalWidth={markings.goalWidth}
            goalDepth={markings.goalDepth}
            lineWidth={lineWidth}
          />

          {/* Subtle Final-Third Watermark */}
          <Text
            x={x + 12}
            y={y + 12}
            text="FINAL-THIRD (BOX ZOOM)"
            fontSize={10}
            fontFamily="system-ui, sans-serif"
            fontStyle="bold"
            fill={lineColor}
            opacity={0.3}
            listening={false}
          />
        </>
      ) : (
        /* Half Pitch Mode Markings */
        <>
          {/* Halfway Line on Left Boundary */}
          <Line
            points={[x, y, x, y + h]}
            stroke={lineColor}
            strokeWidth={lineWidth}
            opacity={lineOpacity}
          />

          {/* Halfway Arc from left boundary */}
          <Arc
            x={x}
            y={y + h / 2}
            innerRadius={markings.centerRadius}
            outerRadius={markings.centerRadius}
            angle={180}
            rotation={-90}
            stroke={lineColor}
            strokeWidth={lineWidth}
            opacity={lineOpacity}
          />
          <Circle
            x={x}
            y={y + h / 2}
            radius={lineWidth * 1.4}
            fill={lineColor}
            opacity={lineOpacity}
          />

          {/* Attacking Goal End (Right Side) */}
          {markings.isFutsalPenaltyArea ? (
            <>
              {/* Futsal Right Penalty Area (6m D-shape) */}
              <FutsalPenaltyArea
                side="right"
                goalLineX={x + w}
                pitchY={y}
                pitchH={h}
                goalWidth={markings.goalWidth}
                radiusX={markings.penaltySpotDist}
                radiusY={futsalRadiusY}
                lineColor={lineColor}
                lineWidth={lineWidth}
                lineOpacity={lineOpacity}
              />
              {/* Futsal 10m Second Penalty Mark */}
              <Circle
                x={x + w - markings.secondPenaltyDist}
                y={y + h / 2}
                radius={lineWidth * 1.3}
                fill={lineColor}
                opacity={lineOpacity}
              />
            </>
          ) : (
            <>
              {/* Penalty Box */}
              <Rect
                x={x + w - markings.penaltyBoxDepth}
                y={y + (h - markings.penaltyBoxWidth) / 2}
                width={markings.penaltyBoxDepth}
                height={markings.penaltyBoxWidth}
                stroke={lineColor}
                strokeWidth={lineWidth}
                opacity={lineOpacity}
              />

              {/* 6-yard Goal Area */}
              {markings.hasGoalArea && (
                <Rect
                  x={x + w - markings.goalAreaDepth}
                  y={y + (h - markings.goalAreaWidth) / 2}
                  width={markings.goalAreaDepth}
                  height={markings.goalAreaWidth}
                  stroke={lineColor}
                  strokeWidth={lineWidth}
                  opacity={lineOpacity}
                />
              )}

              {/* Penalty Arc (D) */}
              <PenaltyArcHelper
                boxLineX={x + w - markings.penaltyBoxDepth}
                spotY={y + h / 2}
                radius={markings.centerRadius}
                side="left"
                pitchType={pitchType}
                lineColor={lineColor}
                lineWidth={lineWidth}
                lineOpacity={lineOpacity}
              />
            </>
          )}

          {/* Penalty Spot */}
          <Circle
            x={x + w - markings.penaltySpotDist}
            y={y + h / 2}
            radius={lineWidth * 1.4}
            fill={lineColor}
            opacity={lineOpacity}
          />

          {/* Corner Arcs (Top-Right & Bottom-Right) */}
          <Arc
            x={x + w}
            y={y}
            innerRadius={markings.cornerArcRadius}
            outerRadius={markings.cornerArcRadius}
            angle={90}
            rotation={90}
            stroke={lineColor}
            strokeWidth={lineWidth}
            opacity={lineOpacity}
          />
          <Arc
            x={x + w}
            y={y + h}
            innerRadius={markings.cornerArcRadius}
            outerRadius={markings.cornerArcRadius}
            angle={90}
            rotation={180}
            stroke={lineColor}
            strokeWidth={lineWidth}
            opacity={lineOpacity}
          />

          {/* Right Goal Frame */}
          <GoalFrame
            side="right"
            goalLineX={x + w}
            pitchY={y}
            pitchH={h}
            goalWidth={markings.goalWidth}
            goalDepth={markings.goalDepth}
            lineWidth={lineWidth}
          />
        </>
      )}

      {/* Tactical Zones Overlay (18-Zone grid / Half-spaces) */}
      {showZones && (() => {
        const { cells, colLines, rowLines } = calculateTacticalZones(pitchView, x, y, w, h);
        return (
          <Group listening={false}>
            {/* Vertical dividing lines */}
            {colLines.map((colX, idx) => (
              <Line
                key={`zone-col-${idx}`}
                points={[colX, y, colX, y + h]}
                stroke={zoneColor}
                strokeWidth={1.5}
                dash={[6, 6]}
                opacity={0.65}
              />
            ))}
            {/* Horizontal dividing lines (Flanks & Central corridor) */}
            {rowLines.map((rowY, idx) => (
              <Line
                key={`zone-row-${idx}`}
                points={[x, rowY, x + w, rowY]}
                stroke={zoneColor}
                strokeWidth={1.5}
                dash={[6, 6]}
                opacity={0.65}
              />
            ))}

            {/* Tactical Zone Cells with Consistent Absolute Zone Numbering */}
            {cells.map((cell) => (
              <Group key={`zone-cell-${cell.zoneNum}`}>
                {/* Subtle tint for Zone 14 (Golden Playmaker zone) */}
                {cell.isZone14 && (
                  <Rect
                    x={cell.x + 2}
                    y={cell.y + 2}
                    width={cell.width - 4}
                    height={cell.height - 4}
                    fill={zoneColor}
                    opacity={0.12}
                    cornerRadius={4}
                  />
                )}
                {/* Zone Number */}
                <Text
                  x={cell.x}
                  y={cell.y + cell.height * 0.4}
                  width={cell.width}
                  text={cell.label}
                  align="center"
                  fontSize={Math.max(10, Math.min(18, Math.round(cell.width * 0.15)))}
                  fontStyle="bold"
                  fill={zoneColor}
                  opacity={cell.isZone14 ? 0.9 : 0.5}
                />
              </Group>
            ))}
          </Group>
        );
      })()}

      {/* Grid Overlay */}
      {showGrid && (
        <Group opacity={0.35}>
          {Array.from({ length: 19 }).map((_, i) => (
            <Line
              key={`grid-x-${i}`}
              points={[x + (i + 1) * (w / 20), y, x + (i + 1) * (w / 20), y + h]}
              stroke={gridColor}
              strokeWidth={0.75}
              dash={[3, 3]}
            />
          ))}
          {Array.from({ length: 9 }).map((_, i) => (
            <Line
              key={`grid-y-${i}`}
              points={[x, y + (i + 1) * (h / 10), x + w, y + (i + 1) * (h / 10)]}
              stroke={gridColor}
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
            x={benchRectHome.x}
            y={benchRectHome.y + (benchRectHome.height < 30 ? 4 : 6)}
            width={teamDisplayMode === 'single' ? pitchRect.width : benchRectHome.width}
            text={`${homeTeamName} Dugout (Bench)`}
            fontSize={benchRectHome.height < 30 ? 9.5 : 11}
            fontFamily="system-ui, sans-serif"
            fontStyle="bold"
            align="center"
            fill="rgba(252, 165, 165, 0.95)"
            ellipsis={true}
            wrap="none"
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
            x={teamDisplayMode === 'single' ? benchRectHome.x : benchRectAway.x}
            y={benchRectAway.y + (benchRectAway.height < 30 ? 4 : 6)}
            width={teamDisplayMode === 'single' ? pitchRect.width : benchRectAway.width}
            text={`${awayTeamName} Dugout (Bench)`}
            fontSize={benchRectAway.height < 30 ? 9.5 : 11}
            fontFamily="system-ui, sans-serif"
            fontStyle="bold"
            align="center"
            fill="rgba(147, 197, 253, 0.95)"
            ellipsis={true}
            wrap="none"
          />
        </Group>
      )}
    </Group>
  );
});

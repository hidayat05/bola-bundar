import React, { useMemo, useState, useEffect } from 'react';
import { Group, Line, Rect, Text, Circle } from 'react-konva';
import { PitchLayout, normToCanvas } from '../../utils/pitchGeometry';
import { PlayerToken, BallToken, PitchType, PositionalGridMode } from '../../types/tactics';
import { soundEffects } from '../../utils/soundEffects';

interface PositionalGridOverlayProps {
  layout: PitchLayout;
  pitchType: PitchType;
  players: PlayerToken[];
  ball: BallToken;
  gridMode: PositionalGridMode;
  showRestDefense: boolean;
  showFutsal4Sec: boolean;
  soundEnabled: boolean;
  showPassingLanes?: boolean;
}

interface CorridorDef {
  name: string;
  nameEn: string;
  yMin: number;
  yMax: number;
  isHalfSpace: boolean;
}

const CORRIDORS: CorridorDef[] = [
  { name: 'Sayap Kiri', nameEn: 'Left Wing', yMin: 0, yMax: 18, isHalfSpace: false },
  { name: 'Half-Space Kiri', nameEn: 'L. Half-Space', yMin: 18, yMax: 38, isHalfSpace: true },
  { name: 'Koridor Tengah', nameEn: 'Center', yMin: 38, yMax: 62, isHalfSpace: false },
  { name: 'Half-Space Kanan', nameEn: 'R. Half-Space', yMin: 62, yMax: 82, isHalfSpace: true },
  { name: 'Sayap Kanan', nameEn: 'Right Wing', yMin: 82, yMax: 100, isHalfSpace: false },
];

const ZONE_X_BOUNDS = [0, 18, 50, 82, 100];

export const PositionalGridOverlay: React.FC<PositionalGridOverlayProps> = React.memo(({
  layout,
  pitchType,
  players,
  ball,
  gridMode,
  showRestDefense,
  showFutsal4Sec,
  soundEnabled,
  showPassingLanes = false,
}) => {
  const { pitchRect } = layout;

  // 1. Calculate Corridor Player Distribution and Violations (Juego de Posicion rule: max 2 players per corridor)
  const corridorStats = useMemo(() => {
    if (gridMode === 'none') return [];

    const activeHomePlayers = players.filter((p) => !p.isBench && p.team === 'home' && !p.isGoalkeeper);

    return CORRIDORS.map((corridor, idx) => {
      const playersInCorridor = activeHomePlayers.filter(
        (p) => p.y >= corridor.yMin && p.y < corridor.yMax
      );
      const isOverloaded = playersInCorridor.length > 2;
      return {
        ...corridor,
        index: idx,
        count: playersInCorridor.length,
        isOverloaded,
        playerIds: playersInCorridor.map((p) => p.id),
      };
    });
  }, [gridMode, players]);

  // 2. Calculate Rest Defense Structure (players behind the ball during attack)
  const restDefenseData = useMemo(() => {
    if (!showRestDefense) return null;

    const activeHomePlayers = players.filter((p) => !p.isBench && p.team === 'home' && !p.isGoalkeeper);
    // Rest defense players are stationed behind or level with the ball position
    const behindBall = activeHomePlayers.filter((p) => p.x <= Math.max(25, ball.x + 4));

    if (behindBall.length < 2) return null;

    // Sort by X to determine structure e.g. 3+2 or 2+3
    const sorted = [...behindBall].sort((a, b) => a.x - b.x);
    const deepestCount = sorted.filter((p) => p.x <= sorted[0].x + 12).length;
    const secondLineCount = sorted.length - deepestCount;
    const structureLabel = secondLineCount > 0 ? `${deepestCount}+${secondLineCount}` : `${sorted.length}`;

    // Compute bounding box
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    behindBall.forEach((p) => {
      const pos = normToCanvas(p.x, p.y, false, p.team, layout);
      minX = Math.min(minX, pos.x);
      maxX = Math.max(maxX, pos.x);
      minY = Math.min(minY, pos.y);
      maxY = Math.max(maxY, pos.y);
    });

    const isSecure = behindBall.length >= 4;
    return {
      count: behindBall.length,
      structureLabel,
      isSecure,
      bounds: {
        x: minX - 18,
        y: minY - 18,
        width: Math.max(48, maxX - minX + 36),
        height: Math.max(36, maxY - minY + 36),
      },
    };
  }, [showRestDefense, players, ball.x, layout]);

  // 3. Passing Lanes Analysis (Open vs Blocked Lines)
  const passingLanes = useMemo(() => {
    if (!showPassingLanes) return [];

    const activePlayers = players.filter((p) => !p.isBench);
    if (activePlayers.length < 2) return [];

    // Find ball carrier (closest player within 20% of pitch)
    let carrier: PlayerToken | null = null;
    let minBallDist = Infinity;
    for (const p of activePlayers) {
      const d = Math.hypot(p.x - ball.x, p.y - ball.y);
      if (d < minBallDist && d <= 20) {
        minBallDist = d;
        carrier = p;
      }
    }
    if (!carrier) return [];

    const carrierPos = normToCanvas(carrier.x, carrier.y, false, carrier.team, layout);
    const teammates = activePlayers.filter((p) => p.team === carrier!.team && p.id !== carrier!.id);
    const opponents = activePlayers.filter((p) => p.team !== carrier!.team);

    const interceptThresholdCanvas = 22; // ~1.5 - 2 meters in canvas pixels

    return teammates.map((mate) => {
      const matePos = normToCanvas(mate.x, mate.y, false, mate.team, layout);
      const dx = matePos.x - carrierPos.x;
      const dy = matePos.y - carrierPos.y;
      const lenSq = dx * dx + dy * dy;

      let isBlocked = false;
      let interceptPt: { x: number; y: number } | null = null;

      if (lenSq > 10) {
        for (const opp of opponents) {
          const oppPos = normToCanvas(opp.x, opp.y, false, opp.team, layout);
          // Calculate projection of opp onto line segment [carrierPos, matePos]
          const t = ((oppPos.x - carrierPos.x) * dx + (oppPos.y - carrierPos.y) * dy) / lenSq;
          if (t > 0.08 && t < 0.92) {
            const projX = carrierPos.x + t * dx;
            const projY = carrierPos.y + t * dy;
            const dist = Math.hypot(oppPos.x - projX, oppPos.y - projY);
            if (dist <= interceptThresholdCanvas) {
              isBlocked = true;
              interceptPt = { x: projX, y: projY };
              break;
            }
          }
        }
      }

      return {
        id: `lane-${carrier!.id}-${mate.id}`,
        from: carrierPos,
        to: matePos,
        isBlocked,
        interceptPt,
      };
    });
  }, [showPassingLanes, players, ball, layout]);

  // 4. Zone 14 Analysis (Center attacking space between midfield & box: X: 50%-82%, Y: 38%-62%)
  const zone14Data = useMemo(() => {
    if (gridMode !== '20-zones') return null;

    const xMin = pitchRect.x + 0.5 * pitchRect.width;
    const xMax = pitchRect.x + 0.82 * pitchRect.width;
    const yMin = pitchRect.y + 0.38 * pitchRect.height;
    const yMax = pitchRect.y + 0.62 * pitchRect.height;
    const w = xMax - xMin;
    const h = yMax - yMin;

    const attackersInZ14 = players.filter(
      (p) => !p.isBench && p.team === 'home' && p.x >= 50 && p.x <= 82 && p.y >= 38 && p.y <= 62
    );
    const defendersInZ14 = players.filter(
      (p) => !p.isBench && p.team === 'away' && p.x >= 50 && p.x <= 82 && p.y >= 38 && p.y <= 62
    );
    const isBallInZ14 = ball.x >= 50 && ball.x <= 82 && ball.y >= 38 && ball.y <= 62;

    return {
      x: xMin,
      y: yMin,
      width: w,
      height: h,
      attackersCount: attackersInZ14.length,
      defendersCount: defendersInZ14.length,
      isBallInZ14,
    };
  }, [gridMode, pitchRect, players, ball]);

  // 3. Futsal 4-Second Rule Interactive Timer
  const [futsalTimer, setFutsalTimer] = useState<number>(4.0);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    if (!showFutsal4Sec) {
      setTimerRunning(false);
      setFutsalTimer(4.0);
      return;
    }
  }, [showFutsal4Sec]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (timerRunning && futsalTimer > 0) {
      interval = setInterval(() => {
        setFutsalTimer((prev) => {
          const next = Math.max(0, Math.round((prev - 0.1) * 10) / 10);
          if (next <= 0) {
            setTimerRunning(false);
            if (soundEnabled) soundEffects.playWhistle(0.3, 0.25);
          }
          return next;
        });
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, futsalTimer, soundEnabled]);

  const handleToggleTimer = () => {
    if (futsalTimer <= 0) {
      setFutsalTimer(4.0);
      setTimerRunning(true);
      if (soundEnabled) soundEffects.playClick();
    } else {
      setTimerRunning(!timerRunning);
      if (soundEnabled) soundEffects.playClick();
    }
  };

  const isMobile = layout.containerWidth < 768;

  return (
    <Group listening={false}>
      {/* A. 5 Vertical Corridors / 20 Positional Play Zones */}
      {gridMode !== 'none' && (
        <Group listening={false}>
          {/* Corridor Shading & Guidelines */}
          {CORRIDORS.map((corridor, idx) => {
            const startY = pitchRect.y + (corridor.yMin / 100) * pitchRect.height;
            const endY = pitchRect.y + (corridor.yMax / 100) * pitchRect.height;
            const h = endY - startY;
            const stats = corridorStats[idx];

            // Half-spaces have a subtle platinum tactical tint to draw attention
            const bgFill = stats?.isOverloaded
              ? 'rgba(239, 68, 68, 0.12)'
              : corridor.isHalfSpace
              ? 'rgba(56, 189, 248, 0.045)'
              : 'transparent';

            return (
              <Group key={`corridor-${idx}`}>
                {/* Corridor Area Fill */}
                <Rect
                  x={pitchRect.x}
                  y={startY}
                  width={pitchRect.width}
                  height={h}
                  fill={bgFill}
                  listening={false}
                />

                {/* Corridor Horizontal Divider Line */}
                {idx > 0 && (
                  <Line
                    points={[pitchRect.x, startY, pitchRect.x + pitchRect.width, startY]}
                    stroke={corridor.isHalfSpace ? 'rgba(56, 189, 248, 0.45)' : 'rgba(255, 255, 255, 0.28)'}
                    strokeWidth={corridor.isHalfSpace ? 1.4 : 1.1}
                    dash={corridor.isHalfSpace ? [8, 4] : [5, 5]}
                    listening={false}
                  />
                )}

                {/* Corridor Label on Left Edge */}
                {!isMobile && (
                  <Text
                    text={`${corridor.name} (${stats?.count || 0})`}
                    x={pitchRect.x + 8}
                    y={startY + h / 2 - 5}
                    fontSize={9}
                    fontFamily="system-ui, sans-serif"
                    fontStyle="bold"
                    fill={stats?.isOverloaded ? '#fca5a5' : corridor.isHalfSpace ? '#7dd3fc' : 'rgba(255, 255, 255, 0.55)'}
                    listening={false}
                  />
                )}

                {/* Overload Alert Badge */}
                {stats?.isOverloaded && (
                  <Group x={pitchRect.x + pitchRect.width / 2} y={startY + h / 2}>
                    <Rect
                      x={-75}
                      y={-10}
                      width={150}
                      height={20}
                      cornerRadius={5}
                      fill="rgba(220, 38, 38, 0.92)"
                      stroke="#fca5a5"
                      strokeWidth={1}
                      shadowColor="#000"
                      shadowBlur={6}
                      shadowOpacity={0.5}
                    />
                    <Text
                      text={`⚠️ ${corridor.name}: ${stats.count} Pemain (>2)`}
                      x={-75}
                      y={-4.5}
                      width={150}
                      align="center"
                      fontSize={8.5}
                      fontFamily="system-ui, sans-serif"
                      fontStyle="bold"
                      fill="#ffffff"
                    />
                  </Group>
                )}
              </Group>
            );
          })}

          {/* Vertical Zone Dividers for 20-Zone Mode */}
          {gridMode === '20-zones' && (
            <Group listening={false}>
              {ZONE_X_BOUNDS.slice(1, -1).map((xNorm, zIdx) => {
                const posX = pitchRect.x + (xNorm / 100) * pitchRect.width;
                return (
                  <Line
                    key={`zone-line-${zIdx}`}
                    points={[posX, pitchRect.y, posX, pitchRect.y + pitchRect.height]}
                    stroke="rgba(245, 158, 11, 0.35)"
                    strokeWidth={1.2}
                    dash={[6, 6]}
                    listening={false}
                  />
                );
              })}

              {/* Highlight Golden Zone 14 (The Critical Assist Area) */}
              {zone14Data && (
                <Group listening={false}>
                  <Rect
                    x={zone14Data.x}
                    y={zone14Data.y}
                    width={zone14Data.width}
                    height={zone14Data.height}
                    fill={zone14Data.isBallInZ14 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.07)'}
                    stroke="rgba(245, 158, 11, 0.85)"
                    strokeWidth={1.8}
                    dash={[8, 4]}
                    listening={false}
                  />
                  {/* Zone 14 Badge */}
                  <Group x={zone14Data.x + zone14Data.width / 2} y={zone14Data.y + 14}>
                    <Rect
                      x={-55}
                      y={-9}
                      width={110}
                      height={18}
                      cornerRadius={5}
                      fill="rgba(15, 23, 42, 0.92)"
                      stroke="#f59e0b"
                      strokeWidth={1}
                      shadowColor="#f59e0b"
                      shadowBlur={6}
                      shadowOpacity={0.4}
                    />
                    <Text
                      text={`⭐ ZONA 14 (${zone14Data.attackersCount}v${zone14Data.defendersCount})`}
                      x={-55}
                      y={-4.5}
                      width={110}
                      align="center"
                      fontSize={8.5}
                      fontFamily="system-ui, sans-serif"
                      fontStyle="bold"
                      fill="#fbbf24"
                    />
                  </Group>
                  {zone14Data.isBallInZ14 && (
                    <Group x={zone14Data.x + zone14Data.width / 2} y={zone14Data.y + zone14Data.height - 14}>
                      <Rect
                        x={-55}
                        y={-8}
                        width={110}
                        height={16}
                        cornerRadius={4}
                        fill="rgba(245, 158, 11, 0.95)"
                      />
                      <Text
                        text="🔥 BOLA DI ZONA 14"
                        x={-55}
                        y={-4.5}
                        width={110}
                        align="center"
                        fontSize={8}
                        fontFamily="system-ui, sans-serif"
                        fontStyle="bold"
                        fill="#0f172a"
                      />
                    </Group>
                  )}
                </Group>
              )}
            </Group>
          )}
        </Group>
      )}

      {/* B. Rest Defense Structure (Pencegah Counter Attack) */}
      {showRestDefense && restDefenseData && (
        <Group listening={false}>
          {/* Bounding Area */}
          <Rect
            x={restDefenseData.bounds.x}
            y={restDefenseData.bounds.y}
            width={restDefenseData.bounds.width}
            height={restDefenseData.bounds.height}
            cornerRadius={8}
            fill={restDefenseData.isSecure ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.15)'}
            stroke={restDefenseData.isSecure ? '#10b981' : '#ef4444'}
            strokeWidth={1.6}
            dash={[6, 4]}
          />

          {/* Metric Badge */}
          <Group
            x={restDefenseData.bounds.x + restDefenseData.bounds.width / 2}
            y={restDefenseData.bounds.y - 12}
          >
            <Rect
              x={-68}
              y={-9}
              width={136}
              height={18}
              cornerRadius={4}
              fill="rgba(15, 23, 42, 0.95)"
              stroke={restDefenseData.isSecure ? '#10b981' : '#ef4444'}
              strokeWidth={1}
              shadowColor="#000"
              shadowBlur={5}
              shadowOpacity={0.4}
            />
            <Text
              text={`🛡️ Rest Defense: ${restDefenseData.structureLabel} (${restDefenseData.count} Bek)`}
              x={-68}
              y={-4}
              width={136}
              align="center"
              fontSize={8.5}
              fontFamily="system-ui, sans-serif"
              fontStyle="bold"
              fill={restDefenseData.isSecure ? '#6ee7b7' : '#fca5a5'}
            />
          </Group>
        </Group>
      )}

      {/* C. Futsal 4-Second Rule Countdown Clock */}
      {pitchType === 'futsal' && showFutsal4Sec && (
        <Group
          x={pitchRect.x + pitchRect.width - 45}
          y={pitchRect.y + 35}
          listening={true}
          onClick={handleToggleTimer}
          onTap={handleToggleTimer}
        >
          {/* Background Badge */}
          <Circle
            radius={24}
            fill="rgba(15, 23, 42, 0.92)"
            stroke={futsalTimer <= 1.0 ? '#ef4444' : timerRunning ? '#10b981' : '#f59e0b'}
            strokeWidth={2}
            shadowColor="#000"
            shadowBlur={6}
            shadowOpacity={0.5}
          />
          {/* Timer Arc Progress */}
          <Circle
            radius={20}
            stroke={futsalTimer <= 1.0 ? '#ef4444' : '#facc15'}
            strokeWidth={2.5}
            dash={[futsalTimer * 31.4, 125]}
            opacity={0.9}
          />
          {/* Numeric Value */}
          <Text
            text={`${futsalTimer.toFixed(1)}s`}
            x={-24}
            y={-6}
            width={48}
            align="center"
            fontSize={10.5}
            fontFamily="system-ui, sans-serif"
            fontStyle="bold"
            fill={futsalTimer <= 1.0 ? '#ef4444' : '#ffffff'}
          />
          <Text
            text={futsalTimer <= 0 ? 'FAIL!' : timerRunning ? '4s RULE' : 'TAP 4s'}
            x={-24}
            y={6}
            width={48}
            align="center"
            fontSize={6.5}
            fontFamily="system-ui, sans-serif"
            fontStyle="bold"
            fill="rgba(255, 255, 255, 0.7)"
          />
        </Group>
      )}

      {/* 4. Passing Lanes (Open vs Blocked Corridors) */}
      {showPassingLanes && passingLanes.length > 0 && (
        <Group listening={false}>
          {passingLanes.map((lane) => {
            if (lane.isBlocked) {
              return (
                <Group key={lane.id}>
                  {/* Blocked Lane: Red Dashed Line */}
                  <Line
                    points={[lane.from.x, lane.from.y, lane.to.x, lane.to.y]}
                    stroke="#ef4444"
                    strokeWidth={1.8}
                    dash={[4, 5]}
                    opacity={0.45}
                  />
                  {/* Intercept Marker */}
                  {lane.interceptPt && (
                    <Group x={lane.interceptPt.x} y={lane.interceptPt.y}>
                      <Circle radius={7} fill="#ef4444" opacity={0.3} />
                      <Circle radius={4} fill="#dc2626" />
                      <Text
                        text="✕"
                        fontSize={8}
                        fill="#ffffff"
                        fontStyle="bold"
                        align="center"
                        offsetX={3}
                        offsetY={4}
                      />
                    </Group>
                  )}
                </Group>
              );
            }

            // Open Lane: Emerald Green Line with glowing beacon
            return (
              <Group key={lane.id}>
                {/* Glow underlay */}
                <Line
                  points={[lane.from.x, lane.from.y, lane.to.x, lane.to.y]}
                  stroke="#10b981"
                  strokeWidth={4}
                  opacity={0.15}
                />
                {/* Clear Lane: Emerald Dashed Line */}
                <Line
                  points={[lane.from.x, lane.from.y, lane.to.x, lane.to.y]}
                  stroke="#10b981"
                  strokeWidth={2}
                  dash={[7, 4]}
                  opacity={0.8}
                />
                {/* Target open indicator dot */}
                <Circle
                  x={lane.to.x}
                  y={lane.to.y}
                  radius={14}
                  stroke="#10b981"
                  strokeWidth={1}
                  dash={[3, 3]}
                  opacity={0.5}
                />
              </Group>
            );
          })}
        </Group>
      )}
    </Group>
  );
});

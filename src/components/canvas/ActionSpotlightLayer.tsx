import React, { useMemo } from 'react';
import { Group, Circle, Line, Arrow, Rect, Text } from 'react-konva';
import { PlayerToken, PitchType, PitchView, TeamConfig, BallToken, TacticalKeyframe } from '../../types/tactics';
import { PitchLayout, normToCanvas, getPitchRealDimensions } from '../../utils/pitchGeometry';
import { useTacticsStore } from '../../store/useTacticsStore';
import { useTranslation } from '../../i18n/useTranslation';

export interface ActionSpotlightLayerProps {
  layout: PitchLayout;
  pitchType: PitchType;
  pitchView?: PitchView;
  homeTeam?: TeamConfig;
  awayTeam?: TeamConfig;
  tokenRadius: number;
  currentPlayers: PlayerToken[];
  currentBall: BallToken;
  segFrameA: TacticalKeyframe;
  segFrameB: TacticalKeyframe | null;
  progress?: number;
}

interface RunnerIntent {
  id: string;
  number: number;
  team: 'home' | 'away' | 'neutral';
  targetX: number;
  targetY: number;
  totalDistMeters: number;
}

export const ActionSpotlightLayer: React.FC<ActionSpotlightLayerProps> = React.memo(({
  layout,
  pitchType,
  tokenRadius,
  currentPlayers,
  currentBall,
  segFrameA,
  segFrameB,
}) => {
  const { t } = useTranslation();
  const showActionSpotlight = useTacticsStore((s) => s.showActionSpotlight);
  const selectedPlayerId = useTacticsStore((s) => s.selectedPlayerId);

  const realDims = useMemo(() => getPitchRealDimensions(pitchType), [pitchType]);

  // Helper to calculate real world distance in meters
  const calcDistanceMeters = React.useCallback(
    (x1: number, y1: number, x2: number, y2: number) => {
      const dxMeters = ((x2 - x1) / 100) * realDims.lengthMeters;
      const dyMeters = ((y2 - y1) / 100) * realDims.widthMeters;
      return Math.hypot(dxMeters, dyMeters);
    },
    [realDims]
  );

  // 1. PRE-COMPUTE TACTICAL INTENT ONCE PER KEYFRAME SEGMENT (Zero math in 60 FPS tick!)
  const segmentIntent = useMemo(() => {
    if (!showActionSpotlight || !segFrameA) return null;

    const findClosestPlayer = (
      players: PlayerToken[],
      pt: { x: number; y: number },
      maxDistMeters = 20
    ): { player: PlayerToken | null; dist: number } => {
      let closest: PlayerToken | null = null;
      let minDist = Infinity;
      players.filter((p) => !p.isBench).forEach((p) => {
        const d = calcDistanceMeters(p.x, p.y, pt.x, pt.y);
        if (d < minDist && d <= maxDistMeters) {
          minDist = d;
          closest = p;
        }
      });
      return { player: closest, dist: minDist };
    };

    let passerId: string | null = null;
    let receiverId: string | null = null;
    let passDistMeters = 0;

    // Detect pass intent between segment frames
    if (segFrameB) {
      const ballMoveDist = calcDistanceMeters(segFrameA.ball.x, segFrameA.ball.y, segFrameB.ball.x, segFrameB.ball.y);
      if (ballMoveDist >= 3.0) {
        const p1 = findClosestPlayer(segFrameA.players, segFrameA.ball, 15).player;
        const p2 = findClosestPlayer(segFrameB.players, segFrameB.ball, 15).player;
        if (p1 && p2 && p1.id !== p2.id) {
          passerId = p1.id;
          receiverId = p2.id;
          passDistMeters = calcDistanceMeters(p1.x, p1.y, p2.x, p2.y);
        }
      }
    }

    // Fallback: Check if a 'pass' drawing exists in segFrameA
    if (!passerId || !receiverId) {
      const passDrawing = segFrameA.drawings?.find((d) => d.type === 'pass' && d.points.length >= 4);
      if (passDrawing) {
        const startPt = { x: passDrawing.points[0], y: passDrawing.points[1] };
        const endPt = {
          x: passDrawing.points[passDrawing.points.length - 2],
          y: passDrawing.points[passDrawing.points.length - 1],
        };
        const p1 = findClosestPlayer(segFrameA.players, startPt, 12).player;
        const p2 = findClosestPlayer(segFrameA.players, endPt, 12).player;
        if (p1 && p2 && p1.id !== p2.id) {
          passerId = p1.id;
          receiverId = p2.id;
          passDistMeters = calcDistanceMeters(p1.x, p1.y, p2.x, p2.y);
        }
      }
    }

    // Detect runners who move >= 3.0 meters
    const runners: RunnerIntent[] = [];
    if (segFrameB) {
      segFrameA.players.filter((p) => !p.isBench).forEach((pA) => {
        const pB = segFrameB.players.find((p) => p.id === pA.id && !p.isBench);
        if (pB) {
          const moveDist = calcDistanceMeters(pA.x, pA.y, pB.x, pB.y);
          if (moveDist >= 3.0) {
            runners.push({
              id: pB.id,
              number: pB.number,
              team: pB.team,
              targetX: pB.x,
              targetY: pB.y,
              totalDistMeters: moveDist,
            });
          }
        }
      });
    }

    return {
      passerId,
      receiverId,
      passDistMeters,
      runners,
    };
  }, [showActionSpotlight, segFrameA, segFrameB, calcDistanceMeters]);

  if (!showActionSpotlight || !segmentIntent) return null;

  const { passerId, receiverId, passDistMeters, runners } = segmentIntent;

  // 2. DYNAMIC ANCHOR RESOLUTION (Reads current live interpolated tokens for 100% sync!)
  const livePasser = passerId ? currentPlayers.find((p) => p.id === passerId && !p.isBench) : null;
  const liveReceiver = receiverId ? currentPlayers.find((p) => p.id === receiverId && !p.isBench) : null;

  const passerCanvas = livePasser ? normToCanvas(livePasser.x, livePasser.y, false, livePasser.team, layout) : null;
  const receiverCanvas = liveReceiver ? normToCanvas(liveReceiver.x, liveReceiver.y, false, liveReceiver.team, layout) : null;
  const ballCanvas = normToCanvas(currentBall.x, currentBall.y, false, 'neutral', layout);

  // Selected player focus
  const liveSelected = selectedPlayerId ? currentPlayers.find((p) => p.id === selectedPlayerId && !p.isBench) : null;
  const selectedCanvas = liveSelected ? normToCanvas(liveSelected.x, liveSelected.y, false, liveSelected.team, layout) : null;

  return (
    <Group listening={false}>
      {/* ---------------- 1. RUNNERS & TARGET LANDING SPACES ---------------- */}
      {runners.map((runner) => {
        const liveRunner = currentPlayers.find((p) => p.id === runner.id && !p.isBench);
        if (!liveRunner) return null;

        const runnerCurrentPos = normToCanvas(liveRunner.x, liveRunner.y, false, runner.team, layout);
        const targetLandingPos = normToCanvas(runner.targetX, runner.targetY, false, runner.team, layout);

        // Distance remaining from current position to target
        const distRemaining = Math.hypot(targetLandingPos.x - runnerCurrentPos.x, targetLandingPos.y - runnerCurrentPos.y);

        return (
          <Group key={`runner-highlight-${runner.id}`}>
            {/* Dynamic Arrow: Points from runner's CURRENT live position to the destination space */}
            {distRemaining > tokenRadius * 1.5 && (
              <Arrow
                points={[runnerCurrentPos.x, runnerCurrentPos.y, targetLandingPos.x, targetLandingPos.y]}
                pointerLength={7}
                pointerWidth={6}
                stroke="#38bdf8"
                strokeWidth={2}
                dash={[5, 4]}
                opacity={0.85}
              />
            )}

            {/* Ghost Landing Zone (Ruang Sasaran): Anchored at the targeted unoccupied space */}
            <Circle
              x={targetLandingPos.x}
              y={targetLandingPos.y}
              radius={tokenRadius * 1.2}
              stroke="rgba(56, 189, 248, 0.85)"
              strokeWidth={1.8}
              dash={[4, 3]}
              fill="rgba(56, 189, 248, 0.15)"
            />

            {/* Player Number in Target Space */}
            <Text
              x={targetLandingPos.x - 12}
              y={targetLandingPos.y - 6}
              width={24}
              align="center"
              text={runner.number.toString()}
              fontSize={11}
              fontStyle="bold"
              fontFamily="sans-serif"
              fill="#38bdf8"
            />

            {/* Mini Label Badge above Target Space */}
            <Group x={targetLandingPos.x} y={targetLandingPos.y - tokenRadius - 14}>
              <Rect
                x={-35}
                y={-7}
                width={70}
                height={14}
                fill="#0f172a"
                stroke="#38bdf8"
                strokeWidth={0.9}
                cornerRadius={7}
                shadowColor="#000000"
                shadowBlur={4}
                shadowOpacity={0.5}
              />
              <Text
                x={-35}
                y={-4.5}
                width={70}
                align="center"
                text={`${t('targetRunSpace')} #${runner.number}`}
                fontSize={8}
                fontStyle="bold"
                fontFamily="sans-serif"
                fill="#7dd3fc"
              />
            </Group>
          </Group>
        );
      })}

      {/* ---------------- 2. PASSING CORRIDOR & LIVE LASER ---------------- */}
      {passerCanvas && receiverCanvas && (
        <Group>
          {/* Laser Passing Corridor: Connects Passer -> Current Ball -> Receiver */}
          <Line
            points={[passerCanvas.x, passerCanvas.y, ballCanvas.x, ballCanvas.y, receiverCanvas.x, receiverCanvas.y]}
            stroke="rgba(245, 158, 11, 0.25)"
            strokeWidth={tokenRadius * 1.4}
            lineCap="round"
            lineJoin="round"
          />

          {/* Glowing central beam */}
          <Line
            points={[passerCanvas.x, passerCanvas.y, receiverCanvas.x, receiverCanvas.y]}
            stroke="#fbbf24"
            strokeWidth={1.8}
            dash={[6, 4]}
            opacity={0.7}
          />

          {/* Distance Metric Badge: Anchored halfway along the passing lane */}
          {passDistMeters > 0 && (
            <Group x={(passerCanvas.x + receiverCanvas.x) / 2} y={(passerCanvas.y + receiverCanvas.y) / 2}>
              <Rect
                x={-38}
                y={-9}
                width={76}
                height={18}
                fill="#0f172a"
                stroke="#fbbf24"
                strokeWidth={1.2}
                cornerRadius={9}
                shadowColor="#000000"
                shadowBlur={5}
                shadowOpacity={0.6}
              />
              <Text
                x={-38}
                y={-5}
                width={76}
                align="center"
                text={`⚡ ${passDistMeters.toFixed(1)}m`}
                fontSize={9.5}
                fontStyle="bold"
                fontFamily="sans-serif"
                fill="#fef08a"
              />
            </Group>
          )}

          {/* PASSER BEACON: Anchored 100% to live passer's coordinates! */}
          <Group x={passerCanvas.x} y={passerCanvas.y}>
            <Circle
              radius={tokenRadius * 1.55}
              stroke="#38bdf8"
              strokeWidth={1.6}
              dash={[3, 3]}
              fill="rgba(56, 189, 248, 0.18)"
            />
            {/* Passer floating badge */}
            <Group y={-tokenRadius - 16}>
              <Rect
                x={-35}
                y={-8}
                width={70}
                height={16}
                fill="#0f172a"
                stroke="#38bdf8"
                strokeWidth={1.2}
                cornerRadius={8}
                shadowColor="#000000"
                shadowBlur={4}
                shadowOpacity={0.6}
              />
              <Text
                x={-35}
                y={-4.5}
                width={70}
                align="center"
                text={`⚽ ${t('passerLabel')}`}
                fontSize={8.5}
                fontStyle="bold"
                fontFamily="sans-serif"
                fill="#38bdf8"
              />
            </Group>
          </Group>

          {/* RECEIVER SPOTLIGHT: Anchored 100% to live receiver's coordinates! */}
          {liveReceiver && (
            <Group x={receiverCanvas.x} y={receiverCanvas.y}>
              {/* Outer radar beacon ring */}
              <Circle
                radius={tokenRadius * 2.2}
                stroke="rgba(245, 158, 11, 0.4)"
                strokeWidth={1.5}
              />

              {/* Middle pulsing dashed beacon */}
              <Circle
                radius={tokenRadius * 1.65}
                stroke="#f59e0b"
                strokeWidth={2.4}
                dash={[4, 3]}
                fill="rgba(245, 158, 11, 0.28)"
              />

              {/* Prominent floating pill badge for Receiver */}
              <Group y={-tokenRadius - 18}>
                <Rect
                  x={-48}
                  y={-10}
                  width={96}
                  height={20}
                  fill="#0f172a"
                  stroke="#f59e0b"
                  strokeWidth={1.8}
                  cornerRadius={10}
                  shadowColor="#000000"
                  shadowBlur={6}
                  shadowOpacity={0.7}
                />
                <Text
                  x={-48}
                  y={-5.5}
                  width={96}
                  align="center"
                  text={`🎯 ${t('receiverLabel')} #${liveReceiver.number}`}
                  fontSize={9.5}
                  fontStyle="bold"
                  fontFamily="sans-serif"
                  fill="#fbbf24"
                />
              </Group>
            </Group>
          )}
        </Group>
      )}

      {/* ---------------- 3. COACH FOCUS SELECTED PLAYER ---------------- */}
      {selectedCanvas && liveSelected && !passerCanvas && (
        <Group x={selectedCanvas.x} y={selectedCanvas.y}>
          <Circle
            radius={tokenRadius * 1.9}
            stroke="#10b981"
            strokeWidth={2}
            dash={[4, 3]}
            fill="rgba(16, 185, 129, 0.2)"
          />
          <Group y={-tokenRadius - 16}>
            <Rect
              x={-32}
              y={-8}
              width={64}
              height={16}
              fill="#0f172a"
              stroke="#10b981"
              strokeWidth={1.2}
              cornerRadius={8}
            />
            <Text
              x={-32}
              y={-4.5}
              width={64}
              align="center"
              text={`FOKUS #${liveSelected.number}`}
              fontSize={8.5}
              fontStyle="bold"
              fontFamily="sans-serif"
              fill="#34d399"
            />
          </Group>
        </Group>
      )}
    </Group>
  );
});

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Group, Circle, Line, Ellipse, Rect, Text } from 'react-konva';
import Konva from 'konva';
import { BallToken, PlayerToken } from '../../types/tactics';
import { PitchLayout, normToCanvas, canvasToNorm } from '../../utils/pitchGeometry';
import { useTacticsStore } from '../../store/useTacticsStore';

interface BallNodeProps {
  ball: BallToken;
  layout: PitchLayout;
  onUpdatePosition: (x: number, y: number, rotation?: number, rotationAxis?: [number, number, number]) => void;
  setIsDragging: (dragging: boolean) => void;
}

type Vector3 = [number, number, number];

// Rodrigues' 3D rotation formula around an arbitrary unit axis
function rotateVector3(p: Vector3, axis: Vector3, angleRad: number): Vector3 {
  const [x, y, z] = p;
  const [u, v, w] = axis;
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  const dot = u * x + v * y + w * z;
  return [
    u * dot * (1 - cos) + x * cos + (-w * y + v * z) * sin,
    v * dot * (1 - cos) + y * cos + (w * x - u * z) * sin,
    w * dot * (1 - cos) + z * cos + (-v * x + u * y) * sin,
  ];
}

// Generate the 12 pentagons and 30 seam edges of a FIFA 32-panel soccer ball
function createSoccerBall3DMesh() {
  const phi = (1 + Math.sqrt(5)) / 2;
  const icoVertices: Vector3[] = [
    [-1, phi, 0],
    [1, phi, 0],
    [-1, -phi, 0],
    [1, -phi, 0],
    [0, -1, phi],
    [0, 1, phi],
    [0, -1, -phi],
    [0, 1, -phi],
    [phi, 0, -1],
    [phi, 0, 1],
    [-phi, 0, -1],
    [-phi, 0, 1],
  ].map(([x, y, z]) => {
    const l = Math.hypot(x, y, z);
    return [x / l, y / l, z / l];
  });

  // Tilt mesh so that vertex 4 ([0, -1, phi]) faces directly forward at the viewer ([0, 0, 1])
  const tiltRad = -31.7 * (Math.PI / 180);
  const tiltedIco = icoVertices.map(([x, y, z]): Vector3 => [
    x,
    y * Math.cos(tiltRad) - z * Math.sin(tiltRad),
    y * Math.sin(tiltRad) + z * Math.cos(tiltRad),
  ]);

  // Construct 12 pentagons
  const pentagons = tiltedIco.map((center, i) => {
    const neighbors = tiltedIco
      .map((other, j) => ({
        j,
        other,
        dist: Math.hypot(center[0] - other[0], center[1] - other[1], center[2] - other[2]),
      }))
      .filter((n) => n.j !== i)
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 5);

    const normal = center;
    let u: Vector3 = [1, 0, 0];
    if (Math.abs(normal[0]) > 0.8) u = [0, 1, 0];
    const v: Vector3 = [
      normal[1] * u[2] - normal[2] * u[1],
      normal[2] * u[0] - normal[0] * u[2],
      normal[0] * u[1] - normal[1] * u[0],
    ];
    const vLen = Math.hypot(v[0], v[1], v[2]);
    const vNorm: Vector3 = [v[0] / vLen, v[1] / vLen, v[2] / vLen];
    const uNorm: Vector3 = [
      vNorm[1] * normal[2] - vNorm[2] * normal[1],
      vNorm[2] * normal[0] - vNorm[0] * normal[2],
      vNorm[0] * normal[1] - vNorm[1] * normal[0],
    ];

    const sortedNeighbors = neighbors
      .map((n) => {
        const diff = [n.other[0] - center[0], n.other[1] - center[1], n.other[2] - center[2]];
        const x = diff[0] * uNorm[0] + diff[1] * uNorm[1] + diff[2] * uNorm[2];
        const y = diff[0] * vNorm[0] + diff[1] * vNorm[1] + diff[2] * vNorm[2];
        return { ...n, angle: Math.atan2(y, x) };
      })
      .sort((a, b) => a.angle - b.angle);

    const factor = 0.355;
    const vertices = sortedNeighbors.map((n): Vector3 => {
      const vx = center[0] + (n.other[0] - center[0]) * factor;
      const vy = center[1] + (n.other[1] - center[1]) * factor;
      const vz = center[2] + (n.other[2] - center[2]) * factor;
      const l = Math.hypot(vx, vy, vz);
      return [vx / l, vy / l, vz / l];
    });

    return {
      center,
      vertices,
      neighborIds: sortedNeighbors.map((n) => n.j),
    };
  });

  // Construct 30 seam edges connecting adjacent pentagon corners
  const seams: { p1: Vector3; p2: Vector3 }[] = [];
  const seen = new Set<string>();
  pentagons.forEach((p, i) => {
    p.neighborIds.forEach((nId, idx) => {
      const key = [Math.min(i, nId), Math.max(i, nId)].join('-');
      if (!seen.has(key)) {
        seen.add(key);
        const neighbor = pentagons[nId];
        const neighborIdx = neighbor.neighborIds.indexOf(i);
        if (neighborIdx !== -1) {
          seams.push({
            p1: p.vertices[idx],
            p2: neighbor.vertices[neighborIdx],
          });
        }
      }
    });
  });

  // Construct 20 hexagon face centers from adjacent triangular icosahedron triplets
  const hexagonCenters: Vector3[] = [];
  for (let i = 0; i < tiltedIco.length; i++) {
    const pI = pentagons[i];
    for (const j of pI.neighborIds) {
      if (j > i) {
        const pJ = pentagons[j];
        const common = pI.neighborIds.filter((k) => k > j && pJ.neighborIds.includes(k));
        for (const k of common) {
          const v1 = tiltedIco[i];
          const v2 = tiltedIco[j];
          const v3 = tiltedIco[k];
          const cx = (v1[0] + v2[0] + v3[0]) / 3;
          const cy = (v1[1] + v2[1] + v3[1]) / 3;
          const cz = (v1[2] + v2[2] + v3[2]) / 3;
          const clen = Math.hypot(cx, cy, cz);
          hexagonCenters.push([cx / clen, cy / clen, cz / clen]);
        }
      }
    }
  }

  return { pentagons, seams, hexagonCenters };
}

// Global cached 3D mesh definition
const SOCCER_BALL_MESH = createSoccerBall3DMesh();
const DEFAULT_ROTATION_AXIS: Vector3 = [0, 1, 0];

export const BallNode: React.FC<BallNodeProps> = React.memo(({
  ball,
  layout,
  onUpdatePosition,
  setIsDragging,
}) => {
  const activeTool = useTacticsStore((s) => s.activeTool);
  const isPlaying = useTacticsStore((s) => s.isPlaying);
  const currentFrame = useTacticsStore((s) => s.frames[s.activeFrameIndex]);
  const showBallBeacon = useTacticsStore((s) => s.showBallBeacon);
  const pingBallTrigger = useTacticsStore((s) => s.pingBallTrigger);
  const isInteractive = activeTool === 'select' && !isPlaying;

  const [isHovered, setIsHovered] = useState(false);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [dragRotation, setDragRotation] = useState<number | null>(null);
  const [dragAxis, setDragAxis] = useState<Vector3 | null>(null);
  const lastDragPos = useRef<{ x: number; y: number } | null>(null);

  // Radar ping pulse animation triggered on 'Temukan Bola'
  const [pingActive, setPingActive] = useState(false);
  useEffect(() => {
    if (pingBallTrigger > 0) {
      setPingActive(true);
      const timer = setTimeout(() => setPingActive(false), 2400);
      return () => clearTimeout(timer);
    }
  }, [pingBallTrigger]);

  // Enhanced radius for maximum visibility on all pitch colors and devices
  const radius = Math.max(12, Math.min(16.5, layout.pitchRect.width * 0.0145));
  const canvasPos = normToCanvas(ball.x, ball.y, false, 'neutral', layout);

  // Detect which player is closest to the ball for possession indicator
  const { closestPlayer, closestDist } = useMemo(() => {
    const activePlayers = currentFrame?.players.filter((p) => !p.isBench) || [];
    let nearest: PlayerToken | null = null;
    let minD = Infinity;
    for (const p of activePlayers) {
      const pPos = normToCanvas(p.x, p.y, false, p.team, layout);
      const d = Math.hypot(canvasPos.x - pPos.x, canvasPos.y - pPos.y);
      if (d < minD) {
        minD = d;
        nearest = p;
      }
    }
    return { closestPlayer: nearest, closestDist: minD };
  }, [currentFrame?.players, canvasPos.x, canvasPos.y, layout]);

  const hasPossession = closestDist < 36 && closestPlayer !== null;

  // Rotation parameters: angle in radians and 3D rolling axis
  const currentAngleDeg = dragRotation !== null ? dragRotation : (ball.rotation || 0);
  const currentAngleRad = (currentAngleDeg * Math.PI) / 180;
  const currentAxis: Vector3 = dragAxis || ball.rotationAxis || DEFAULT_ROTATION_AXIS;

  // 3D Projection: rotate vertices and project onto 2D canvas with spherical foreshortening
  const projectedData = useMemo(() => {
    const { pentagons, seams, hexagonCenters } = SOCCER_BALL_MESH;

    // Rotate and project visible pentagons (front hemisphere z > 0.0 to prevent back-face bleedthrough)
    const visiblePentagons: { points: number[]; center: Vector3; depth: number }[] = [];
    pentagons.forEach((p) => {
      const rotCenter = rotateVector3(p.center, currentAxis, currentAngleRad);
      if (rotCenter[2] > 0.0) {
        const polyPoints: number[] = [];
        p.vertices.forEach((v) => {
          const rotV = rotateVector3(v, currentAxis, currentAngleRad);
          polyPoints.push(rotV[0] * radius, rotV[1] * radius);
        });
        visiblePentagons.push({
          points: polyPoints,
          center: rotCenter,
          depth: rotCenter[2],
        });
      }
    });

    // Rotate and project visible hexagon leather depth highlights
    const visibleHexagons: { x: number; y: number; depth: number }[] = [];
    hexagonCenters.forEach((hc) => {
      const rotH = rotateVector3(hc, currentAxis, currentAngleRad);
      if (rotH[2] > 0.06) {
        visibleHexagons.push({
          x: rotH[0] * radius,
          y: rotH[1] * radius,
          depth: rotH[2],
        });
      }
    });

    // Rotate and project visible seam edges (front hemisphere)
    const visibleSeams: number[][] = [];
    seams.forEach(({ p1, p2 }) => {
      const r1 = rotateVector3(p1, currentAxis, currentAngleRad);
      const r2 = rotateVector3(p2, currentAxis, currentAngleRad);
      if (r1[2] > -0.05 && r2[2] > -0.05) {
        visibleSeams.push([r1[0] * radius, r1[1] * radius, r2[0] * radius, r2[1] * radius]);
      }
    });

    return { visiblePentagons, visibleHexagons, visibleSeams };
  }, [currentAxis, currentAngleRad, radius]);

  const handleDragStart = (e: Konva.KonvaEventObject<DragEvent>) => {
    setIsDragging(true);
    const startX = e.target.x();
    const startY = e.target.y();
    lastDragPos.current = { x: startX, y: startY };
    setDragPos({ x: startX, y: startY });
    setDragRotation(ball.rotation || 0);
    setDragAxis(ball.rotationAxis || DEFAULT_ROTATION_AXIS);
  };

  const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    const curX = e.target.x();
    const curY = e.target.y();

    if (lastDragPos.current) {
      const dX = curX - lastDragPos.current.x;
      const dY = curY - lastDragPos.current.y;
      const dist = Math.hypot(dX, dY);

      if (dist > 0.4) {
        // Physical rolling axis perpendicular to 2D travel direction
        const axisX = -dY / dist;
        const axisY = dX / dist;
        setDragAxis([axisX, axisY, 0]);

        // Exact physical roll angle without slip: angle = dist / radius * (180 / PI)
        const degPerPixel = 180 / (Math.PI * radius);
        setDragRotation((prev) => {
          const base = prev ?? (ball.rotation || 0);
          return ((base + dist * degPerPixel) % 360 + 360) % 360;
        });
      }
    }

    setDragPos({ x: curX, y: curY });
    lastDragPos.current = { x: curX, y: curY };
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    setIsDragging(false);
    const dropX = e.target.x();
    const dropY = e.target.y();
    const finalRot = dragRotation !== null ? dragRotation : (ball.rotation || 0);
    const finalAxis = dragAxis || ball.rotationAxis || DEFAULT_ROTATION_AXIS;

    setDragRotation(null);
    setDragAxis(null);
    setDragPos(null);
    lastDragPos.current = null;

    // Magnetic snap to nearby player's feet (within 36px)
    const activePlayers = currentFrame?.players.filter((p) => !p.isBench) || [];
    let closestPlayer = null;
    let closestDist = Infinity;

    for (const p of activePlayers) {
      const pPos = normToCanvas(p.x, p.y, false, p.team, layout);
      const d = Math.hypot(dropX - pPos.x, dropY - pPos.y);
      if (d < closestDist) {
        closestDist = d;
        closestPlayer = { player: p, pos: pPos };
      }
    }

    if (closestPlayer && closestDist < 36) {
      // Snap slightly ahead of player based on their facing angle
      const rad = (closestPlayer.player.rotation * Math.PI) / 180;
      const snapDist = 18;
      const snappedCanvasX = closestPlayer.pos.x + Math.cos(rad) * snapDist;
      const snappedCanvasY = closestPlayer.pos.y + Math.sin(rad) * snapDist;
      const { normX, normY } = canvasToNorm(snappedCanvasX, snappedCanvasY, layout);
      onUpdatePosition(normX, normY, finalRot, finalAxis);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(15);
      }
    } else {
      const { normX, normY } = canvasToNorm(dropX, dropY, layout);
      onUpdatePosition(normX, normY, finalRot, finalAxis);
    }
  };

  // 3D Ball elevation flight physics (lofted pass / chip ball)
  const elevation = ball.elevation || 0;
  const altitudeY = -elevation * radius * 1.8;
  const visualScale = 1 + elevation * 0.42;

  return (
    <Group
      x={dragPos ? dragPos.x : canvasPos.x}
      y={dragPos ? dragPos.y : canvasPos.y}
      draggable={isInteractive}
      listening={isInteractive}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onMouseEnter={() => isInteractive && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      cursor={isInteractive ? 'grab' : 'default'}
    >
      {/* 1. Ground Shadow (stays grounded on grass, expands & softens with elevation) */}
      <Ellipse
        x={0}
        y={radius * 0.85}
        radiusX={radius * (1.08 + elevation * 0.35)}
        radiusY={radius * (0.42 + elevation * 0.18)}
        fill={`rgba(0, 0, 0, ${0.52 * Math.max(0.2, 1 - elevation * 0.45)})`}
        listening={false}
      />

      {/* 1.1 Elevated 3D Flying Ball Body */}
      <Group y={altitudeY} scaleX={visualScale} scaleY={visualScale} listening={false}>

      {/* 1.2 Radar Ping Rings (Triggered on 'Temukan Bola') */}
      {pingActive && (
        <Group listening={false}>
          <Circle
            radius={radius + 16}
            stroke="#facc15"
            strokeWidth={2.5}
            dash={[4, 4]}
            opacity={0.9}
          />
          <Circle
            radius={radius + 32}
            stroke="#f59e0b"
            strokeWidth={2}
            dash={[6, 4]}
            opacity={0.65}
          />
          <Circle
            radius={radius + 48}
            stroke="#f97316"
            strokeWidth={1.5}
            dash={[8, 6]}
            opacity={0.4}
          />
        </Group>
      )}

      {/* 1.4 High-Visibility Glowing Golden/Amber Aura Halo */}
      {showBallBeacon && (
        <Group listening={false}>
          {/* Outer diffuse aura glow */}
          <Circle
            radius={radius + 7.5}
            fill="rgba(245, 158, 11, 0.2)"
            stroke="#f59e0b"
            strokeWidth={1.8}
            dash={[4, 3]}
            shadowColor="#f59e0b"
            shadowBlur={8}
            shadowOpacity={0.6}
          />
          {/* Inner high-contrast crisp white ring */}
          <Circle
            radius={radius + 3.2}
            stroke="#ffffff"
            strokeWidth={1.4}
            opacity={0.95}
          />
        </Group>
      )}

      {/* 2. Interactive Selection / Hover Glow Ring */}
      {isHovered && isInteractive && (
        <Circle
          radius={radius + 5}
          stroke="#10b981"
          strokeWidth={2.2}
          dash={[3, 3]}
          opacity={0.95}
          listening={false}
        />
      )}

      {/* 3. Base Spherical Leather Surface with 3D Radial Shading */}
      <Circle
        radius={radius}
        fillRadialGradientStartPoint={{ x: -radius * 0.38, y: -radius * 0.38 }}
        fillRadialGradientStartRadius={0}
        fillRadialGradientEndPoint={{ x: radius * 0.25, y: radius * 0.25 }}
        fillRadialGradientEndRadius={radius * 1.3}
        fillRadialGradientColorStops={[
          0, '#ffffff',
          0.45, '#f8fafc',
          0.75, '#cbd5e1',
          1, '#64748b',
        ]}
        stroke="#0f172a"
        strokeWidth={1.4}
        shadowColor="#000000"
        shadowBlur={5}
        shadowOpacity={0.4}
        shadowOffset={{ x: 0, y: 1.8 }}
        listening={false}
      />

      {/* 4. True 3D Rotating Soccer Ball Surface (Clipped inside sphere) */}
      <Group
        clipFunc={(ctx) => {
          ctx.arc(0, 0, radius - 0.2, 0, Math.PI * 2);
        }}
        listening={false}
      >
        {/* 3D Projected Hexagon Leather Depth Highlights */}
        {projectedData.visibleHexagons.map((hex, i) => (
          <Circle
            key={`hex-${i}`}
            x={hex.x}
            y={hex.y}
            radius={radius * 0.22 * Math.max(0.4, hex.depth)}
            fill="rgba(255, 255, 255, 0.55)"
            listening={false}
          />
        ))}

        {/* 3D Projected Pentagons (Classic Telstar Jet-Black Panels) */}
        {projectedData.visiblePentagons.map((p, i) => (
          <Group key={`pentagon-${i}`} listening={false}>
            <Line
              points={p.points}
              closed
              fill="#090d16"
              stroke="#000000"
              strokeWidth={1.1}
              lineJoin="round"
              listening={false}
            />
            {/* Pentagon central golden crest for instant visual rotational tracking */}
            {p.depth > 0.08 && (
              <Circle
                x={p.center[0] * radius}
                y={p.center[1] * radius}
                radius={Math.max(1, radius * 0.09 * p.depth)}
                fill="#f59e0b"
                listening={false}
              />
            )}
            {p.depth > 0.2 && (
              <Circle
                x={p.center[0] * radius}
                y={p.center[1] * radius}
                radius={Math.max(0.6, radius * 0.045 * p.depth)}
                fill="#fef08a"
                listening={false}
              />
            )}
          </Group>
        ))}

        {/* 3D Projected Seam Edges connecting pentagons (Hexagon boundaries) */}
        {projectedData.visibleSeams.map((pts, i) => (
          <Line
            key={`seam-${i}`}
            points={pts}
            stroke="#1e293b"
            strokeWidth={1.35}
            lineCap="round"
            listening={false}
          />
        ))}
      </Group>

      {/* 5. Static 3D Spherical Light & Reflection (Stays stationary as ball spins!) */}
      {/* Stadium floodlight specular reflection */}
      <Circle
        x={-radius * 0.35}
        y={-radius * 0.35}
        radius={radius * 0.20}
        fill="#ffffff"
        opacity={0.6}
        listening={false}
      />
      <Circle
        x={-radius * 0.38}
        y={-radius * 0.38}
        radius={radius * 0.08}
        fill="#ffffff"
        opacity={0.95}
        listening={false}
      />

      {/* Bottom-right ambient shadow / spherical depth crescent */}
      <Circle
        radius={radius}
        stroke="rgba(15, 23, 42, 0.28)"
        strokeWidth={1.6}
        listening={false}
      />

      {/* 6. Floating Ball Beacon Marker (Broadcast TV Style Pin) */}
      {showBallBeacon && (
        <Group y={-radius - 12} listening={false}>
          {/* Downward pointing triangle */}
          <Line
            points={[-5, -2, 5, -2, 0, 5]}
            closed
            fill="#f59e0b"
            stroke="#ffffff"
            strokeWidth={0.8}
            shadowColor="#000"
            shadowBlur={3}
            shadowOpacity={0.5}
          />

          {/* Beacon pill label */}
          <Rect
            x={hasPossession && closestPlayer ? -24 : -19}
            y={-14}
            width={hasPossession && closestPlayer ? 48 : 38}
            height={13}
            fill="rgba(15, 23, 42, 0.95)"
            stroke="#f59e0b"
            strokeWidth={1.2}
            cornerRadius={4}
            shadowColor="#000"
            shadowBlur={4}
            shadowOpacity={0.7}
          />
          <Text
            text={hasPossession && closestPlayer ? `⚽ #${closestPlayer.number}` : '⚽ BOLA'}
            fontSize={7.5}
            fontFamily="system-ui, -apple-system, sans-serif"
            fontStyle="bold"
            fill="#fef08a"
            align="center"
            width={hasPossession && closestPlayer ? 48 : 38}
            offsetX={hasPossession && closestPlayer ? 24 : 19}
            y={-12.5}
          />
        </Group>
      )}
      </Group>

      {/* 7. Large Touch Hit Area for effortless mobile interaction */}
      <Circle
        radius={radius * 1.8}
        fill="rgba(0, 0, 0, 0.001)"
        hitStrokeWidth={24}
      />
    </Group>
  );
});

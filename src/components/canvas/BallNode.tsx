import React, { useMemo, useRef, useState } from 'react';
import { Group, Circle, Line, Ellipse } from 'react-konva';
import Konva from 'konva';
import { BallToken } from '../../types/tactics';
import { PitchLayout, normToCanvas, canvasToNorm } from '../../utils/pitchGeometry';
import { useTacticsStore } from '../../store/useTacticsStore';

interface BallNodeProps {
  ball: BallToken;
  layout: PitchLayout;
  onUpdatePosition: (x: number, y: number, rotation?: number) => void;
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

  return { pentagons, seams };
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
  const isInteractive = activeTool === 'select' && !isPlaying;

  const [isHovered, setIsHovered] = useState(false);
  const [dragRotation, setDragRotation] = useState<number | null>(null);
  const [dragAxis, setDragAxis] = useState<Vector3 | null>(null);
  const lastDragPos = useRef<{ x: number; y: number } | null>(null);

  // Scaled radius for clear visibility and crisp 3D rendering
  const radius = Math.max(10, Math.min(14, layout.pitchRect.width * 0.012));
  const canvasPos = normToCanvas(ball.x, ball.y, false, 'neutral', layout);

  // Rotation parameters: angle in radians and 3D rolling axis
  const currentAngleDeg = dragRotation !== null ? dragRotation : (ball.rotation || 0);
  const currentAngleRad = (currentAngleDeg * Math.PI) / 180;
  const currentAxis: Vector3 = dragAxis || ball.rotationAxis || DEFAULT_ROTATION_AXIS;

  // 3D Projection: rotate vertices and project onto 2D canvas with spherical foreshortening
  const projectedData = useMemo(() => {
    const { pentagons, seams } = SOCCER_BALL_MESH;

    // Rotate and project visible pentagons
    const visiblePentagons: number[][] = [];
    pentagons.forEach((p) => {
      const rotCenter = rotateVector3(p.center, currentAxis, currentAngleRad);
      // Cull pentagons on the back hemisphere (z < -0.2)
      if (rotCenter[2] > -0.2) {
        const polyPoints: number[] = [];
        p.vertices.forEach((v) => {
          const rotV = rotateVector3(v, currentAxis, currentAngleRad);
          polyPoints.push(rotV[0] * radius, rotV[1] * radius);
        });
        visiblePentagons.push(polyPoints);
      }
    });

    // Rotate and project visible seam edges
    const visibleSeams: number[][] = [];
    seams.forEach(({ p1, p2 }) => {
      const r1 = rotateVector3(p1, currentAxis, currentAngleRad);
      const r2 = rotateVector3(p2, currentAxis, currentAngleRad);
      if (r1[2] > -0.15 && r2[2] > -0.15) {
        visibleSeams.push([r1[0] * radius, r1[1] * radius, r2[0] * radius, r2[1] * radius]);
      }
    });

    return { visiblePentagons, visibleSeams };
  }, [currentAxis, currentAngleRad, radius]);

  const handleDragStart = (e: Konva.KonvaEventObject<DragEvent>) => {
    setIsDragging(true);
    lastDragPos.current = { x: e.target.x(), y: e.target.y() };
    setDragRotation(ball.rotation || 0);
  };

  const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    const curX = e.target.x();
    const curY = e.target.y();

    if (lastDragPos.current) {
      const dX = curX - lastDragPos.current.x;
      const dY = curY - lastDragPos.current.y;
      const dist = Math.hypot(dX, dY);

      if (dist > 0.4) {
        // Rolling axis perpendicular to 2D motion vector on the pitch
        const axisX = -dY / dist;
        const axisY = dX / dist;
        setDragAxis([axisX, axisY, 0]);

        // Continuous roll angle in degrees proportional to dragging distance
        setDragRotation((prev) => {
          const base = prev ?? (ball.rotation || 0);
          return ((base + dist * 3.8) % 360 + 360) % 360;
        });
      }
    }

    lastDragPos.current = { x: curX, y: curY };
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    setIsDragging(false);
    const dropX = e.target.x();
    const dropY = e.target.y();
    const finalRot = dragRotation !== null ? dragRotation : (ball.rotation || 0);

    setDragRotation(null);
    setDragAxis(null);
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
      onUpdatePosition(normX, normY, finalRot);
    } else {
      const { normX, normY } = canvasToNorm(dropX, dropY, layout);
      onUpdatePosition(normX, normY, finalRot);
    }
  };

  return (
    <Group
      x={canvasPos.x}
      y={canvasPos.y}
      draggable={isInteractive}
      listening={isInteractive}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onMouseEnter={() => isInteractive && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      cursor={isInteractive ? 'grab' : 'default'}
    >
      {/* 1. Realistic Drop Shadow onto Pitch Grass */}
      <Ellipse
        x={0}
        y={radius * 0.78}
        radiusX={radius * 0.88}
        radiusY={radius * 0.35}
        fill="rgba(0, 0, 0, 0.45)"
        listening={false}
      />

      {/* 2. Interactive Selection / Hover Glow Ring */}
      {isHovered && isInteractive && (
        <Circle
          radius={radius + 4}
          stroke="#10b981"
          strokeWidth={2}
          dash={[3, 3]}
          opacity={0.85}
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
        strokeWidth={1.2}
        shadowColor="#000000"
        shadowBlur={4}
        shadowOpacity={0.35}
        shadowOffset={{ x: 0, y: 1.5 }}
        listening={false}
      />

      {/* 4. True 3D Rotating Soccer Ball Surface (Clipped inside sphere) */}
      <Group
        clipFunc={(ctx) => {
          ctx.arc(0, 0, radius - 0.2, 0, Math.PI * 2);
        }}
        listening={false}
      >
        {/* 3D Projected Pentagons */}
        {projectedData.visiblePentagons.map((pts, i) => (
          <Line
            key={`pentagon-${i}`}
            points={pts}
            closed
            fill="#1e293b"
            stroke="#0f172a"
            strokeWidth={0.8}
            lineJoin="round"
            listening={false}
          />
        ))}

        {/* 3D Projected Seam Edges connecting pentagons (Hexagon boundaries) */}
        {projectedData.visibleSeams.map((pts, i) => (
          <Line
            key={`seam-${i}`}
            points={pts}
            stroke="#475569"
            strokeWidth={0.9}
            lineCap="round"
            listening={false}
          />
        ))}
      </Group>

      {/* 5. Static 3D Spherical Light & Reflection (Stays stationary as ball spins!) */}
      {/* Top-left soft diffuse shine */}
      <Circle
        x={-radius * 0.32}
        y={-radius * 0.32}
        radius={radius * 0.42}
        fill="#ffffff"
        opacity={0.45}
        listening={false}
      />

      {/* Top-left intense glossy specular glint */}
      <Circle
        x={-radius * 0.38}
        y={-radius * 0.38}
        radius={radius * 0.16}
        fill="#ffffff"
        opacity={0.9}
        listening={false}
      />

      {/* Bottom-right ambient shadow / spherical depth crescent */}
      <Circle
        radius={radius}
        stroke="rgba(15, 23, 42, 0.35)"
        strokeWidth={1.8}
        listening={false}
      />
    </Group>
  );
});

import React, { useState } from 'react';
import { Group, Arrow, Line, Rect } from 'react-konva';
import Konva from 'konva';
import { DrawingElement } from '../../types/tactics';
import { PitchLayout } from '../../utils/pitchGeometry';
import { useTacticsStore } from '../../store/useTacticsStore';

interface DrawingLayerProps {
  layout: PitchLayout;
  drawings: DrawingElement[];
}

export const DrawingLayer: React.FC<DrawingLayerProps> = React.memo(({ layout, drawings }) => {
  const activeTool = useTacticsStore((s) => s.activeTool);
  const activeDrawingColor = useTacticsStore((s) => s.activeDrawingColor);
  const addDrawing = useTacticsStore((s) => s.addDrawing);
  const removeDrawing = useTacticsStore((s) => s.removeDrawing);

  const [currentDraft, setCurrentDraft] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);

  const { pitchRect } = layout;

  // Convert normalized (0-100) to canvas pixels
  const toCanvasX = (normX: number) => pitchRect.x + (normX / 100) * pitchRect.width;
  const toCanvasY = (normY: number) => pitchRect.y + (normY / 100) * pitchRect.height;

  // Convert canvas pixels to normalized (0-100)
  const toNormX = (canvasX: number) =>
    Math.max(0, Math.min(100, ((canvasX - pitchRect.x) / pitchRect.width) * 100));
  const toNormY = (canvasY: number) =>
    Math.max(0, Math.min(100, ((canvasY - pitchRect.y) / pitchRect.height) * 100));

  // Generate wavy points for dribbling line
  const generateWavyPoints = (
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): number[] => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.hypot(dx, dy);
    if (dist < 10) return [x1, y1, x2, y2];

    const ux = dx / dist;
    const uy = dy / dist;
    const nx = -uy;
    const ny = ux;

    const wavelength = 24;
    const amplitude = 6;
    const samples = Math.max(12, Math.floor(dist / 3));
    const points: number[] = [];

    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      const d = t * dist;
      // Dampen ends so start and end attach cleanly
      const envelope = Math.sin(Math.PI * t);
      const offset = amplitude * Math.sin((2 * Math.PI * d) / wavelength) * envelope;
      points.push(x1 + ux * d + nx * offset, y1 + uy * d + ny * offset);
    }

    return points;
  };

  // Helper: generate quadratic Bezier curved points for crosses and lobs
  const generateCurvedPoints = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    depthRatio = 0.2
  ): number[] => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.hypot(dx, dy);
    if (dist < 10) return [x1, y1, x2, y2];

    const nx = -dy / dist;
    const ny = dx / dist;

    // Normal curve arc height
    const sagitta = Math.min(80, Math.max(16, dist * depthRatio));
    const cx = (x1 + x2) / 2 + nx * sagitta;
    const cy = (y1 + y2) / 2 + ny * sagitta;

    const points: number[] = [];
    const steps = 18;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const invT = 1 - t;
      const px = invT * invT * x1 + 2 * invT * t * cx + t * t * x2;
      const py = invT * invT * y1 + 2 * invT * t * cy + t * t * y2;
      points.push(px, py);
    }
    return points;
  };

  // Drawing event handlers
  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (activeTool === 'select' || activeTool === 'eraser') return;

    const stage = e.target.getStage();
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;

    setCurrentDraft({
      startX: pos.x,
      startY: pos.y,
      currentX: pos.x,
      currentY: pos.y,
    });
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (!currentDraft) return;

    const stage = e.target.getStage();
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;

    setCurrentDraft((prev) => (prev ? { ...prev, currentX: pos.x, currentY: pos.y } : null));
  };

  const handleMouseUp = () => {
    if (!currentDraft) return;

    const { startX, startY, currentX, currentY } = currentDraft;
    const dist = Math.hypot(currentX - startX, currentY - startY);

    // Only commit if dragged at least 8 pixels
    if (dist >= 8 && activeTool !== 'select' && activeTool !== 'eraser') {
      const normStartX = toNormX(startX);
      const normStartY = toNormY(startY);
      const normEndX = toNormX(currentX);
      const normEndY = toNormY(currentY);

      const newDrawing: DrawingElement = {
        id: `draw-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        type: activeTool,
        points: [normStartX, normStartY, normEndX, normEndY],
        color: activeDrawingColor,
        opacity: activeTool === 'zone' ? 0.35 : 0.9,
        width: activeTool === 'zone' ? 1.5 : 3,
        dashed: activeTool === 'run' || activeTool === 'zone' || activeTool === 'curved-pass' || activeTool === 'lofted-pass',
        curveDepth: activeTool === 'curved-pass' ? 0.2 : activeTool === 'lofted-pass' ? 0.45 : undefined,
      };

      addDrawing(newDrawing);
    }

    setCurrentDraft(null);
  };

  return (
    <Group>
      {/* Invisible overlay for capturing drawing gestures when drawing tool is active */}
      {activeTool !== 'select' && (
        <Rect
          x={0}
          y={0}
          width={layout.containerWidth}
          height={layout.containerHeight}
          fill="transparent"
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
          onMouseMove={handleMouseMove}
          onTouchMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchEnd={handleMouseUp}
          listening={true}
        />
      )}

      {/* Committed Drawings */}
      {drawings.map((draw) => {
        const [nx1, ny1, nx2, ny2] = draw.points;
        const x1 = toCanvasX(nx1);
        const y1 = toCanvasY(ny1);
        const x2 = toCanvasX(nx2);
        const y2 = toCanvasY(ny2);

        const isEraser = activeTool === 'eraser';

        // 1. Tactical Zone (Translucent box with border)
        if (draw.type === 'zone') {
          const rectX = Math.min(x1, x2);
          const rectY = Math.min(y1, y2);
          const rectW = Math.abs(x2 - x1);
          const rectH = Math.abs(y2 - y1);

          return (
            <Group
              key={draw.id}
              onClick={() => isEraser && removeDrawing(draw.id)}
              onTap={() => isEraser && removeDrawing(draw.id)}
              className={isEraser ? 'cursor-pointer' : 'cursor-default'}
            >
              <Rect
                x={rectX}
                y={rectY}
                width={rectW}
                height={rectH}
                fill={draw.color}
                opacity={draw.opacity ?? 0.3}
                stroke={draw.color}
                strokeWidth={draw.width ?? 1.5}
                dash={[6, 4]}
                cornerRadius={6}
              />
            </Group>
          );
        }

        // 2. Wavy Dribble Line
        if (draw.type === 'dribble') {
          const wavyPoints = generateWavyPoints(x1, y1, x2, y2);
          const len = wavyPoints.length;
          const tipX = wavyPoints[len - 2];
          const tipY = wavyPoints[len - 1];
          const prevX = wavyPoints[len - 4] ?? x1;
          const prevY = wavyPoints[len - 3] ?? y1;

          return (
            <Group
              key={draw.id}
              onClick={() => isEraser && removeDrawing(draw.id)}
              onTap={() => isEraser && removeDrawing(draw.id)}
              className={isEraser ? 'cursor-pointer' : 'cursor-default'}
            >
              <Line
                points={wavyPoints}
                stroke={draw.color}
                strokeWidth={draw.width ?? 3}
                lineCap="round"
                lineJoin="round"
                shadowColor="#000"
                shadowBlur={3}
                shadowOpacity={0.3}
              />
              <Arrow
                points={[prevX, prevY, tipX, tipY]}
                pointerLength={10}
                pointerWidth={8}
                fill={draw.color}
                stroke={draw.color}
                strokeWidth={1}
              />
            </Group>
          );
        }

        // 2.5. Curved Pass Line (Lob / Crossing Parabola)
        if (draw.type === 'curved-pass') {
          const curvedPoints = generateCurvedPoints(x1, y1, x2, y2, draw.curveDepth ?? 0.2);
          const len = curvedPoints.length;
          const tipX = curvedPoints[len - 2];
          const tipY = curvedPoints[len - 1];
          const prevX = curvedPoints[len - 4] ?? x1;
          const prevY = curvedPoints[len - 3] ?? y1;

          return (
            <Group
              key={draw.id}
              onClick={() => isEraser && removeDrawing(draw.id)}
              onTap={() => isEraser && removeDrawing(draw.id)}
              className={isEraser ? 'cursor-pointer' : 'cursor-default'}
            >
              <Line
                points={curvedPoints}
                stroke={draw.color}
                strokeWidth={draw.width ?? 3}
                dash={[6, 4]}
                lineCap="round"
                lineJoin="round"
                shadowColor="#000"
                shadowBlur={3}
                shadowOpacity={0.3}
              />
              <Arrow
                points={[prevX, prevY, tipX, tipY]}
                pointerLength={11}
                pointerWidth={9}
                fill={draw.color}
                stroke={draw.color}
                strokeWidth={1}
              />
            </Group>
          );
        }

        // 2.7. Lofted Pass Line (Steep High-Arc — 3D flight indicator)
        if (draw.type === 'lofted-pass') {
          const arcPoints = generateCurvedPoints(x1, y1, x2, y2, draw.curveDepth ?? 0.45);
          const len = arcPoints.length;
          const tipX = arcPoints[len - 2];
          const tipY = arcPoints[len - 1];
          const prevX = arcPoints[len - 4] ?? x1;
          const prevY = arcPoints[len - 3] ?? y1;
          // Midpoint for altitude dot
          const midIdx = Math.floor(len / 2);
          const midX = arcPoints[midIdx % 2 === 0 ? midIdx : midIdx - 1];
          const midY = arcPoints[midIdx % 2 === 0 ? midIdx + 1 : midIdx];

          return (
            <Group
              key={draw.id}
              onClick={() => isEraser && removeDrawing(draw.id)}
              onTap={() => isEraser && removeDrawing(draw.id)}
              className={isEraser ? 'cursor-pointer' : 'cursor-default'}
            >
              <Line
                points={arcPoints}
                stroke={draw.color}
                strokeWidth={draw.width ?? 3}
                dash={[4, 5]}
                lineCap="round"
                lineJoin="round"
                shadowColor="#000"
                shadowBlur={4}
                shadowOpacity={0.35}
              />
              {/* Altitude peak dot */}
              <Group x={midX} y={midY}>
                <Line points={[0, 0, 0, 14]} stroke={draw.color} strokeWidth={1.5} opacity={0.6} />
                <Line points={[-5, 14, 5, 14]} stroke={draw.color} strokeWidth={1.5} opacity={0.6} />
              </Group>
              <Arrow
                points={[prevX, prevY, tipX, tipY]}
                pointerLength={12}
                pointerWidth={10}
                fill={draw.color}
                stroke={draw.color}
                strokeWidth={1}
              />
            </Group>
          );
        }

        // 3. Passing Arrow (Solid)
        if (draw.type === 'pass') {
          return (
            <Arrow
              key={draw.id}
              points={[x1, y1, x2, y2]}
              stroke={draw.color}
              fill={draw.color}
              strokeWidth={draw.width ?? 3}
              pointerLength={12}
              pointerWidth={10}
              shadowColor="#000"
              shadowBlur={3}
              shadowOpacity={0.3}
              onClick={() => isEraser && removeDrawing(draw.id)}
              onTap={() => isEraser && removeDrawing(draw.id)}
              className={isEraser ? 'cursor-pointer' : 'cursor-default'}
            />
          );
        }

        // 4. Running Arrow (Dashed)
        return (
          <Arrow
            key={draw.id}
            points={[x1, y1, x2, y2]}
            stroke={draw.color}
            fill={draw.color}
            strokeWidth={draw.width ?? 2.5}
            dash={[7, 5]}
            pointerLength={12}
            pointerWidth={10}
            shadowColor="#000"
            shadowBlur={3}
            shadowOpacity={0.3}
            onClick={() => isEraser && removeDrawing(draw.id)}
            onTap={() => isEraser && removeDrawing(draw.id)}
            className={isEraser ? 'cursor-pointer' : 'cursor-default'}
          />
        );
      })}

      {/* Live Active Draft Preview */}
      {currentDraft && (
        <Group listening={false}>
          {activeTool === 'zone' ? (
            <Rect
              x={Math.min(currentDraft.startX, currentDraft.currentX)}
              y={Math.min(currentDraft.startY, currentDraft.currentY)}
              width={Math.abs(currentDraft.currentX - currentDraft.startX)}
              height={Math.abs(currentDraft.currentY - currentDraft.startY)}
              fill={activeDrawingColor}
              opacity={0.35}
              stroke={activeDrawingColor}
              strokeWidth={1.5}
              dash={[6, 4]}
              cornerRadius={6}
            />
          ) : activeTool === 'dribble' ? (
            (() => {
              const wavyPoints = generateWavyPoints(
                currentDraft.startX,
                currentDraft.startY,
                currentDraft.currentX,
                currentDraft.currentY
              );
              const len = wavyPoints.length;
              return (
                <>
                  <Line
                    points={wavyPoints}
                    stroke={activeDrawingColor}
                    strokeWidth={3}
                    lineCap="round"
                    lineJoin="round"
                  />
                  <Arrow
                    points={[
                      wavyPoints[len - 4] ?? currentDraft.startX,
                      wavyPoints[len - 3] ?? currentDraft.startY,
                      wavyPoints[len - 2],
                      wavyPoints[len - 1],
                    ]}
                    pointerLength={10}
                    pointerWidth={8}
                    fill={activeDrawingColor}
                    stroke={activeDrawingColor}
                    strokeWidth={1}
                  />
                </>
              );
            })()
          ) : activeTool === 'curved-pass' ? (
            (() => {
              const curvedPoints = generateCurvedPoints(
                currentDraft.startX,
                currentDraft.startY,
                currentDraft.currentX,
                currentDraft.currentY,
                0.2
              );
              const len = curvedPoints.length;
              return (
                <>
                  <Line
                    points={curvedPoints}
                    stroke={activeDrawingColor}
                    strokeWidth={3}
                    dash={[6, 4]}
                    lineCap="round"
                    lineJoin="round"
                  />
                  <Arrow
                    points={[
                      curvedPoints[len - 4] ?? currentDraft.startX,
                      curvedPoints[len - 3] ?? currentDraft.startY,
                      curvedPoints[len - 2],
                      curvedPoints[len - 1],
                    ]}
                    pointerLength={11}
                    pointerWidth={9}
                    fill={activeDrawingColor}
                    stroke={activeDrawingColor}
                    strokeWidth={1}
                  />
                </>
              );
            })()
          ) : activeTool === 'lofted-pass' ? (
            (() => {
              const arcPoints = generateCurvedPoints(
                currentDraft.startX,
                currentDraft.startY,
                currentDraft.currentX,
                currentDraft.currentY,
                0.45
              );
              const len = arcPoints.length;
              return (
                <>
                  <Line
                    points={arcPoints}
                    stroke={activeDrawingColor}
                    strokeWidth={3}
                    dash={[4, 5]}
                    lineCap="round"
                    lineJoin="round"
                  />
                  <Arrow
                    points={[
                      arcPoints[len - 4] ?? currentDraft.startX,
                      arcPoints[len - 3] ?? currentDraft.startY,
                      arcPoints[len - 2],
                      arcPoints[len - 1],
                    ]}
                    pointerLength={12}
                    pointerWidth={10}
                    fill={activeDrawingColor}
                    stroke={activeDrawingColor}
                    strokeWidth={1}
                  />
                </>
              );
            })()
          ) : (
            <Arrow
              points={[
                currentDraft.startX,
                currentDraft.startY,
                currentDraft.currentX,
                currentDraft.currentY,
              ]}
              stroke={activeDrawingColor}
              fill={activeDrawingColor}
              strokeWidth={activeTool === 'pass' ? 3 : 2.5}
              dash={activeTool === 'run' ? [7, 5] : undefined}
              pointerLength={12}
              pointerWidth={10}
            />
          )}
        </Group>
      )}
    </Group>
  );
});

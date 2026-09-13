import React, { useRef } from 'react';
import { Group, Circle, Rect, Line, Text, Ellipse, Arc } from 'react-konva';
import Konva from 'konva';
import { EquipmentItem } from '../../types/tactics';
import { PitchLayout } from '../../utils/pitchGeometry';

interface EquipmentNodeProps {
  item: EquipmentItem;
  layout: PitchLayout;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdatePosition: (id: string, x: number, y: number) => void;
  onUpdateRotation: (id: string, rotation: number) => void;
  onDelete: (id: string) => void;
  setIsDragging: (dragging: boolean) => void;
}

export const EquipmentNode: React.FC<EquipmentNodeProps> = React.memo(({
  item,
  layout,
  isSelected,
  onSelect,
  onUpdatePosition,
  onUpdateRotation,
  onDelete,
  setIsDragging,
}) => {
  const groupRef = useRef<Konva.Group>(null);
  const handleRef = useRef<Konva.Circle>(null);

  const { pitchRect } = layout;
  const px = pitchRect.x + (item.x / 100) * pitchRect.width;
  const py = pitchRect.y + (item.y / 100) * pitchRect.height;

  // Rotation handle position offset (relative to equipment center)
  const handleDistance = item.type === 'mini-goal' ? 32 : 24;
  const rad = ((item.rotation - 90) * Math.PI) / 180;
  const handleX = Math.cos(rad) * handleDistance;
  const handleY = Math.sin(rad) * handleDistance;

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    setIsDragging(false);
    const newCanvasX = e.target.x();
    const newCanvasY = e.target.y();
    const normX = Math.max(0, Math.min(100, ((newCanvasX - pitchRect.x) / pitchRect.width) * 100));
    const normY = Math.max(0, Math.min(100, ((newCanvasY - pitchRect.y) / pitchRect.height) * 100));
    onUpdatePosition(item.id, normX, normY);
  };

  const handleRotationDrag = (e: Konva.KonvaEventObject<DragEvent>) => {
    e.cancelBubble = true;
    const stage = e.target.getStage();
    if (!stage) return;
    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) return;

    // Calculate angle relative to equipment center (px, py)
    const dx = pointerPos.x - px;
    const dy = pointerPos.y - py;
    let angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    if (angle < 0) angle += 360;

    onUpdateRotation(item.id, Math.round(angle));
  };

  return (
    <Group
      ref={groupRef}
      x={px}
      y={py}
      draggable
      onClick={(e) => {
        e.cancelBubble = true;
        onSelect(item.id);
      }}
      onTap={(e) => {
        e.cancelBubble = true;
        onSelect(item.id);
      }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
    >
      {/* Selection Glow Ring */}
      {isSelected && (
        <Circle
          radius={item.type === 'mini-goal' ? 26 : 18}
          stroke="#38bdf8"
          strokeWidth={2}
          dash={[3, 3]}
          fill="rgba(56, 189, 248, 0.12)"
        />
      )}

      {/* Equipment Graphic based on Type */}
      <Group rotation={item.rotation}>
        {/* 1. CONE / MARKER */}
        {item.type === 'cone' && (
          <Group>
            {/* Ground shadow */}
            <Ellipse radiusX={10} radiusY={6} fill="rgba(0,0,0,0.25)" y={2} />
            {/* Base saucer */}
            <Circle radius={9} fill={item.color} stroke="#ffffff" strokeWidth={1} />
            {/* Cone stepped rings */}
            <Circle radius={6} fill="rgba(255,255,255,0.3)" />
            <Circle radius={3} fill="#1e293b" />
          </Group>
        )}

        {/* 2. MANNEQUIN / DUMMY */}
        {item.type === 'mannequin' && (
          <Group>
            {/* Base shadow */}
            <Ellipse radiusX={12} radiusY={4} fill="rgba(0,0,0,0.3)" y={10} />
            {/* Ground stand bars */}
            <Line points={[-10, 9, 10, 9]} stroke="#64748b" strokeWidth={2} />
            {/* Support poles */}
            <Line points={[-4, -2, -4, 9]} stroke="#94a3b8" strokeWidth={2} />
            <Line points={[4, -2, 4, 9]} stroke="#94a3b8" strokeWidth={2} />
            {/* Body Torso */}
            <Rect
              x={-8}
              y={-12}
              width={16}
              height={14}
              cornerRadius={3}
              fill={item.color}
              stroke="#ffffff"
              strokeWidth={1.2}
              shadowColor="#000000"
              shadowBlur={3}
              shadowOpacity={0.3}
            />
            {/* Slits in torso */}
            <Line points={[-5, -6, 5, -6]} stroke="#ffffff" strokeWidth={1} opacity={0.6} />
            <Line points={[-5, -2, 5, -2]} stroke="#ffffff" strokeWidth={1} opacity={0.6} />
            {/* Head oval */}
            <Circle
              y={-17}
              radius={5}
              fill={item.color}
              stroke="#ffffff"
              strokeWidth={1}
            />
          </Group>
        )}

        {/* 3. AGILITY POLE */}
        {item.type === 'pole' && (
          <Group>
            {/* Rubber base ring */}
            <Ellipse radiusX={8} radiusY={5} fill="#334155" stroke="#64748b" strokeWidth={1} />
            <Circle radius={4} fill="#0f172a" />
            {/* Pole upright circle / indicator */}
            <Circle
              y={-8}
              radius={5}
              fill={item.color}
              stroke="#ffffff"
              strokeWidth={1.5}
              shadowColor="#000"
              shadowBlur={3}
              shadowOpacity={0.4}
            />
          </Group>
        )}

        {/* 4. MINI GOAL (PUGG / POP-UP) */}
        {item.type === 'mini-goal' && (
          <Group>
            {/* Net backing polygon / arc */}
            <Arc
              innerRadius={0}
              outerRadius={22}
              angle={180}
              rotation={180}
              fill="rgba(241, 245, 249, 0.22)"
              stroke="rgba(255, 255, 255, 0.4)"
              strokeWidth={1}
            />
            {/* Net cross patterns */}
            <Line points={[-16, 0, 0, -18]} stroke="rgba(255,255,255,0.3)" strokeWidth={0.8} />
            <Line points={[16, 0, 0, -18]} stroke="rgba(255,255,255,0.3)" strokeWidth={0.8} />
            <Line points={[-10, 0, 0, -12]} stroke="rgba(255,255,255,0.3)" strokeWidth={0.8} />
            <Line points={[10, 0, 0, -12]} stroke="rgba(255,255,255,0.3)" strokeWidth={0.8} />
            {/* Goal Posts and Crossbar */}
            <Line
              points={[-22, 0, 22, 0]}
              stroke="#ffffff"
              strokeWidth={3}
              lineCap="round"
              shadowColor="#000"
              shadowBlur={3}
              shadowOpacity={0.5}
            />
            {/* Post nodes */}
            <Circle x={-21} y={0} radius={2.5} fill="#ef4444" />
            <Circle x={21} y={0} radius={2.5} fill="#ef4444" />
          </Group>
        )}
      </Group>

      {/* Rotation Knob & Delete Button when selected */}
      {isSelected && (
        <Group>
          {/* Connector to rotation handle */}
          <Line
            points={[0, 0, handleX, handleY]}
            stroke="#38bdf8"
            strokeWidth={1.5}
            dash={[2, 2]}
            listening={false}
          />
          {/* Rotation Handle */}
          <Circle
            ref={handleRef}
            x={handleX}
            y={handleY}
            radius={7}
            fill="#38bdf8"
            stroke="#ffffff"
            strokeWidth={1.5}
            draggable
            onDragStart={(e) => {
              e.cancelBubble = true;
              setIsDragging(true);
            }}
            onDragMove={handleRotationDrag}
            onDragEnd={(e) => {
              e.cancelBubble = true;
              setIsDragging(false);
              e.target.position({ x: handleX, y: handleY });
            }}
            shadowColor="#000"
            shadowBlur={3}
            shadowOpacity={0.4}
          />

          {/* Delete Icon Button (Top-Right) */}
          <Group
            x={18}
            y={-18}
            onClick={(e) => {
              e.cancelBubble = true;
              onDelete(item.id);
            }}
            onTap={(e) => {
              e.cancelBubble = true;
              onDelete(item.id);
            }}
          >
            <Circle radius={8} fill="#ef4444" stroke="#ffffff" strokeWidth={1} shadowColor="#000" shadowBlur={3} shadowOpacity={0.5} />
            <Text
              text="✕"
              fontSize={9}
              fontStyle="bold"
              fill="#ffffff"
              x={-4}
              y={-5}
              listening={false}
            />
          </Group>
        </Group>
      )}
    </Group>
  );
});

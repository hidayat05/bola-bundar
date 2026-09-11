import React from 'react';
import { Group, Rect, Circle, Line, Text } from 'react-konva';
import { BallToken, PitchType, PitchView, TargetZoneKey } from '../../types/tactics';
import { PitchLayout } from '../../utils/pitchGeometry';
import { calculateTargetZones } from '../../utils/setpieceUtils';

interface TargetZonesNodeProps {
  layout: PitchLayout;
  pitchType: PitchType;
  pitchView: PitchView;
  ball: BallToken;
  activeTargetZone: TargetZoneKey | 'all' | null;
  onSelectZone: (zone: TargetZoneKey | 'all' | null) => void;
}

export const TargetZonesNode: React.FC<TargetZonesNodeProps> = React.memo(({
  layout,
  pitchType,
  pitchView,
  ball,
  activeTargetZone,
  onSelectZone,
}) => {
  const zones = calculateTargetZones(layout, pitchType, pitchView, ball);

  return (
    <Group id="target-zones-layer">
      {zones.map((zone) => {
        const isFocused = activeTargetZone === zone.id;
        const isIncluded = activeTargetZone === 'all' || activeTargetZone === null || isFocused;
        const opacityMultiplier = isFocused ? 1 : isIncluded ? 0.75 : 0.2;

        const badgeWidth = Math.max(76, zone.shortName.length * 6.5);
        const badgeHeight = 16;
        const badgeY = Math.max(layout.pitchRect.y + 4, zone.y - badgeHeight - 3);

        return (
          <Group
            key={zone.id}
            onClick={() => onSelectZone(isFocused ? 'all' : zone.id)}
            onTap={() => onSelectZone(isFocused ? 'all' : zone.id)}
          >
            {/* Zone Shaded Area */}
            <Rect
              x={zone.x}
              y={zone.y}
              width={zone.width}
              height={zone.height}
              fill={zone.color}
              opacity={(isFocused ? 0.26 : 0.13) * opacityMultiplier}
              cornerRadius={6}
              stroke={zone.color}
              strokeWidth={isFocused ? 2.5 : 1.2}
              dash={isFocused ? undefined : [5, 4]}
            />

            {/* Glowing Focus Ring if specifically focused */}
            {isFocused && (
              <Rect
                x={zone.x - 3}
                y={zone.y - 3}
                width={zone.width + 6}
                height={zone.height + 6}
                stroke={zone.color}
                strokeWidth={1}
                opacity={0.5}
                dash={[2, 3]}
                cornerRadius={8}
                listening={false}
              />
            )}

            {/* Center Crosshair Target Mark */}
            <Group x={zone.centerX} y={zone.centerY} listening={false} opacity={opacityMultiplier}>
              {/* Outer target ring */}
              <Circle
                radius={Math.min(14, Math.max(8, zone.width * 0.18))}
                stroke={zone.color}
                strokeWidth={1.5}
                fill="transparent"
                dash={[3, 3]}
              />
              {/* Inner bullseye */}
              <Circle
                radius={3}
                fill={zone.color}
                opacity={0.9}
              />
              {/* Crosshair horizontal */}
              <Line
                points={[-14, 0, 14, 0]}
                stroke={zone.color}
                strokeWidth={1}
                opacity={0.6}
              />
              {/* Crosshair vertical */}
              <Line
                points={[0, -14, 0, 14]}
                stroke={zone.color}
                strokeWidth={1}
                opacity={0.6}
              />
            </Group>

            {/* Tactical Label Badge Pill */}
            <Group
              x={zone.centerX - badgeWidth / 2}
              y={badgeY}
              opacity={opacityMultiplier}
            >
              <Rect
                width={badgeWidth}
                height={badgeHeight}
                fill="rgba(15, 23, 42, 0.88)"
                stroke={zone.color}
                strokeWidth={isFocused ? 1.5 : 1}
                cornerRadius={10}
                shadowColor="rgba(0,0,0,0.5)"
                shadowBlur={4}
              />
              <Text
                width={badgeWidth}
                height={badgeHeight}
                text={`🎯 ${zone.shortName}`}
                fontSize={9}
                fontFamily="system-ui, sans-serif"
                fontStyle="bold"
                fill={isFocused ? '#ffffff' : zone.color}
                align="center"
                verticalAlign="middle"
              />
            </Group>
          </Group>
        );
      })}
    </Group>
  );
});

import React from 'react';
import { Group, Rect, Text, Line, Arrow } from 'react-konva';
import { PlayerToken } from '../../types/tactics';
import { PitchLayout, normToCanvas } from '../../utils/pitchGeometry';

interface PlayerActionZoneLayerProps {
  layout: PitchLayout;
  players: PlayerToken[];
  selectedPlayerId: string | null;
  showAllActionZones?: boolean;
}

export const PlayerActionZoneLayer: React.FC<PlayerActionZoneLayerProps> = React.memo(({
  layout,
  players,
  selectedPlayerId,
  showAllActionZones = false,
}) => {
  const activePlayers = players.filter((p) => !p.isBench);

  // Filter players whose action zone should be rendered
  const playersToRender = activePlayers.filter((p) => {
    if (!p.activeActionZone) return false;
    if (showAllActionZones) return true;
    return p.id === selectedPlayerId;
  });

  if (playersToRender.length === 0) return null;

  return (
    <Group listening={false}>
      {playersToRender.map((player) => {
        const zone = player.activeActionZone!;
        const { bounds, color, label } = zone;

        // Convert normalized bounds [0-100] to canvas pixels
        const tl = normToCanvas(bounds.x, bounds.y, false, player.team, layout);
        const br = normToCanvas(bounds.x + bounds.width, bounds.y + bounds.height, false, player.team, layout);

        const rectX = Math.min(tl.x, br.x);
        const rectY = Math.min(tl.y, br.y);
        const rectW = Math.max(20, Math.abs(br.x - tl.x));
        const rectH = Math.max(20, Math.abs(br.y - tl.y));

        const playerPos = normToCanvas(player.x, player.y, false, player.team, layout);
        const zoneCenter = { x: rectX + rectW / 2, y: rectY + rectH / 2 };

        const badgeText = `#${player.number} ${player.role ? `${player.role} • ` : ''}${label}`;
        const badgeWidth = Math.max(80, badgeText.length * 6.5 + 16);

        return (
          <Group key={`action-zone-${player.id}`}>
            {/* 1. Connecting Directional Vector from Player to Target Zone */}
            <Arrow
              points={[playerPos.x, playerPos.y, zoneCenter.x, zoneCenter.y]}
              pointerLength={6}
              pointerWidth={6}
              stroke={color}
              fill={color}
              strokeWidth={1.5}
              dash={[5, 4]}
              opacity={0.65}
              listening={false}
            />

            {/* 2. Tactical Bounding Box with Rounded Corners & Glow */}
            <Rect
              x={rectX}
              y={rectY}
              width={rectW}
              height={rectH}
              cornerRadius={6}
              fill={`${color}1a`} // ~10% transparent tint
              stroke={color}
              strokeWidth={1.8}
              dash={[7, 5]}
              shadowColor={color}
              shadowBlur={6}
              shadowOpacity={0.35}
              listening={false}
            />

            {/* Corner Bracket Accents */}
            <Line
              points={[rectX, rectY + 8, rectX, rectY, rectX + 8, rectY]}
              stroke={color}
              strokeWidth={2.5}
              listening={false}
            />
            <Line
              points={[rectX + rectW - 8, rectY, rectX + rectW, rectY, rectX + rectW, rectY + 8]}
              stroke={color}
              strokeWidth={2.5}
              listening={false}
            />
            <Line
              points={[rectX, rectY + rectH - 8, rectX, rectY + rectH, rectX + 8, rectY + rectH]}
              stroke={color}
              strokeWidth={2.5}
              listening={false}
            />
            <Line
              points={[rectX + rectW - 8, rectY + rectH, rectX + rectW, rectY + rectH, rectX + rectW, rectY + rectH - 8]}
              stroke={color}
              strokeWidth={2.5}
              listening={false}
            />

            {/* 3. Floating Tactical Badge Pill */}
            <Group x={rectX + rectW / 2} y={rectY - 11}>
              <Rect
                x={-badgeWidth / 2}
                y={-8}
                width={badgeWidth}
                height={16}
                cornerRadius={4}
                fill="rgba(15, 23, 42, 0.94)"
                stroke={color}
                strokeWidth={1}
                shadowColor="#000"
                shadowBlur={4}
                shadowOpacity={0.5}
              />
              <Text
                text={badgeText}
                x={-badgeWidth / 2}
                y={-4.5}
                width={badgeWidth}
                align="center"
                fontSize={8}
                fontFamily="system-ui, sans-serif"
                fontStyle="bold"
                fill="#f8fafc"
              />
            </Group>
          </Group>
        );
      })}
    </Group>
  );
});

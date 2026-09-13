import { describe, it, expect } from 'vitest';
import { encodeSharePayload, decodeSharePayload } from './shareLink';
import { TacticsExportData } from '../types/tactics';

describe('shareLink utils', () => {
  const dummyData: TacticsExportData = {
    version: '1.6.0',
    exportedAt: '2026-09-13T10:00:00.000Z',
    appName: 'Bola Bundar Tactical Board',
    pitchType: 'football',
    pitchView: 'full',
    pitchSurface: 'grass',
    showGrid: false,
    gridColor: '#94a3b8',
    showZones: false,
    zoneColor: '#fbbf24',
    homeTeam: {
      name: 'Red Team',
      primaryColor: '#ef4444',
      secondaryColor: '#ffffff',
      textColor: '#ffffff',
      goalkeeperColor: '#eab308',
    },
    awayTeam: {
      name: 'Blue Team',
      primaryColor: '#2563eb',
      secondaryColor: '#ffffff',
      textColor: '#ffffff',
      goalkeeperColor: '#10b981',
    },
    frames: [
      {
        id: 'f-1',
        name: 'Frame 1',
        players: [
          { id: 'p-1', team: 'home', number: 1, name: 'GK', x: 10, y: 50, rotation: 0, isBench: false, isGoalkeeper: true },
          { id: 'p-2', team: 'home', number: 2, name: 'RB', x: 25, y: 80, rotation: 0, isBench: false },
        ],
        ball: { id: 'b-1', x: 50, y: 50 },
        duration: 1.5,
      },
    ],
  };

  it('encodes and decodes payload with full fidelity', () => {
    const encoded = encodeSharePayload(dummyData);
    expect(typeof encoded).toBe('string');
    expect(encoded.length).toBeGreaterThan(0);

    const decoded = decodeSharePayload(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded?.appName).toBe('Bola Bundar Tactical Board');
    expect(decoded?.pitchType).toBe('football');
    expect(decoded?.frames.length).toBe(1);
    expect(decoded?.frames[0].players.length).toBe(2);
  });

  it('returns null gracefully on corrupt or invalid string', () => {
    const result = decodeSharePayload('not-a-valid-lz-base64-payload!!!');
    expect(result).toBeNull();
  });
});

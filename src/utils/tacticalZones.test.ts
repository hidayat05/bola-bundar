import { describe, it, expect } from 'vitest';
import { getAvailableActionZones } from './tacticalZones';
import { PlayerToken } from '../types/tactics';

describe('tacticalZones utils', () => {
  const baseHomePlayer: PlayerToken = {
    id: 'p-fb',
    team: 'home',
    number: 2,
    name: 'Right Back',
    role: 'RB',
    x: 25,
    y: 80,
    rotation: 0,
    isBench: false,
  };

  it('generates overlap, underlap, and cover zones for fullbacks', () => {
    const zones = getAvailableActionZones(baseHomePlayer, 'football');
    expect(zones.length).toBeGreaterThanOrEqual(3);

    const types = zones.map((z) => z.type);
    expect(types).toContain('overlap');
    expect(types).toContain('underlap');
    expect(types).toContain('cover');
  });

  it('generates futsal paralela and diagonal zones for futsal wings (ALA)', () => {
    const alaPlayer: PlayerToken = {
      ...baseHomePlayer,
      role: 'ALA',
      x: 35,
      y: 85,
    };
    const zones = getAvailableActionZones(alaPlayer, 'futsal');
    const types = zones.map((z) => z.type);
    expect(types).toContain('paralela');
    expect(types).toContain('diagonal');
  });

  it('mirrors x coordinate for away team zones', () => {
    const homeZones = getAvailableActionZones(baseHomePlayer, 'football');
    const awayPlayer: PlayerToken = {
      ...baseHomePlayer,
      id: 'p-away-fb',
      team: 'away',
      x: 75,
      y: 80,
    };
    const awayZones = getAvailableActionZones(awayPlayer, 'football');

    const homeOverlap = homeZones.find((z) => z.type === 'overlap');
    const awayOverlap = awayZones.find((z) => z.type === 'overlap');

    expect(homeOverlap).toBeDefined();
    expect(awayOverlap).toBeDefined();
    // In mirrored coordinates, away x should be flipped
    if (homeOverlap && awayOverlap) {
      expect(awayOverlap.bounds.x).not.toBe(homeOverlap.bounds.x);
    }
  });
});

import { describe, it, expect } from 'vitest';
import { generateInitialSquad, getFormationsForPitch } from './formations';

describe('formations utils', () => {
  it('generates correct 11v11 football squad with 11 on pitch and bench', () => {
    const squad = generateInitialSquad('home', 'football', undefined, 3);
    const onPitch = squad.filter((p) => !p.isBench);
    const onBench = squad.filter((p) => p.isBench);

    expect(onPitch.length).toBe(11);
    expect(onBench.length).toBe(3);
    expect(onPitch.some((p) => p.isGoalkeeper)).toBe(true);
    expect(squad.every((p) => p.team === 'home')).toBe(true);
  });

  it('generates 7v7 mini soccer squad with 7 on pitch', () => {
    const squad = generateInitialSquad('away', 'mini-soccer', undefined, 2);
    const onPitch = squad.filter((p) => !p.isBench);
    const onBench = squad.filter((p) => p.isBench);

    expect(onPitch.length).toBe(7);
    expect(onBench.length).toBe(2);
    expect(squad.every((p) => p.team === 'away')).toBe(true);
  });

  it('generates 5v5 futsal squad with 5 on pitch', () => {
    const squad = generateInitialSquad('home', 'futsal', undefined, 2);
    const onPitch = squad.filter((p) => !p.isBench);
    const onBench = squad.filter((p) => p.isBench);

    expect(onPitch.length).toBe(5);
    expect(onBench.length).toBe(2);
  });

  it('returns valid formations list for each pitch type', () => {
    const footballForms = getFormationsForPitch('football');
    const miniForms = getFormationsForPitch('mini-soccer');
    const futsalForms = getFormationsForPitch('futsal');

    expect(footballForms.length).toBeGreaterThanOrEqual(3);
    expect(miniForms.length).toBeGreaterThanOrEqual(2);
    expect(futsalForms.length).toBeGreaterThanOrEqual(2);
  });
});

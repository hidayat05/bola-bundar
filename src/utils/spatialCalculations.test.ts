import { describe, it, expect } from 'vitest';
import { getConvexHull, getCompactnessRating, calculateMetricPolygonArea } from './spatialCalculations';

describe('spatialCalculations utils', () => {
  it('computes convex hull correctly for simple points', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
      { x: 5, y: 5 }, // interior point
    ];
    const hull = getConvexHull(points);
    expect(hull.length).toBe(4);
  });

  it('calculates compactness rating based on pitch type and area', () => {
    const compactRating = getCompactnessRating(450, 'football');
    expect(compactRating.rating).toBe('Sangat Kompak');

    const stretchedRating = getCompactnessRating(1800, 'football');
    expect(stretchedRating.rating).toBe('Renggang');
  });

  it('calculates polygon area metric in square meters', () => {
    // 50% width by 50% height of 105x68m pitch
    const square = [
      { x: 0, y: 0 },
      { x: 50, y: 0 },
      { x: 50, y: 50 },
      { x: 0, y: 50 },
    ];
    const area = calculateMetricPolygonArea(square, 'football');
    expect(area).toBeGreaterThan(1000);
  });
});

import { useEffect, useRef, useState } from 'react';
import { useTacticsStore } from '../store/useTacticsStore';
import { TacticsExportData } from '../types/tactics';

export const AUTOSAVE_STORAGE_KEY = 'bola_bundar_autosave_v1';

export function useAutoSave() {
  const {
    pitchType,
    pitchView,
    pitchSurface,
    showGrid,
    gridColor,
    showZones,
    zoneColor,
    homeTeam,
    awayTeam,
    frames,
    equipment,
    drillNotes,
    loadProjectData,
  } = useTacticsStore();

  const [hasRestored, setHasRestored] = useState(false);
  const isInitialMount = useRef(true);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. Initial Mount: restore from localStorage if no hash #data= exists
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // If URL already has share link payload, prioritize share link
    if (window.location.hash.includes('data=')) {
      isInitialMount.current = false;
      return;
    }

    try {
      const raw = localStorage.getItem(AUTOSAVE_STORAGE_KEY);
      if (raw) {
        const savedData = JSON.parse(raw) as TacticsExportData;
        if (savedData && Array.isArray(savedData.frames) && savedData.frames.length > 0) {
          const isModified =
            savedData.frames.length > 1 ||
            (savedData.equipment && savedData.equipment.length > 0) ||
            Boolean(savedData.drillNotes?.title && savedData.drillNotes.title.trim().length > 0) ||
            savedData.pitchType !== 'football';

          if (isModified) {
            loadProjectData(savedData);
            setHasRestored(true);
            setTimeout(() => setHasRestored(false), 5000);
          }
        }
      }
    } catch {
      // ignore
    }

    isInitialMount.current = false;
  }, [loadProjectData]);

  // 2. Continuous Debounced Auto-Save
  useEffect(() => {
    if (isInitialMount.current || typeof window === 'undefined') return;

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      try {
        const payload: TacticsExportData = {
          version: '1.3.0',
          exportedAt: new Date().toISOString(),
          appName: 'Bola Bundar Tactical Board',
          pitchType,
          pitchView,
          pitchSurface,
          showGrid,
          gridColor,
          showZones,
          zoneColor,
          homeTeam,
          awayTeam,
          frames,
          equipment,
          drillNotes,
        };
        localStorage.setItem(AUTOSAVE_STORAGE_KEY, JSON.stringify(payload));
      } catch {
        // quota exceeded or private browsing
      }
    }, 800);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [
    pitchType,
    pitchView,
    pitchSurface,
    showGrid,
    gridColor,
    showZones,
    zoneColor,
    homeTeam,
    awayTeam,
    frames,
    equipment,
    drillNotes,
  ]);

  return { hasRestored, setHasRestored };
}

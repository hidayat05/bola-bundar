import { describe, it, expect, beforeEach } from 'vitest';
import { useTacticsStore } from './useTacticsStore';

describe('useTacticsStore undo/redo and frames', () => {
  beforeEach(() => {
    // Reset state to a clean 1-frame state
    useTacticsStore.getState().resetTactics();
  });

  it('adds frame and can undo frame addition', () => {
    const store = useTacticsStore.getState();
    expect(store.frames.length).toBe(1);

    // Add frame
    store.addFrame();
    expect(useTacticsStore.getState().frames.length).toBe(2);
    expect(useTacticsStore.getState().canUndo).toBe(true);

    // Undo should restore back to 1 frame!
    useTacticsStore.getState().undo();
    expect(useTacticsStore.getState().frames.length).toBe(1);

    // Redo should bring back 2 frames!
    useTacticsStore.getState().redo();
    expect(useTacticsStore.getState().frames.length).toBe(2);
  });

  it('removes frame and can undo frame deletion', () => {
    const store = useTacticsStore.getState();
    store.addFrame(); // now 2 frames
    expect(useTacticsStore.getState().frames.length).toBe(2);

    // Remove frame 1
    useTacticsStore.getState().removeFrame(1);
    expect(useTacticsStore.getState().frames.length).toBe(1);

    // Undo should restore the deleted frame!
    useTacticsStore.getState().undo();
    expect(useTacticsStore.getState().frames.length).toBe(2);
  });

  it('duplicates frame and updates active frame index', () => {
    const store = useTacticsStore.getState();
    store.duplicateFrame(0);

    const state = useTacticsStore.getState();
    expect(state.frames.length).toBe(2);
    expect(state.frames[1].name).toContain('(Copy)');
    expect(state.activeFrameIndex).toBe(1);
  });
});

import { create } from 'zustand';
import {
  ActiveTool,
  BallToken,
  DrawingElement,
  PitchSurface,
  PitchType,
  PitchView,
  PlayerToken,
  TacticalKeyframe,
  TacticsExportData,
  TeamConfig,
  TeamDisplayMode,
  TeamSide,
} from '../types/tactics';
import { generateInitialSquad, getFormationsForPitch } from '../utils/formations';

interface TacticsState {
  pitchType: PitchType;
  pitchView: PitchView;
  pitchSurface: PitchSurface;
  showGrid: boolean;
  showZones: boolean;
  zoneColor: string;
  teamDisplayMode: TeamDisplayMode; // 'both' | 'single'
  soloTeamSide: 'home' | 'away';

  homeTeam: TeamConfig;
  awayTeam: TeamConfig;

  frames: TacticalKeyframe[];
  activeFrameIndex: number;

  selectedPlayerId: string | null;
  hoveredPlayerId: string | null;
  swapTargetPlayerId: string | null;
  isDragging: boolean;
  isPlaying: boolean;
  playbackSpeed: number;

  // Setters & Pitch
  setPitchType: (pitchType: PitchType) => void;
  setPitchView: (pitchView: PitchView) => void;
  setPitchSurface: (surface: PitchSurface) => void;
  setShowGrid: (show: boolean) => void;
  setShowZones: (show: boolean) => void;
  setZoneColor: (color: string) => void;
  setTeamDisplayMode: (mode: TeamDisplayMode) => void;
  setSoloTeamSide: (side: 'home' | 'away') => void;

  // Teams
  updateHomeTeam: (updates: Partial<TeamConfig>) => void;
  updateAwayTeam: (updates: Partial<TeamConfig>) => void;

  // Player Selections & Interactions
  selectPlayer: (id: string | null) => void;
  setHoveredPlayer: (id: string | null) => void;
  setSwapTargetPlayer: (id: string | null) => void;
  setIsDragging: (dragging: boolean) => void;

  // Player Operations
  updatePlayerPosition: (playerId: string, x: number, y: number, isBench?: boolean) => void;
  updatePlayerRotation: (playerId: string, rotation: number) => void;
  updatePlayer: (playerId: string, updates: Partial<PlayerToken>) => void;
  swapPlayers: (playerAId: string, playerBId: string) => void;
  addPlayer: (team: TeamSide, isBench?: boolean) => void;
  removePlayer: (playerId: string) => void;
  toggleBenchPlayer: (playerId: string) => void;
  applyFormation: (team: TeamSide, presetName: string) => void;

  // Ball
  updateBallPosition: (x: number, y: number) => void;

  // Drawing Tools
  activeTool: ActiveTool;
  activeDrawingColor: string;
  setActiveTool: (tool: ActiveTool) => void;
  setActiveDrawingColor: (color: string) => void;
  addDrawing: (drawing: DrawingElement) => void;
  removeDrawing: (id: string) => void;
  clearDrawings: () => void;

  // Keyframes & Interpolation
  interpolatedFrame: TacticalKeyframe | null;
  playbackProgress: number;
  isRecording: boolean;
  setInterpolatedFrame: (frame: TacticalKeyframe | null) => void;
  setPlaybackProgress: (progress: number) => void;
  setIsRecording: (recording: boolean) => void;
  setActiveFrame: (index: number) => void;
  addFrame: () => void;
  duplicateFrame: (index: number) => void;
  removeFrame: (index: number) => void;
  updateFrameDuration: (index: number, duration: number) => void;
  loadPlayPreset: (frames: TacticalKeyframe[]) => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
  resetTactics: () => void;
  loadProjectData: (data: TacticsExportData) => void;
}

const DEFAULT_HOME_TEAM: TeamConfig = {
  name: 'Home Red',
  primaryColor: '#ef4444',
  secondaryColor: '#ffffff',
  textColor: '#ffffff',
  goalkeeperColor: '#eab308',
};

const DEFAULT_AWAY_TEAM: TeamConfig = {
  name: 'Away Blue',
  primaryColor: '#2563eb',
  secondaryColor: '#ffffff',
  textColor: '#ffffff',
  goalkeeperColor: '#10b981',
};

function createInitialKeyframe(pitchType: PitchType): TacticalKeyframe {
  const homeSquad = generateInitialSquad('home', pitchType, undefined, 3);
  const awaySquad = generateInitialSquad('away', pitchType, undefined, 3);

  return {
    id: `frame-${Date.now()}-1`,
    name: 'Frame 1',
    players: [...homeSquad, ...awaySquad],
    ball: {
      id: 'ball-1',
      x: 50,
      y: 50,
    },
    duration: 1.5,
  };
}

export const useTacticsStore = create<TacticsState>((set, get) => {
  const initialFrame = createInitialKeyframe('football');

  return {
    pitchType: 'football',
    pitchView: 'full',
    pitchSurface: 'grass',
    showGrid: false,
    showZones: false,
    zoneColor: '#fbbf24',
    teamDisplayMode: 'both',
    soloTeamSide: 'home',

    homeTeam: DEFAULT_HOME_TEAM,
    awayTeam: DEFAULT_AWAY_TEAM,

    frames: [initialFrame],
    activeFrameIndex: 0,

    selectedPlayerId: null,
    hoveredPlayerId: null,
    swapTargetPlayerId: null,
    isDragging: false,
    isPlaying: false,
    playbackSpeed: 1,

    activeTool: 'select',
    activeDrawingColor: '#f59e0b',
    interpolatedFrame: null,
    playbackProgress: 0,
    isRecording: false,

    setPitchType: (pitchType: PitchType) => {
      // Pick appropriate default surface
      const surface: PitchSurface = pitchType === 'futsal' ? 'blue' : 'grass';
      const newFrame = createInitialKeyframe(pitchType);
      set({
        pitchType,
        pitchSurface: surface,
        frames: [newFrame],
        activeFrameIndex: 0,
        selectedPlayerId: null,
      });
    },

    setPitchView: (pitchView: PitchView) => set({ pitchView }),
    setPitchSurface: (pitchSurface: PitchSurface) => set({ pitchSurface }),
    setShowGrid: (showGrid: boolean) => set({ showGrid }),
    setShowZones: (showZones: boolean) => set({ showZones }),
    setZoneColor: (zoneColor: string) => set({ zoneColor }),
    setTeamDisplayMode: (teamDisplayMode: TeamDisplayMode) => set({ teamDisplayMode }),
    setSoloTeamSide: (soloTeamSide: 'home' | 'away') => set({ soloTeamSide }),

    updateHomeTeam: (updates: Partial<TeamConfig>) =>
      set((state) => ({ homeTeam: { ...state.homeTeam, ...updates } })),

    updateAwayTeam: (updates: Partial<TeamConfig>) =>
      set((state) => ({ awayTeam: { ...state.awayTeam, ...updates } })),

    selectPlayer: (id: string | null) => set({ selectedPlayerId: id }),
    setHoveredPlayer: (id: string | null) => set({ hoveredPlayerId: id }),
    setSwapTargetPlayer: (id: string | null) => set({ swapTargetPlayerId: id }),
    setIsDragging: (isDragging: boolean) => set({ isDragging }),

    updatePlayerPosition: (playerId: string, x: number, y: number, isBench?: boolean) => {
      const { frames, activeFrameIndex } = get();
      const currentFrame = frames[activeFrameIndex];
      if (!currentFrame) return;

      const newPlayers = currentFrame.players.map((p) => {
        if (p.id === playerId) {
          return {
            ...p,
            x: Math.max(0, Math.min(100, x)),
            y: Math.max(0, Math.min(115, y)), // allow slightly below pitch for bench
            isBench: isBench !== undefined ? isBench : p.isBench,
          };
        }
        return p;
      });

      const updatedFrames = [...frames];
      updatedFrames[activeFrameIndex] = { ...currentFrame, players: newPlayers };
      set({ frames: updatedFrames });
    },

    updatePlayerRotation: (playerId: string, rotation: number) => {
      const { frames, activeFrameIndex } = get();
      const currentFrame = frames[activeFrameIndex];
      if (!currentFrame) return;

      // Normalize rotation between 0 and 360
      const normRot = ((rotation % 360) + 360) % 360;

      const newPlayers = currentFrame.players.map((p) =>
        p.id === playerId ? { ...p, rotation: normRot } : p
      );

      const updatedFrames = [...frames];
      updatedFrames[activeFrameIndex] = { ...currentFrame, players: newPlayers };
      set({ frames: updatedFrames });
    },

    updatePlayer: (playerId: string, updates: Partial<PlayerToken>) => {
      const { frames, activeFrameIndex } = get();
      const currentFrame = frames[activeFrameIndex];
      if (!currentFrame) return;

      // Update across all frames if it's name or number, or in current frame if it's tactical
      const updatedFrames = frames.map((frame, idx) => {
        if (idx === activeFrameIndex) {
          return {
            ...frame,
            players: frame.players.map((p) => (p.id === playerId ? { ...p, ...updates } : p)),
          };
        }
        // Sync static props (name, number, role, team) across frames
        return {
          ...frame,
          players: frame.players.map((p) => {
            if (p.id === playerId) {
              return {
                ...p,
                name: updates.name !== undefined ? updates.name : p.name,
                number: updates.number !== undefined ? updates.number : p.number,
                role: updates.role !== undefined ? updates.role : p.role,
                customColor: updates.customColor !== undefined ? updates.customColor : p.customColor,
                customTextColor:
                  updates.customTextColor !== undefined ? updates.customTextColor : p.customTextColor,
              };
            }
            return p;
          }),
        };
      });

      set({ frames: updatedFrames });
    },

    swapPlayers: (playerAId: string, playerBId: string) => {
      const { frames, activeFrameIndex } = get();
      const currentFrame = frames[activeFrameIndex];
      if (!currentFrame) return;

      const pA = currentFrame.players.find((p) => p.id === playerAId);
      const pB = currentFrame.players.find((p) => p.id === playerBId);
      if (!pA || !pB) return;

      const newPlayers = currentFrame.players.map((p) => {
        if (p.id === playerAId) {
          return { ...p, x: pB.x, y: pB.y, rotation: pB.rotation, isBench: pB.isBench };
        }
        if (p.id === playerBId) {
          return { ...p, x: pA.x, y: pA.y, rotation: pA.rotation, isBench: pA.isBench };
        }
        return p;
      });

      const updatedFrames = [...frames];
      updatedFrames[activeFrameIndex] = { ...currentFrame, players: newPlayers };
      set({ frames: updatedFrames, swapTargetPlayerId: null });
    },

    addPlayer: (team: TeamSide, isBench = false) => {
      const { frames, activeFrameIndex } = get();
      const currentFrame = frames[activeFrameIndex];
      if (!currentFrame) return;

      const teamPlayers = currentFrame.players.filter((p) => p.team === team);
      const maxNum = teamPlayers.reduce((max, p) => Math.max(max, p.number), 0);
      const newNumber = maxNum + 1;
      const isHome = team === 'home';

      const newPlayer: PlayerToken = {
        id: `${team}-custom-${Date.now()}`,
        team,
        number: newNumber,
        name: `${isHome ? 'H' : 'A'}${newNumber}`,
        x: isBench ? (isHome ? 15 : 85) : isHome ? 35 : 65,
        y: isBench ? 106 : 50,
        rotation: isHome ? 0 : 180,
        isBench,
        isGoalkeeper: false,
        role: isBench ? 'SUB' : 'PL',
      };

      const updatedFrames = frames.map((frame) => ({
        ...frame,
        players: [...frame.players, { ...newPlayer }],
      }));

      set({ frames: updatedFrames, selectedPlayerId: newPlayer.id });
    },

    removePlayer: (playerId: string) => {
      const { frames, selectedPlayerId } = get();
      const updatedFrames = frames.map((frame) => ({
        ...frame,
        players: frame.players.filter((p) => p.id !== playerId),
      }));

      set({
        frames: updatedFrames,
        selectedPlayerId: selectedPlayerId === playerId ? null : selectedPlayerId,
      });
    },

    toggleBenchPlayer: (playerId: string) => {
      const { frames, activeFrameIndex } = get();
      const currentFrame = frames[activeFrameIndex];
      if (!currentFrame) return;

      const target = currentFrame.players.find((p) => p.id === playerId);
      if (!target) return;

      const willBeBench = !target.isBench;
      const newY = willBeBench ? 106 : 50;
      const newX = target.team === 'home' ? 25 : 75;

      const newPlayers = currentFrame.players.map((p) =>
        p.id === playerId ? { ...p, isBench: willBeBench, x: newX, y: newY } : p
      );

      const updatedFrames = [...frames];
      updatedFrames[activeFrameIndex] = { ...currentFrame, players: newPlayers };
      set({ frames: updatedFrames });
    },

    applyFormation: (team: TeamSide, presetName: string) => {
      const { frames, activeFrameIndex, pitchType } = get();
      const currentFrame = frames[activeFrameIndex];
      if (!currentFrame) return;

      const presets = getFormationsForPitch(pitchType);
      const preset = presets.find((p) => p.name === presetName);
      if (!preset) return;

      const isHome = team === 'home';
      const teamActivePlayers = currentFrame.players.filter(
        (p) => p.team === team && !p.isBench
      );

      // Map positions onto current active players
      const newPlayers = currentFrame.players.map((p) => {
        if (p.team !== team || p.isBench) return p;

        const idx = teamActivePlayers.findIndex((ap) => ap.id === p.id);
        if (idx >= 0 && idx < preset.positions.length) {
          const pos = preset.positions[idx];
          return {
            ...p,
            x: isHome ? pos.x : 100 - pos.x,
            y: isHome ? pos.y : 100 - pos.y,
            role: pos.role,
            rotation: isHome ? 0 : 180,
          };
        }
        return p;
      });

      const updatedFrames = [...frames];
      updatedFrames[activeFrameIndex] = { ...currentFrame, players: newPlayers };
      set({ frames: updatedFrames });
    },

    updateBallPosition: (x: number, y: number) => {
      const { frames, activeFrameIndex } = get();
      const currentFrame = frames[activeFrameIndex];
      if (!currentFrame) return;

      const newBall: BallToken = {
        ...currentFrame.ball,
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
      };

      const updatedFrames = [...frames];
      updatedFrames[activeFrameIndex] = { ...currentFrame, ball: newBall };
      set({ frames: updatedFrames });
    },

    setActiveFrame: (index: number) => {
      const { frames } = get();
      if (index >= 0 && index < frames.length) {
        set({ activeFrameIndex: index });
      }
    },

    addFrame: () => {
      const { frames, activeFrameIndex } = get();
      const currentFrame = frames[activeFrameIndex];
      if (!currentFrame) return;

      // Deep clone current frame state for seamless tweening
      const newFrame: TacticalKeyframe = {
        id: `frame-${Date.now()}-${frames.length + 1}`,
        name: `Frame ${frames.length + 1}`,
        players: currentFrame.players.map((p) => ({ ...p })),
        ball: { ...currentFrame.ball },
        duration: 1.5,
      };

      const insertIndex = activeFrameIndex + 1;
      const updatedFrames = [
        ...frames.slice(0, insertIndex),
        newFrame,
        ...frames.slice(insertIndex),
      ];

      set({
        frames: updatedFrames,
        activeFrameIndex: insertIndex,
      });
    },

    duplicateFrame: (index: number) => {
      const { frames } = get();
      const frameToDuplicate = frames[index];
      if (!frameToDuplicate) return;

      const newFrame: TacticalKeyframe = {
        id: `frame-${Date.now()}-${frames.length + 1}`,
        name: `${frameToDuplicate.name} (Copy)`,
        players: frameToDuplicate.players.map((p) => ({ ...p })),
        ball: { ...frameToDuplicate.ball },
        duration: frameToDuplicate.duration,
      };

      const insertIndex = index + 1;
      const updatedFrames = [
        ...frames.slice(0, insertIndex),
        newFrame,
        ...frames.slice(insertIndex),
      ];

      set({
        frames: updatedFrames,
        activeFrameIndex: insertIndex,
      });
    },

    removeFrame: (index: number) => {
      const { frames, activeFrameIndex } = get();
      if (frames.length <= 1) return; // Keep at least one frame

      const updatedFrames = frames.filter((_, idx) => idx !== index);
      const newActive = Math.min(activeFrameIndex, updatedFrames.length - 1);

      set({
        frames: updatedFrames,
        activeFrameIndex: newActive,
      });
    },

    updateFrameDuration: (index: number, duration: number) => {
      const { frames } = get();
      const updatedFrames = [...frames];
      if (updatedFrames[index]) {
        updatedFrames[index] = { ...updatedFrames[index], duration: Math.max(0.2, duration) };
        set({ frames: updatedFrames });
      }
    },

    loadPlayPreset: (frames: TacticalKeyframe[]) => {
      if (!frames || frames.length === 0) return;
      set({
        frames,
        activeFrameIndex: 0,
        selectedPlayerId: null,
        hoveredPlayerId: null,
        swapTargetPlayerId: null,
        interpolatedFrame: null,
        isPlaying: false,
      });
    },

    setActiveTool: (tool: ActiveTool) => set({ activeTool: tool, selectedPlayerId: null }),
    setActiveDrawingColor: (color: string) => set({ activeDrawingColor: color }),

    addDrawing: (drawing: DrawingElement) => {
      const { frames, activeFrameIndex } = get();
      const currentFrame = frames[activeFrameIndex];
      if (!currentFrame) return;

      const existing = currentFrame.drawings || [];
      const updatedFrames = [...frames];
      updatedFrames[activeFrameIndex] = {
        ...currentFrame,
        drawings: [...existing, drawing],
      };
      set({ frames: updatedFrames });
    },

    removeDrawing: (id: string) => {
      const { frames, activeFrameIndex } = get();
      const currentFrame = frames[activeFrameIndex];
      if (!currentFrame) return;

      const updatedDrawings = (currentFrame.drawings || []).filter((d) => d.id !== id);
      const updatedFrames = [...frames];
      updatedFrames[activeFrameIndex] = {
        ...currentFrame,
        drawings: updatedDrawings,
      };
      set({ frames: updatedFrames });
    },

    clearDrawings: () => {
      const { frames, activeFrameIndex } = get();
      const currentFrame = frames[activeFrameIndex];
      if (!currentFrame) return;

      const updatedFrames = [...frames];
      updatedFrames[activeFrameIndex] = {
        ...currentFrame,
        drawings: [],
      };
      set({ frames: updatedFrames });
    },

    setInterpolatedFrame: (frame: TacticalKeyframe | null) => set({ interpolatedFrame: frame }),
    setPlaybackProgress: (playbackProgress: number) => set({ playbackProgress }),
    setIsRecording: (isRecording: boolean) => set({ isRecording }),

    loadProjectData: (data: TacticsExportData) => {
      if (!data || !data.frames || data.frames.length === 0) return;
      set({
        pitchType: data.pitchType || 'football',
        pitchView: data.pitchView || 'full',
        pitchSurface: data.pitchSurface || 'grass',
        showGrid: !!data.showGrid,
        showZones: !!data.showZones,
        zoneColor: data.zoneColor || '#fbbf24',
        homeTeam: data.homeTeam || DEFAULT_HOME_TEAM,
        awayTeam: data.awayTeam || DEFAULT_AWAY_TEAM,
        frames: data.frames,
        activeFrameIndex: 0,
        selectedPlayerId: null,
        hoveredPlayerId: null,
        swapTargetPlayerId: null,
        interpolatedFrame: null,
        isPlaying: false,
      });
    },

    setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),
    setPlaybackSpeed: (playbackSpeed: number) => set({ playbackSpeed }),

    resetTactics: () => {
      const { pitchType } = get();
      const newFrame = createInitialKeyframe(pitchType);
      set({
        frames: [newFrame],
        activeFrameIndex: 0,
        selectedPlayerId: null,
        hoveredPlayerId: null,
        swapTargetPlayerId: null,
        interpolatedFrame: null,
        isPlaying: false,
      });
    },
  };
});

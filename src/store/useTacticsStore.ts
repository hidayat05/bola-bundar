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
  TokenStyle,
  TargetZoneKey,
} from '../types/tactics';
import { generateInitialSquad, getFormationsForPitch } from '../utils/formations';
import { calculatePitchLayout } from '../utils/pitchGeometry';
import { calculateDefensiveWall, getDefaultBarrierDistance } from '../utils/setpieceUtils';
import { SetpiecePreset } from '../utils/setpiecePresets';

interface TacticsState {
  pitchType: PitchType;
  pitchView: PitchView;
  pitchSurface: PitchSurface;
  showGrid: boolean;
  gridColor: string;
  showZones: boolean;
  zoneColor: string;
  showTooltips: boolean;
  teamDisplayMode: TeamDisplayMode; // 'both' | 'single'
  soloTeamSide: 'home' | 'away';
  tokenStyle: TokenStyle; // 'jersey' | 'circle'

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
  setGridColor: (color: string) => void;
  setShowZones: (show: boolean) => void;
  setZoneColor: (color: string) => void;
  setShowTooltips: (show: boolean) => void;
  setTeamDisplayMode: (mode: TeamDisplayMode) => void;
  setSoloTeamSide: (side: 'home' | 'away') => void;
  setTokenStyle: (style: TokenStyle) => void;

  // Setpiece Mode & Assistant Tools
  isSetpieceMode: boolean;
  showDistanceBarrier: boolean;
  barrierDistance: number | null; // in meters, null means auto default per sport
  setpieceAttackingTeam: 'home' | 'away';
  setIsSetpieceMode: (enabled: boolean) => void;
  setShowDistanceBarrier: (show: boolean) => void;
  setBarrierDistance: (dist: number | null) => void;
  setSetpieceAttackingTeam: (team: 'home' | 'away') => void;
  toggleAttackingGk: () => void;
  wallPlayerIds: string[];
  createDefensiveWall: (playerCount: number) => void;
  disbandDefensiveWall: () => void;
  realignDefensiveWall: () => void;
  setActivePlayerCount: (team: TeamSide, targetCount: number) => void;
  restoreFullSquad: () => void;
  preSetpieceSnapshot: { frames: TacticalKeyframe[]; pitchView: PitchView } | null;

  // Target Zones & Presets Library
  showTargetZones: boolean;
  activeTargetZone: TargetZoneKey | 'all' | null;
  setShowTargetZones: (show: boolean) => void;
  setActiveTargetZone: (zone: TargetZoneKey | 'all' | null) => void;
  isSetpiecePresetsModalOpen: boolean;
  setIsSetpiecePresetsModalOpen: (open: boolean) => void;
  loadSetpiecePreset: (preset: SetpiecePreset) => void;

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
    gridColor: '#94a3b8',
    showZones: false,
    zoneColor: '#fbbf24',
    showTooltips: typeof window !== 'undefined' ? localStorage.getItem('bola_bundar_tooltips') !== 'false' : true,
    teamDisplayMode: 'both',
    soloTeamSide: 'home',
    tokenStyle: (typeof window !== 'undefined' && localStorage.getItem('bola_bundar_token_style') === 'circle') ? 'circle' : 'jersey',

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
      const defaultBarrier = getDefaultBarrierDistance(pitchType);
      set({
        pitchType,
        pitchSurface: surface,
        frames: [newFrame],
        activeFrameIndex: 0,
        selectedPlayerId: null,
        barrierDistance: defaultBarrier,
      });
    },

    setPitchView: (pitchView: PitchView) => {
      const { pitchView: currentView, frames, preSetpieceSnapshot } = get();
      if (currentView === pitchView) return;

      // When returning from half/third back to full pitch, restore full squad as originally
      if (pitchView === 'full') {
        get().restoreFullSquad();
        return;
      }

      // When transitioning into half or third, save snapshot if not yet saved
      const snapshot = preSetpieceSnapshot || {
        frames: JSON.parse(JSON.stringify(frames)),
        pitchView: currentView,
      };

      let updatedFrames = frames;

      // In half pitch or 1/3 box zoom, the camera focuses on the attacking goal on the right.
      // The defending goalkeeper (Away GK) guards the goal at x=93.
      // The attacking goalkeeper (Home GK) logically stays in their own half / dugout (bench)
      // and should NOT awkwardly advance into the opponent's attacking box.
      if (currentView === 'full' && (pitchView === 'half' || pitchView === 'third')) {
        updatedFrames = frames.map((frame) => ({
          ...frame,
          players: frame.players.map((p) => {
            if (p.team === 'home' && (p.isGoalkeeper || p.role === 'GK' || p.number === 1)) {
              return { ...p, isBench: true, x: 25, y: 106 };
            }
            return p;
          }),
        }));
      }

      set({
        pitchView,
        frames: updatedFrames,
        preSetpieceSnapshot: snapshot,
      });
    },
    setPitchSurface: (pitchSurface: PitchSurface) => set({ pitchSurface }),
    setShowGrid: (showGrid: boolean) => set({ showGrid }),
    setGridColor: (gridColor: string) => set({ gridColor }),
    setShowZones: (showZones: boolean) => set({ showZones }),
    setZoneColor: (zoneColor: string) => set({ zoneColor }),
    setShowTooltips: (showTooltips: boolean) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('bola_bundar_tooltips', showTooltips ? 'true' : 'false');
      }
      set({ showTooltips });
    },
    setTeamDisplayMode: (teamDisplayMode: TeamDisplayMode) => set({ teamDisplayMode }),
    setSoloTeamSide: (soloTeamSide: 'home' | 'away') => set({ soloTeamSide }),
    setTokenStyle: (tokenStyle: TokenStyle) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('bola_bundar_token_style', tokenStyle);
      }
      set({ tokenStyle });
    },

    // Setpiece State & Setters
    isSetpieceMode: false,
    showDistanceBarrier: false,
    barrierDistance: null,
    setpieceAttackingTeam: 'home',
    preSetpieceSnapshot: null,

    // Restore Full Squad (unbenches players, restores formations & full player counts: 11 for 11v11, 8/7 for mini, 5 for futsal)
    restoreFullSquad: () => {
      const { frames, pitchType, preSetpieceSnapshot } = get();
      const defaultPresets = getFormationsForPitch(pitchType);
      const defaultPreset = defaultPresets[0];

      const updatedFrames = frames.map((frame, frameIdx) => {
        const snapshotFrame = preSetpieceSnapshot?.frames?.[frameIdx] || preSetpieceSnapshot?.frames?.[0];
        let players = [...frame.players];

        // 1. If snapshot exists, restore player positions and bench status from snapshot
        if (snapshotFrame && snapshotFrame.players && snapshotFrame.players.length > 0) {
          const snapMap = new Map<string, PlayerToken>();
          snapshotFrame.players.forEach((p: PlayerToken) => {
            snapMap.set(p.id, p);
            snapMap.set(`${p.team}-${p.number}`, p);
          });

          // Update existing players that match snapshot
          players = players.map((p) => {
            const snap = snapMap.get(p.id) || snapMap.get(`${p.team}-${p.number}`);
            if (snap) {
              return {
                ...p,
                isBench: snap.isBench,
                x: snap.x,
                y: snap.y,
                rotation: snap.rotation,
                isWall: false,
              };
            }
            return p;
          });

          // If snapshot had players that don't exist in current frame (e.g. preset had removed them), add them back!
          snapshotFrame.players.forEach((snapP: PlayerToken) => {
            const alreadyExists = players.some(
              (p) => p.id === snapP.id || (p.team === snapP.team && p.number === snapP.number)
            );
            if (!alreadyExists) {
              players.push({
                ...snapP,
                isWall: false,
              });
            }
          });
        }

        // 2. Guarantee both teams have the exact standard full squad active on pitch:
        // - Football: 11 active players per team
        // - Mini-soccer: 8 or 7 active players per team
        // - Futsal: 5 active players per team
        (['home', 'away'] as const).forEach((team) => {
          const isHome = team === 'home';
          const teamPlayers = players.filter((p) => p.team === team);

          let targetCount = 11;
          if (pitchType === 'futsal') {
            targetCount = 5;
          } else if (pitchType === 'mini-soccer') {
            const snapActive = snapshotFrame?.players.filter((p) => p.team === team && !p.isBench).length;
            if (snapActive === 8 || snapActive === 7) {
              targetCount = snapActive;
            } else {
              const hasNum8 = teamPlayers.some((p) => p.number === 8);
              targetCount = hasNum8 ? 8 : 7;
            }
          }

          let activePlayers = teamPlayers.filter((p) => !p.isBench);

          // A) Activate from bench first if active players < targetCount
          if (activePlayers.length < targetCount) {
            const needed = targetCount - activePlayers.length;
            const benchPlayers = teamPlayers.filter((p) => p.isBench);
            const toActivate = benchPlayers.slice(0, needed);
            const toActivateIds = new Set(toActivate.map((p) => p.id));

            players = players.map((p) => {
              if (toActivateIds.has(p.id)) {
                const presetPos = defaultPreset?.positions?.[p.number - 1];
                let posX = isHome
                  ? (presetPos ? presetPos.x : 20 + ((p.number * 5) % 25))
                  : (presetPos ? 100 - presetPos.x : 80 - ((p.number * 5) % 25));
                let posY = presetPos
                  ? (isHome ? presetPos.y : 100 - presetPos.y)
                  : 20 + ((p.number * 8) % 60);

                if (p.isGoalkeeper || p.role === 'GK' || p.number === 1) {
                  posX = isHome ? 7 : 93;
                  posY = 50;
                }

                return {
                  ...p,
                  isBench: false,
                  isWall: false,
                  x: posX,
                  y: posY,
                  rotation: isHome ? 0 : 180,
                };
              }
              return p;
            });
          }

          // B) If bench still didn't have enough players (e.g. loaded preset that had no bench), generate missing formation players
          const currentActiveCount = players.filter((p) => p.team === team && !p.isBench).length;
          if (currentActiveCount < targetCount) {
            const stillNeeded = targetCount - currentActiveCount;
            const existingNumbers = new Set(players.filter((p) => p.team === team).map((p) => p.number));

            for (let i = 0; i < stillNeeded; i++) {
              let newNum = 1;
              while (existingNumbers.has(newNum)) {
                newNum++;
              }
              existingNumbers.add(newNum);

              const presetPos = defaultPreset?.positions?.[newNum - 1];
              let posX = isHome
                ? (presetPos ? presetPos.x : 20 + ((newNum * 5) % 25))
                : (presetPos ? 100 - presetPos.x : 80 - ((newNum * 5) % 25));
              let posY = presetPos
                ? (isHome ? presetPos.y : 100 - presetPos.y)
                : 20 + ((newNum * 8) % 60);

              if (newNum === 1) {
                posX = isHome ? 7 : 93;
                posY = 50;
              }

              players.push({
                id: `${team}-restored-${newNum}`,
                team,
                number: newNum,
                name: `${isHome ? 'H' : 'A'}${newNum}`,
                x: posX,
                y: posY,
                rotation: isHome ? 0 : 180,
                isBench: false,
                isGoalkeeper: newNum === 1,
                role: presetPos?.role || (newNum === 1 ? 'GK' : 'PL'),
              });
            }
          }

          // C) If active players > targetCount: bench the excess outfield players
          const finalActive = players.filter((p) => p.team === team && !p.isBench);
          if (finalActive.length > targetCount) {
            const excess = finalActive.length - targetCount;
            const toBench = finalActive
              .filter((p) => !p.isGoalkeeper && p.role !== 'GK' && p.number !== 1)
              .sort((a, b) => b.number - a.number)
              .slice(0, excess);
            const toBenchIds = new Set(toBench.map((p) => p.id));

            players = players.map((p) => {
              if (toBenchIds.has(p.id)) {
                return {
                  ...p,
                  isBench: true,
                  isWall: false,
                  x: isHome ? 15 : 85,
                  y: 106,
                };
              }
              return p;
            });
          }

          // D) Guarantee Home GK and Away GK are active and at their goals
          players = players.map((p) => {
            if (p.team === 'home' && (p.isGoalkeeper || p.role === 'GK' || p.number === 1)) {
              return {
                ...p,
                isBench: false,
                x: 7,
                y: 50,
                rotation: 0,
              };
            }
            if (p.team === 'away' && (p.isGoalkeeper || p.role === 'GK' || p.number === 1)) {
              return {
                ...p,
                isBench: false,
                x: 93,
                y: 50,
                rotation: 180,
              };
            }
            return p;
          });
        });

        return { ...frame, players };
      });

      set({
        frames: updatedFrames,
        pitchView: 'full',
        wallPlayerIds: [],
        preSetpieceSnapshot: null,
      });
    },

    setIsSetpieceMode: (isSetpieceMode: boolean) => {
      const { frames, pitchView, preSetpieceSnapshot } = get();

      if (!isSetpieceMode) {
        // Exiting setpiece mode: return to full pitch with original number of players as before
        get().restoreFullSquad();
        set({
          isSetpieceMode: false,
          showDistanceBarrier: false,
          showTargetZones: false,
          selectedPlayerId: null,
        });
        return;
      }

      // Entering setpiece mode: capture snapshot if not already saved
      const snapshot = preSetpieceSnapshot || {
        frames: JSON.parse(JSON.stringify(frames)),
        pitchView,
      };

      let updatedFrames = frames;

      // If opening setpiece mode in half or third, ensure Home GK is placed in the dugout bench
      if (pitchView === 'half' || pitchView === 'third') {
        updatedFrames = frames.map((frame) => ({
          ...frame,
          players: frame.players.map((p) => {
            if (
              p.team === 'home' &&
              (p.isGoalkeeper || p.role === 'GK' || p.number === 1) &&
              !p.isBench &&
              p.x < 25
            ) {
              return { ...p, isBench: true, x: 25, y: 106 };
            }
            return p;
          }),
        }));
      }

      set((state) => ({
        isSetpieceMode: true,
        preSetpieceSnapshot: snapshot,
        frames: updatedFrames,
        showDistanceBarrier: true,
        showTargetZones: true,
        barrierDistance: getDefaultBarrierDistance(state.pitchType),
      }));
    },
    setShowDistanceBarrier: (showDistanceBarrier: boolean) => set({ showDistanceBarrier }),
    setBarrierDistance: (barrierDistance: number | null) => set({ barrierDistance }),
    setSetpieceAttackingTeam: (setpieceAttackingTeam: 'home' | 'away') =>
      set({ setpieceAttackingTeam }),

    // Target Zones & Presets Library
    showTargetZones: false,
    activeTargetZone: 'all',
    isSetpiecePresetsModalOpen: false,
    setShowTargetZones: (showTargetZones: boolean) => set({ showTargetZones }),
    setActiveTargetZone: (activeTargetZone: TargetZoneKey | 'all' | null) => set({ activeTargetZone }),
    setIsSetpiecePresetsModalOpen: (isSetpiecePresetsModalOpen: boolean) =>
      set({ isSetpiecePresetsModalOpen }),
    loadSetpiecePreset: (preset: SetpiecePreset) => {
      const { frames, pitchView, preSetpieceSnapshot } = get();
      const snapshot = preSetpieceSnapshot || {
        frames: JSON.parse(JSON.stringify(frames)),
        pitchView,
      };
      set({
        pitchType: preset.category,
        pitchView: preset.recommendedPitchView || 'third',
        isSetpieceMode: true,
        preSetpieceSnapshot: snapshot,
        showDistanceBarrier: true,
        barrierDistance: preset.barrierDistance,
        showTargetZones: true,
        activeTargetZone: preset.targetZoneHighlight || 'all',
        frames: preset.frames,
        activeFrameIndex: 0,
        isPlaying: false,
        interpolatedFrame: null,
        playbackProgress: 0,
        selectedPlayerId: null,
        wallPlayerIds: preset.frames[0]?.players.filter((p) => p.isWall).map((p) => p.id) || [],
        isSetpiecePresetsModalOpen: false,
      });
    },

    toggleAttackingGk: () => {
      const { frames, activeFrameIndex } = get();
      const currentFrame = frames[activeFrameIndex];
      if (!currentFrame) return;

      const homeGk = currentFrame.players.find(
        (p) => p.team === 'home' && (p.isGoalkeeper || p.role === 'GK' || p.number === 1)
      );
      if (!homeGk) return;

      const willJoin = homeGk.isBench;

      const updatedFrames = frames.map((frame, idx) => {
        if (idx === activeFrameIndex) {
          return {
            ...frame,
            players: frame.players.map((p) => {
              if (p.id === homeGk.id) {
                return willJoin
                  ? { ...p, isBench: false, x: 72, y: 50, rotation: 0 }
                  : { ...p, isBench: true, x: 25, y: 106 };
              }
              return p;
            }),
          };
        }
        return frame;
      });

      set({ frames: updatedFrames });
    },

    wallPlayerIds: [],

    createDefensiveWall: (playerCount: number) => {
      const {
        frames,
        activeFrameIndex,
        setpieceAttackingTeam,
        barrierDistance,
        pitchType,
        pitchView,
      } = get();
      const currentFrame = frames[activeFrameIndex];
      if (!currentFrame) return;

      const defendingTeam = setpieceAttackingTeam === 'home' ? 'away' : 'home';
      const effectiveDist = barrierDistance ?? getDefaultBarrierDistance(pitchType);

      const layout = calculatePitchLayout(
        typeof window !== 'undefined' ? window.innerWidth : 800,
        typeof window !== 'undefined' ? window.innerHeight : 600,
        pitchType,
        pitchView
      );

      // Defending outfield players (exclude GK)
      let outfieldDefenders = currentFrame.players.filter(
        (p) => p.team === defendingTeam && !p.isBench && !p.isGoalkeeper && p.role !== 'GK'
      );

      // If not enough defenders on pitch, activate from bench
      if (outfieldDefenders.length < playerCount) {
        const benchDefenders = currentFrame.players.filter(
          (p) => p.team === defendingTeam && p.isBench && !p.isGoalkeeper && p.role !== 'GK'
        );
        const needed = playerCount - outfieldDefenders.length;
        const activated = benchDefenders.slice(0, needed);
        outfieldDefenders = [...outfieldDefenders, ...activated];
      }

      const wallDefenders = calculateDefensiveWall(
        currentFrame.ball,
        outfieldDefenders,
        playerCount,
        effectiveDist,
        layout,
        pitchType,
        pitchView,
        defendingTeam
      );

      const wallIds = wallDefenders.map((p) => p.id);

      const updatedPlayers = currentFrame.players.map((p) => {
        const inWall = wallDefenders.find((wp) => wp.id === p.id);
        if (inWall) {
          return inWall;
        }
        if (p.isWall && !wallIds.includes(p.id)) {
          return { ...p, isWall: false };
        }
        return p;
      });

      const updatedFrames = [...frames];
      updatedFrames[activeFrameIndex] = { ...currentFrame, players: updatedPlayers };
      set({ frames: updatedFrames, wallPlayerIds: wallIds });
    },

    disbandDefensiveWall: () => {
      const { frames, activeFrameIndex } = get();
      const currentFrame = frames[activeFrameIndex];
      if (!currentFrame) return;

      const updatedPlayers = currentFrame.players.map((p) =>
        p.isWall ? { ...p, isWall: false } : p
      );

      const updatedFrames = [...frames];
      updatedFrames[activeFrameIndex] = { ...currentFrame, players: updatedPlayers };
      set({ frames: updatedFrames, wallPlayerIds: [] });
    },

    realignDefensiveWall: () => {
      const { wallPlayerIds } = get();
      if (wallPlayerIds.length > 0) {
        get().createDefensiveWall(wallPlayerIds.length);
      }
    },

    setActivePlayerCount: (team: TeamSide, targetCount: number) => {
      const { frames, activeFrameIndex, pitchView, preSetpieceSnapshot } = get();
      const currentFrame = frames[activeFrameIndex];
      if (!currentFrame) return;

      // Save pre-setpiece snapshot if not yet saved
      const snapshot = preSetpieceSnapshot || {
        frames: JSON.parse(JSON.stringify(frames)),
        pitchView,
      };

      const clampedTarget = Math.max(1, Math.min(15, targetCount));
      const teamPlayers = currentFrame.players.filter((p) => p.team === team);
      const activePlayers = teamPlayers.filter((p) => !p.isBench);

      if (activePlayers.length === clampedTarget) return;

      if (activePlayers.length < clampedTarget) {
        // Need to add more active players on the pitch
        const diff = clampedTarget - activePlayers.length;
        const benchAvailable = teamPlayers.filter((p) => p.isBench);

        // Take from bench first
        const toActivateIds = benchAvailable.slice(0, diff).map((p) => p.id);
        const remainingNeeded = diff - toActivateIds.length;

        const newPlayers = currentFrame.players.map((p) => {
          if (toActivateIds.includes(p.id)) {
            const isHome = team === 'home';
            let posX = isHome ? 35 : 65;
            let posY = 25 + ((p.number * 8) % 50);

            if (pitchView === 'third') {
              // Visible range [66.7, 100]
              posX = isHome ? 72 + ((p.number * 3.5) % 18) : 82 + ((p.number * 2.5) % 14);
              posY = 20 + ((p.number * 9) % 60);
            } else if (pitchView === 'half') {
              // Visible range [50, 100]
              posX = isHome ? 55 + ((p.number * 4) % 25) : 78 + ((p.number * 3) % 18);
              posY = 20 + ((p.number * 8) % 60);
            } else {
              posX = isHome ? 35 + ((p.number * 4) % 25) : 65 - ((p.number * 4) % 25);
            }

            return {
              ...p,
              isBench: false,
              x: posX,
              y: posY,
              rotation: isHome ? 0 : 180,
            };
          }
          return p;
        });

        // If bench didn't have enough, generate new player tokens
        for (let i = 0; i < remainingNeeded; i++) {
          const maxNum = newPlayers
            .filter((p) => p.team === team)
            .reduce((max, p) => Math.max(max, p.number), 0);
          const newNumber = maxNum + 1;
          const isHome = team === 'home';
          let posX = isHome ? 35 : 65;
          let posY = 25 + ((i * 14) % 55);

          if (pitchView === 'third') {
            posX = isHome ? 74 + ((i * 4) % 16) : 84 + ((i * 3) % 12);
            posY = 22 + ((i * 15) % 55);
          } else if (pitchView === 'half') {
            posX = isHome ? 58 + ((i * 5) % 22) : 78 + ((i * 4) % 16);
            posY = 22 + ((i * 15) % 55);
          }

          newPlayers.push({
            id: `${team}-custom-${Date.now()}-${i}`,
            team,
            number: newNumber,
            name: `${isHome ? 'H' : 'A'}${newNumber}`,
            x: posX,
            y: posY,
            rotation: isHome ? 0 : 180,
            isBench: false,
            isGoalkeeper: false,
            role: 'PL',
          });
        }

        const toActivateSet = new Set(toActivateIds);
        const updatedFrames = frames.map((frame, idx) => {
          if (idx === activeFrameIndex) {
            return { ...frame, players: newPlayers };
          }
          return {
            ...frame,
            players: frame.players.map((p) =>
              toActivateSet.has(p.id) ? { ...p, isBench: false } : p
            ),
          };
        });
        set({ frames: updatedFrames, preSetpieceSnapshot: snapshot });
      } else {
        // Need to reduce active players (move excess outfield players to bench)
        const diff = activePlayers.length - clampedTarget;
        // Never bench the goalkeeper if possible! Move highest numbered outfield players first
        const candidates = [...activePlayers]
          .filter((p) => !p.isGoalkeeper && p.role !== 'GK')
          .sort((a, b) => b.number - a.number);

        const toBenchIds = candidates.slice(0, diff).map((p) => p.id);
        const toBenchSet = new Set(toBenchIds);

        const newPlayers = currentFrame.players.map((p) => {
          if (toBenchSet.has(p.id)) {
            const isHome = team === 'home';
            return {
              ...p,
              isBench: true,
              isWall: false,
              x: isHome ? 15 : 85,
              y: 106,
            };
          }
          return p;
        });

        const updatedFrames = frames.map((frame, idx) => {
          if (idx === activeFrameIndex) {
            return { ...frame, players: newPlayers };
          }
          return {
            ...frame,
            players: frame.players.map((p) =>
              toBenchSet.has(p.id) ? { ...p, isBench: true, isWall: false } : p
            ),
          };
        });
        set({ frames: updatedFrames, preSetpieceSnapshot: snapshot });
      }
    },

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
        gridColor: data.gridColor || '#94a3b8',
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

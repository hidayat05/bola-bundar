export type SupportedLanguage = 'id' | 'en';

export interface Translations {
  // Brand & General
  brandTitle: string;
  brandSubtitle: string;
  replayIntro: string;
  replayIntroDesc: string;

  // Sports Type
  sport11v11: string;
  sportMini: string;
  sportFutsal: string;

  // Menus in Navbar
  menuPitch: string;
  menuPitchDesc: string;
  menuAnalysis: string;
  menuAnalysisDesc: string;
  menuSession: string;
  menuSessionDesc: string;
  menuFile: string;
  menuFileDesc: string;

  // Pitch Settings
  pitchMode: string;
  pitchViewFull: string;
  pitchViewHalf: string;
  pitchViewThird: string;
  pitchViewFullDesc: string;
  pitchViewHalfDesc: string;
  pitchViewThirdDesc: string;
  pitchSurface: string;
  surfaceGrass: string;
  surfaceFullGreen: string;
  surfaceTurf: string;
  surfaceBlue: string;
  surfaceWood: string;
  surfaceDarkBoard: string;
  teamDisplayMode: string;
  teamDisplayBoth: string;
  teamDisplaySingle: string;
  teamDisplaySingleDesc: string;
  tokenStyle: string;
  tokenJersey: string;
  tokenCircle: string;

  // Tactical Analysis
  analysisHeader: string;
  zones18: string;
  zones18Desc: string;
  zonesColor: string;
  grid: string;
  gridDesc: string;
  gridColor: string;
  compactness: string;
  compactnessDesc: string;
  compactnessOff: string;
  compactnessHome: string;
  compactnessAway: string;
  compactnessBoth: string;
  defensiveLines: string;
  defensiveLinesDesc: string;
  playerFOV: string;
  playerFOVDesc: string;
  customColor: string;
  actionSpotlight: string;
  actionSpotlightDesc: string;
  ballBeacon: string;
  ballBeaconDesc: string;
  findBall: string;
  receiverLabel: string;
  passerLabel: string;
  targetRunSpace: string;
  passDistance: string;

  // Strategy & Tactical Phases
  strategyHUD: string;
  strategyHUDDesc: string;
  strategyModalTitle: string;
  strategyModalSubtitle: string;
  applyStrategyPositions: string;
  applyStrategyAsNextFrame: string;
  applyStrategyThisFrame: string;
  strategyInstructionLabel: string;
  strategyNameLabel: string;
  phaseAttacking: string;
  phaseDefending: string;
  loadMasterSequence: string;
  loadMasterSequenceDesc: string;

  // Session & Tactics
  setpieceMode: string;
  setpieceModeDesc: string;
  setpieceActive: string;
  setpieceInactive: string;
  setpiecePreset: string;
  setpiecePresetDesc: string;
  drillNotes: string;
  drillNotesDesc: string;
  equipmentToolbar: string;
  equipmentToolbarDesc: string;

  // File & System
  snapshotPng: string;
  snapshotPngDesc: string;
  recordVideo: string;
  recordVideoDesc: string;
  recording: string;
  stopRecord: string;
  exportJson: string;
  exportJsonDesc: string;
  importJson: string;
  importJsonDesc: string;
  resetTactics: string;
  resetTacticsDesc: string;
  undo: string;
  undoDesc: string;
  redo: string;
  redoDesc: string;
  fullscreen: string;
  exitFullscreen: string;
  guideTour: string;
  guideTourDesc: string;

  // Mobile Drawer
  mobileMenuTitle: string;
  closeMenu: string;

  // Equipment Toolbar
  equipmentTitle: string;
  coneName: string;
  coneDesc: string;
  mannequinName: string;
  mannequinDesc: string;
  poleName: string;
  poleDesc: string;
  miniGoalName: string;
  miniGoalDesc: string;
  clearEquipment: string;
  clearEquipmentConfirm: string;

  // Drill Notes Modal
  drillModalTitle: string;
  drillModalSubtitle: string;
  drillTitleLabel: string;
  drillTitlePlaceholder: string;
  drillPhaseLabel: string;
  phaseInPossession: string;
  phaseOutOfPossession: string;
  phaseTransAttack: string;
  phaseTransDefend: string;
  phaseSetpiece: string;
  phaseAll: string;
  drillDimensionsLabel: string;
  drillDimensionsPlaceholder: string;
  drillDurationLabel: string;
  drillDurationPlaceholder: string;
  drillPlayerCountLabel: string;
  drillPlayerCountPlaceholder: string;
  drillObjectiveLabel: string;
  drillObjectivePlaceholder: string;
  drillCoachingPointsLabel: string;
  drillPointPlaceholder: string;
  addPoint: string;
  saveNotes: string;
  cancel: string;

  // Drawing Tools
  toolSelect: string;
  toolSelectDesc: string;
  toolPass: string;
  toolPassDesc: string;
  toolCurvedPass: string;
  toolCurvedPassDesc: string;
  toolLoftedPass: string;
  toolLoftedPassDesc: string;
  toolRun: string;
  toolRunDesc: string;
  toolDribble: string;
  toolDribbleDesc: string;
  toolZone: string;
  toolZoneDesc: string;
  toolEraser: string;
  toolEraserDesc: string;
  clearDrawings: string;

  // Colors
  colorAmber: string;
  colorWhite: string;
  colorCyan: string;
  colorRed: string;
  colorLime: string;
  colorOrange: string;
  colorPink: string;
  colorBlue: string;
  colorPurple: string;
  colorSlate: string;
  colorGreen: string;
}

export const translations: Record<SupportedLanguage, Translations> = {
  id: {
    // Brand & General
    brandTitle: 'Bola Bundar',
    brandSubtitle: 'Pro',
    replayIntro: 'Putar Animasi Intro ⚽',
    replayIntroDesc: 'Tonton kembali animasi bola berputar dan membesar',

    // Sports Type
    sport11v11: '11v11',
    sportMini: 'Mini Soccer',
    sportFutsal: 'Futsal',

    // Menus in Navbar
    menuPitch: 'Lapangan',
    menuPitchDesc: 'Tampilan lapangan, tipe olahraga, permukaan & opsi tim',
    menuAnalysis: 'Analisis',
    menuAnalysisDesc: '18 Zona taktis, grid, kompaksi hull m², lini bek, dan visi FOV',
    menuSession: 'Sesi & Taktik',
    menuSessionDesc: 'Catatan drill latihan, peralatan cones/dummy, & preset bola mati',
    menuFile: 'Berkas',
    menuFileDesc: 'Foto PNG, rekam video, ekspor/impor taktik, & reset formasi',

    // Pitch Settings
    pitchMode: 'Sudut Pandang (Zoom)',
    pitchViewFull: 'Lapangan Penuh',
    pitchViewHalf: 'Separuh Lapangan',
    pitchViewThird: '1/3 Final & Kotak Penalti',
    pitchViewFullDesc: 'Tampilan 100% seluruh lapangan',
    pitchViewHalfDesc: 'Fokus pada satu separuh lapangan',
    pitchViewThirdDesc: 'Zoom khusus area kotak penalti & final third',
    pitchSurface: 'Permukaan Lapangan',
    surfaceGrass: 'Rumput Alami (Turf)',
    surfaceFullGreen: 'Rumput Hijau Terang',
    surfaceTurf: 'Rumput Sintetis Gelap',
    surfaceBlue: 'Lantai Futsal Biru',
    surfaceWood: 'Lantai Parket Kayu',
    surfaceDarkBoard: 'Papan Taktis Gelap (Boardroom)',
    teamDisplayMode: 'Mode Tampilan Tim',
    teamDisplayBoth: '2 Tim (Lawan)',
    teamDisplaySingle: '1 Tim (Solo Build-up)',
    teamDisplaySingleDesc: 'Latihan pola menyerang/bertahan tanpa gangguan tim lawan',
    tokenStyle: 'Bentuk Token Pemain',
    tokenJersey: 'Jersey Kit',
    tokenCircle: 'Bulatan Klasik',

    // Tactical Analysis
    analysisHeader: 'Fitur Analisis Taktis',
    zones18: '18 Zona Taktis & Half-spaces',
    zones18Desc: 'Bagi lapangan menjadi 18 zona positional play Guardiola/Cruyff',
    zonesColor: 'Warna Zona',
    grid: 'Grid Taktis Metrik',
    gridDesc: 'Tampilkan garis-garis petak metrik pembantu jarak',
    gridColor: 'Warna Grid',
    compactness: 'Kompaksi Tim (Convex Hull)',
    compactnessDesc: 'Hitung luas area bermain tim dalam meter persegi (m²)',
    compactnessOff: 'Mati',
    compactnessHome: 'Tim Home',
    compactnessAway: 'Tim Away',
    compactnessBoth: 'Kedua Tim',
    defensiveLines: 'Garis Pertahanan (Backline)',
    defensiveLinesDesc: 'Deteksi otomatis lini bek, koneksi antar bek & jarak pemain',
    playerFOV: 'Sudut Pandang Pemain (FOV 110°)',
    playerFOVDesc: 'Kerucut pandang pemain sesuai rotasi arah hadap',
    customColor: 'Warna Kustom',
    actionSpotlight: 'Sorotan Umpan & Pergerakan',
    actionSpotlightDesc: 'Highlight otomatis pemain penerima bola, pengumpan, & area lari',
    ballBeacon: 'Aura & Penanda Posisi Bola',
    ballBeaconDesc: 'Cahaya sorot emas dan pin penanda broadcast agar bola selalu terlihat jelas di lapangan',
    findBall: 'Temukan Bola (Ping)',
    receiverLabel: 'PENERIMA',
    passerLabel: 'PENGUMPAN',
    targetRunSpace: 'Ruang Sasaran',
    passDistance: 'Operan',

    // Strategy & Tactical Phases
    strategyHUD: 'HUD Strategi & Instruksi',
    strategyHUDDesc: 'Tampilkan banner nama strategi dan instruksi taktis di atas layar saat animasi berjalan',
    strategyModalTitle: 'Pola Strategi & Instruksi Frame',
    strategyModalSubtitle: 'Tentukan strategi untuk frame ini dan otomatis posisikan pemain ke pola taktis',
    applyStrategyPositions: 'Terapkan Pola Posisi ke Pemain',
    applyStrategyAsNextFrame: '⚡ Buat Frame & Animasikan Transisi ▶',
    applyStrategyThisFrame: '✏️ Terapkan di Frame Ini',
    strategyInstructionLabel: 'Instruksi Taktis untuk Pemain',
    strategyNameLabel: 'Nama Strategi',
    phaseAttacking: 'Menyerang',
    phaseDefending: 'Bertahan',
    loadMasterSequence: 'Muat Alur: Menyerang ➔ Transisi ➔ Bertahan',
    loadMasterSequenceDesc: 'Muat 3 frame taktis otomatis untuk demonstrasi alur strategi lengkap',

    // Session & Tactics
    setpieceMode: 'Asisten Bola Mati (Setpiece)',
    setpieceModeDesc: 'Lingkaran jarak legal bola, barrier pagar betis, & zoom gawang',
    setpieceActive: 'AKTIF',
    setpieceInactive: 'NONAKTIF',
    setpiecePreset: 'Library Preset Bola Mati',
    setpiecePresetDesc: 'Koleksi skema taktik corner, free kick, dan throw-in siap pakai',
    drillNotes: 'Lembar Sesi Latihan',
    drillNotesDesc: 'Rencana sesi latihan, coaching points, dimensi & durasi drill',
    equipmentToolbar: 'Peralatan Lapangan',
    equipmentToolbarDesc: 'Taruh cones, mannequin dummy, agility poles, & mini goal',

    // File & System
    snapshotPng: 'Ambil Foto PNG',
    snapshotPngDesc: 'Simpan gambar resolusi tinggi papan taktik',
    recordVideo: 'Rekam Video',
    recordVideoDesc: 'Rekam animasi pergerakan taktik ke format .webm',
    recording: 'Merekam...',
    stopRecord: 'Hentikan Rekaman',
    exportJson: 'Ekspor Proyek (.json)',
    exportJsonDesc: 'Simpan file proyek taktik lengkap ke perangkat',
    importJson: 'Impor Proyek (.json)',
    importJsonDesc: 'Muat file proyek taktik yang telah disimpan sebelumnya',
    resetTactics: 'Reset Formasi',
    resetTacticsDesc: 'Kembalikan posisi semua pemain ke formasi standar',
    undo: 'Urungkan (Undo)',
    undoDesc: 'Kembalikan langkah sebelumnya (Ctrl+Z)',
    redo: 'Ulangi (Redo)',
    redoDesc: 'Jalankan kembali langkah yang diurungkan (Ctrl+Y)',
    fullscreen: 'Layar Penuh (Fullscreen)',
    exitFullscreen: 'Keluar Layar Penuh (Esc)',
    guideTour: 'Panduan Tutorial',
    guideTourDesc: 'Buka tur interaktif pengenalan fitur taktik',

    // Mobile Drawer
    mobileMenuTitle: 'Pengaturan & Menu Taktik',
    closeMenu: 'Tutup Menu',

    // Equipment Toolbar
    equipmentTitle: 'Peralatan Latihan',
    coneName: 'Cone / Marker',
    coneDesc: 'Mangkok kerucut pembatas rondo & jalur lari',
    mannequinName: 'Mannequin Dummy',
    mannequinDesc: 'Simulasi rintangan lawan & pagar betis latihan',
    poleName: 'Agility Pole',
    poleDesc: 'Tiang kelincahan latihan dribble zigzag & slalom',
    miniGoalName: 'Mini Goal',
    miniGoalDesc: 'Gawang kecil target latihan akurasi & transisi',
    clearEquipment: 'Hapus Semua Peralatan',
    clearEquipmentConfirm: 'Apakah Anda yakin ingin menghapus semua peralatan dari lapangan?',

    // Drill Notes Modal
    drillModalTitle: 'Lembar Sesi Latihan & Taktik',
    drillModalSubtitle: 'Rencana sesi, instruksi taktis, dan coaching points',
    drillTitleLabel: 'Judul Sesi / Drill',
    drillTitlePlaceholder: 'Contoh: Rondo 4v2 + Sirkulasi Vertikal',
    drillPhaseLabel: 'Fase Permainan',
    phaseInPossession: 'In Possession (Menyerang)',
    phaseOutOfPossession: 'Out of Possession (Bertahan)',
    phaseTransAttack: 'Transisi Menyerang',
    phaseTransDefend: 'Transisi Bertahan (Rest Def)',
    phaseSetpiece: 'Bola Mati (Set Piece)',
    phaseAll: 'Kombinasi / Bebas',
    drillDimensionsLabel: 'Dimensi Lapangan',
    drillDimensionsPlaceholder: 'Contoh: 30m x 25m',
    drillDurationLabel: 'Durasi Latihan',
    drillDurationPlaceholder: 'Contoh: 4 x 4 menit (Istirahat 90s)',
    drillPlayerCountLabel: 'Jumlah Pemain',
    drillPlayerCountPlaceholder: 'Contoh: 8v8 + 2 Netral',
    drillObjectiveLabel: 'Tujuan Taktis / Objektif',
    drillObjectivePlaceholder: 'Jelaskan tujuan utama drill latihan ini...',
    drillCoachingPointsLabel: 'Poin Pelatihan (Coaching Points)',
    drillPointPlaceholder: 'Ketik poin instruksi lalu tekan Tambah...',
    addPoint: 'Tambah',
    saveNotes: 'Simpan Lembar Sesi',
    cancel: 'Batal',

    // Drawing Tools
    toolSelect: 'Pilih & Geser',
    toolSelectDesc: 'Pindahkan token pemain/bola & putar arah hadap',
    toolPass: 'Panah Operan',
    toolPassDesc: 'Garis panah solid penunjuk arah operan bola',
    toolCurvedPass: 'Operan Melengkung (Crossing)',
    toolCurvedPassDesc: 'Garis lengkung parabola untuk crossing sayap atau umpan lambung',
    toolLoftedPass: 'Umpan Lambung (Lofted Pass)',
    toolLoftedPassDesc: 'Lintasan 3D melambung tinggi melewati barisan pertahanan lawan',
    toolRun: 'Jalur Lari (Sprint)',
    toolRunDesc: 'Garis putus-putus pergerakan pemain tanpa bola',
    toolDribble: 'Dribbling',
    toolDribbleDesc: 'Garis gelombang gerakan menggiring bola',
    toolZone: 'Area Taktis',
    toolZoneDesc: 'Blok persegi penanda zona strategi penting',
    toolEraser: 'Penghapus',
    toolEraserDesc: 'Klik coretan anotasi untuk menghapusnya',
    clearDrawings: 'Bersihkan Gambar',

    // Colors
    colorAmber: 'Kuning Amber',
    colorWhite: 'Putih Bersih',
    colorCyan: 'Sian Cerah',
    colorRed: 'Merah',
    colorLime: 'Hijau Lemon',
    colorOrange: 'Oranye',
    colorPink: 'Merah Muda',
    colorBlue: 'Biru Cerah',
    colorPurple: 'Ungu',
    colorSlate: 'Abu Slate',
    colorGreen: 'Hijau Zamrud',
  },

  en: {
    // Brand & General
    brandTitle: 'Bola Bundar',
    brandSubtitle: 'Pro',
    replayIntro: 'Replay Intro Animation ⚽',
    replayIntroDesc: 'Watch the spinning soccer ball intro again',

    // Sports Type
    sport11v11: '11v11',
    sportMini: 'Mini Soccer',
    sportFutsal: 'Futsal',

    // Menus in Navbar
    menuPitch: 'Pitch',
    menuPitchDesc: 'Pitch view, sport type, surface texture & team display',
    menuAnalysis: 'Analysis',
    menuAnalysisDesc: '18 Tactical zones, grid, hull compactness m², backline, & FOV',
    menuSession: 'Session & Drills',
    menuSessionDesc: 'Training drill sheet, equipment cones/dummies, & setpiece routines',
    menuFile: 'File',
    menuFileDesc: 'PNG snapshot, video recorder, export/import tactics, & reset',

    // Pitch Settings
    pitchMode: 'Pitch Zoom / View',
    pitchViewFull: 'Full Pitch',
    pitchViewHalf: 'Half Pitch',
    pitchViewThird: '1/3 Final & Box',
    pitchViewFullDesc: '100% view of the entire pitch',
    pitchViewHalfDesc: 'Focused on one half of the pitch',
    pitchViewThirdDesc: 'Detailed zoom on the penalty area & final third',
    pitchSurface: 'Pitch Surface',
    surfaceGrass: 'Natural Grass Turf',
    surfaceFullGreen: 'Full Green Grass',
    surfaceTurf: 'Dark Green Turf',
    surfaceBlue: 'Futsal Blue Court',
    surfaceWood: 'Parquet Wood Court',
    surfaceDarkBoard: 'Dark Tactical Boardroom',
    teamDisplayMode: 'Team Display Mode',
    teamDisplayBoth: '2 Teams (Opponent)',
    teamDisplaySingle: '1 Team (Solo Shape)',
    teamDisplaySingleDesc: 'Solo build-up shape without opposing squad',
    tokenStyle: 'Player Token Style',
    tokenJersey: 'Jersey Kit',
    tokenCircle: 'Classic Circle',

    // Tactical Analysis
    analysisHeader: 'Tactical Analysis Suite',
    zones18: '18 Tactical Zones & Half-spaces',
    zones18Desc: 'Divide the pitch into Guardiola/Cruyff 18 positional play zones',
    zonesColor: 'Zone Color',
    grid: 'Tactical Metric Grid',
    gridDesc: 'Overlay metric grid boxes for spatial references',
    gridColor: 'Grid Color',
    compactness: 'Team Compactness (Convex Hull)',
    compactnessDesc: 'Calculate team playing surface area in square meters (m²)',
    compactnessOff: 'Off',
    compactnessHome: 'Home Team',
    compactnessAway: 'Away Team',
    compactnessBoth: 'Both Teams',
    defensiveLines: 'Defensive Line (Backline)',
    defensiveLinesDesc: 'Auto-detect backline chain, spacing & offside line',
    playerFOV: 'Player Field of View (FOV 110°)',
    playerFOVDesc: 'Player vision cone matching facing direction',
    customColor: 'Custom Color',
    actionSpotlight: 'Pass & Movement Spotlight',
    actionSpotlightDesc: 'Auto-highlight pass receiver, passer, & player run corridors',
    ballBeacon: 'Ball Beacon & Aura Glow',
    ballBeaconDesc: 'Golden beacon halo and broadcast pin so the ball is always clearly visible',
    findBall: 'Find Ball (Ping)',
    receiverLabel: 'RECEIVER',
    passerLabel: 'PASSER',
    targetRunSpace: 'Target Space',
    passDistance: 'Pass',

    // Strategy & Tactical Phases
    strategyHUD: 'Tactical Strategy HUD',
    strategyHUDDesc: 'Display strategy name banner and coaching instructions on screen during animation',
    strategyModalTitle: 'Frame Strategy & Tactical Movement',
    strategyModalSubtitle: 'Assign a strategy for this frame and automatically arrange player positioning',
    applyStrategyPositions: 'Apply Positioning to Players',
    applyStrategyAsNextFrame: '⚡ Create Next Frame & Animate ▶',
    applyStrategyThisFrame: '✏️ Apply to Current Frame',
    strategyInstructionLabel: 'Tactical Instruction for Players',
    strategyNameLabel: 'Strategy Name',
    phaseAttacking: 'Attacking',
    phaseDefending: 'Defending',
    loadMasterSequence: 'Load Sequence: Attack ➔ Transition ➔ Defend',
    loadMasterSequenceDesc: 'Load 3-frame automatic demonstration of full tactical cycle',

    // Session & Tactics
    setpieceMode: 'Setpiece Assistant',
    setpieceModeDesc: 'Legal distance barrier circle, wall setup, & goal zoom',
    setpieceActive: 'ACTIVE',
    setpieceInactive: 'INACTIVE',
    setpiecePreset: 'Setpiece Routine Library',
    setpiecePresetDesc: 'Ready-to-use corner, free kick, and set-play tactical setups',
    drillNotes: 'Drill Session Sheet',
    drillNotesDesc: 'Training session plan, coaching points, dimensions & duration',
    equipmentToolbar: 'Training Equipment',
    equipmentToolbarDesc: 'Deploy cones, mannequin dummies, agility poles, & mini goals',

    // File & System
    snapshotPng: 'Take PNG Snapshot',
    snapshotPngDesc: 'Save high-resolution tactical board picture',
    recordVideo: 'Record Video',
    recordVideoDesc: 'Record tactical animation movements to .webm video',
    recording: 'Recording...',
    stopRecord: 'Stop Recording',
    exportJson: 'Export Project (.json)',
    exportJsonDesc: 'Save complete tactical project file to device',
    importJson: 'Import Project (.json)',
    importJsonDesc: 'Load previously saved tactical project file',
    resetTactics: 'Reset Formation',
    resetTacticsDesc: 'Restore player tokens back to default formation',
    undo: 'Undo',
    undoDesc: 'Revert previous action (Ctrl+Z)',
    redo: 'Redo',
    redoDesc: 'Re-apply undone action (Ctrl+Y)',
    fullscreen: 'Fullscreen Mode',
    exitFullscreen: 'Exit Fullscreen (Esc)',
    guideTour: 'Guide Tutorial',
    guideTourDesc: 'Interactive step-by-step walkthrough of tactical tools',

    // Mobile Drawer
    mobileMenuTitle: 'Tactical Board Menu',
    closeMenu: 'Close Menu',

    // Equipment Toolbar
    equipmentTitle: 'Training Equipment',
    coneName: 'Cone / Marker',
    coneDesc: 'Boundary marker for rondos & running channels',
    mannequinName: 'Mannequin Dummy',
    mannequinDesc: 'Passive opponent simulation for walls & obstacles',
    poleName: 'Agility Pole',
    poleDesc: 'Agility pole for slalom drills & ball mastery',
    miniGoalName: 'Mini Goal',
    miniGoalDesc: 'Target goal for transition drills & finishing accuracy',
    clearEquipment: 'Clear All Equipment',
    clearEquipmentConfirm: 'Are you sure you want to remove all equipment from the pitch?',

    // Drill Notes Modal
    drillModalTitle: 'Training Drill & Tactical Sheet',
    drillModalSubtitle: 'Session planning, tactical instructions, and coaching points',
    drillTitleLabel: 'Drill / Session Title',
    drillTitlePlaceholder: 'e.g. 4v2 Rondo + Vertical Circulation',
    drillPhaseLabel: 'Game Phase',
    phaseInPossession: 'In Possession (Attacking)',
    phaseOutOfPossession: 'Out of Possession (Defending)',
    phaseTransAttack: 'Attacking Transition',
    phaseTransDefend: 'Defensive Transition (Rest Def)',
    phaseSetpiece: 'Set Piece',
    phaseAll: 'Combination / Open',
    drillDimensionsLabel: 'Pitch Dimensions',
    drillDimensionsPlaceholder: 'e.g. 30m x 25m',
    drillDurationLabel: 'Drill Duration',
    drillDurationPlaceholder: 'e.g. 4 x 4 mins (90s rest)',
    drillPlayerCountLabel: 'Player Count',
    drillPlayerCountPlaceholder: 'e.g. 8v8 + 2 Neutrals',
    drillObjectiveLabel: 'Tactical Objective',
    drillObjectivePlaceholder: 'Describe the primary tactical goal of this session...',
    drillCoachingPointsLabel: 'Coaching Points',
    drillPointPlaceholder: 'Type instruction point and press Add...',
    addPoint: 'Add',
    saveNotes: 'Save Drill Sheet',
    cancel: 'Cancel',

    // Drawing Tools
    toolSelect: 'Select & Move',
    toolSelectDesc: 'Move player/ball tokens and rotate facing angle',
    toolPass: 'Pass Arrow',
    toolPassDesc: 'Solid arrow indicating ball passing path',
    toolCurvedPass: 'Curved Pass (Cross / Lob)',
    toolCurvedPassDesc: 'Parabolic curved pass line for crosses or lobs',
    toolLoftedPass: 'Lofted Pass (3D Arc)',
    toolLoftedPassDesc: '3D high-arc lofted ball — ball rises and descends with physics',
    toolRun: 'Player Run',
    toolRunDesc: 'Dashed line indicating off-the-ball sprint path',
    toolDribble: 'Dribbling',
    toolDribbleDesc: 'Wavy line indicating player ball-carrying run',
    toolZone: 'Tactical Area',
    toolZoneDesc: 'Rectangular block highlighting strategic zones',
    toolEraser: 'Eraser',
    toolEraserDesc: 'Click drawing annotations to delete them',
    clearDrawings: 'Clear Drawings',

    // Colors
    colorAmber: 'Amber Yellow',
    colorWhite: 'Pure White',
    colorCyan: 'Bright Cyan',
    colorRed: 'Red',
    colorLime: 'Lime Green',
    colorOrange: 'Orange',
    colorPink: 'Pink',
    colorBlue: 'Bright Blue',
    colorPurple: 'Purple',
    colorSlate: 'Slate Grey',
    colorGreen: 'Emerald Green',
  },
};

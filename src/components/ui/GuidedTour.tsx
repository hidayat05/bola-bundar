import React, { useState, useEffect, useRef } from 'react';
import {
  Trophy,
  Spline,
  Play,
  Sparkles,
  Layers,
  Users,
  Download,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  Lightbulb,
  Crosshair,
} from 'lucide-react';
import { useTacticsStore } from '../../store/useTacticsStore';

interface TourStep {
  selector?: string;
  badge: string;
  title: string;
  buttonName: string;
  functionDesc: string;
  benefitDesc: string;
  hint: string;
  icon: React.FC<{ className?: string }>;
  accentColor: string;
  placement?: 'bottom' | 'top' | 'left' | 'right' | 'center';
}

const TOUR_STEPS: TourStep[] = [
  {
    selector: '[data-tour="pitch-canvas"]',
    badge: 'Papan Taktik Interaktif',
    buttonName: 'Token Pemain, Bola & Lapangan',
    title: 'Selamat Datang di Bola Bundar! ⚽',
    functionDesc:
      'Geser token pemain dan bola ke mana saja di lapangan. Putar titik kontrol (knob oranye) untuk menentukan arah pandang pemain.',
    benefitDesc:
      'Membantu Anda memvisualisasikan struktur formasi tim secara real-time. Dilengkapi fitur Magnetic Snap saat bola didekatkan ke kaki pemain.',
    hint: 'Tukar posisi (swap) 2 pemain langsung dengan mendrag satu token tepat ke atas token pemain lain.',
    icon: Trophy,
    accentColor: 'from-emerald-500 to-teal-600',
    placement: 'center',
  },
  {
    selector: '[data-tour="pitch-controls"]',
    badge: 'Navigasi Atas (Top Navbar)',
    buttonName: 'Tipe Lapangan (11v11, Mini, Futsal)',
    title: 'Pilihan Dimensi Lapangan',
    functionDesc:
      'Mengubah ukuran dan garis batas lapangan secara instan antara Sepak Bola Besar (11v11), Mini Soccer (7v7/8v8), atau Lapangan Futsal (5v5).',
    benefitDesc:
      'Proporsi dimensi lapangan akan disesuaikan otomatis dengan standar lapangan resmi sehingga ruang taktik selalu akurat.',
    hint: 'Gunakan juga tombol "Full / Half" di sampingnya untuk simulasi skema sepak pojok atau tendangan bebas di setengah lapangan.',
    icon: Crosshair,
    accentColor: 'from-blue-500 to-cyan-600',
    placement: 'bottom',
  },
  {
    selector: '[data-tour="solo-mode"]',
    badge: 'Navigasi Atas (Top Navbar)',
    buttonName: 'Mode 1 Tim (Solo) vs 2 Tim',
    title: 'Fokus Latihan 1 Tim Tanpa Lawan',
    functionDesc:
      'Menyembunyikan tim lawan sehingga di lapangan hanya terdapat 1 tim yang sedang fokus membangun serangan (build-up shape).',
    benefitDesc:
      'Sangat berguna untuk menyusun skema pola aliran bola dan drill passing tanpa terganggu kepadatan token tim lawan.',
    hint: 'Klik badge "Home/Away" di sebelahnya untuk berganti tim mana yang ingin ditampilkan sendiri.',
    icon: Users,
    accentColor: 'from-teal-500 to-emerald-600',
    placement: 'bottom',
  },
  {
    selector: '[data-tour="zones-grid"]',
    badge: 'Navigasi Atas (Top Navbar)',
    buttonName: '18 Zones Grid & Palet Warna',
    title: 'Kisi Taktis 18 Zona Pep & Van Gaal',
    functionDesc:
      'Membagi lapangan menjadi 18 zona analitik modern dengan penomoran standar UEFA, termasuk sorotan khusus Zona 14 (lubang pertahanan lawan).',
    benefitDesc:
      'Memudahkan instruksi pelatih mengenai penguasaan ruang, eksploitasi half-space (sayap dalam), dan pemosisian gelandang serang.',
    hint: 'Klik ikon palet kecil di samping tombol 18 Zones untuk mengganti warna garis zona (Kuning, Putih, Cyan, Merah, dll).',
    icon: Layers,
    accentColor: 'from-amber-500 to-yellow-600',
    placement: 'bottom',
  },
  {
    selector: '[data-tour="drawing-toolbar"]',
    badge: 'Alat Gambar Mengambang (Floating)',
    buttonName: 'Drawing Toolbar (Umpan, Lari, Dribble, Area)',
    title: 'Anotasi & Garis Taktis',
    functionDesc:
      'Menyediakan panah operan lurus (solid), garis lari sprint tanpa bola (dashed), liukan dribble bergelombang (wavy), dan kotak area taktis.',
    benefitDesc:
      'Memvisualisasikan rencana pergerakan taktis sebelum disimulasikan, sehingga pemain memahami jalur lari dan tujuan umpan.',
    hint: 'Pilih warna favorit di palet warna atau gunakan alat Penghapus (Eraser) untuk menghapus goresan.',
    icon: Spline,
    accentColor: 'from-rose-500 to-pink-600',
    placement: 'right',
  },
  {
    selector: '[data-tour="timeline-controls"]',
    badge: 'Timeline Bawah',
    buttonName: 'Play/Pause (▶), Speed, & Add Frame',
    title: 'Keyframe Timeline & Animasi Halus',
    functionDesc:
      'Memutar pergerakan animasi posisi pemain dan operan bola antar-frame dengan interpolasi pergerakan halus 60fps (Cubic Ease-In-Out).',
    benefitDesc:
      'Simulasi taktik bergerak seperti video sungguhan. Anda dapat mengatur kecepatan (0.5x hingga 2x) dan menambah frame baru (📋).',
    hint: 'Pemain akan otomatis memutar arah badannya menghadap arah berlari secara dinamis saat animasi diputar.',
    icon: Play,
    accentColor: 'from-violet-500 to-purple-600',
    placement: 'top',
  },
  {
    selector: '[data-tour="tactical-plays"]',
    badge: 'Timeline Bawah',
    buttonName: 'Pola Lari & Umpan Siap Pakai ⚡',
    title: 'Koleksi Simulasi Taktik Otomatis',
    functionDesc:
      'Memuat pola kombinasi lari dan operan nyata yang siap ditonton: One-Two Wall Pass, Overlapping Wing-Back, dan Third-Man Run.',
    benefitDesc:
      'Tidak perlu menyusun frame dari nol jika ingin menunjukkan contoh pergerakan membuka ruang dan operan satu-dua kepada pemain.',
    hint: 'Pola taktik ini menyesuaikan secara dinamis tergantung apakah Anda berada di lapangan Sepak Bola, Mini Soccer, atau Futsal.',
    icon: Sparkles,
    accentColor: 'from-amber-500 to-orange-600',
    placement: 'top',
  },
  {
    selector: '[data-tour="squad-panel"]',
    badge: 'Sidebar Kanan',
    buttonName: 'Manajemen Skuad & Formasi',
    title: 'Formasi Tim & Bangku Cadangan (Bench)',
    functionDesc:
      'Memilih preset formasi populer (4-3-3, 3-5-2, Futsal Diamond, dll) dan mengelola pemain cadangan di pinggir lapangan.',
    benefitDesc:
      'Mendukung jumlah pemain asimetris (misal 8 lawan 7 pemain) dan pergantian pemain cadangan ke lapangan dengan sekali klik.',
    hint: 'Klik tab "Token Inspector" saat memilih pemain untuk mengubah nomor punggung, nama, atau warna khusus token pemain.',
    icon: Users,
    accentColor: 'from-indigo-500 to-blue-600',
    placement: 'left',
  },
  {
    selector: '[data-tour="export-controls"]',
    badge: 'Navigasi Atas (Top Navbar)',
    buttonName: 'Ekspor Video, PNG & Proyek JSON',
    title: 'Bagikan & Simpan Taktik Anda',
    functionDesc:
      'Merekam simulasi animasi ke format video (.webm) dan menyimpan gambar papan berkualitas tinggi (Retina PNG 2x).',
    benefitDesc:
      'Bahan presentasi taktik Anda siap dibagikan ke grup WhatsApp tim, media sosial, atau disimpan sebagai arsip latihan pelatih.',
    hint: 'Gunakan fitur Export JSON untuk menyimpan file proyek taktik yang bisa diedit kembali kapan saja di kemudian hari.',
    icon: Download,
    accentColor: 'from-emerald-500 to-green-600',
    placement: 'bottom',
  },
];

interface GuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuidedTour: React.FC<GuidedTourProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const { showTooltips, setShowTooltips } = useTacticsStore();
  const cardRef = useRef<HTMLDivElement>(null);

  const step = TOUR_STEPS[currentStep];

  // Update bounding rect of target element
  const updateTargetRect = () => {
    if (!isOpen || !step.selector) {
      setTargetRect(null);
      return;
    }

    const el = document.querySelector(step.selector);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  };

  useEffect(() => {
    updateTargetRect();

    // Listen to resize and scroll
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect, true);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkip();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect, true);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentStep, isOpen]);

  const handleSkip = () => {
    localStorage.setItem('bola_bundar_tour_dismissed', 'true');
    onClose();
  };

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSkip();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  const Icon = step.icon;
  const isLast = currentStep === TOUR_STEPS.length - 1;

  // Calculate smart position for floating card
  let cardStyle: React.CSSProperties = {};
  const margin = 16;
  const cardWidth = 440;
  const cardEstimatedHeight = 440;

  if (targetRect && step.placement !== 'center') {
    const isMobile = window.innerWidth < 768;
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    if (isMobile) {
      // On mobile, dock nicely at bottom center
      cardStyle = {
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100vw - 32px)',
        maxWidth: '440px',
        maxHeight: 'calc(100vh - 32px)',
      };
    } else {
      const effectiveWidth = Math.min(cardWidth, viewportWidth - margin * 2);

      if (step.placement === 'bottom') {
        const left = Math.max(
          margin,
          Math.min(
            viewportWidth - effectiveWidth - margin,
            targetRect.left + targetRect.width / 2 - effectiveWidth / 2
          )
        );

        // Safe spacing: ensure card never bleeds off bottom
        const desiredTop = targetRect.bottom + 14;
        const maxTop = Math.max(margin, viewportHeight - cardEstimatedHeight - margin);
        // If bottom clearance is too tight and there's plenty of space above, flip to top
        const spaceBelow = viewportHeight - targetRect.bottom - margin;
        const spaceAbove = targetRect.top - margin;

        if (spaceBelow < 280 && spaceAbove > spaceBelow) {
          const bottom = Math.max(margin, viewportHeight - targetRect.top + 14);
          cardStyle = {
            bottom: `${bottom}px`,
            left: `${left}px`,
            width: `${effectiveWidth}px`,
            maxHeight: `calc(100vh - ${bottom + margin}px)`,
          };
        } else {
          const top = Math.max(margin, Math.min(maxTop, desiredTop));
          cardStyle = {
            top: `${top}px`,
            left: `${left}px`,
            width: `${effectiveWidth}px`,
            maxHeight: `calc(100vh - ${top + margin}px)`,
          };
        }
      } else if (step.placement === 'top') {
        const left = Math.max(
          margin,
          Math.min(
            viewportWidth - effectiveWidth - margin,
            targetRect.left + targetRect.width / 2 - effectiveWidth / 2
          )
        );
        const desiredBottom = viewportHeight - targetRect.top + 14;
        const maxBottom = Math.max(margin, viewportHeight - cardEstimatedHeight - margin);
        const bottom = Math.max(margin, Math.min(maxBottom, desiredBottom));
        cardStyle = {
          bottom: `${bottom}px`,
          left: `${left}px`,
          width: `${effectiveWidth}px`,
          maxHeight: `calc(100vh - ${bottom + margin}px)`,
        };
      } else if (step.placement === 'right') {
        const left = Math.min(viewportWidth - effectiveWidth - margin, targetRect.right + 16);
        const top = Math.max(
          margin,
          Math.min(viewportHeight - cardEstimatedHeight - margin, targetRect.top)
        );
        cardStyle = {
          top: `${top}px`,
          left: `${left}px`,
          width: `${effectiveWidth}px`,
          maxHeight: `calc(100vh - ${top + margin}px)`,
        };
      } else if (step.placement === 'left') {
        const left = Math.max(margin, targetRect.left - effectiveWidth - 16);
        const top = Math.max(
          margin,
          Math.min(viewportHeight - cardEstimatedHeight - margin, targetRect.top)
        );
        cardStyle = {
          top: `${top}px`,
          left: `${left}px`,
          width: `${effectiveWidth}px`,
          maxHeight: `calc(100vh - ${top + margin}px)`,
        };
      }
    }
  }

  const isFloating = targetRect && step.placement !== 'center';

  return (
    <div className="fixed inset-0 z-50 select-none">
      {/* 1. Backdrop with Spotlight Cutout or Dark Scrim */}
      {targetRect && isFloating ? (
        <svg
          className="fixed inset-0 w-full h-full pointer-events-auto transition-all duration-300"
          style={{ zIndex: 45 }}
          onClick={handleSkip}
        >
          <defs>
            <mask id="spotlight-mask">
              {/* White fills everything (opaque mask) */}
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {/* Black cutout around target element */}
              <rect
                x={targetRect.left - 6}
                y={targetRect.top - 6}
                width={targetRect.width + 12}
                height={targetRect.height + 12}
                rx="12"
                fill="black"
              />
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(2, 6, 23, 0.82)"
            mask="url(#spotlight-mask)"
          />
        </svg>
      ) : (
        <div
          onClick={handleSkip}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-40 transition-opacity"
        />
      )}

      {/* 2. Pulsing Neon Highlight Ring directly on the target button */}
      {targetRect && isFloating && (
        <div
          className="fixed rounded-xl border-2 border-emerald-400 ring-4 ring-emerald-500/40 pointer-events-none transition-all duration-300 ease-out z-50 animate-spotlight-glow"
          style={{
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
          }}
        />
      )}

      {/* 3. Floating or Centered Tour Card */}
      <div
        className={
          isFloating
            ? 'fixed z-50'
            : 'fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none'
        }
        style={isFloating ? cardStyle : undefined}
      >
        <div
          ref={cardRef}
          className="pointer-events-auto relative w-full max-w-lg bg-slate-900 border border-slate-700/90 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[calc(100vh-32px)] animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Top Header with Gradient Accent */}
          <div className={`shrink-0 p-4 sm:p-5 pb-3.5 bg-gradient-to-r ${step.accentColor} text-white relative`}>
            {/* Close / Skip button */}
            <button
              onClick={handleSkip}
              className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-black/25 hover:bg-black/50 text-white/90 hover:text-white transition-colors"
              title="Tutup / Lewati Panduan (Esc)"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner shrink-0">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="pr-6">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-white/80">
                    Langkah {currentStep + 1} dari {TOUR_STEPS.length}
                  </span>
                  <span className="text-[9px] bg-black/30 border border-white/20 px-1.5 py-0.2 rounded font-mono text-white/90">
                    {step.badge}
                  </span>
                </div>
                <h2 className="text-sm sm:text-base font-extrabold text-white leading-tight mt-0.5">
                  {step.title}
                </h2>
              </div>
            </div>
          </div>

          {/* Structured Content Body: Fungsi & Kegunaan */}
          <div className="p-4 sm:p-5 space-y-3 bg-slate-900/95 overflow-y-auto min-h-0 flex-1">
            {/* Target Button Name Banner */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 flex items-center gap-2">
              <Crosshair className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-xs text-slate-300 font-semibold truncate">
                Tombol: <span className="text-emerald-400">{step.buttonName}</span>
              </span>
            </div>

            {/* 1. Fungsi Tombol */}
            <div className="flex items-start gap-2.5 text-xs">
              <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div className="text-slate-300 leading-relaxed">
                <strong className="text-slate-100 font-semibold">Fungsi: </strong>
                {step.functionDesc}
              </div>
            </div>

            {/* 2. Kegunaan & Manfaat Taktis */}
            <div className="flex items-start gap-2.5 text-xs">
              <div className="p-1 rounded bg-sky-500/10 text-sky-400 shrink-0 mt-0.5">
                <Lightbulb className="w-3.5 h-3.5" />
              </div>
              <div className="text-slate-300 leading-relaxed">
                <strong className="text-slate-100 font-semibold">Kegunaan: </strong>
                {step.benefitDesc}
              </div>
            </div>

            {/* 3. Pro Tip Box */}
            <div className="bg-slate-950/90 border border-slate-800/90 rounded-xl p-2.5 flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-[11px] text-slate-400 leading-normal">
                <span className="font-bold text-slate-300">Tips Cepat: </span>
                {step.hint}
              </div>
            </div>

            {/* Step Progress Dots & Tooltip Toggle */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
              <div className="flex items-center space-x-1.5">
                {TOUR_STEPS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentStep(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentStep
                        ? 'w-5 bg-emerald-500'
                        : idx < currentStep
                        ? 'w-2 bg-slate-600'
                        : 'w-2 bg-slate-800'
                    }`}
                    title={`Lompat ke langkah ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Hover Tooltip Preference Toggle */}
              <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-slate-400 hover:text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={showTooltips}
                  onChange={(e) => setShowTooltips(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-0 cursor-pointer"
                />
                <span>Highlight & Tooltip Aktif</span>
              </label>
            </div>
          </div>

          {/* Footer Navigation Actions */}
          <div className="shrink-0 p-3.5 px-4 sm:px-5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="text-xs font-medium text-slate-400 hover:text-slate-200 px-2.5 py-1.5 rounded-lg hover:bg-slate-850 transition-colors"
            >
              Lewati (Skip)
            </button>

            <div className="flex items-center space-x-2">
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Sebelumnya</span>
                </button>
              )}

              <button
                onClick={handleNext}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md transition-all ${
                  isLast
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {isLast ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mulai Menggambar!</span>
                  </>
                ) : (
                  <>
                    <span>Lanjut</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

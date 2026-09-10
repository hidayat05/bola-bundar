import React, { useState } from 'react';
import {
  Trophy,
  MousePointer,
  Spline,
  Play,
  Sparkles,
  Layers,
  Users,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
} from 'lucide-react';
import { useTacticsStore } from '../../store/useTacticsStore';

interface TourStep {
  title: string;
  subtitle: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  accentColor: string;
  hint: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Selamat Datang di Bola Bundar! ⚽',
    subtitle: 'Papan Taktik & Animasi Interaktif Sepak Bola, Mini Soccer & Futsal',
    description:
      'Aplikasi ini dirancang untuk pelatih, analis, dan pemain membuat simulasi taktik, pola pergerakan lari, dan animasi operan bola secara mudah dan profesional.',
    icon: Trophy,
    accentColor: 'from-amber-500 to-yellow-600',
    hint: 'Ikuti panduan singkat ini atau lewati kapan saja dengan tombol Skip/Lewati.',
  },
  {
    title: '1. Papan Taktik & Pemain Interaktif',
    subtitle: 'Drag & Drop Bebas, Rotasi Arah Hadap, & Magnet Bola',
    description:
      'Tarik token pemain ke mana saja di lapangan. Putar titik pegangan (handle) untuk mengubah arah hadap (0-360°). Dekatkan bola ke kaki pemain untuk fitur Magnetic Snap!',
    icon: MousePointer,
    accentColor: 'from-blue-500 to-cyan-600',
    hint: 'Tukar posisi (swap) 2 pemain langsung dengan mendrag satu pemain ke atas pemain lain.',
  },
  {
    title: '2. Alat Gambar & Anotasi Taktis',
    subtitle: 'Panah Umpan, Jalur Lari Putus-putus, Dribble Wavy & Zona',
    description:
      'Gunakan floating toolbar di pojok kiri atas untuk menggambar garis operan bola, jalur lari tanpa bola (dashed), liukan dribble bergelombang, atau blok area taktis.',
    icon: Spline,
    accentColor: 'from-emerald-500 to-teal-600',
    hint: 'Pilih warna favorit dari palet warna atau gunakan penghapus (eraser) untuk menghapus anotasi.',
  },
  {
    title: '3. Keyframe Timeline & Animasi Halus',
    subtitle: 'Alur Gerakan Mulus Antar-Frame (Cubic Ease-In-Out)',
    description:
      'Animasi dibuat dari rangkaian Frame (Frame 1 ➔ Frame 2 ➔ Frame 3). Gandakan Frame (📋), geser pemain & bola ke titik baru, lalu tekan Play (▶) untuk menonton pergerakan hidup!',
    icon: Play,
    accentColor: 'from-violet-500 to-purple-600',
    hint: 'Pemain otomatis berputar menghadap arah larinya (Auto-Facing) saat animasi berjalan.',
  },
  {
    title: '4. Pola Lari & Umpan Siap Pakai ⚡',
    subtitle: 'Contoh Taktik Populer (Give & Go, Overlap, Third-Man)',
    description:
      'Ingin melihat simulasi operan bola dan pemain membuka ruang sungguhan? Klik tombol "Pola Lari & Umpan" di timeline bawah untuk memuat simulasi siap tonton.',
    icon: Sparkles,
    accentColor: 'from-amber-500 to-orange-600',
    hint: 'Tersedia Give & Go (One-Two), Overlapping Wing Run, dan Tiki-Taka Third-Man Run.',
  },
  {
    title: '5. 18 Zona Taktis & Pilihan Rumput',
    subtitle: 'Visual Analitik Louis van Gaal / UEFA & Full Green Grass',
    description:
      'Aktifkan tombol "18 Zones" di navbar atas untuk membagi lapangan menjadi 18 zona taktis bernomor (dengan Zone 14 di-highlight). Lengkap dengan pengubah warna zona & rumput Full Green.',
    icon: Layers,
    accentColor: 'from-rose-500 to-pink-600',
    hint: 'Klik ikon palet di samping tombol 18 Zones untuk mengganti warna garis zona.',
  },
  {
    title: '6. Formasi, Cadangan, & Ekspor Video / PNG',
    subtitle: 'Kustomisasi Skuad Lengkap & Ekspor Berkualitas Tinggi',
    description:
      'Pilih formasi dari menu samping (4-3-3, 3-5-2, Futsal Diamond, dll). Rekam animasi ke format video (.webm) atau simpan foto papan taktik resolusi tinggi (2x Retina PNG).',
    icon: Users,
    accentColor: 'from-indigo-500 to-blue-600',
    hint: 'Anda juga bisa menyimpan seluruh proyek taktik dalam format JSON untuk dibuka lagi nanti.',
  },
];

interface GuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuidedTour: React.FC<GuidedTourProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { showTooltips, setShowTooltips } = useTacticsStore();

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

  const step = TOUR_STEPS[currentStep];
  const Icon = step.icon;
  const isLast = currentStep === TOUR_STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Top Header with Gradient Accent */}
        <div className={`p-5 pb-4 bg-gradient-to-r ${step.accentColor} text-white relative`}>
          {/* Close / Skip button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white/90 hover:text-white transition-colors"
            title="Tutup / Lewati Panduan (Esc)"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-white/80">
                Panduan Aplikasi • Langkah {currentStep + 1} dari {TOUR_STEPS.length}
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-white leading-tight">
                {step.title}
              </h2>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="text-xs font-semibold text-slate-300">
            {step.subtitle}
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {step.description}
          </p>

          {/* Pro Tip / Hint Box */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-400 leading-normal">
              <span className="font-semibold text-slate-300">Tips: </span>
              {step.hint}
            </div>
          </div>

          {/* Step Progress Dots */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-1.5">
              {TOUR_STEPS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentStep
                      ? 'w-6 bg-emerald-500'
                      : idx < currentStep
                      ? 'w-2 bg-slate-600'
                      : 'w-2 bg-slate-800'
                  }`}
                  title={`Lompat ke langkah ${idx + 1}`}
                />
              ))}
            </div>

            {/* Hover Tooltip Preference Toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-400 hover:text-slate-300 select-none">
              <input
                type="checkbox"
                checked={showTooltips}
                onChange={(e) => setShowTooltips(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-0 cursor-pointer"
              />
              <span>Tampilkan Tooltip</span>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-5 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-xs font-medium text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Lewati (Skip)
          </button>

          <div className="flex items-center space-x-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Sebelumnya</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md transition-all ${
                isLast
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
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
  );
};

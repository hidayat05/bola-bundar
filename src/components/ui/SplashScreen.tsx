import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'enter' | 'ready' | 'zoom' | 'done'>('enter');
  const [progress, setProgress] = useState(15);
  const [statusText, setStatusText] = useState('Menyiapkan lapangan...');

  useEffect(() => {
    // Progress counter animation
    const timer1 = setTimeout(() => {
      setProgress(45);
      setStatusText('Memuat token pemain & formasi...');
    }, 450);

    const timer2 = setTimeout(() => {
      setProgress(85);
      setStatusText('Menyiapkan engine animasi 60fps...');
    }, 950);

    const timer3 = setTimeout(() => {
      setProgress(100);
      setStatusText('Papan Taktik Siap! ⚽');
      setPhase('ready');
    }, 1400);

    // Trigger explosive scale-up zoom transition (bola membesar & berputar masuk ke lapangan)
    const timer4 = setTimeout(() => {
      setPhase('zoom');
    }, 1750);

    // Fade out and close
    const timer5 = setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 2450);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setPhase('zoom');
    setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 450);
  };

  if (phase === 'done') return null;

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center select-none overflow-hidden cursor-pointer transition-opacity duration-700 ease-out ${
        phase === 'zoom' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        background:
          'radial-gradient(circle at center, #064e3b 0%, #022c22 35%, #020617 80%, #000000 100%)',
      }}
    >
      {/* Background Stadium & Tactical Grid Aesthetics */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="tactical-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="rgba(52, 211, 153, 0.3)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#tactical-grid)" />
          {/* Glowing Center Circle of Pitch */}
          <circle
            cx="50%"
            cy="50%"
            r="160"
            fill="none"
            stroke="rgba(255, 255, 255, 0.35)"
            strokeWidth="2"
            strokeDasharray="8 6"
          />
          <circle
            cx="50%"
            cy="50%"
            r="260"
            fill="none"
            stroke="rgba(52, 211, 153, 0.2)"
            strokeWidth="1.5"
          />
          <line
            x1="0"
            y1="50%"
            x2="100%"
            y2="50%"
            stroke="rgba(255, 255, 255, 0.25)"
            strokeWidth="2"
          />
        </svg>
      </div>

      {/* Atmospheric Ambient Glows */}
      <div className="absolute w-96 h-96 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
      <div className="absolute w-64 h-64 rounded-full bg-teal-400/15 blur-2xl pointer-events-none" />

      {/* Pulsing Tactical Ring Beacons */}
      <div className="relative flex items-center justify-center">
        <div className="absolute w-56 h-56 rounded-full border border-emerald-400/30 animate-ring-expand pointer-events-none" />
        <div
          className="absolute w-72 h-72 rounded-full border border-teal-300/20 animate-ring-expand pointer-events-none"
          style={{ animationDelay: '0.6s' }}
        />

        {/* 3D Realistic Spinning & Zooming Soccer Ball */}
        <div
          className={`relative z-10 w-36 h-36 sm:w-44 sm:h-44 transition-transform ${
            phase === 'enter'
              ? 'animate-ball-spin-enter'
              : phase === 'zoom'
              ? 'animate-ball-zoom-burst'
              : 'scale-100 hover:scale-105 transition-transform duration-300'
          }`}
        >
          {/* Drop shadow on pitch */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-32 h-6 bg-black/60 rounded-full blur-md pointer-events-none" />

          {/* SVG 3D Shaded Soccer Ball */}
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full drop-shadow-[0_15px_25px_rgba(0,0,0,0.7)]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* 3D Spherical Radial Gradient */}
              <radialGradient id="ballShading" cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="55%" stopColor="#e2e8f0" />
                <stop offset="85%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#334155" />
              </radialGradient>

              {/* Specular Highlight Gloss */}
              <radialGradient id="ballGlare" cx="30%" cy="25%" r="35%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
                <stop offset="60%" stopColor="rgba(255,255,255,0.15)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </radialGradient>

              {/* Dark Pentagon Material */}
              <linearGradient id="pentagonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>

              {/* Clip path for ball boundary */}
              <clipPath id="ballClip">
                <circle cx="50" cy="50" r="48" />
              </clipPath>
            </defs>

            {/* Base Spherical Body */}
            <circle cx="50" cy="50" r="48" fill="url(#ballShading)" stroke="#0f172a" strokeWidth="1.5" />

            {/* Leather Pentagon Patches (Clipped inside sphere) */}
            <g clipPath="url(#ballClip)">
              {/* Seam lines radiating from center pentagon */}
              <g stroke="#64748b" strokeWidth="1.2" strokeLinejoin="round" fill="none">
                {/* Center to 5 perimeter points */}
                <line x1="50" y1="36" x2="50" y2="18" />
                <line x1="63" y1="45" x2="78" y2="34" />
                <line x1="58" y1="61" x2="72" y2="76" />
                <line x1="42" y1="61" x2="28" y2="76" />
                <line x1="37" y1="45" x2="22" y2="34" />

                {/* Hexagon seam connections */}
                <path d="M 50,18 L 68,10 L 78,34" />
                <path d="M 78,34 L 88,52 L 72,76" />
                <path d="M 72,76 L 50,88 L 28,76" />
                <path d="M 28,76 L 12,52 L 22,34" />
                <path d="M 22,34 L 32,10 L 50,18" />
              </g>

              {/* Center Pentagon */}
              <polygon
                points="50,36 63,45 58,61 42,61 37,45"
                fill="url(#pentagonGrad)"
                stroke="#0f172a"
                strokeWidth="1.2"
              />

              {/* Perimeter Pentagons (partially showing along sphere edge) */}
              <polygon
                points="50,18 60,6 40,6"
                fill="url(#pentagonGrad)"
                stroke="#0f172a"
                strokeWidth="1.2"
              />
              <polygon
                points="78,34 94,30 88,48"
                fill="url(#pentagonGrad)"
                stroke="#0f172a"
                strokeWidth="1.2"
              />
              <polygon
                points="72,76 84,86 66,94"
                fill="url(#pentagonGrad)"
                stroke="#0f172a"
                strokeWidth="1.2"
              />
              <polygon
                points="28,76 16,86 34,94"
                fill="url(#pentagonGrad)"
                stroke="#0f172a"
                strokeWidth="1.2"
              />
              <polygon
                points="22,34 6,30 12,48"
                fill="url(#pentagonGrad)"
                stroke="#0f172a"
                strokeWidth="1.2"
              />

              {/* Spherical Shadow Depth Rim */}
              <circle
                cx="50"
                cy="50"
                r="48"
                fill="none"
                stroke="rgba(0,0,0,0.4)"
                strokeWidth="4"
              />

              {/* Surface Gloss Glare */}
              <ellipse cx="40" cy="35" rx="30" ry="24" fill="url(#ballGlare)" />
            </g>
          </svg>
        </div>
      </div>

      {/* Typography & Branding */}
      <div className="relative z-10 mt-8 sm:mt-10 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-2.5 backdrop-blur-sm shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Tactical Board & Animation Studio</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase drop-shadow-md">
          BOLA{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            BUNDAR
          </span>
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 mt-1.5 font-medium tracking-wide">
          Football • Mini Soccer • Futsal Tactics
        </p>

        {/* Progress Bar & Status Text */}
        <div className="w-56 sm:w-72 mt-6 space-y-2">
          <div className="h-1.5 w-full bg-slate-900/90 rounded-full overflow-hidden border border-slate-700/60 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300 ease-out shadow-[0_0_12px_rgba(52,211,153,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>{statusText}</span>
            <span className="text-emerald-400 font-semibold">{progress}%</span>
          </div>
        </div>
      </div>

      {/* Quick Skip Prompt Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleSkip();
        }}
        className="absolute bottom-6 right-6 z-20 px-3.5 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-400 hover:text-slate-100 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg backdrop-blur-md group"
      >
        <span>Lewati Intro</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
};

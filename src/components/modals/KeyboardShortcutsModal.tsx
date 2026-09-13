import React from 'react';
import { X, Keyboard, Navigation, Palette, Edit } from 'lucide-react';
import { useTacticsStore } from '../../store/useTacticsStore';

interface ShortcutItem {
  keys: string[];
  label: string;
  description: string;
}

interface ShortcutSection {
  title: string;
  icon: React.ReactNode;
  items: ShortcutItem[];
}

export const KeyboardShortcutsModal: React.FC = () => {
  const isShortcutsModalOpen = useTacticsStore((s) => s.isShortcutsModalOpen);
  const setIsShortcutsModalOpen = useTacticsStore((s) => s.setIsShortcutsModalOpen);

  if (!isShortcutsModalOpen) return null;

  const sections: ShortcutSection[] = [
    {
      title: 'Animasi & Navigasi Frame',
      icon: <Navigation className="w-4 h-4 text-sky-400" />,
      items: [
        {
          keys: ['Space'],
          label: 'Putar / Jeda Animasi',
          description: 'Mulai atau hentikan simulasi pergerakan taktis antar-frame',
        },
        {
          keys: ['←', '→'],
          label: 'Pindah Keyframe',
          description: 'Navigasi cepat ke frame sebelumnya atau frame berikutnya',
        },
        {
          keys: ['Ctrl / ⌘', 'D'],
          label: 'Duplikat Frame',
          description: 'Gandakan keyframe aktif saat ini ke frame baru',
        },
        {
          keys: ['Esc'],
          label: 'Batal Seleksi / Keluar',
          description: 'Batalkan pemilihan pemain atau keluar dari mode presentasi',
        },
      ],
    },
    {
      title: 'Peralatan Gambar Taktis (1 - 8)',
      icon: <Palette className="w-4 h-4 text-emerald-400" />,
      items: [
        { keys: ['1'], label: 'Penunjuk / Seleksi', description: 'Pilih dan geser pemain atau bola' },
        { keys: ['2'], label: 'Operan Datar', description: 'Garis panah umpan langsung mendatar' },
        { keys: ['3'], label: 'Operan Lengkung', description: 'Anak panah kurva melengkung (swerved)' },
        { keys: ['4'], label: 'Umpan Lambung 3D', description: 'Umpan melambung tinggi dengan parabola elevasi' },
        { keys: ['5'], label: 'Lari Pemain', description: 'Garis putus-putus pergerakan tanpa bola (run)' },
        { keys: ['6'], label: 'Dribel Bola', description: 'Garis zig-zag menggiring bola' },
        { keys: ['7'], label: 'Zona Taktis', description: 'Area persegi penanda ruang kosong / overload' },
        { keys: ['8'], label: 'Penghapus', description: 'Hapus goresan gambar taktis yang disentuh' },
      ],
    },
    {
      title: 'Riwayat & Manajemen Proyek',
      icon: <Edit className="w-4 h-4 text-amber-400" />,
      items: [
        {
          keys: ['Ctrl / ⌘', 'Z'],
          label: 'Undo (Batal)',
          description: 'Batalkan aksi atau pergeseran posisi terakhir',
        },
        {
          keys: ['Ctrl / ⌘', 'Y'],
          label: 'Redo (Ulangi)',
          description: 'Ulangi aksi yang sebelumnya dibatalkan (atau Cmd+Shift+Z)',
        },
        {
          keys: ['Del', 'Backspace'],
          label: 'Hapus Elemen',
          description: 'Hapus peralatan kerucut/manekin latihan yang sedang dipilih',
        },
        {
          keys: ['?'],
          label: 'Pintasan Keyboard',
          description: 'Buka atau tutup jendela panduan tombol pintasan ini',
        },
      ],
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-fadeIn"
      onClick={() => setIsShortcutsModalOpen(false)}
    >
      <div
        className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Pintasan Papan Ketik
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  Keyboard Shortcuts
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Akses cepat semua fungsi taktik untuk alur kerja pelatih berkecepatan tinggi
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsShortcutsModalOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            title="Tutup (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-6 scrollbar-thin">
          {sections.map((sec, secIdx) => (
            <div key={secIdx} className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                {sec.icon}
                <span>{sec.title}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sec.items.map((item, itemIdx) => (
                  <div
                    key={itemIdx}
                    className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-slate-700 transition-colors flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-slate-200">{item.label}</div>
                      <div className="text-[11px] text-slate-400 truncate">{item.description}</div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {item.keys.map((k, kIdx) => (
                        <kbd
                          key={kIdx}
                          className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700/80 text-[11px] font-mono font-bold text-slate-200 shadow-sm"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Pintasan dinonaktifkan otomatis saat mengetik di formulir teks.</span>
          </div>
          <button
            onClick={() => setIsShortcutsModalOpen(false)}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors text-xs"
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>
  );
};

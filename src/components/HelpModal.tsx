import React from 'react';
import { HelpCircle, X, Layers, User, ArrowRightLeft, Keyboard, AlertTriangle, ShieldCheck } from 'lucide-react';
import { FRAME_STATUS_CONFIGS, RING_CONFIGS } from '../data/constants';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#0a0c11] rounded-2xl max-w-2xl w-full border border-gray-800 shadow-2xl overflow-hidden flex flex-col max-h-[88vh] text-gray-100">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between bg-[#0d1117]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-950/80 border border-purple-800 text-purple-400 rounded-lg">
              <HelpCircle size={18} />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-gray-100 leading-none">
                Gerçeklik Oyunu – Oyun Kılavuzu & Kurallar
              </h2>
              <p className="text-[11px] text-gray-400">
                Kartlar, coinler, çerçeveler ve ok bağlantıları kullanım rehberi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-100 rounded-lg hover:bg-gray-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs text-gray-300 leading-relaxed">
          {/* Section 1: Overview */}
          <div className="p-3 bg-purple-950/40 border border-purple-800/80 rounded-xl space-y-1">
            <div className="font-extrabold text-purple-300 text-xs flex items-center gap-1.5">
              <ShieldCheck size={15} />
              Oyunun Temel Mantığı
            </div>
            <p className="text-[11px] text-purple-200">
              Gerçeklik Oyunu; stratejik hedeflerin, operasyonel adımların, aktörlerin (öznelerin) ve
              fiziksel ortamların (mekânların) görsel ilişki ağını kurmanızı sağlayan dinamik bir
              model analiz sistemidir.
            </p>
          </div>

          {/* Section 2: Cards Legend */}
          <div className="space-y-2">
            <h3 className="font-black uppercase text-gray-200 text-[11px] flex items-center gap-1.5">
              <Layers size={14} className="text-blue-400" />
              1. Kart Tipleri ve Boyutları
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="p-2.5 border border-gray-800 rounded-xl bg-[#0d1117]">
                <div className="font-bold text-gray-200 flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-gray-500" />
                  XL Kart (220x140 - Gri)
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Ana vizyon, makro hedef veya merkeze oturtulacak temel strateji kartı.
                </p>
              </div>

              <div className="p-2.5 border border-gray-800 rounded-xl bg-[#0d1117]">
                <div className="font-bold text-gray-200 flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-red-600" />
                  L Kart (180x120 - Kırmızı)
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Yüksek öncelikli aksiyonlar veya kritik operasyon adımları.
                </p>
              </div>

              <div className="p-2.5 border border-gray-800 rounded-xl bg-[#0d1117]">
                <div className="font-bold text-gray-200 flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-blue-600" />
                  M Kart (160x100 - Mavi)
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Standart uygulama modülü, süreç veya iş adımı kartı.
                </p>
              </div>

              <div className="p-2.5 border border-gray-800 rounded-xl bg-[#0d1117]">
                <div className="font-bold text-gray-200 flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-600" />
                  S Kart (130x80 - Yeşil)
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Alt görev, kontrol listesi adımı veya kısa notlar.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Frame Statuses */}
          <div className="space-y-2">
            <h3 className="font-black uppercase text-gray-200 text-[11px] flex items-center gap-1.5">
              <AlertTriangle size={14} className="text-amber-400" />
              2. Kart Durum Çerçeveleri
            </h3>
            <div className="space-y-1.5">
              <div className="p-2 bg-emerald-950/40 border border-emerald-800/80 rounded-lg text-[11px]">
                <span className="font-bold text-emerald-300">Hazır (Yeşil):</span> {FRAME_STATUS_CONFIGS.READY.desc}
              </div>
              <div className="p-2 bg-blue-950/40 border border-blue-800/80 rounded-lg text-[11px]">
                <span className="font-bold text-blue-300">Süreçte (Mavi):</span> {FRAME_STATUS_CONFIGS.IN_PROGRESS.desc}
              </div>
              <div className="p-2 bg-[#0d1117] border border-gray-800 rounded-lg text-[11px]">
                <span className="font-bold text-gray-300">Kapalı (Gri):</span> {FRAME_STATUS_CONFIGS.CLOSED.desc}
              </div>
              <div className="p-2 bg-red-950/40 border border-red-800/80 rounded-lg text-[11px]">
                <span className="font-bold text-red-300">Gerçeklik Sınırında (Kırmızı Kesikli):</span> {FRAME_STATUS_CONFIGS.REALITY_LIMITS.desc}
              </div>
            </div>
          </div>

          {/* Section 4: Coins & Rings */}
          <div className="space-y-2">
            <h3 className="font-black uppercase text-gray-200 text-[11px] flex items-center gap-1.5">
              <User size={14} className="text-purple-400" />
              3. Tokenlar (Coinler) ve Halkalar
            </h3>
            <ul className="list-disc pl-4 space-y-1 text-[11px] text-gray-300">
              <li><b>Özne Coini (30mm):</b> İnsan, personel, sorumlu veya aktör rolünü temsil eder.</li>
              <li><b>Mekân Coini (60mm):</b> Fiziksel alan, platform, oda veya lokasyonu temsil eder.</li>
              <li><b>Halkalar (Rings):</b> Mutfak (Turuncu), Servis (Mor), Lojistik (Mavi-Yeşil), Yönetim (Sarı) halkalarıyla coinin ait olduğu operasyonel alanı belirleyebilirsiniz.</li>
            </ul>
          </div>

          {/* Section 5: Connecting Arrows */}
          <div className="space-y-2">
            <h3 className="font-black uppercase text-gray-200 text-[11px] flex items-center gap-1.5">
              <ArrowRightLeft size={14} className="text-emerald-400" />
              4. Ok Bağlantısı Kurma
            </h3>
            <p className="text-[11px] text-gray-300">
              İki yol ile ok bağlayabilirsiniz:
              <br />
              1. Üst bardaki <b>🔗 Ok Bağla</b> butonuna tıklayın ➔ 1. karta tıklayın ➔ 2. karta tıklayın.
              <br />
              2. Kartı seçin ➔ Yan panadaki <b>🔗 Bu Karttan 2. Karta Ok Çıkar</b> butonuna tıklayın ➔ Hedef karta tıklayın.
            </p>
          </div>

          {/* Section 6: Shortcuts */}
          <div className="space-y-2">
            <h3 className="font-black uppercase text-gray-200 text-[11px] flex items-center gap-1.5">
              <Keyboard size={14} className="text-gray-400" />
              5. Kısayol Tuşları
            </h3>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-[#0d1117] border border-gray-800 rounded-lg flex justify-between font-mono text-gray-300">
                <span>Geri Al:</span> <b className="text-blue-400">Ctrl + Z</b>
              </div>
              <div className="p-2 bg-[#0d1117] border border-gray-800 rounded-lg flex justify-between font-mono text-gray-300">
                <span>İleri Al:</span> <b className="text-blue-400">Ctrl + Y</b>
              </div>
              <div className="p-2 bg-[#0d1117] border border-gray-800 rounded-lg flex justify-between font-mono text-gray-300">
                <span>Seçileni Sil:</span> <b className="text-blue-400">Delete / Backspace</b>
              </div>
              <div className="p-2 bg-[#0d1117] border border-gray-800 rounded-lg flex justify-between font-mono text-gray-300">
                <span>Masa Kaydırma:</span> <b className="text-blue-400">Space + Sürükle</b>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import {
  FolderOpen,
  ArrowRightLeft,
  Undo2,
  Redo2,
  Download,
  HelpCircle,
  Menu,
  Eye,
  EyeOff,
} from 'lucide-react';

interface TopbarProps {
  isConnectMode: boolean;
  onToggleConnectMode: () => void;
  isQuietHighlightMode?: boolean;
  onToggleQuietHighlightMode?: () => void;
  onOpenProjectModal: () => void;
  onOpenHelpModal: () => void;
  onOpenTemplatesModal: () => void;
  onToggleMobileMenu: () => void;
  onExportPNG: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  connectSourceTitle?: string;
}

export const Topbar: React.FC<TopbarProps> = ({
  isConnectMode,
  onToggleConnectMode,
  isQuietHighlightMode = false,
  onToggleQuietHighlightMode,
  onOpenProjectModal,
  onOpenHelpModal,
  onOpenTemplatesModal,
  onToggleMobileMenu,
  onExportPNG,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  connectSourceTitle,
}) => {
  return (
    <header className="bg-[#0a0c10] border-b border-gray-800 px-2.5 py-1.5 flex items-center justify-between gap-2 overflow-x-auto select-none z-30 shadow-md">
      {/* Title & Logo (Compact Area) */}
      <div className="flex items-center gap-1.5 shrink-0 pr-1 border-r border-gray-800/80">
        <div className="w-6 h-6 rounded-md bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-black text-xs shrink-0">
          🎯
        </div>
        <div className="leading-tight">
          <h1 className="font-black text-xs text-gray-100 tracking-tight flex items-center gap-1">
            <span>RRP</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-blue-950 text-blue-300 rounded border border-blue-800/80">
              v1 Beta
            </span>
          </h1>
        </div>
      </div>

      {/* Main Bar Actions in Order: Kılavuz -> Palet -> Proje & Dosya -> Ok Bağla -> Şablonlar -> Undo/Redo -> PNG İndir */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* 1. Kılavuz (Help / Guide) */}
        <button
          onClick={onOpenHelpModal}
          className="px-2.5 py-1.5 bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-200 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
          title="Kılavuz ve Kurallar"
        >
          <HelpCircle size={14} className="text-amber-400" />
          <span>Kılavuz</span>
        </button>

        {/* 2. Palet (Palette / Sidebar Toggle) */}
        <button
          onClick={onToggleMobileMenu}
          className="px-2.5 py-1.5 bg-blue-950/60 hover:bg-blue-900/80 border border-blue-800/80 text-blue-300 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all"
          title="Kart ve Coin Paleti / Yan Panel"
        >
          <Menu size={14} className="text-blue-400" />
          <span>Palet</span>
        </button>

        {/* 3. Proje & Dosya */}
        <button
          onClick={onOpenProjectModal}
          className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(37,99,235,0.25)]"
          title="Proje Yükle, Kaydet, JSON ve Şablonlar"
        >
          <FolderOpen size={14} />
          <span className="hidden sm:inline">Proje &amp; Dosya</span>
          <span className="sm:hidden">Dosya</span>
        </button>

        {/* 4. Ok Bağla (Connect Arrow) */}
        <button
          onClick={onToggleConnectMode}
          className={`px-2.5 py-1.5 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all border ${
            isConnectMode
              ? 'bg-emerald-600 text-white border-emerald-500 ring-2 ring-emerald-500/50 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.4)]'
              : 'bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border-emerald-800/80'
          }`}
          title="Ok bağlama modu: Seçili kart(lar)dan hedef karta ok bağlar"
        >
          <ArrowRightLeft size={14} />
          <span>{isConnectMode ? '🔗 Ok Bağlama Aktif' : '🔗 Ok Bağla'}</span>
        </button>

        {/* 5. Sessiz Mod & Sessiz Oklar Toggle */}
        <button
          onClick={onToggleQuietHighlightMode}
          className={`px-2.5 py-1.5 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all border ${
            isQuietHighlightMode
              ? 'bg-purple-900/90 text-purple-200 border-purple-600 ring-2 ring-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
              : 'bg-gray-900 hover:bg-gray-800 text-gray-300 border-gray-700'
          }`}
          title="Sessiz Mod: Sessiz özellikleri ve tırtıklı gri okları masa üzerinde vurgular"
        >
          {isQuietHighlightMode ? <Eye size={14} className="text-purple-400" /> : <EyeOff size={14} className="text-gray-400" />}
          <span className="hidden md:inline">{isQuietHighlightMode ? 'Sessiz Mod: AKTİF' : 'Sessiz Mod'}</span>
          <span className="md:hidden">Sessiz</span>
        </button>

        <div className="h-4 w-px bg-gray-800 mx-0.5 hidden sm:block" />

        {/* 6. Undo / Redo */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`p-1.5 rounded-lg border font-bold text-xs flex items-center gap-1 transition-colors ${
            canUndo
              ? 'bg-gray-900 hover:bg-gray-800 text-gray-200 border-gray-700'
              : 'bg-gray-950 text-gray-600 border-gray-800/50 cursor-not-allowed'
          }`}
          title="Geri Al (Ctrl+Z)"
        >
          <Undo2 size={14} />
          <span className="hidden lg:inline text-[11px]">Geri</span>
        </button>

        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`p-1.5 rounded-lg border font-bold text-xs flex items-center gap-1 transition-colors ${
            canRedo
              ? 'bg-gray-900 hover:bg-gray-800 text-gray-200 border-gray-700'
              : 'bg-gray-950 text-gray-600 border-gray-800/50 cursor-not-allowed'
          }`}
          title="İleri Al (Ctrl+Y)"
        >
          <Redo2 size={14} />
          <span className="hidden lg:inline text-[11px]">İleri</span>
        </button>

        {/* 7. Export PNG */}
        <button
          onClick={onExportPNG}
          className="p-1.5 md:px-2.5 md:py-1.5 bg-gray-900 hover:bg-gray-800 text-gray-200 border border-gray-700 font-bold text-xs rounded-lg flex items-center gap-1 transition-colors"
          title="Haritayı PNG / Görsel Olarak İndir"
        >
          <Download size={14} />
          <span className="hidden sm:inline">PNG İndir</span>
        </button>
      </div>

      {/* Right Side Connection Active Banner if source selected */}
      {connectSourceTitle && (
        <div className="hidden xl:flex items-center gap-1.5 bg-blue-950/80 border border-blue-800 text-blue-300 px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 ml-auto">
          <span>Kaynak:</span>
          <span className="text-blue-200 truncate max-w-[100px]">{connectSourceTitle}</span>
          <span className="animate-bounce text-blue-400">➔</span>
          <span>Hedef Karta Tıkla</span>
        </div>
      )}
    </header>
  );
};

import React, { useState, useEffect } from 'react';
import { BoardItem, BoardEdge, CardSize, CoinSize, FrameStatus, RingType } from '../types';
import { CARD_CONFIGS, COIN_CONFIGS, FRAME_STATUS_CONFIGS, RING_CONFIGS } from '../data/constants';
import { AIAgentPanel } from './AIAgentPanel';
import {
  Plus,
  Trash2,
  Copy,
  Info,
  ArrowRightLeft,
  X,
  Layers,
  Settings,
  Sliders,
  Check,
  Sparkles,
  CircleDot
} from 'lucide-react';

interface SidebarPanelProps {
  items: BoardItem[];
  edges: BoardEdge[];
  selectedItemIds: string[];
  selectedEdgeId: string | null;
  connectSourceId: string | null;
  isMobileOpen: boolean;
  isQuietHighlightMode?: boolean;
  onToggleQuietHighlightMode?: () => void;
  onCloseMobile: () => void;
  onAddItem: (type: 'CARD' | 'COIN', size: CardSize | CoinSize) => void;
  onUpdateItem: (id: string, updates: Partial<BoardItem>) => void;
  onUpdateBatchItems: (ids: string[], updates: Partial<BoardItem>) => void;
  onDeleteItem: (id: string) => void;
  onDeleteBatchItems: (ids: string[]) => void;
  onDuplicateItem: (id: string) => void;
  onDuplicateBatchItems: (ids: string[]) => void;
  onUpdateEdge: (id: string, updates: Partial<BoardEdge>) => void;
  onDeleteEdge: (id: string) => void;
  onStartConnectFrom: (id: string) => void;
  onSelectItems: (ids: string[]) => void;
  onSelectEdge: (id: string | null) => void;
}

export const SidebarPanel: React.FC<SidebarPanelProps> = ({
  items,
  edges,
  selectedItemIds,
  selectedEdgeId,
  connectSourceId,
  isMobileOpen,
  isQuietHighlightMode = false,
  onToggleQuietHighlightMode,
  onCloseMobile,
  onAddItem,
  onUpdateItem,
  onUpdateBatchItems,
  onDeleteItem,
  onDeleteBatchItems,
  onDuplicateItem,
  onDuplicateBatchItems,
  onUpdateEdge,
  onDeleteEdge,
  onStartConnectFrom,
  onSelectItems,
  onSelectEdge,
}) => {
  const [activeTab, setActiveTab] = useState<'add' | 'edit' | 'edges' | 'ai'>('add');

  const selectedItemId = selectedItemIds.length === 1 ? selectedItemIds[0] : null;
  const selectedItem = items.find((i) => i.id === selectedItemId);
  const selectedItems = items.filter((i) => selectedItemIds.includes(i.id));

  // Auto-switch to edit tab if item(s) are selected
  useEffect(() => {
    if (selectedItemIds.length > 0) {
      setActiveTab('edit');
    }
  }, [selectedItemIds]);

  return (
    <aside
      className={`fixed lg:static right-0 bottom-0 top-12 lg:top-0 w-full lg:w-96 bg-[#0a0c11] border-l border-gray-800 z-40 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
        isMobileOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'
      }`}
    >
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-3 border-b border-gray-800 bg-[#0d1117]">
        <div className="font-extrabold text-xs text-gray-100 flex items-center gap-1.5">
          <Settings size={14} className="text-blue-400" />
          <span>Kontrol & Düzenleme Paneli</span>
        </div>
        <button
          onClick={onCloseMobile}
          className="p-1 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-gray-100 text-xs font-bold flex items-center gap-1"
        >
          <X size={16} />
          <span>Kapat</span>
        </button>
      </div>

      {/* Tabs Header */}
      <div className="grid grid-cols-4 p-1.5 bg-[#050608] border-b border-gray-800 text-[11px] font-bold gap-1 shrink-0">
        <button
          onClick={() => setActiveTab('add')}
          className={`py-2 px-1 rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeTab === 'add'
              ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.3)]'
              : 'text-gray-400 hover:text-gray-200 hover:bg-[#111827]'
          }`}
        >
          <Plus size={13} />
          <span>Ekle</span>
        </button>
        <button
          onClick={() => setActiveTab('edit')}
          className={`py-2 px-1 rounded-lg transition-all flex items-center justify-center gap-1 relative ${
            activeTab === 'edit'
              ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.3)]'
              : 'text-gray-400 hover:text-gray-200 hover:bg-[#111827]'
          }`}
        >
          <Sliders size={13} />
          <span>Düzenle</span>
          {selectedItem && (
            <span className="w-2 h-2 rounded-full bg-blue-400 absolute top-1 right-1 animate-ping" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('edges')}
          className={`py-2 px-1 rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeTab === 'edges'
              ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.3)]'
              : 'text-gray-400 hover:text-gray-200 hover:bg-[#111827]'
          }`}
        >
          <ArrowRightLeft size={13} />
          <span>Oklar</span>
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`py-2 px-1 rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeTab === 'ai'
              ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(147,51,234,0.3)]'
              : 'text-purple-400 hover:text-purple-200 hover:bg-[#111827]'
          }`}
        >
          <Sparkles size={13} />
          <span>AI Ajan</span>
        </button>
      </div>

      {/* Tab Contents Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* TAB 1: ADD OBJECTS */}
        {activeTab === 'add' && (
          <div className="space-y-4">
            {/* Cards Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-300 flex items-center gap-1">
                  <Layers size={13} className="text-blue-400" />
                  Kart Ekle
                </h3>
                <span className="text-[10px] text-gray-500">Masa zeminine eklenir</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* XL Card */}
                <button
                  onClick={() => onAddItem('CARD', 'XL')}
                  className="p-2.5 border border-gray-800 rounded-xl bg-[#0d1117] hover:border-gray-500 transition-all text-left group flex flex-col justify-between h-20"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-3 h-3 rounded-md bg-gray-700 border border-gray-500" />
                    <span className="text-[9px] font-black font-mono text-gray-500">220x140</span>
                  </div>
                  <div>
                    <div className="font-black text-xs text-gray-200 group-hover:text-gray-100">
                      XL Siyah Kart
                    </div>
                    <div className="text-[10px] text-gray-400 line-clamp-1">Zemin / Pano / Kural</div>
                  </div>
                </button>

                {/* L Card */}
                <button
                  onClick={() => onAddItem('CARD', 'L')}
                  className="p-2.5 border border-gray-800 rounded-xl bg-[#0d1117] hover:border-red-500 hover:shadow-[0_0_12px_rgba(239,68,68,0.2)] transition-all text-left group flex flex-col justify-between h-20"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-3 h-3 rounded-md bg-red-600" />
                    <span className="text-[9px] font-black font-mono text-gray-500">180x120</span>
                  </div>
                  <div>
                    <div className="font-black text-xs text-gray-200 group-hover:text-red-400">
                      L Kırmızı Kart
                    </div>
                    <div className="text-[10px] text-gray-400 line-clamp-1">Ana Yapı / Ekip</div>
                  </div>
                </button>

                {/* M Card */}
                <button
                  onClick={() => onAddItem('CARD', 'M')}
                  className="p-2.5 border border-gray-800 rounded-xl bg-[#0d1117] hover:border-blue-500 hover:shadow-[0_0_12px_rgba(37,99,235,0.2)] transition-all text-left group flex flex-col justify-between h-20"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-3 h-3 rounded-md bg-blue-600" />
                    <span className="text-[9px] font-black font-mono text-gray-500">160x100</span>
                  </div>
                  <div>
                    <div className="font-black text-xs text-gray-200 group-hover:text-blue-400">
                      M Mavi Kart
                    </div>
                    <div className="text-[10px] text-gray-400 line-clamp-1">Atölye / Alan / Sistem</div>
                  </div>
                </button>

                {/* S Card */}
                <button
                  onClick={() => onAddItem('CARD', 'S')}
                  className="p-2.5 border border-gray-800 rounded-xl bg-[#0d1117] hover:border-emerald-500 hover:shadow-[0_0_12px_rgba(16,185,129,0.2)] transition-all text-left group flex flex-col justify-between h-20"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-3 h-3 rounded-md bg-emerald-600" />
                    <span className="text-[9px] font-black font-mono text-gray-500">130x80</span>
                  </div>
                  <div>
                    <div className="font-black text-xs text-gray-200 group-hover:text-emerald-400">
                      S Yeşil Kart
                    </div>
                    <div className="text-[10px] text-gray-400 line-clamp-1">Somut Ürün / Çıktı</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Coins Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-300 flex items-center gap-1">
                  <CircleDot size={13} className="text-amber-400" />
                  Coin Ekle
                </h3>
                <span className="text-[10px] text-gray-500">Özne & Mekân</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Özne Coini */}
                <button
                  onClick={() => onAddItem('COIN', 'SMALL')}
                  className="p-2.5 border border-gray-800 rounded-xl bg-[#0d1117] hover:border-emerald-500 transition-all text-left group flex items-center gap-2.5"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">
                    Ö
                  </div>
                  <div>
                    <div className="font-black text-xs text-gray-200 group-hover:text-emerald-400">
                      Özne Coini
                    </div>
                    <div className="text-[10px] text-gray-400">30mm Personel / Aktör</div>
                  </div>
                </button>

                {/* Mekân Coini */}
                <button
                  onClick={() => onAddItem('COIN', 'BIG')}
                  className="p-2.5 border border-gray-800 rounded-xl bg-[#0d1117] hover:border-amber-500 transition-all text-left group flex items-center gap-2.5"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-950 border border-slate-700 text-amber-400 font-bold flex items-center justify-center shrink-0 text-xs">
                    M
                  </div>
                  <div>
                    <div className="font-black text-xs text-gray-200 group-hover:text-amber-400">
                      Mekân Coini
                    </div>
                    <div className="text-[10px] text-gray-400">60mm Ortam / Konum</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EDIT SELECTED ITEM */}
        {activeTab === 'edit' && (
          <div>
            {selectedItemIds.length === 0 ? (
              <div className="p-6 text-center text-gray-400 bg-[#0d1117] border border-dashed border-gray-800 rounded-2xl my-4">
                <Info size={28} className="mx-auto text-gray-600 mb-2" />
                <p className="font-bold text-xs text-gray-200">Henüz Öğe Seçilmedi</p>
                <p className="text-[11px] text-gray-400 mt-1">
                  Masa üzerindeki kart veya coinlere tıklayarak (ya da fareyle kutu çizip toplu seçerek)
                  özellikleri düzenleyebilirsiniz.
                </p>
              </div>
            ) : selectedItemIds.length > 1 ? (
              /* MULTI-SELECT BATCH EDITING PANEL */
              <div className="space-y-4">
                <div className="p-3 bg-blue-950/40 border border-blue-500/40 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400 flex items-center gap-1">
                      <Layers size={13} />
                      Toplu Seçim Modu
                    </span>
                    <button
                      onClick={() => onSelectItems([])}
                      className="text-[10px] text-gray-400 hover:text-white underline"
                    >
                      Seçimi Kaldır
                    </button>
                  </div>
                  <div className="font-extrabold text-sm text-gray-100">
                    {selectedItemIds.length} Öğe Birden Seçildi
                  </div>
                  <div className="text-[11px] text-gray-400">
                    Seçili tüm kartlar ve coinler üzerinde toplu durum, halka veya silme işlemleri uygulayabilirsiniz.
                  </div>
                </div>

                {/* Batch Frame Status for Cards */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-gray-400 mb-1.5">
                    Toplu Çerçeve Durumu Değiştir (Kartlar İçin)
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(Object.keys(FRAME_STATUS_CONFIGS) as FrameStatus[]).map((statusKey) => {
                      const cfg = FRAME_STATUS_CONFIGS[statusKey];
                      return (
                        <button
                          key={statusKey}
                          onClick={() => onUpdateBatchItems(selectedItemIds, { frameStatus: statusKey })}
                          className="p-1.5 rounded-lg border text-left flex items-center justify-between text-[11px] font-bold bg-[#0d1117] text-gray-300 border-gray-800 hover:border-blue-500 transition-all"
                        >
                          <span className="flex items-center gap-1.5 truncate">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: cfg.color }}
                            />
                            <span className="truncate">{cfg.label}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Batch Ring Selector for Coins */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-extrabold uppercase text-gray-400 mb-1">
                    Toplu Ring / Uğraş Türü (Coinler İçin)
                  </label>
                  <div className="space-y-1">
                    {(Object.keys(RING_CONFIGS) as RingType[]).map((ringKey) => {
                      const cfg = RING_CONFIGS[ringKey];
                      return (
                        <button
                          key={ringKey}
                          onClick={() => onUpdateBatchItems(selectedItemIds, { ringType: ringKey })}
                          className="w-full p-2 rounded-lg border text-left flex items-center justify-between text-xs font-bold bg-[#0d1117] text-gray-300 border-gray-800 hover:border-blue-500 transition-all"
                        >
                          <span className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full border border-gray-700 shrink-0"
                              style={{
                                backgroundColor: ringKey === 'NONE' ? '#4b5563' : cfg.lightColor,
                              }}
                            />
                            <span>{cfg.label}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Batch Ring Tone */}
                <div className="p-2.5 bg-[#0d1117] border border-gray-800 rounded-xl space-y-2">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-gray-300">
                    Toplu Uğraş Tonu (Açık / Koyu)
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                    <button
                      onClick={() => onUpdateBatchItems(selectedItemIds, { ringTone: 'LIGHT' })}
                      className="p-2 rounded-lg border font-bold text-center bg-[#050608] text-emerald-400 border-gray-800 hover:border-emerald-500"
                    >
                      Açık Ton (Bizzat Yapmak)
                    </button>
                    <button
                      onClick={() => onUpdateBatchItems(selectedItemIds, { ringTone: 'DARK' })}
                      className="p-2 rounded-lg border font-bold text-center bg-[#050608] text-purple-400 border-gray-800 hover:border-purple-500"
                    >
                      Koyu Ton (Yönetmek)
                    </button>
                  </div>
                </div>

                {/* Batch Connect Button */}
                <button
                  onClick={() => onStartConnectFrom(selectedItemIds[0])}
                  className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow transition-all"
                >
                  <ArrowRightLeft size={14} />
                  <span>🔗 Toplu ({selectedItemIds.length}) Öğeden Ok Çıkar / Bağla</span>
                </button>

                {/* Batch Actions */}
                <div className="pt-2 border-t border-gray-800 flex items-center gap-2">
                  <button
                    onClick={() => onDuplicateBatchItems(selectedItemIds)}
                    className="flex-1 py-2 px-3 bg-[#111827] hover:bg-gray-800 text-gray-200 font-bold text-xs rounded-xl border border-gray-800 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Copy size={14} />
                    <span>Toplu Çoğalt ({selectedItemIds.length})</span>
                  </button>

                  <button
                    onClick={() => onDeleteBatchItems(selectedItemIds)}
                    className="py-2 px-3 bg-red-950/60 hover:bg-red-900/80 text-red-300 font-bold text-xs rounded-xl border border-red-800/80 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Trash2 size={14} />
                    <span>Toplu Sil ({selectedItemIds.length})</span>
                  </button>
                </div>
              </div>
            ) : selectedItem ? (
              /* SINGLE ITEM EDITING PANEL */
              <div className="space-y-4">
                {/* Header Info Banner */}
                <div className="p-3 bg-[#0d1117] border border-gray-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Seçili {selectedItem.type === 'CARD' ? 'Kart' : 'Coin'}
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-[#111827] border border-gray-800 px-2 py-0.5 rounded text-blue-400">
                      {selectedItem.size}
                    </span>
                  </div>
                  <div className="font-extrabold text-sm text-gray-100 truncate">{selectedItem.title}</div>

                  {/* Connect Arrow Trigger Button */}
                  <button
                    onClick={() => onStartConnectFrom(selectedItem.id)}
                    className={`w-full py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      connectSourceId === selectedItem.id
                        ? 'bg-blue-600 text-white ring-2 ring-blue-500/50 animate-pulse shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                    }`}
                  >
                    <ArrowRightLeft size={13} />
                    <span>
                      {connectSourceId === selectedItem.id
                        ? '2. Karta Tıklayın (Hedef Seçin)'
                        : '🔗 Bu Öğeden Ok Çıkar'}
                    </span>
                  </button>
                </div>

                {/* Title & Description Fields */}
                <div className="space-y-2">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-gray-400 mb-1">
                      Başlık (ANAHTAR KELİME BÜYÜK)
                    </label>
                    <input
                      type="text"
                      value={selectedItem.title}
                      onChange={(e) => onUpdateItem(selectedItem.id, { title: e.target.value })}
                      className="w-full text-xs font-bold p-2 bg-[#0d1117] text-gray-100 border border-gray-800 rounded-lg outline-none focus:border-blue-500"
                      placeholder="Örn: HAMLECİ KONAĞI..."
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-gray-400 mb-1">
                      Açıklama / Detaylar (küçük harf)
                    </label>
                    <textarea
                      value={selectedItem.description}
                      onChange={(e) =>
                        onUpdateItem(selectedItem.id, { description: e.target.value })
                      }
                      rows={2}
                      className="w-full text-xs p-2 bg-[#0d1117] text-gray-100 border border-gray-800 rounded-lg outline-none focus:border-blue-500 resize-none"
                      placeholder="Açıklama ve detay notları..."
                    />
                  </div>

                  {selectedItem.type === 'CARD' && (
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-gray-400 mb-1">
                        Kategori Etiketi
                      </label>
                      <input
                        type="text"
                        value={selectedItem.categoryTag || ''}
                        onChange={(e) =>
                          onUpdateItem(selectedItem.id, { categoryTag: e.target.value })
                        }
                        className="w-full text-xs font-bold p-2 bg-[#0d1117] text-gray-100 border border-gray-800 rounded-lg outline-none focus:border-blue-500 uppercase"
                        placeholder="Örn: ZEMİN, EKİP, ATÖLYE, ÜRÜN"
                      />
                    </div>
                  )}
                </div>

                {/* Frame Status Selector (For Cards) */}
                {selectedItem.type === 'CARD' && (
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-gray-400 mb-1.5">
                      Durum Çerçevesi
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(Object.keys(FRAME_STATUS_CONFIGS) as FrameStatus[]).map((statusKey) => {
                        const cfg = FRAME_STATUS_CONFIGS[statusKey];
                        const isActive = selectedItem.frameStatus === statusKey;
                        return (
                          <button
                            key={statusKey}
                            onClick={() =>
                              onUpdateItem(selectedItem.id, { frameStatus: statusKey })
                            }
                            className={`p-1.5 rounded-lg border text-left flex items-center justify-between text-[11px] font-bold transition-all ${
                              isActive
                                ? 'bg-blue-900/60 text-blue-200 border-blue-500 shadow-sm'
                                : 'bg-[#0d1117] text-gray-300 border-gray-800 hover:border-gray-700'
                            }`}
                          >
                            <span className="flex items-center gap-1.5 truncate">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: cfg.color }}
                              />
                              <span className="truncate">{cfg.label}</span>
                            </span>
                            {isActive && <Check size={12} className="text-blue-400 shrink-0 ml-1" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Ring Selector & Ring Tone (For Coins) */}
                {selectedItem.type === 'COIN' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-gray-400 mb-1.5">
                        Coin Ringi (Uğraş Türü)
                      </label>
                      <div className="space-y-1">
                        {(Object.keys(RING_CONFIGS) as RingType[]).map((ringKey) => {
                          const cfg = RING_CONFIGS[ringKey];
                          const isActive = selectedItem.ringType === ringKey;
                          return (
                            <button
                              key={ringKey}
                              onClick={() =>
                                onUpdateItem(selectedItem.id, { ringType: ringKey })
                              }
                              className={`w-full p-2 rounded-lg border text-left flex items-center justify-between text-xs font-bold transition-all ${
                                isActive
                                  ? 'bg-blue-950/80 text-blue-200 border-blue-500'
                                  : 'bg-[#0d1117] text-gray-300 border-gray-800 hover:border-gray-700'
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <span
                                  className="w-3 h-3 rounded-full border border-gray-700 shrink-0"
                                  style={{
                                    backgroundColor:
                                      ringKey === 'NONE'
                                        ? '#4b5563'
                                        : selectedItem.ringTone === 'DARK'
                                        ? cfg.darkColor
                                        : cfg.lightColor,
                                  }}
                                />
                                <span>{cfg.label}</span>
                              </span>
                              {isActive && <Check size={12} className="text-blue-400 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Ring Tone Toggle (Açık Ton vs Koyu Ton) */}
                    {selectedItem.ringType && selectedItem.ringType !== 'NONE' && (
                      <div className="p-2.5 bg-[#0d1117] border border-gray-800 rounded-xl space-y-2">
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-gray-300">
                          Uğraş Tonu (Rol Derecesi)
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                          <button
                            onClick={() => onUpdateItem(selectedItem.id, { ringTone: 'LIGHT' })}
                            className={`p-2 rounded-lg border font-bold text-center transition-all ${
                              selectedItem.ringTone !== 'DARK'
                                ? 'bg-emerald-950 text-emerald-200 border-emerald-600 shadow-sm'
                                : 'bg-[#050608] text-gray-400 border-gray-800 hover:text-gray-200'
                            }`}
                          >
                            <div className="font-extrabold text-emerald-400">Açık Ton</div>
                            <div className="text-[9px] opacity-80">İşi Bizzat Yapmak</div>
                          </button>

                          <button
                            onClick={() => onUpdateItem(selectedItem.id, { ringTone: 'DARK' })}
                            className={`p-2 rounded-lg border font-bold text-center transition-all ${
                              selectedItem.ringTone === 'DARK'
                                ? 'bg-purple-950 text-purple-200 border-purple-600 shadow-sm'
                                : 'bg-[#050608] text-gray-400 border-gray-800 hover:text-gray-200'
                            }`}
                          >
                            <div className="font-extrabold text-purple-400">Koyu Ton</div>
                            <div className="text-[9px] opacity-80">Süreci Yönetmek</div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Duplicate & Delete Actions */}
                <div className="pt-2 border-t border-gray-800 flex items-center gap-2">
                  <button
                    onClick={() => onDuplicateItem(selectedItem.id)}
                    className="flex-1 py-2 px-3 bg-[#111827] hover:bg-gray-800 text-gray-200 font-bold text-xs rounded-xl border border-gray-800 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Copy size={14} />
                    <span>Çoğalt</span>
                  </button>

                  <button
                    onClick={() => onDeleteItem(selectedItem.id)}
                    className="py-2 px-3 bg-red-950/60 hover:bg-red-900/80 text-red-300 font-bold text-xs rounded-xl border border-red-800/80 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Trash2 size={14} />
                    <span>Sil</span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* TAB 3: EDGES MANAGER */}
        {activeTab === 'edges' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-300">
                Tüm Bağlantı Okları
              </h3>
              <span className="text-[10px] text-gray-500 font-bold">{edges.length} Adet</span>
            </div>

            {edges.length === 0 ? (
              <div className="p-6 text-center text-gray-400 bg-[#0d1117] border border-dashed border-gray-800 rounded-2xl">
                <ArrowRightLeft size={24} className="mx-auto text-gray-600 mb-2" />
                <p className="font-bold text-xs text-gray-200">Henüz Ok Bağlantısı Yok</p>
                <p className="text-[11px] text-gray-400 mt-1">
                  Masa üzerindeki herhangi bir karta tıklayıp &quot;🔗 Ok Çıkar&quot; butonuna
                  bastıktan sonra diğer bir öğeye tıklayarak ok bağlayabilirsiniz.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {edges.map((edge) => {
                  const fromItem = items.find((i) => i.id === edge.fromId);
                  const toItem = items.find((i) => i.id === edge.toId);
                  const isSelected = edge.id === selectedEdgeId;

                  return (
                    <div
                      key={edge.id}
                      onClick={() => {
                        onSelectEdge(edge.id);
                        onSelectItems([]);
                      }}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-950/60 border-blue-500 ring-2 ring-blue-500/50'
                          : 'bg-[#0d1117] border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between font-extrabold mb-1">
                        <div className="flex items-center gap-1.5 truncate max-w-[180px]">
                          <span className="truncate text-gray-100">
                            {fromItem?.title || 'Öğe'}
                          </span>
                          <span className="text-blue-400">➔</span>
                          <span className="truncate text-gray-100">{toItem?.title || 'Öğe'}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteEdge(edge.id);
                          }}
                          className="text-red-400 hover:text-red-300 p-1"
                          title="Oku Sil"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      {/* Edge Label Input */}
                      <input
                        type="text"
                        value={edge.label || ''}
                        onChange={(e) => onUpdateEdge(edge.id, { label: e.target.value })}
                        className="w-full text-[11px] p-1.5 bg-[#050608] text-gray-100 border border-gray-800 rounded outline-none focus:border-blue-500 uppercase font-bold"
                        placeholder="Örn: GÖREV, YOL, YÖNTEM, AMAÇ, SONUÇ"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: AI AGENT PANEL */}
        {activeTab === 'ai' && (
          <AIAgentPanel
            items={items}
            edges={edges}
            onAddEdge={(fromId, toId, label) => {
              const newEdge: BoardEdge = {
                id: `edge-ai-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                fromId,
                toId,
                label,
                color: '#3b82f6',
                isDashed: false,
              };
              onUpdateEdge(newEdge.id, newEdge);
            }}
            onUpdateItem={onUpdateItem}
            onUpdateBatchItems={onUpdateBatchItems}
            onDeleteItem={onDeleteItem}
            onDeleteBatchItems={onDeleteBatchItems}
            onSelectItems={onSelectItems}
            isQuietHighlightMode={isQuietHighlightMode}
            onToggleQuietHighlightMode={onToggleQuietHighlightMode}
          />
        )}
      </div>
    </aside>
  );
};

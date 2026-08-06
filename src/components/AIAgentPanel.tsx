import React, { useState } from 'react';
import { BoardItem, BoardEdge, ProjectData } from '../types';
import {
  Sparkles,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Upload,
  FileText,
  Image as ImageIcon,
  Trash2,
  Eye,
  EyeOff,
  Globe,
  ArrowRight,
  Layers,
  Link,
  Ban
} from 'lucide-react';

interface AIAgentPanelProps {
  items: BoardItem[];
  edges: BoardEdge[];
  onAddEdge: (fromId: string, toId: string, label: string) => void;
  onUpdateItem: (id: string, updates: Partial<BoardItem>) => void;
  onUpdateBatchItems?: (ids: string[], updates: Partial<BoardItem>) => void;
  onDeleteItem: (id: string) => void;
  onDeleteBatchItems?: (ids: string[]) => void;
  onSelectItems?: (ids: string[]) => void;
  isQuietHighlightMode?: boolean;
  onToggleQuietHighlightMode?: () => void;
}

export const AIAgentPanel: React.FC<AIAgentPanelProps> = ({
  items,
  edges,
  onAddEdge,
  onUpdateItem,
  onUpdateBatchItems,
  onDeleteItem,
  onDeleteBatchItems,
  onSelectItems,
  isQuietHighlightMode = false,
  onToggleQuietHighlightMode,
}) => {
  const [subMode, setSubMode] = useState<'STANDARDIZE' | 'MERGE' | 'QUIET'>('STANDARDIZE');
  
  // Standartlaştır / Kontrol Modu (Tek Öğe vs Bütün Masa)
  const [checkTarget, setCheckTarget] = useState<'SINGLE' | 'FULL_BOARD'>('FULL_BOARD');
  const [selectedItemId, setSelectedItemId] = useState<string>(items[0]?.id || '');
  
  // Birleştir Modu - Dosya İçe Aktarma
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; type: 'json' | 'image'; content: any }[]>([]);
  const [secondMapJSON, setSecondMapJSON] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // 1. Standartlaştır ve Gerçeklik Kontrolü Yap (Tek veya Bütün Masa)
  const handleRunStandardize = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      if (checkTarget === 'SINGLE') {
        const item = items.find((i) => i.id === selectedItemId);
        if (!item) {
          setError('Lütfen önce kontrol edilecek bir kart veya coin seçin.');
          setLoading(false);
          return;
        }

        const res = await fetch('/api/ai-agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'STANDARDIZE_AND_CHECK',
            inputItem: item,
          }),
        });

        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || 'AI yanıtı alınamadı.');
        }

        setResult({ type: 'SINGLE', ...data.result });
      } else {
        // Bütün Masa Gerçeklik Taraması
        const res = await fetch('/api/ai-agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'FULL_BOARD_CHECK',
            items,
            edges,
          }),
        });

        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || 'AI yanıtı alınamadı.');
        }

        setResult({ type: 'FULL_BOARD', ...data.result });
      }
    } catch (err: any) {
      setError(err.message || 'AI Ajanı çalışırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Çoklu Dosya İçe Aktarma (JSON & PNG/JPG)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    (Array.from(files) as File[]).forEach((file: File) => {
      const isJson = file.name.endsWith('.json');
      const isImage = file.type.startsWith('image/');

      const reader = new FileReader();
      if (isJson) {
        reader.onload = (event) => {
          try {
            const json = JSON.parse(event.target?.result as string);
            setUploadedFiles((prev) => [
              ...prev,
              { name: file.name, type: 'json', content: json },
            ]);
          } catch {
            setError(`"${file.name}" geçerli bir JSON dosyası değil.`);
          }
        };
        reader.readAsText(file);
      } else if (isImage) {
        reader.onload = (event) => {
          setUploadedFiles((prev) => [
            ...prev,
            { name: file.name, type: 'image', content: event.target?.result as string },
          ]);
        };
        reader.readAsDataURL(file);
      }
    });

    e.target.value = '';
  };

  const removeUploadedFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // 3. Senaryoları Birleştir (Çoklu Harita / PNG Taraması)
  const handleRunMergeScenarios = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const jsonMaps: any[] = [];
      const imageList: string[] = [];

      // Process uploaded files
      uploadedFiles.forEach((file) => {
        if (file.type === 'json') {
          jsonMaps.push(file.content);
        } else if (file.type === 'image') {
          imageList.push(file.content);
        }
      });

      // Process raw textarea JSON if filled
      if (secondMapJSON.trim()) {
        try {
          const parsed = JSON.parse(secondMapJSON);
          jsonMaps.push(parsed);
        } catch {
          throw new Error('Metin kutusundaki JSON verisi geçersiz.');
        }
      }

      const res = await fetch('/api/ai-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'MERGE_SCENARIOS',
          mapA: { items, edges },
          maps: jsonMaps,
          images: imageList,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'AI yanıtı alınamadı.');
      }

      setResult({ type: 'MERGE', ...data.result });
    } catch (err: any) {
      setError(err.message || 'İçe aktarılan verilerle AI harita birleştirmesi yapılamadı.');
    } finally {
      setLoading(false);
    }
  };

  // Önerilen Ok Bağlantılarını Masaya Otomatik Ekle
  const handleApplySuggestedEdges = (intersections: any[]) => {
    let addedCount = 0;
    intersections.forEach((item) => {
      if (item.suggestedEdge) {
        const { fromTitle, toTitle, label } = item.suggestedEdge;

        const fromCard = items.find(
          (i) => i.title && i.title.toLowerCase().includes((fromTitle || '').toLowerCase())
        );
        const toCard = items.find(
          (i) => i.title && i.title.toLowerCase().includes((toTitle || '').toLowerCase())
        );

        if (fromCard && toCard && fromCard.id !== toCard.id) {
          onAddEdge(fromCard.id, toCard.id, label || 'YOL');
          addedCount++;
        }
      }
    });

    if (addedCount > 0) {
      alert(`${addedCount} adet önerilen ok bağlantısı masaya başarıyla eklendi!`);
    } else {
      alert('Kart başlıklarıyla eşleşen öğeler bulunamadı veya bağlantılar zaten var.');
    }
  };

  // 4. Sessiz Kartlar Listesi & İstatistikleri
  const quietCards = items.filter((item) => {
    if (item.type !== 'CARD') return false;
    const hasCoin = items.some(
      (coin) => coin.type === 'COIN' && Math.hypot(coin.x - item.x, coin.y - item.y) < 100
    );
    const hasEdge = edges.some((e) => e.fromId === item.id || e.toId === item.id);
    const isClosed = item.frameStatus === 'CLOSED';
    return !hasCoin && !hasEdge && !isClosed;
  });

  const quietCardIds = quietCards.map((c) => c.id);

  return (
    <div className="space-y-3">
      {/* AI Sub-navigation */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-[#050608] border border-gray-800 rounded-xl text-[11px] font-bold">
        <button
          onClick={() => {
            setSubMode('STANDARDIZE');
            setResult(null);
            setError(null);
          }}
          className={`py-1.5 px-1 rounded-lg transition-all ${
            subMode === 'STANDARDIZE'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Kontrol
        </button>
        <button
          onClick={() => {
            setSubMode('MERGE');
            setResult(null);
            setError(null);
          }}
          className={`py-1.5 px-1 rounded-lg transition-all ${
            subMode === 'MERGE'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Birleştir
        </button>
        <button
          onClick={() => {
            setSubMode('QUIET');
            setResult(null);
            setError(null);
          }}
          className={`py-1.5 px-1 rounded-lg transition-all flex items-center justify-center gap-1 ${
            subMode === 'QUIET'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <span>Sessiz</span>
          {quietCards.length > 0 && (
            <span className="px-1.5 py-0.2 bg-purple-900 text-purple-200 text-[9px] rounded-full">
              {quietCards.length}
            </span>
          )}
        </button>
      </div>

      {/* MODE 1: STANDARDIZE & CHECK (SINGLE vs FULL BOARD) */}
      {subMode === 'STANDARDIZE' && (
        <div className="space-y-3 text-xs">
          <div className="p-2.5 bg-purple-950/30 border border-purple-800/60 rounded-xl space-y-1">
            <div className="font-extrabold text-purple-300 flex items-center gap-1.5">
              <ShieldCheck size={14} />
              Gerçeklik Kontrolü & Standartlaştırma
            </div>
            <p className="text-[10px] text-purple-200">
              &quot;Masaya yalnızca nesnel gerçeklikte karşılığı olan şeyler konur.&quot; kuralına göre masayı denetleyin.
            </p>
          </div>

          {/* Target Toggle: Single Item vs Full Board */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#0d1117] border border-gray-800 rounded-xl text-[11px] font-bold">
            <button
              onClick={() => {
                setCheckTarget('FULL_BOARD');
                setResult(null);
              }}
              className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
                checkTarget === 'FULL_BOARD'
                  ? 'bg-purple-900/80 text-purple-200 border border-purple-600'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Globe size={13} />
              <span>Bütün Masa Taraması</span>
            </button>
            <button
              onClick={() => {
                setCheckTarget('SINGLE');
                setResult(null);
              }}
              className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
                checkTarget === 'SINGLE'
                  ? 'bg-purple-900/80 text-purple-200 border border-purple-600'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Layers size={13} />
              <span>Tek Öğe Kontrolü</span>
            </button>
          </div>

          {checkTarget === 'SINGLE' ? (
            <div>
              <label className="block text-[10px] font-extrabold uppercase text-gray-400 mb-1">
                İncelenecek Öğe Seçin
              </label>
              <select
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                className="w-full text-xs font-bold p-2 bg-[#0d1117] text-gray-100 border border-gray-800 rounded-lg outline-none focus:border-purple-500"
              >
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    [{item.type === 'CARD' ? item.size : 'COIN'}] {item.title}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="p-2.5 bg-[#0d1117] border border-gray-800 rounded-xl space-y-1 text-[11px] text-gray-300">
              <div className="font-bold flex items-center justify-between text-gray-100">
                <span>Masa Genel Durumu:</span>
                <span className="text-purple-400 font-extrabold">{items.length} Öğe Var</span>
              </div>
              <p className="text-[10px] text-gray-400">
                Masadaki tüm kartlar, coinler ve ok bağlantıları taranarak genel gerçeklik özeti ve sağlık raporu çıkarılacaktır.
              </p>
            </div>
          )}

          <button
            onClick={handleRunStandardize}
            disabled={loading || (checkTarget === 'SINGLE' && !selectedItemId)}
            className="w-full py-2 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <Sparkles size={14} />
            )}
            <span>
              {checkTarget === 'FULL_BOARD'
                ? 'Bütün Masayı Taramaya Başla'
                : 'AI Gerçeklik Analizi Yap'}
            </span>
          </button>

          {error && (
            <div className="p-2.5 bg-red-950/60 border border-red-800 text-red-300 rounded-xl text-[11px] font-medium flex items-start gap-1.5">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* SINGLE ITEM RESULT */}
          {result && result.type === 'SINGLE' && (
            <div className="p-3 bg-[#0d1117] border border-purple-800/80 rounded-xl space-y-2 text-[11px]">
              <div className="flex items-center justify-between font-extrabold">
                <span className="text-gray-200">Gerçeklik Değerlendirmesi:</span>
                <span
                  className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                    result.isObjectiveReality
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-red-950 text-red-300 border border-red-800'
                  }`}
                >
                  {result.isObjectiveReality ? '✓ Nesnel Gerçeklik' : '⚠️ Soyut / Şüpheli'}
                </span>
              </div>

              <p className="text-gray-300">{result.realityAssessment}</p>

              {result.standardizedTitle && (
                <div className="pt-2 border-t border-gray-800 space-y-1">
                  <div className="text-[10px] font-bold text-purple-400">Önerilen Format:</div>
                  <div className="font-black text-gray-100">{result.standardizedTitle}</div>
                  <div className="text-gray-400 text-[10px]">{result.standardizedDescription}</div>

                  <button
                    onClick={() => {
                      const item = items.find((i) => i.id === selectedItemId);
                      if (item) {
                        onUpdateItem(item.id, {
                          title: result.standardizedTitle,
                          description: result.standardizedDescription || item.description,
                        });
                      }
                    }}
                    className="w-full mt-2 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 size={13} />
                    <span>Öneriyi Karta Uygula</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* FULL BOARD RESULT */}
          {result && result.type === 'FULL_BOARD' && (
            <div className="p-3 bg-[#0d1117] border border-purple-800/80 rounded-xl space-y-3 text-[11px]">
              <div className="p-2 bg-purple-950/40 border border-purple-800/80 rounded-lg space-y-1">
                <div className="font-extrabold text-purple-300 flex items-center justify-between">
                  <span>Masa Sağlık Özeti:</span>
                  <span className="text-emerald-400 font-black text-sm">
                    %{result.objectivePercentage || 100} Nesnel
                  </span>
                </div>
                <p className="text-gray-200 text-[11px] leading-relaxed">
                  {result.overallSummary}
                </p>
              </div>

              {result.itemEvaluations && result.itemEvaluations.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[10px] font-extrabold uppercase text-gray-400">
                    Öğe Detayları &amp; Öneriler:
                  </div>

                  <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                    {result.itemEvaluations.map((evalItem: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-2 bg-[#050608] border border-gray-800 rounded-lg space-y-1"
                      >
                        <div className="flex items-center justify-between font-bold text-gray-200">
                          <span className="truncate pr-1">{evalItem.title}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold shrink-0 ${
                              evalItem.isObjectiveReality
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-red-950 text-red-400 border border-red-800'
                            }`}
                          >
                            {evalItem.isObjectiveReality ? '✓ Nesnel' : '⚠️ Soyut'}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400">{evalItem.realityAssessment}</p>

                        {evalItem.standardizedTitle && (
                          <div className="flex items-center justify-between text-[10px] pt-1 border-t border-gray-800/60">
                            <span className="text-purple-300 font-bold">
                              Öneri: {evalItem.standardizedTitle}
                            </span>
                            <button
                              onClick={() => {
                                onUpdateItem(evalItem.itemId, {
                                  title: evalItem.standardizedTitle,
                                  description: evalItem.standardizedDescription || undefined,
                                });
                              }}
                              className="text-emerald-400 hover:underline font-bold text-[9px]"
                            >
                              Uygula
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Batch apply all standardized titles */}
                  <button
                    onClick={() => {
                      if (onUpdateBatchItems && result.itemEvaluations) {
                        result.itemEvaluations.forEach((evalItem: any) => {
                          if (evalItem.itemId && evalItem.standardizedTitle) {
                            onUpdateItem(evalItem.itemId, {
                              title: evalItem.standardizedTitle,
                              description: evalItem.standardizedDescription || undefined,
                            });
                          }
                        });
                        alert('Tüm önerilen standart başlıklar başarıyla uygulandı!');
                      }
                    }}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 size={14} />
                    <span>Tüm Önerilen Başlıkları Masa Üzerine Uygula</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODE 2: SCENARIO MERGER (MULTI-FILE & PNG IMPORT) */}
      {subMode === 'MERGE' && (
        <div className="space-y-3 text-xs">
          <div className="p-2.5 bg-purple-950/30 border border-purple-800/60 rounded-xl space-y-1">
            <div className="font-extrabold text-purple-300 flex items-center gap-1.5">
              <Sparkles size={14} />
              Senaryo Birleştirici Ajan
            </div>
            <p className="text-[10px] text-purple-200">
              Mevcut haritanız ile içe aktaracağınız JSON veya PNG harita dosyalarını tarayarak kesişimleri ve bağlantı oklarını tespit eder.
            </p>
          </div>

          {/* File Drop & Upload Zone */}
          <div className="space-y-2">
            <label className="block text-[10px] font-extrabold uppercase text-gray-400">
              Çoklu Dosya Yükle (JSON / PNG / JPG)
            </label>
            <div className="relative border-2 border-dashed border-gray-800 hover:border-purple-500 rounded-xl p-3 bg-[#0d1117] text-center transition-all cursor-pointer">
              <input
                type="file"
                multiple
                accept=".json,image/png,image/jpeg"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <Upload size={20} className="mx-auto text-purple-400 mb-1" />
              <div className="font-bold text-gray-200 text-xs">
                JSON veya PNG Dosyalarını Sürükleyin ya da Seçin
              </div>
              <div className="text-[10px] text-gray-400">
                Birden fazla oyuncu haritası veya görsel ekleyebilirsiniz
              </div>
            </div>

            {/* Uploaded Files Chips List */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[10px] font-extrabold text-purple-400 uppercase">
                  Yüklenen Dosyalar ({uploadedFiles.length}):
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {uploadedFiles.map((f, idx) => (
                    <div
                      key={idx}
                      className="p-1.5 bg-[#050608] border border-gray-800 rounded-lg flex items-center justify-between text-[11px]"
                    >
                      <span className="flex items-center gap-1.5 text-gray-200 truncate pr-2">
                        {f.type === 'json' ? (
                          <FileText size={13} className="text-emerald-400 shrink-0" />
                        ) : (
                          <ImageIcon size={13} className="text-blue-400 shrink-0" />
                        )}
                        <span className="truncate">{f.name}</span>
                      </span>
                      <button
                        onClick={() => removeUploadedFile(idx)}
                        className="text-gray-500 hover:text-red-400 p-0.5"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Optional Direct JSON Textarea */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase text-gray-500 my-1">
                Veya Doğrudan JSON Yapıştır (Opsiyonel):
              </label>
              <textarea
                value={secondMapJSON}
                onChange={(e) => setSecondMapJSON(e.target.value)}
                rows={2}
                placeholder="JSON yapıştırılabilir..."
                className="w-full text-[10px] p-2 bg-[#0d1117] text-gray-100 border border-gray-800 rounded-lg outline-none font-mono focus:border-purple-500"
              />
            </div>
          </div>

          <button
            onClick={handleRunMergeScenarios}
            disabled={loading}
            className="w-full py-2 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <Sparkles size={14} />
            )}
            <span>
              {uploadedFiles.length > 0
                ? `${uploadedFiles.length} Dosya + Haritayı Taramaya Başla`
                : 'Kesişim Taraması Başlat'}
            </span>
          </button>

          {error && (
            <div className="p-2.5 bg-red-950/60 border border-red-800 text-red-300 rounded-xl text-[11px] font-medium flex items-start gap-1.5">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {result && result.type === 'MERGE' && (
            <div className="p-3 bg-[#0d1117] border border-purple-800/80 rounded-xl space-y-2 text-[11px]">
              <div className="font-bold text-purple-300 leading-relaxed">{result.summary}</div>

              {result.intersections && result.intersections.length > 0 && (
                <div className="space-y-2 mt-2 pt-2 border-t border-gray-800">
                  <div className="text-[10px] font-extrabold uppercase text-gray-400">
                    Tespit Edilen Kesişimler &amp; Öneriler:
                  </div>

                  <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                    {result.intersections.map((intersection: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-2 bg-[#050608] border border-gray-800 rounded-lg space-y-1"
                      >
                        <div className="font-bold text-gray-200">{intersection.title}</div>
                        <p className="text-[10px] text-gray-400">{intersection.description}</p>
                        {intersection.suggestedEdge && (
                          <div className="text-[10px] text-emerald-400 font-extrabold flex items-center justify-between pt-1 border-t border-gray-800/60">
                            <span className="flex items-center gap-1">
                              <Link size={12} />
                              {intersection.suggestedEdge.fromTitle} ➔ {intersection.suggestedEdge.toTitle}
                            </span>
                            <span className="px-1.5 py-0.2 bg-emerald-950 border border-emerald-800 rounded">
                              {intersection.suggestedEdge.label}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Apply Suggested Edges Button */}
                  <button
                    onClick={() => handleApplySuggestedEdges(result.intersections)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow"
                  >
                    <ArrowRight size={14} />
                    <span>Önerilen Bağlantı Oklarını Masaya Ekle</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODE 3: QUIET CARDS & UNCONNECTED CARDS */}
      {subMode === 'QUIET' && (
        <div className="space-y-3 text-xs">
          <div className="p-2.5 bg-gray-900 border border-gray-800 rounded-xl space-y-1">
            <div className="font-extrabold text-gray-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-purple-400" />
                Sessizleşmiş &amp; Bağlantısız Kartlar
              </span>
            </div>
            <p className="text-[10px] text-gray-400">
              Masa üzerinde coin atılmamış, hiçbir ok bağlantısı olmayan ve durumu kapalı tutulmayan pasif kartlar.
            </p>
          </div>

          {/* Visual Highlight Canvas Toggle */}
          <button
            onClick={onToggleQuietHighlightMode}
            className={`w-full py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-between transition-all ${
              isQuietHighlightMode
                ? 'bg-purple-950/80 text-purple-300 border-purple-600 shadow'
                : 'bg-[#0d1117] text-gray-300 border-gray-800 hover:border-gray-700'
            }`}
          >
            <span className="flex items-center gap-2">
              {isQuietHighlightMode ? <Eye size={15} /> : <EyeOff size={15} />}
              <span>Masa Üzerinde Vurgulamayı {isQuietHighlightMode ? 'Kapat' : 'Aç'}</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/40 border border-purple-500/30">
              {isQuietHighlightMode ? 'AKTİF' : 'PASİF'}
            </span>
          </button>

          {quietCards.length === 0 ? (
            <div className="p-4 text-center text-emerald-400 bg-emerald-950/20 border border-emerald-800/60 rounded-xl font-bold text-xs">
              ✓ Masada atıl veya bağlantısız kalmış sessiz kart bulunmuyor!
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-extrabold uppercase text-gray-400">
                <span>Tespit Edilen Sessiz Kartlar ({quietCards.length}):</span>
              </div>

              {/* Quiet Cards List */}
              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                {quietCards.map((card) => (
                  <div
                    key={card.id}
                    className="p-2 bg-[#0d1117] border border-gray-800 rounded-xl flex items-center justify-between"
                  >
                    <div className="truncate pr-2">
                      <div className="font-bold text-gray-200 text-xs truncate">{card.title}</div>
                      <div className="text-[10px] text-gray-400 truncate">
                        [{card.size}] - {card.description || 'Açıklama girilmemiş'}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onUpdateItem(card.id, { frameStatus: 'CLOSED' })}
                        className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-[10px] rounded-lg"
                        title="Kartı Kapalı Yap"
                      >
                        Kapat
                      </button>
                      <button
                        onClick={() => onDeleteItem(card.id)}
                        className="px-2 py-1 bg-red-950/80 hover:bg-red-900 text-red-300 font-bold text-[10px] rounded-lg"
                        title="Kartı Sil"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Batch Quick Actions */}
              <div className="pt-2 border-t border-gray-800 space-y-1.5">
                <button
                  onClick={() => onSelectItems && onSelectItems(quietCardIds)}
                  className="w-full py-1.5 bg-[#111827] hover:bg-gray-800 text-purple-300 font-bold rounded-lg border border-purple-800/50 flex items-center justify-center gap-1.5 text-xs"
                >
                  <Layers size={13} />
                  <span>Tüm Sessiz Kartları Masada Seç ({quietCards.length})</span>
                </button>

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => {
                      if (onUpdateBatchItems) {
                        onUpdateBatchItems(quietCardIds, { frameStatus: 'CLOSED' });
                      } else {
                        quietCardIds.forEach((id) => onUpdateItem(id, { frameStatus: 'CLOSED' }));
                      }
                    }}
                    className="py-1.5 px-2 bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold rounded-lg text-[10px] flex items-center justify-center gap-1"
                  >
                    <Ban size={12} />
                    <span>Hepsini Kapat</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onDeleteBatchItems) {
                        onDeleteBatchItems(quietCardIds);
                      } else {
                        quietCardIds.forEach((id) => onDeleteItem(id));
                      }
                    }}
                    className="py-1.5 px-2 bg-red-950/80 hover:bg-red-900 text-red-300 font-bold rounded-lg text-[10px] flex items-center justify-center gap-1"
                  >
                    <Trash2 size={12} />
                    <span>Hepsini Sil</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { ProjectData } from '../types';
import { SAMPLE_PROJECT } from '../data/constants';
import {
  FolderOpen,
  Save,
  Download,
  Upload,
  Trash2,
  X,
  FileCode,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProjectName: string;
  onSaveCurrentProject: (name: string) => void;
  onLoadProject: (project: ProjectData) => void;
  onExportJSON: () => void;
  onImportJSON: (file: File) => void;
  onClearBoard: () => void;
  savedProjects: ProjectData[];
  onDeleteSavedProject: (id: string) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  currentProjectName,
  onSaveCurrentProject,
  onLoadProject,
  onExportJSON,
  onImportJSON,
  onClearBoard,
  savedProjects,
  onDeleteSavedProject,
}) => {
  const [projectNameInput, setProjectNameInput] = useState(currentProjectName);
  const [activeTab, setActiveTab] = useState<'save_load' | 'templates' | 'export_import'>('save_load');

  if (!isOpen) return null;

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImportJSON(e.target.files[0]);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#0a0c11] rounded-2xl max-w-xl w-full border border-gray-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-gray-100">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between bg-[#0d1117]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-950/80 border border-blue-800 text-blue-400 rounded-lg">
              <FolderOpen size={18} />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-gray-100 leading-none">
                Proje & Dosya Yöneticisi
              </h2>
              <p className="text-[11px] text-gray-400">Kaydet, Yükle ve Şablon Haritalar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-100 rounded-lg hover:bg-gray-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-800 bg-[#050608] text-xs font-bold">
          <button
            onClick={() => setActiveTab('save_load')}
            className={`flex-1 py-2.5 px-3 border-b-2 text-center transition-all ${
              activeTab === 'save_load'
                ? 'border-blue-500 bg-[#0d1117] text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Proje Kaydet / Yükle
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 py-2.5 px-3 border-b-2 text-center transition-all ${
              activeTab === 'templates'
                ? 'border-blue-500 bg-[#0d1117] text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Hazır Şablonlar
          </button>
          <button
            onClick={() => setActiveTab('export_import')}
            className={`flex-1 py-2.5 px-3 border-b-2 text-center transition-all ${
              activeTab === 'export_import'
                ? 'border-blue-500 bg-[#0d1117] text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            JSON Aktarım
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: SAVE / LOAD */}
          {activeTab === 'save_load' && (
            <div className="space-y-4">
              {/* Save Section */}
              <div className="p-3 bg-[#0d1117] border border-gray-800 rounded-xl space-y-2">
                <label className="block text-xs font-black text-gray-200">
                  Mevcut Projeyi Kaydet
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={projectNameInput}
                    onChange={(e) => setProjectNameInput(e.target.value)}
                    className="flex-1 text-xs font-bold p-2 bg-[#050608] text-gray-100 border border-gray-800 rounded-lg outline-none focus:border-blue-500"
                    placeholder="Proje adı..."
                  />
                  <button
                    onClick={() => {
                      onSaveCurrentProject(projectNameInput || 'Gerçeklik Haritası');
                    }}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shrink-0 shadow-md"
                  >
                    <Save size={14} />
                    <span>Kaydet</span>
                  </button>
                </div>
              </div>

              {/* Saved Projects List */}
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase text-gray-400">
                  Kayıtlı Projelerim ({savedProjects.length})
                </h3>

                {savedProjects.length === 0 ? (
                  <p className="text-xs text-gray-500 italic p-3 text-center bg-[#0d1117] border border-gray-800/60 rounded-xl">
                    Henüz kayıtlı proje bulunmuyor.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {savedProjects.map((p) => (
                      <div
                        key={p.id}
                        className="p-3 bg-[#0d1117] border border-gray-800 rounded-xl flex items-center justify-between hover:border-gray-700 transition-colors"
                      >
                        <div>
                          <div className="font-extrabold text-xs text-gray-100">{p.name}</div>
                          <div className="text-[10px] text-gray-400">
                            {p.items?.length || 0} Öğe · {p.edges?.length || 0} Bağlantı ·{' '}
                            {new Date(p.updatedAt).toLocaleDateString('tr-TR')}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              onLoadProject(p);
                              onClose();
                            }}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg"
                          >
                            Yükle
                          </button>
                          <button
                            onClick={() => onDeleteSavedProject(p.id)}
                            className="p-1 text-red-400 hover:bg-red-950/60 rounded-lg"
                            title="Sil"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: TEMPLATES */}
          {activeTab === 'templates' && (
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase text-gray-400 flex items-center gap-1">
                <Sparkles size={14} className="text-amber-400" />
                Örnek Şablon Haritalar
              </h3>

              <div className="grid grid-cols-1 gap-2">
                {/* Preset 1 */}
                <div
                  onClick={() => {
                    onLoadProject(SAMPLE_PROJECT);
                    onClose();
                  }}
                  className="p-3 border border-gray-800 hover:border-blue-500 bg-[#0d1117] rounded-xl cursor-pointer transition-all flex items-center justify-between"
                >
                  <div>
                    <div className="font-black text-xs text-gray-100">
                      🎯 Tam Gerçeklik Haritası (v5 Örnek)
                    </div>
                    <div className="text-[11px] text-gray-400">
                      XL, L, M, S kartlar, Özne/Mekân coinleri ve bağlantı okları içeren hazır set.
                    </div>
                  </div>
                  <button className="px-2.5 py-1 bg-blue-600 text-white font-bold text-xs rounded-lg shrink-0 ml-2">
                    Yükle
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-800">
                <button
                  onClick={() => {
                    if (confirm('Masa üzerindeki tüm ögeler temizlenecektir. Emin misiniz?')) {
                      onClearBoard();
                      onClose();
                    }
                  }}
                  className="w-full py-2.5 px-3 bg-red-950/60 hover:bg-red-900/80 text-red-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-red-800/80"
                >
                  <RefreshCw size={14} />
                  <span>Masayı Tamamen Temizle (Boş Harita)</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: EXPORT / IMPORT */}
          {activeTab === 'export_import' && (
            <div className="space-y-4">
              <div className="p-3 border border-gray-800 bg-[#0d1117] rounded-xl space-y-2">
                <div className="font-extrabold text-xs text-gray-100 flex items-center gap-1.5">
                  <Download size={15} className="text-blue-400" />
                  JSON Olarak İndir (Dışa Aktar)
                </div>
                <p className="text-[11px] text-gray-400">
                  Haritanızdaki tüm kartları, coinleri ve ok bağlantılarını bilgisayarınıza `.json`
                  dosyası olarak yedekleyin.
                </p>
                <button
                  onClick={() => {
                    onExportJSON();
                    onClose();
                  }}
                  className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-md"
                >
                  <FileCode size={14} />
                  <span>JSON Dosyasını İndir</span>
                </button>
              </div>

              <div className="p-3 border border-gray-800 bg-[#0d1117] rounded-xl space-y-2">
                <div className="font-extrabold text-xs text-gray-100 flex items-center gap-1.5">
                  <Upload size={15} className="text-emerald-400" />
                  JSON Dosyası Yükle (İçe Aktar)
                </div>
                <p className="text-[11px] text-gray-400">
                  Daha önce indirdiğiniz `.json` harita dosyasını yükleyin.
                </p>
                <label className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-md">
                  <Upload size={14} />
                  <span>Bilgisayardan Dosya Seç</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

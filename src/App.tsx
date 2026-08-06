import { useState, useEffect, useCallback, useRef } from 'react';
import { BoardItem, BoardEdge, ProjectData, CardSize, CoinSize } from './types';
import { SAMPLE_PROJECT, BASIC_STARTER_PROJECT, CARD_CONFIGS, COIN_CONFIGS } from './data/constants';
import { Topbar } from './components/Topbar';
import { BoardCanvas } from './components/BoardCanvas';
import { SidebarPanel } from './components/SidebarPanel';
import { ProjectModal } from './components/ProjectModal';
import { HelpModal } from './components/HelpModal';
import { ToastNotification, ToastMessage } from './components/ToastNotification';

const LOCAL_STORAGE_KEY = 'gerceklik_oyunu_current_v1_beta';
const LOCAL_STORAGE_SAVED_KEY = 'gerceklik_oyunu_saved_projects_v1_beta';

export default function App() {
  // Core Board State
  const [items, setItems] = useState<BoardItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.items) return parsed.items;
      }
    } catch {
      // ignore
    }
    return BASIC_STARTER_PROJECT.items;
  });

  const [edges, setEdges] = useState<BoardEdge[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.edges) return parsed.edges;
      }
    } catch {
      // ignore
    }
    return BASIC_STARTER_PROJECT.edges;
  });

  const [projectName, setProjectName] = useState<string>('Gerçeklik Haritası');

  // History for Undo / Redo
  const [history, setHistory] = useState<{ items: BoardItem[]; edges: BoardEdge[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const isUndoRedoAction = useRef(false);

  // Selection & Connect Modes
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [isConnectMode, setIsConnectMode] = useState<boolean>(false);
  const [connectSourceId, setConnectSourceId] = useState<string | null>(null);
  const [isQuietHighlightMode, setIsQuietHighlightMode] = useState<boolean>(false);

  // Single selected item helper
  const selectedItemId = selectedItemIds.length === 1 ? selectedItemIds[0] : null;

  // Toggle item in multi-select
  const handleSelectItemToggle = (id: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
    setSelectedEdgeId(null);
  };

  // Set selected item IDs directly
  const handleSelectItems = (ids: string[]) => {
    setSelectedItemIds(ids);
    if (ids.length > 0) setSelectedEdgeId(null);
  };

  // Modals & Mobile Sidebar
  const [isProjectModalOpen, setIsProjectModalOpen] = useState<boolean>(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Saved Projects List
  const [savedProjects, setSavedProjects] = useState<ProjectData[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SAVED_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [BASIC_STARTER_PROJECT, SAMPLE_PROJECT];
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((title: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    setToasts((prev) => [...prev, { id, title, type }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Save state snapshot into undo/redo history
  const pushHistory = useCallback(
    (newItems: BoardItem[], newEdges: BoardEdge[]) => {
      if (isUndoRedoAction.current) {
        isUndoRedoAction.current = false;
        return;
      }

      setHistory((prev) => {
        const sliced = prev.slice(0, historyIndex + 1);
        return [...sliced, { items: newItems, edges: newEdges }];
      });
      setHistoryIndex((prev) => prev + 1);
    },
    [historyIndex]
  );

  // Auto-save current project to localStorage
  useEffect(() => {
    try {
      const data = { items, edges, projectName, updatedAt: new Date().toISOString() };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore
    }
  }, [items, edges, projectName]);

  // Undo Handler
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      isUndoRedoAction.current = true;
      const prev = history[historyIndex - 1];
      setItems(prev.items);
      setEdges(prev.edges);
      setHistoryIndex(historyIndex - 1);
      addToast('İşlem geri alındı', 'info');
    }
  }, [historyIndex, history, addToast]);

  // Redo Handler
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoRedoAction.current = true;
      const next = history[historyIndex + 1];
      setItems(next.items);
      setEdges(next.edges);
      setHistoryIndex(historyIndex + 1);
      addToast('İşlem ileri alındı', 'info');
    }
  }, [historyIndex, history, addToast]);

  // Keyboard Ctrl+Z / Ctrl+Y
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        handleRedo();
      } else if (e.key === 'Escape') {
        setIsConnectMode(false);
        setConnectSourceId(null);
        setSelectedItemIds([]);
        setSelectedEdgeId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Add Item (Card or Coin)
  const handleAddItem = (type: 'CARD' | 'COIN', size: CardSize | CoinSize) => {
    const id = `${type.toLowerCase()}-${Date.now()}`;
    const x = 300 + Math.random() * 80;
    const y = 200 + Math.random() * 80;

    let newItem: BoardItem;

    if (type === 'CARD') {
      const config = CARD_CONFIGS[size as CardSize] || CARD_CONFIGS.M;
      newItem = {
        id,
        type: 'CARD',
        size,
        x,
        y,
        width: config.width,
        height: config.height,
        title: config.defaultTitle,
        description: '',
        categoryTag: 'TANIM',
        frameStatus: 'NONE',
        colorHex: config.defaultColor,
        bgHex: '#ffffff',
        zIndex: items.length + 1,
      };
    } else {
      const config = COIN_CONFIGS[size as CoinSize] || COIN_CONFIGS.SMALL;
      newItem = {
        id,
        type: 'COIN',
        size,
        x,
        y,
        width: config.size,
        height: config.size,
        title: config.defaultTitle,
        description: '',
        frameStatus: 'NONE',
        ringType: 'NONE',
        bgHex: config.defaultBg,
        zIndex: items.length + 1,
      };
    }

    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    setSelectedItemIds([id]);
    setSelectedEdgeId(null);
    pushHistory(updatedItems, edges);
    addToast(`${type === 'CARD' ? 'Yeni Kart' : 'Yeni Coin'} eklendi`);
  };

  // Move Item Position
  const handleMoveItem = (id: string, x: number, y: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, x, y } : item))
    );
  };

  // Move Multiple Items Position Together
  const handleMoveMultipleItems = (deltas: { id: string; dx: number; dy: number }[]) => {
    setItems((prev) =>
      prev.map((item) => {
        const delta = deltas.find((d) => d.id === item.id);
        if (delta) {
          return { ...item, x: item.x + delta.dx, y: item.y + delta.dy };
        }
        return item;
      })
    );
  };

  // Update Item Properties
  const handleUpdateItem = (id: string, updates: Partial<BoardItem>) => {
    const updatedItems = items.map((item) => (item.id === id ? { ...item, ...updates } : item));
    setItems(updatedItems);
    pushHistory(updatedItems, edges);
  };

  // Update Multiple Items Properties Batch
  const handleUpdateBatchItems = (ids: string[], updates: Partial<BoardItem>) => {
    const updatedItems = items.map((item) => (ids.includes(item.id) ? { ...item, ...updates } : item));
    setItems(updatedItems);
    pushHistory(updatedItems, edges);
    addToast(`${ids.length} öğenin özellikleri güncellendi`);
  };

  // Delete Selected Item
  const handleDeleteItem = (id: string) => {
    const updatedItems = items.filter((item) => item.id !== id);
    const updatedEdges = edges.filter((e) => e.fromId !== id && e.toId !== id);

    setItems(updatedItems);
    setEdges(updatedEdges);
    setSelectedItemIds((prev) => prev.filter((i) => i !== id));
    pushHistory(updatedItems, updatedEdges);
    addToast('Öğe silindi', 'info');
  };

  // Delete Multiple Selected Items Batch
  const handleDeleteBatchItems = (ids: string[]) => {
    const updatedItems = items.filter((item) => !ids.includes(item.id));
    const updatedEdges = edges.filter((e) => !ids.includes(e.fromId) && !ids.includes(e.toId));

    setItems(updatedItems);
    setEdges(updatedEdges);
    setSelectedItemIds([]);
    pushHistory(updatedItems, updatedEdges);
    addToast(`${ids.length} öğe silindi`, 'info');
  };

  // Duplicate Item
  const handleDuplicateItem = (id: string) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;

    const newId = `${target.type.toLowerCase()}-${Date.now()}`;
    const newItem: BoardItem = {
      ...target,
      id: newId,
      x: target.x + 30,
      y: target.y + 30,
      title: `${target.title} (Kopya)`,
    };

    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    setSelectedItemIds([newId]);
    pushHistory(updatedItems, edges);
    addToast('Öğe çoğaltıldı');
  };

  // Duplicate Multiple Items Batch
  const handleDuplicateBatchItems = (ids: string[]) => {
    const targets = items.filter((i) => ids.includes(i.id));
    if (targets.length === 0) return;

    const now = Date.now();
    const newItems: BoardItem[] = targets.map((t, idx) => ({
      ...t,
      id: `${t.type.toLowerCase()}-${now}-${idx}`,
      x: t.x + 40,
      y: t.y + 40,
      title: `${t.title} (Kopya)`,
    }));

    const updatedItems = [...items, ...newItems];
    setItems(updatedItems);
    setSelectedItemIds(newItems.map((n) => n.id));
    pushHistory(updatedItems, edges);
    addToast(`${targets.length} öğe çoğaltıldı`);
  };

  // Toggle Connect Mode
  const handleToggleConnectMode = () => {
    if (isConnectMode) {
      setIsConnectMode(false);
      setConnectSourceId(null);
    } else {
      setIsConnectMode(true);
      if (selectedItemIds.length > 1) {
        addToast(`${selectedItemIds.length} öğe seçildi. Hedef karta tıklandığında tümü bağlanacak!`, 'info');
      } else if (selectedItemIds.length === 1) {
        setConnectSourceId(selectedItemIds[0]);
        addToast('Hedef karta/coine tıklayarak oku bağlayın', 'info');
      } else {
        addToast('Önce başlangıç kartına (veya kartlarına), ardından hedef karta tıklayın', 'info');
      }
    }
  };

  // Start connect arrow from specific item
  const handleStartConnectFrom = (id: string) => {
    setIsConnectMode(true);
    if (!selectedItemIds.includes(id)) {
      setSelectedItemIds([id]);
    }
    setConnectSourceId(id);
    if (selectedItemIds.length > 1) {
      addToast(`Seçili ${selectedItemIds.length} öğe için hedef karta/coine tıklayın`, 'info');
    } else {
      addToast('Hedef karta/coine tıklayın', 'info');
    }
  };

  // Complete Arrow Connection (Single or Batch Multi-Select)
  const handleCompleteConnect = (targetId: string) => {
    // Determine sources to connect from
    let sources: string[] = [];
    if (selectedItemIds.length > 0) {
      sources = selectedItemIds.filter((id) => id !== targetId);
    } else if (connectSourceId && connectSourceId !== targetId) {
      sources = [connectSourceId];
    }

    if (sources.length === 0) {
      setConnectSourceId(targetId);
      setSelectedItemIds([targetId]);
      addToast('Başlangıç kartı seçildi. Şimdi ok bağlamak istediğiniz hedef karta tıklayın', 'info');
      return;
    }

    let addedCount = 0;
    const newEdges: BoardEdge[] = [];
    const now = Date.now();

    sources.forEach((srcId, idx) => {
      if (srcId === targetId) return;

      const exists = edges.some(
        (e) =>
          (e.fromId === srcId && e.toId === targetId) ||
          (e.fromId === targetId && e.toId === srcId)
      );

      if (!exists) {
        newEdges.push({
          id: `edge-${now}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
          fromId: srcId,
          toId: targetId,
          label: 'İlişki / Akış',
          color: '#6b7280',
          isDashed: false,
        });
        addedCount++;
      }
    });

    if (addedCount > 0) {
      const updatedEdges = [...edges, ...newEdges];
      setEdges(updatedEdges);
      pushHistory(items, updatedEdges);
      addToast(`🔗 ${addedCount} adet ok bağlantısı başarıyla oluşturuldu!`);
    } else {
      addToast('Seçili öğeler ile hedef arasında zaten ok bağlantısı mevcut', 'info');
    }

    setIsConnectMode(false);
    setConnectSourceId(null);
  };

  // Edge Updates & Delete
  const handleUpdateEdge = (id: string, updates: Partial<BoardEdge>) => {
    const updatedEdges = edges.map((e) => (e.id === id ? { ...e, ...updates } : e));
    setEdges(updatedEdges);
    pushHistory(items, updatedEdges);
  };

  const handleDeleteEdge = (id: string) => {
    const updatedEdges = edges.filter((e) => e.id !== id);
    setEdges(updatedEdges);
    setSelectedEdgeId(null);
    pushHistory(items, updatedEdges);
    addToast('Ok bağlantısı silindi', 'info');
  };

  const handleDeleteSelected = () => {
    if (selectedItemIds.length > 0) {
      handleDeleteBatchItems(selectedItemIds);
    } else if (selectedEdgeId) {
      handleDeleteEdge(selectedEdgeId);
    }
  };

  // Save / Load Project
  const handleSaveCurrentProject = (name: string) => {
    setProjectName(name);
    const newProject: ProjectData = {
      id: `proj-${Date.now()}`,
      name,
      description: 'Kullanıcı tarafından kaydedilen harita',
      items,
      edges,
      updatedAt: new Date().toISOString(),
    };

    const updatedList = [newProject, ...savedProjects.filter((p) => p.name !== name)];
    setSavedProjects(updatedList);
    try {
      localStorage.setItem(LOCAL_STORAGE_SAVED_KEY, JSON.stringify(updatedList));
    } catch {
      // ignore
    }
    addToast(`"${name}" kaydedildi!`);
  };

  const handleLoadProject = (project: ProjectData) => {
    setItems(project.items || []);
    setEdges(project.edges || []);
    setProjectName(project.name || 'Gerçeklik Haritası');
    setSelectedItemIds([]);
    setSelectedEdgeId(null);
    pushHistory(project.items || [], project.edges || []);
    addToast(`"${project.name}" yüklendi`);
  };

  const handleReplaceBoard = useCallback(
    (newItems: BoardItem[], newEdges: BoardEdge[], title?: string) => {
      setItems(newItems);
      setEdges(newEdges);
      if (title) setProjectName(title);
      setSelectedItemIds([]);
      setSelectedEdgeId(null);
      pushHistory(newItems, newEdges);
      addToast('Yeni Gerçeklik Haritası masaya başarıyla yüklendi!', 'success');
    },
    [pushHistory, addToast]
  );

  const handleAppendBoard = useCallback(
    (newItems: BoardItem[], newEdges: BoardEdge[]) => {
      const offsetItems = newItems.map((item) => ({
        ...item,
        id: `imported-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        x: item.x + 120,
        y: item.y + 120,
      }));
      const idMap = new Map<string, string>();
      newItems.forEach((oldItem, idx) => {
        idMap.set(oldItem.id, offsetItems[idx].id);
      });
      const offsetEdges = newEdges.map((edge) => ({
        ...edge,
        id: `edge-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        fromId: idMap.get(edge.fromId) || edge.fromId,
        toId: idMap.get(edge.toId) || edge.toId,
      }));

      const combinedItems = [...items, ...offsetItems];
      const combinedEdges = [...edges, ...offsetEdges];
      setItems(combinedItems);
      setEdges(combinedEdges);
      pushHistory(combinedItems, combinedEdges);
      addToast('Metinden türetilen yeni kartlar ve oklar masaya eklendi!', 'success');
    },
    [items, edges, pushHistory, addToast]
  );

  const handleDeleteSavedProject = (id: string) => {
    const updatedList = savedProjects.filter((p) => p.id !== id);
    setSavedProjects(updatedList);
    try {
      localStorage.setItem(LOCAL_STORAGE_SAVED_KEY, JSON.stringify(updatedList));
    } catch {
      // ignore
    }
    addToast('Kayıtlı proje silindi', 'info');
  };

  // Export / Import JSON
  const handleExportJSON = () => {
    const data = {
      name: projectName,
      items,
      edges,
      exportedAt: new Date().toISOString(),
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.toLowerCase().replace(/\s+/g, '_')}_v5.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('JSON harita dosyası indirildi');
  };

  const handleImportJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (parsed.items) {
          setItems(parsed.items);
          setEdges(parsed.edges || []);
          if (parsed.name) setProjectName(parsed.name);
          pushHistory(parsed.items, parsed.edges || []);
          addToast('JSON haritası başarıyla yüklendi!');
        } else {
          addToast('Geçersiz harita JSON dosyası', 'error');
        }
      } catch {
        addToast('JSON okunurken hata oluştu', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Clear Canvas Board
  const handleClearBoard = () => {
    setItems([]);
    setEdges([]);
    setSelectedItemIds([]);
    setSelectedEdgeId(null);
    pushHistory([], []);
    addToast('Masa temizlendi', 'info');
  };

  // Export Canvas as PNG
  const handleExportPNG = () => {
    const svgElem = document.querySelector('svg') as SVGElement | null;
    if (!svgElem) return;

    try {
      const xml = new XMLSerializer().serializeToString(svgElem);
      const svgBlob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1600;
        canvas.height = 1000;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#fafaf9';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const pngUrl = canvas.toDataURL('image/png');
          const a = document.createElement('a');
          a.href = pngUrl;
          a.download = `${projectName.toLowerCase().replace(/\s+/g, '_')}_goruntusu.png`;
          a.click();
          addToast('🖼️ PNG Görseli indirildi!');
        }
        URL.revokeObjectURL(url);
      };

      img.src = url;
    } catch {
      addToast('PNG oluşturulurken hata oluştu', 'error');
    }
  };

  const connectSourceItem = items.find((i) => i.id === connectSourceId);

  return (
    <div className="h-screen w-screen flex flex-col bg-stone-100 overflow-hidden text-gray-900 font-sans">
      {/* Toast Notifications */}
      <ToastNotification toasts={toasts} onDismiss={dismissToast} />

      {/* Topbar */}
      <Topbar
        isConnectMode={isConnectMode}
        onToggleConnectMode={handleToggleConnectMode}
        isQuietHighlightMode={isQuietHighlightMode}
        onToggleQuietHighlightMode={() => setIsQuietHighlightMode((prev) => !prev)}
        onOpenProjectModal={() => setIsProjectModalOpen(true)}
        onOpenHelpModal={() => setIsHelpModalOpen(true)}
        onOpenTemplatesModal={() => setIsProjectModalOpen(true)}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        onExportPNG={handleExportPNG}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        connectSourceTitle={connectSourceItem?.title}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Canvas Area */}
        <main className="flex-1 relative">
          <BoardCanvas
            items={items}
            edges={edges}
            selectedItemIds={selectedItemIds}
            selectedEdgeId={selectedEdgeId}
            connectSourceId={connectSourceId}
            isConnectMode={isConnectMode}
            isQuietHighlightMode={isQuietHighlightMode}
            onSelectItems={handleSelectItems}
            onSelectItemToggle={handleSelectItemToggle}
            onSelectEdge={setSelectedEdgeId}
            onMoveItem={handleMoveItem}
            onMoveMultipleItems={handleMoveMultipleItems}
            onCompleteConnect={handleCompleteConnect}
            onDeleteSelected={handleDeleteSelected}
          />
        </main>

        {/* Sidebar / Bottom Drawer */}
        <SidebarPanel
          items={items}
          edges={edges}
          selectedItemIds={selectedItemIds}
          selectedEdgeId={selectedEdgeId}
          connectSourceId={connectSourceId}
          isMobileOpen={isMobileMenuOpen}
          isQuietHighlightMode={isQuietHighlightMode}
          onToggleQuietHighlightMode={() => setIsQuietHighlightMode((prev) => !prev)}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          onAddItem={handleAddItem}
          onUpdateItem={handleUpdateItem}
          onUpdateBatchItems={handleUpdateBatchItems}
          onDeleteItem={handleDeleteItem}
          onDeleteBatchItems={handleDeleteBatchItems}
          onDuplicateItem={handleDuplicateItem}
          onDuplicateBatchItems={handleDuplicateBatchItems}
          onUpdateEdge={handleUpdateEdge}
          onDeleteEdge={handleDeleteEdge}
          onStartConnectFrom={handleStartConnectFrom}
          onSelectItems={handleSelectItems}
          onSelectEdge={setSelectedEdgeId}
          onReplaceBoard={handleReplaceBoard}
          onAppendBoard={handleAppendBoard}
        />
      </div>

      {/* Modals */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        currentProjectName={projectName}
        onSaveCurrentProject={handleSaveCurrentProject}
        onLoadProject={handleLoadProject}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        onClearBoard={handleClearBoard}
        savedProjects={savedProjects}
        onDeleteSavedProject={handleDeleteSavedProject}
      />

      <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
    </div>
  );
}

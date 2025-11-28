
import React, { useState, useEffect } from 'react';
import { Icons } from './components/ui/Icons';
import CanvasArea from './components/CanvasArea';
import LayerManager from './components/LayerManager';
import PropertyPanel from './components/PropertyPanel';
import SettingsModal from './components/SettingsModal';
import { useTranslation } from './hooks/useTranslation';
import { exportCanvas } from './services/exportService';
import { 
  Layer, 
  CanvasConfig, 
  LayerType, 
  AspectRatio
} from './types';
import { 
  DEFAULT_CANVAS_WIDTH, 
  DEFAULT_LAYER_PROPS, 
  ASPECT_RATIOS 
} from './constants';

const simpleId = () => Math.random().toString(36).substr(2, 9);

function App() {
  // Hooks
  const { t, language, setLanguage } = useTranslation();

  // State
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [canvasConfig, setCanvasConfig] = useState<CanvasConfig>({
    width: DEFAULT_CANVAS_WIDTH,
    height: DEFAULT_CANVAS_WIDTH,
    aspectRatio: '1:1',
    scaleDisplay: 1,
  });
  const [showLogs, setShowLogs] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Style Clipboard State
  const [styleClipboard, setStyleClipboard] = useState<Partial<Layer> | null>(null);
  
  // Initial Setup: Add a default background
  useEffect(() => {
    const bgId = simpleId();
    setLayers([
      {
        ...DEFAULT_LAYER_PROPS,
        id: bgId,
        type: 'background',
        name: t('layer_types.background'), // Initial name, won't update dynamically but that's standard for user-editable names
        visible: true,
        locked: true,
        x: 0, 
        y: 0,
        width: 100,
        height: 100,
        backgroundColor: '#1f1f1f',
        opacity: 100,
        scale: 1,
        rotation: 0,
        backgroundScale: 100, // Default background scale
        patternConfig: {
            enabled: false,
            text: 'SPIE',
            size: 24,
            opacity: 10,
            rotation: -15,
            gapX: 20,
            gapY: 20,
            color: '#ffffff'
        }
      } as Layer
    ]);
  }, []); // Only run once on mount

  // Handlers
  const handleAddLayer = (type: LayerType) => {
    const id = simpleId();
    let newLayer: Layer = {
        ...DEFAULT_LAYER_PROPS,
        id,
        type,
        name: t(`layer_types.new_${type}` as any) || `New ${type}`,
        width: 50, // Default relative size
        height: 50,
        visible: true,
        locked: false,
        x: 50,
        y: 50,
        scale: 1,
        rotation: 0,
        opacity: 100
    } as Layer;

    if (type === 'text') {
        newLayer.name = t('layer_types.player_name');
        newLayer.width = 0; // Auto width
        newLayer.height = 0;
        newLayer.textConfig = {
            content: 'PLAYER NAME',
            fontFamily: 'Impact',
            fontSize: 40,
            color: '#ffffff',
            bold: false,
            italic: false,
            align: 'center',
            letterSpacing: 2
        };
        newLayer.shadow = { enabled: true, color: 'rgba(0,0,0,0.8)', blur: 4, offsetX: 2, offsetY: 2, opacity: 100 };
    } else if (type === 'frame') {
        newLayer.name = t('layer_types.border_frame');
        newLayer.width = 100;
        newLayer.height = 100;
        newLayer.x = 0;
        newLayer.y = 0;
        newLayer.locked = true; // Frames usually static
        newLayer.frameConfig = {
            enabled: true,
            type: 'solid',
            color: '#ffffff',
            width: 10,
            radius: 0
        };
    } else if (type === 'image') {
       // Typically triggered by upload, but if clicked from menu:
       newLayer.src = 'https://picsum.photos/400/400'; // Placeholder
       newLayer.shadow = { enabled: false, color: '#000000', blur: 10, offsetX: 0, offsetY: 0, opacity: 100 };
       newLayer.stroke = { enabled: false, color: '#ffffff', width: 2, opacity: 100 };
       newLayer.glow = { enabled: false, color: '#ffffff', blur: 10, spread: 0 };
    }

    setLayers(prev => [...prev, newLayer]);
    setSelectedLayerId(id);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
              const src = event.target?.result as string;
              
              // Load image to determine aspect ratio for initial layer size
              const img = new Image();
              img.onload = () => {
                  const id = simpleId();
                  
                  // Calculate dimensions to maintain aspect ratio relative to canvas
                  const imgAspect = img.naturalWidth / img.naturalHeight;
                  const canvasAspect = canvasConfig.width / canvasConfig.height;
                  
                  let newWidth = 50; // Default 50% width
                  let newHeight = 50;
                  
                  // If image is taller than it is wide relative to canvas
                  if (imgAspect < canvasAspect) {
                       newHeight = 50;
                       // width% = height% * (imgAspect / canvasAspect)
                       newWidth = newHeight * (imgAspect / canvasAspect);
                  } else {
                       // If image is wider
                       newWidth = 50;
                       // height% = width% * (canvasAspect / imgAspect)
                       newHeight = newWidth * (canvasAspect / imgAspect);
                  }

                  const newLayer: Layer = {
                      ...DEFAULT_LAYER_PROPS,
                      id,
                      type: 'image',
                      name: file.name,
                      visible: true,
                      locked: false,
                      x: 50,
                      y: 50,
                      width: newWidth, 
                      height: newHeight, 
                      scale: 1,
                      rotation: 0,
                      opacity: 100,
                      src: src,
                      shadow: { enabled: false, color: '#000000', blur: 10, offsetX: 0, offsetY: 0, opacity: 100 },
                      glow: { enabled: false, color: '#ffffff', blur: 10, spread: 0 }
                  } as Layer;
                  setLayers(prev => [...prev, newLayer]);
                  setSelectedLayerId(id);
              };
              img.src = src;
          };
          reader.readAsDataURL(file);
      }
  };

  const handleUpdateLayer = (updatedLayer: Layer) => {
      setLayers(prev => prev.map(l => l.id === updatedLayer.id ? updatedLayer : l));
  };

  const handleChangeAspectRatio = (ratioLabel: AspectRatio) => {
      const ratioObj = ASPECT_RATIOS.find(r => r.label === ratioLabel);
      if (!ratioObj) return;

      const base = 1080;
      let w, h;
      
      // Calculate dims based on ratio while keeping max dim around base
      if (ratioObj.ratio >= 1) {
          w = base;
          h = base / ratioObj.ratio;
      } else {
          h = base;
          w = base * ratioObj.ratio;
      }

      setCanvasConfig(prev => ({
          ...prev,
          aspectRatio: ratioLabel,
          width: Math.round(w),
          height: Math.round(h)
      }));
  };

  const handleExport = () => {
      // Temporarily deselect layer to avoid exporting the selection box
      const previousSelection = selectedLayerId;
      setSelectedLayerId(null);

      // Allow React one tick to re-render without selection
      setTimeout(() => {
          const name = prompt("Enter file name:", "player-card");
          if (name) {
              exportCanvas('export-canvas', name)
                .finally(() => {
                    // Restore selection
                    setSelectedLayerId(previousSelection);
                });
          } else {
              setSelectedLayerId(previousSelection);
          }
      }, 100);
  };
  
  // Style Copy/Paste Logic
  const handleCopyStyle = (layer: Layer) => {
      // Extract transferable properties
      const styleData: Partial<Layer> = {
          opacity: layer.opacity,
          rotation: layer.rotation,
          scale: layer.scale,
          shadow: layer.shadow ? { ...layer.shadow } : undefined,
          glow: layer.glow ? { ...layer.glow } : undefined,
          // We intentionally do not copy X/Y to avoid moving the target image to the source's location
      };
      setStyleClipboard(styleData);
  };

  const handlePasteStyle = (targetLayer: Layer) => {
      if (!styleClipboard) return;
      
      const newLayer = { ...targetLayer, ...styleClipboard };
      // Deep merge nested objects if necessary, but spreading is usually enough here 
      // as we copied the full object structure in handleCopyStyle
      
      handleUpdateLayer(newLayer);
  };

  // Project Save/Load Logic
  const handleSaveProject = () => {
      const projectData = {
          version: '1.2.0',
          timestamp: Date.now(),
          canvasConfig,
          layers
      };
      const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `spie-project-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
  };

  const handleLoadProject = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const content = event.target?.result as string;
              const data = JSON.parse(content);
              
              if (data.layers && data.canvasConfig) {
                  setLayers(data.layers);
                  setCanvasConfig(data.canvasConfig);
                  setSelectedLayerId(null);
                  alert(t('common.project_loaded'));
              } else {
                  alert(t('common.invalid_project'));
              }
          } catch (error) {
              console.error('Failed to parse project file', error);
              alert(t('common.invalid_project'));
          }
      };
      reader.readAsText(file);
      // Reset input to allow loading the same file again
      e.target.value = '';
  };

  const selectedLayer = layers.find(l => l.id === selectedLayerId) || null;

  return (
    <div className="flex w-screen h-screen bg-black text-gray-200 overflow-hidden font-sans">
      
      {/* 1. Sidebar (Tools) - 1/16 Width approx 64px or 4rem */}
      <div className="w-16 flex flex-col items-center border-r border-gray-800 bg-gray-950 py-4 space-y-6 z-20">
        <div className="text-xl font-black tracking-tighter text-white mb-4">SPIE</div>
        
        {/* Upload */}
        <div className="relative group">
            <label className="p-3 rounded-xl bg-gray-800 hover:bg-white hover:text-black transition-all cursor-pointer block">
                <Icons.Upload size={20} />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
            <span className="absolute left-14 top-2 bg-gray-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                {t('common.import_image')}
            </span>
        </div>

        {/* Add Text */}
        <button 
            onClick={() => handleAddLayer('text')}
            className="p-3 rounded-xl bg-gray-800 hover:bg-white hover:text-black transition-all group relative"
        >
            <Icons.Type size={20} />
            <span className="absolute left-14 top-2 bg-gray-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                {t('common.add_name')}
            </span>
        </button>

         {/* Add Frame */}
         <button 
            onClick={() => handleAddLayer('frame')}
            className="p-3 rounded-xl bg-gray-800 hover:bg-white hover:text-black transition-all group relative"
        >
            <Icons.Frame size={20} />
            <span className="absolute left-14 top-2 bg-gray-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                {t('common.add_frame')}
            </span>
        </button>

        <div className="w-full h-px bg-gray-800 my-2"></div>

        {/* Load Project */}
        <div className="relative group">
            <label className="p-3 rounded-xl bg-gray-800 hover:bg-white hover:text-black transition-all cursor-pointer block">
                <Icons.Load size={20} />
                <input type="file" accept=".json" className="hidden" onChange={handleLoadProject} />
            </label>
            <span className="absolute left-14 top-2 bg-gray-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                {t('common.load_project')}
            </span>
        </div>

        {/* Save Project */}
        <button 
            onClick={handleSaveProject}
            className="p-3 rounded-xl bg-gray-800 hover:bg-white hover:text-black transition-all group relative"
        >
            <Icons.Save size={20} />
            <span className="absolute left-14 top-2 bg-gray-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                {t('common.save_project')}
            </span>
        </button>

        <div className="flex-1"></div>

        {/* Settings */}
        <button 
            onClick={() => setShowSettings(true)}
            className="p-3 rounded-xl bg-gray-800 hover:bg-white hover:text-black transition-all group relative"
        >
            <Icons.Settings size={20} />
            <span className="absolute left-14 top-2 bg-gray-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                {t('common.settings')}
            </span>
        </button>

        {/* Export */}
        <button 
            onClick={handleExport}
            className="p-3 rounded-xl bg-green-900 text-green-400 hover:bg-green-500 hover:text-white transition-all group relative"
        >
            <Icons.Download size={20} />
            <span className="absolute left-14 top-2 bg-gray-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                {t('common.export_png')}
            </span>
        </button>

        {/* Logs */}
        <button 
            onClick={() => setShowLogs(!showLogs)}
            className="p-3 rounded-xl hover:bg-gray-800 transition-all text-gray-500"
        >
            <Icons.Logs size={20} />
        </button>
      </div>

      {/* 2. Main Canvas Area - 1/2 Width (Flex 1) */}
      <CanvasArea 
        layers={layers}
        config={canvasConfig}
        selectedLayerId={selectedLayerId}
        onSelectLayer={setSelectedLayerId}
      />

      {/* 3. Right Editor Panel - Remaining width */}
      <div className="w-80 lg:w-96 flex flex-col border-l border-gray-800 z-10 bg-gray-900 shadow-xl">
        
        {/* Aspect Ratio & Global Settings (Mini Header) */}
        <div className="p-4 border-b border-gray-800 bg-gray-950">
            <h2 className="text-xs font-bold text-gray-500 uppercase mb-2">{t('common.canvas_ratio')}</h2>
            <div className="grid grid-cols-4 gap-2">
                {ASPECT_RATIOS.map(r => (
                    <button
                        key={r.label}
                        onClick={() => handleChangeAspectRatio(r.label)}
                        className={`text-xs py-1 px-2 rounded border ${
                            canvasConfig.aspectRatio === r.label 
                            ? 'bg-white text-black border-white' 
                            : 'border-gray-700 text-gray-400 hover:border-gray-500'
                        }`}
                    >
                        {r.label}
                    </button>
                ))}
            </div>
            <div className="mt-2 text-xs text-gray-600 font-mono text-center">
                {canvasConfig.width} x {canvasConfig.height}px
            </div>
        </div>

        {/* Top: Property Editor */}
        <PropertyPanel 
            layer={selectedLayer} 
            onUpdate={handleUpdateLayer}
            canvasAspect={canvasConfig.aspectRatio}
            onCopyStyle={handleCopyStyle}
            onPasteStyle={handlePasteStyle}
            hasClipboard={!!styleClipboard}
            t={t}
        />

        {/* Bottom: Layer Manager */}
        <LayerManager 
            layers={layers}
            selectedLayerId={selectedLayerId}
            onSelect={setSelectedLayerId}
            onChange={setLayers}
            t={t}
        />
      </div>

      {/* Settings Modal */}
      <SettingsModal 
          isOpen={showSettings} 
          onClose={() => setShowSettings(false)}
          language={language}
          setLanguage={setLanguage}
          t={t}
      />

      {/* Update Logs Modal Overlay */}
      {showLogs && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 p-10 backdrop-blur-sm" onClick={() => setShowLogs(false)}>
              <div className="bg-gray-900 border border-gray-700 p-6 rounded-2xl max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                  <h2 className="text-2xl font-bold mb-4">Updates & Info</h2>
                  <div className="space-y-4 text-gray-400 text-sm">
                      <p><strong className="text-white">Version 1.2.1</strong> - Project Management</p>
                      <ul className="list-disc pl-5 space-y-1">
                          <li>Added Save/Load Project functionality (JSON).</li>
                          <li>Optimized sidebar layout.</li>
                      </ul>
                      <p className="mt-4"><strong className="text-white">Version 1.2.0</strong> - Style Copy/Paste</p>
                      <ul className="list-disc pl-5 space-y-1">
                          <li>Added Copy & Paste buttons for layer styles.</li>
                          <li>Added System Font loading.</li>
                      </ul>
                      <p className="pt-4 border-t border-gray-800">
                          {t('common.created_by')} <span className="text-white font-semibold">ShineMiyo</span>
                      </p>
                  </div>
                  <button 
                    onClick={() => setShowLogs(false)}
                    className="mt-6 w-full py-2 bg-white text-black font-bold rounded hover:bg-gray-200"
                  >
                      {t('common.close')}
                  </button>
              </div>
          </div>
      )}

    </div>
  );
}

export default App;

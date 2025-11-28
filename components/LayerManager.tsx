import React from 'react';
import { Layer } from '../types';
import { Icons } from './ui/Icons';

interface LayerManagerProps {
  layers: Layer[];
  selectedLayerId: string | null;
  onSelect: (id: string) => void;
  onChange: (layers: Layer[]) => void;
  t: (key: string) => string;
}

const LayerManager: React.FC<LayerManagerProps> = ({ layers, selectedLayerId, onSelect, onChange, t }) => {
  
  const moveLayer = (index: number, direction: 'up' | 'down') => {
    const newLayers = [...layers];
    if (direction === 'up' && index < layers.length - 1) {
      [newLayers[index], newLayers[index + 1]] = [newLayers[index + 1], newLayers[index]];
    } else if (direction === 'down' && index > 0) {
      [newLayers[index], newLayers[index - 1]] = [newLayers[index - 1], newLayers[index]];
    }
    onChange(newLayers);
  };

  const toggleVisibility = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newLayers = [...layers];
    newLayers[index].visible = !newLayers[index].visible;
    onChange(newLayers);
  };

  const toggleLock = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newLayers = [...layers];
    newLayers[index].locked = !newLayers[index].locked;
    onChange(newLayers);
  };

  const deleteLayer = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newLayers = layers.filter((_, i) => i !== index);
    onChange(newLayers);
  };

  // Layers are rendered bottom-to-top in DOM, so index 0 is bottom.
  // In the UI list, usually Top layer is shown at the top.
  // So we reverse the map for display.
  const displayLayers = [...layers].map((l, i) => ({ ...l, originalIndex: i })).reverse();

  return (
    <div className="flex flex-col h-1/2 border-t border-gray-800 bg-gray-900">
      <div className="p-3 border-b border-gray-800 font-semibold text-gray-400 text-sm flex justify-between items-center">
        <span>{t('common.layers')}</span>
        <span className="text-xs bg-gray-800 px-2 py-0.5 rounded">{layers.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {displayLayers.map((layer) => (
          <div
            key={layer.id}
            onClick={() => onSelect(layer.id)}
            className={`group flex items-center p-2 rounded cursor-pointer border border-transparent transition-colors ${
              selectedLayerId === layer.id ? 'bg-gray-800 border-gray-700' : 'hover:bg-gray-800/50'
            }`}
          >
            <div className="mr-3 text-gray-400">
              {layer.type === 'image' && <Icons.Image size={16} />}
              {layer.type === 'text' && <Icons.Type size={16} />}
              {layer.type === 'background' && <Icons.Layout size={16} />}
              {layer.type === 'frame' && <Icons.Frame size={16} />}
            </div>
            
            <span className="flex-1 text-sm truncate select-none text-gray-300 font-medium">
              {layer.name}
            </span>

            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
               <button onClick={() => moveLayer(layer.originalIndex, 'up')} className="p-1 hover:text-white text-gray-500" title="Move Up">
                <Icons.MoveUp size={14} />
              </button>
              <button onClick={() => moveLayer(layer.originalIndex, 'down')} className="p-1 hover:text-white text-gray-500" title="Move Down">
                <Icons.MoveDown size={14} />
              </button>
              <button onClick={(e) => toggleVisibility(layer.originalIndex, e)} className="p-1 hover:text-white text-gray-500">
                {layer.visible ? <Icons.Visible size={14} /> : <Icons.Hidden size={14} />}
              </button>
              <button onClick={(e) => toggleLock(layer.originalIndex, e)} className="p-1 hover:text-white text-gray-500">
                {layer.locked ? <Icons.Lock size={14} /> : <Icons.Unlock size={14} />}
              </button>
              <button onClick={(e) => deleteLayer(layer.originalIndex, e)} className="p-1 hover:text-red-400 text-gray-500">
                <Icons.Delete size={14} />
              </button>
            </div>
          </div>
        ))}
        {layers.length === 0 && (
          <div className="text-center text-gray-600 py-10 text-sm">
            {t('common.no_layers')}
          </div>
        )}
      </div>
    </div>
  );
};

export default LayerManager;
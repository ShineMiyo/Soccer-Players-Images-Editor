
import React, { useState, useMemo } from 'react';
import { Layer, AspectRatio } from '../types';
import { FONTS, TEXT_EFFECT_PRESETS } from '../constants';
import { Icons } from './ui/Icons';

// Dynamically import all images from assets/backgrounds subdirectories
// We separate general backgrounds and nation flags
let generalPresetsGlob: Record<string, any> = {};
let nationsPresetsGlob: Record<string, any> = {};

try {
  // @ts-ignore
  generalPresetsGlob = import.meta.glob('../assets/backgrounds/general/*.{png,jpg,jpeg,webp,svg}', { eager: true });
  // @ts-ignore
  nationsPresetsGlob = import.meta.glob('../assets/backgrounds/nations/*.{png,jpg,jpeg,webp,svg}', { eager: true });
} catch (e) {
  console.warn('Background presets not available:', e);
}

interface PropertyPanelProps {
  layer: Layer | null;
  onUpdate: (updatedLayer: Layer) => void;
  canvasAspect: AspectRatio;
  onCopyStyle?: (layer: Layer) => void;
  onPasteStyle?: (layer: Layer) => void;
  hasClipboard?: boolean;
  t: (key: string) => string;
}

// Global cache to store fonts once loaded
let CACHED_FONTS = [...FONTS];

// Extract Helper Components outside
const RangeInput = ({ label, value, min, max, step = 1, onChange }: any) => (
  <div className="mb-3">
    <div className="flex justify-between mb-1">
      <label className="text-xs text-gray-400">{label}</label>
      <span className="text-xs text-gray-500">{value}</span>
    </div>
    <input
      type="range"
      className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-white"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
    />
  </div>
);

const ColorInput = ({ label, value, onChange }: any) => (
  <div className="mb-3 flex items-center justify-between">
    <label className="text-xs text-gray-400">{label}</label>
    <div className="flex items-center space-x-2">
       <span className="text-xs text-gray-600 font-mono">{value}</span>
       <input
          type="color"
          className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}
      />
    </div>
  </div>
);

const TextInput = ({ label, value, onChange }: any) => (
    <div className="mb-3">
      <label className="text-xs text-gray-400 block mb-1">{label}</label>
      <input 
          type="text" 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded px-2 py-1 focus:outline-none focus:border-gray-500"
      />
    </div>
);

const SelectInput = ({ label, value, options, onChange, onAction, actionLabel }: any) => (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
          <label className="text-xs text-gray-400 block">{label}</label>
          {onAction && (
              <button 
                onClick={onAction}
                className="text-[10px] bg-gray-800 hover:bg-gray-700 text-blue-400 px-2 py-0.5 rounded border border-gray-700 transition-colors"
              >
                  {actionLabel}
              </button>
          )}
      </div>
      <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded px-2 py-1 focus:outline-none focus:border-gray-500 appearance-none"
      >
          {options.map((opt: string) => (
              <option key={opt} value={opt} style={{ fontFamily: opt }}>{opt}</option>
          ))}
      </select>
    </div>
);

const PropertyPanel: React.FC<PropertyPanelProps> = ({ 
    layer, 
    onUpdate, 
    onCopyStyle, 
    onPasteStyle, 
    hasClipboard,
    t
}) => {
  const [fontOptions, setFontOptions] = useState<string[]>(CACHED_FONTS);
  const [loadingFonts, setLoadingFonts] = useState(false);
  
  // New state for toggling background modes
  const [showFlags, setShowFlags] = useState(false);

  // Memoize preset images based on selected mode
  const presetImages = useMemo(() => {
    const glob = showFlags ? nationsPresetsGlob : generalPresetsGlob;
    return Object.values(glob).map((mod: any) => mod.default);
  }, [showFlags]);

  // Function to access local system fonts
  const handleLoadSystemFonts = async () => {
      if (!('queryLocalFonts' in window)) {
          alert('Your browser does not support accessing local fonts. Please use Chrome, Edge, or Opera on desktop.');
          return;
      }

      setLoadingFonts(true);
      try {
          // @ts-ignore - queryLocalFonts is a new API
          const localFonts = await window.queryLocalFonts();
          const uniqueFamilies = new Set(CACHED_FONTS);
          
          for (const font of localFonts) {
              uniqueFamilies.add(font.family);
          }
          
          const sortedFonts = Array.from(uniqueFamilies).sort();
          CACHED_FONTS = sortedFonts; // Update global cache
          setFontOptions(sortedFonts);
      } catch (err: any) {
          console.warn("Font loading error:", err);
          if (err.name === 'SecurityError' || (err.message && err.message.includes('Permissions Policy'))) {
              alert(t('properties.local_fonts_blocked') || 'Access to local fonts is blocked in this environment.');
          }
      } finally {
          setLoadingFonts(false);
      }
  };
  
  const handleBackgroundImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!layer || layer.type !== 'background') return;
      
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
              const src = event.target?.result as string;
              // Reset scale to 100 on new image load
              onUpdate({ ...layer, src: src, backgroundScale: 100 });
          };
          reader.readAsDataURL(file);
      }
  };
  
  const handleSelectPreset = (src: string) => {
      if (!layer || layer.type !== 'background') return;
      // Reset scale to 100 on new image selection
      onUpdate({ ...layer, src: src, backgroundScale: 100 });
  };
  
  const handleRemoveBackgroundImage = () => {
      if (!layer || layer.type !== 'background') return;
      onUpdate({ ...layer, src: undefined });
  };

  if (!layer) {
    return (
      <div className="h-1/2 flex items-center justify-center text-gray-500 bg-gray-900 border-b border-gray-800">
        <p className="text-sm">Select a layer to edit properties</p>
      </div>
    );
  }

  const handleChange = (key: keyof Layer, value: any) => {
    onUpdate({ ...layer, [key]: value });
  };

  const handleNestedChange = (parentKey: keyof Layer, key: string, value: any) => {
    const parentObj = layer[parentKey] as any || {};
    onUpdate({
      ...layer,
      [parentKey]: {
        ...parentObj,
        [key]: value
      }
    });
  };

  return (
    <div className="h-1/2 overflow-y-auto bg-gray-900 p-4 border-b border-gray-800 custom-scrollbar">
      <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            {t(`layer_types.${layer.type}`) || layer.type} {t('common.settings')}
          </h3>
          
          {/* Copy/Paste Buttons - Only for Image layers or compatible layers */}
          {(layer.type === 'image' || layer.type === 'text') && onCopyStyle && onPasteStyle && (
            <div className="flex gap-1">
                <button 
                    onClick={() => onCopyStyle(layer)}
                    className="p-1.5 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded transition-colors"
                    title={t('properties.copy_style')}
                >
                    <Icons.Copy size={14} />
                </button>
                <button 
                    onClick={() => onPasteStyle(layer)}
                    disabled={!hasClipboard}
                    className={`p-1.5 rounded transition-colors ${
                        hasClipboard 
                        ? 'text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700' 
                        : 'text-gray-600 bg-gray-800/50 cursor-not-allowed'
                    }`}
                    title={t('properties.paste_style')}
                >
                    <Icons.Paste size={14} />
                </button>
            </div>
          )}
      </div>

      {/* Common Transforms */}
      <div className="space-y-4 mb-6">
        <h4 className="text-xs font-semibold text-gray-500 uppercase">{t('properties.transform')}</h4>
        <div className="grid grid-cols-2 gap-4">
             {layer.type !== 'frame' && layer.type !== 'background' && (
                <>
                    <RangeInput label={t('properties.x_position')} value={layer.x} min={-50} max={150} onChange={(v: number) => handleChange('x', v)} />
                    <RangeInput label={t('properties.y_position')} value={layer.y} min={-50} max={150} onChange={(v: number) => handleChange('y', v)} />
                    <RangeInput label={t('properties.scale')} value={layer.scale} min={0.1} max={3} step={0.1} onChange={(v: number) => handleChange('scale', v)} />
                    <RangeInput label={t('properties.rotation')} value={layer.rotation} min={-180} max={180} onChange={(v: number) => handleChange('rotation', v)} />
                </>
             )}
             <RangeInput label={t('properties.opacity')} value={layer.opacity} min={0} max={100} onChange={(v: number) => handleChange('opacity', v)} />
        </div>
      </div>

      {/* Type Specific */}
      
      {/* --- TEXT LAYER --- */}
      {layer.type === 'text' && layer.textConfig && (
        <div className="space-y-4 mb-6">
           <h4 className="text-xs font-semibold text-gray-500 uppercase">{t('properties.typography')}</h4>
           <TextInput label={t('properties.content')} value={layer.textConfig.content} onChange={(v: string) => handleNestedChange('textConfig', 'content', v)} />
           
           <SelectInput 
                label={t('properties.font_family')} 
                value={layer.textConfig.fontFamily} 
                options={fontOptions} 
                onChange={(v: string) => handleNestedChange('textConfig', 'fontFamily', v)}
                onAction={handleLoadSystemFonts}
                actionLabel={loadingFonts ? t('common.loading') : t('properties.load_system_fonts')}
           />

           {/* Text Effects Selector */}
           <div className="mb-3">
              <label className="text-xs text-gray-400 block mb-1">{t('properties.text_effects')}</label>
              <select
                  value={layer.textConfig.effectPresetId || 'none'}
                  onChange={(e) => handleNestedChange('textConfig', 'effectPresetId', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded px-2 py-1 focus:outline-none focus:border-gray-500 appearance-none"
              >
                  {TEXT_EFFECT_PRESETS.map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {t(`properties.effect_${preset.id.replace(/-/g, '_')}`) || preset.name}
                      </option>
                  ))}
              </select>
           </div>
           
           <RangeInput label={t('properties.font_size')} value={layer.textConfig.fontSize} min={10} max={200} onChange={(v: number) => handleNestedChange('textConfig', 'fontSize', v)} />
           
           {/* Only show Color Input if no complex effect is selected */}
           {(!layer.textConfig.effectPresetId || layer.textConfig.effectPresetId === 'none' || layer.textConfig.effectPresetId === 'outline' || layer.textConfig.effectPresetId.startsWith('neon')) && (
               <ColorInput label={t('properties.color')} value={layer.textConfig.color} onChange={(v: string) => handleNestedChange('textConfig', 'color', v)} />
           )}

           <RangeInput label={t('properties.letter_spacing')} value={layer.textConfig.letterSpacing} min={-5} max={20} onChange={(v: number) => handleNestedChange('textConfig', 'letterSpacing', v)} />
           
           <div className="flex gap-2 mb-2">
                <button 
                    className={`flex-1 py-1 text-xs rounded border ${layer.textConfig.bold ? 'bg-white text-black' : 'border-gray-700 text-gray-400'}`}
                    onClick={() => handleNestedChange('textConfig', 'bold', !layer.textConfig?.bold)}
                >{t('properties.bold')}</button>
                <button 
                    className={`flex-1 py-1 text-xs rounded border ${layer.textConfig.italic ? 'bg-white text-black' : 'border-gray-700 text-gray-400'}`}
                    onClick={() => handleNestedChange('textConfig', 'italic', !layer.textConfig?.italic)}
                >{t('properties.italic')}</button>
           </div>
        </div>
      )}

      {/* --- FRAME LAYER --- */}
      {layer.type === 'frame' && layer.frameConfig && (
          <div className="space-y-4 mb-6">
              <h4 className="text-xs font-semibold text-gray-500 uppercase">{t('properties.border_style')}</h4>
               <RangeInput label={t('properties.width')} value={layer.frameConfig.width} min={0} max={100} onChange={(v: number) => handleNestedChange('frameConfig', 'width', v)} />
               <RangeInput label={t('properties.corner_radius')} value={layer.frameConfig.radius} min={0} max={50} onChange={(v: number) => handleNestedChange('frameConfig', 'radius', v)} />
               <ColorInput label={t('properties.color_1')} value={layer.frameConfig.color} onChange={(v: string) => handleNestedChange('frameConfig', 'color', v)} />
               
               <div className="mb-3">
                   <label className="flex items-center space-x-2 cursor-pointer">
                       <input 
                        type="checkbox" 
                        checked={layer.frameConfig.type === 'gradient'} 
                        onChange={(e) => handleNestedChange('frameConfig', 'type', e.target.checked ? 'gradient' : 'solid')}
                        className="rounded bg-gray-700 border-none"
                       />
                       <span className="text-xs text-gray-400">{t('properties.use_gradient')}</span>
                   </label>
               </div>
               
               {layer.frameConfig.type === 'gradient' && (
                    <ColorInput label={t('properties.color_2')} value={layer.frameConfig.color2 || '#ffffff'} onChange={(v: string) => handleNestedChange('frameConfig', 'color2', v)} />
               )}
          </div>
      )}

      {/* --- BACKGROUND LAYER --- */}
      {layer.type === 'background' && (
          <div className="space-y-4 mb-6">
              <h4 className="text-xs font-semibold text-gray-500 uppercase">{t('layer_types.background')}</h4>
              <ColorInput label={t('properties.solid_color')} value={layer.backgroundColor || '#000000'} onChange={(v: string) => handleChange('backgroundColor', v)} />
              
              <div className="mb-4">
                  <h4 className="text-xs text-gray-400 block mb-1">{t('properties.background_image')}</h4>
                  
                  {/* Preset Backgrounds Section */}
                  <div className="mb-3">
                      <div className="flex justify-between items-end mb-2">
                         <div className="flex flex-col">
                             <span className="text-xs text-gray-500">{t('properties.preset_backgrounds')}</span>
                             <span className="text-[10px] text-gray-600 font-mono">
                                {showFlags ? '.../nations' : '.../general'}
                             </span>
                         </div>
                         <button
                            onClick={() => setShowFlags(!showFlags)}
                            className={`text-[10px] px-2 py-1 rounded border transition-colors flex items-center gap-1.5 ${
                                showFlags 
                                ? 'bg-indigo-900/40 text-indigo-200 border-indigo-700 hover:bg-indigo-900/60' 
                                : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white hover:bg-gray-700'
                            }`}
                         >
                            {showFlags ? <Icons.Image size={10} /> : <Icons.Flag size={10} />}
                            {showFlags ? t('properties.show_general') : t('properties.show_flags')}
                         </button>
                      </div>
                      
                      {presetImages.length > 0 ? (
                          <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto custom-scrollbar p-1 border border-gray-800 rounded bg-gray-950/50">
                              {presetImages.map((src, index) => (
                                  <button
                                    key={index}
                                    onClick={() => handleSelectPreset(src)}
                                    className={`relative aspect-square rounded overflow-hidden border transition-all ${
                                        layer.src === src ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-700 hover:border-gray-500'
                                    }`}
                                  >
                                      <img src={src} className="w-full h-full object-cover" alt={`Preset ${index}`} />
                                  </button>
                              ))}
                          </div>
                      ) : (
                          <div className="text-[10px] text-gray-600 italic py-2 text-center border border-gray-800 rounded border-dashed">
                              {t('properties.no_presets')}
                          </div>
                      )}
                  </div>

                  <div className="flex gap-2 items-center">
                    <label className="flex-1 bg-gray-800 hover:bg-gray-700 text-white text-xs py-2 px-3 rounded cursor-pointer border border-gray-700 text-center transition-colors">
                        {t('common.choose_image')}
                        <input type="file" accept="image/*" className="hidden" onChange={handleBackgroundImageUpload} />
                    </label>
                    {layer.src && (
                        <button 
                            onClick={handleRemoveBackgroundImage}
                            className="bg-red-900/50 hover:bg-red-900 text-red-200 p-2 rounded border border-red-900 transition-colors"
                            title="Remove Background Image"
                        >
                            <Icons.Delete size={14} />
                        </button>
                    )}
                  </div>
                  {layer.src && (
                      <div className="mt-2 text-xs text-gray-500 italic">
                          {t('common.image_loaded')}
                      </div>
                  )}
                  {/* Background Scale - Only if image exists */}
                  {layer.src && (
                       <div className="mt-3">
                            <RangeInput 
                                label={t('properties.bg_scale')} 
                                value={layer.backgroundScale || 100} 
                                min={100} 
                                max={200} 
                                step={1}
                                onChange={(v: number) => handleChange('backgroundScale', v)}
                            />
                       </div>
                  )}
              </div>
              
              <div className="pt-4 border-t border-gray-800">
                  <div className="flex justify-between items-center mb-2">
                       <h4 className="text-xs font-semibold text-gray-500 uppercase">{t('properties.pattern_text')}</h4>
                       <input 
                        type="checkbox" 
                        checked={layer.patternConfig?.enabled} 
                        onChange={(e) => handleNestedChange('patternConfig', 'enabled', e.target.checked)}
                       />
                  </div>
                  
                  {layer.patternConfig?.enabled && (
                      <div className="pl-2 border-l-2 border-gray-700">
                           <TextInput label={t('properties.content')} value={layer.patternConfig.text} onChange={(v: string) => handleNestedChange('patternConfig', 'text', v)} />
                           <RangeInput label={t('properties.size')} value={layer.patternConfig.size} min={10} max={100} onChange={(v: number) => handleNestedChange('patternConfig', 'size', v)} />
                           <RangeInput label={t('properties.opacity')} value={layer.patternConfig.opacity} min={0} max={100} onChange={(v: number) => handleNestedChange('patternConfig', 'opacity', v)} />
                           <RangeInput label={t('properties.rotation')} value={layer.patternConfig.rotation} min={-45} max={45} onChange={(v: number) => handleNestedChange('patternConfig', 'rotation', v)} />
                           <RangeInput label={t('properties.gap_x')} value={layer.patternConfig.gapX} min={10} max={50} onChange={(v: number) => handleNestedChange('patternConfig', 'gapX', v)} />
                           <RangeInput label={t('properties.gap_y')} value={layer.patternConfig.gapY} min={10} max={50} onChange={(v: number) => handleNestedChange('patternConfig', 'gapY', v)} />
                           <ColorInput label={t('properties.color')} value={layer.patternConfig.color} onChange={(v: string) => handleNestedChange('patternConfig', 'color', v)} />
                      </div>
                  )}
              </div>
          </div>
      )}
      
      {/* --- SHADOW & GLOW (Common for Image & Text) --- */}
      {(layer.type === 'image' || layer.type === 'text') && (
         <div className="pt-4 border-t border-gray-800 space-y-4">
             {/* Shadow Module */}
             <div>
                <div className="flex justify-between items-center mb-2">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase">{t('properties.shadow')}</h4>
                    <input 
                        type="checkbox" 
                        checked={layer.shadow?.enabled} 
                        onChange={(e) => handleNestedChange('shadow', 'enabled', e.target.checked)}
                    />
                </div>
                {layer.shadow?.enabled && (
                    <div className="pl-2 border-l-2 border-gray-700">
                        <ColorInput label={t('properties.color')} value={layer.shadow.color} onChange={(v: string) => handleNestedChange('shadow', 'color', v)} />
                        <RangeInput label={t('properties.blur')} value={layer.shadow.blur} min={0} max={50} onChange={(v: number) => handleNestedChange('shadow', 'blur', v)} />
                        <RangeInput label={t('properties.offset_x')} value={layer.shadow.offsetX} min={-50} max={50} onChange={(v: number) => handleNestedChange('shadow', 'offsetX', v)} />
                        <RangeInput label={t('properties.offset_y')} value={layer.shadow.offsetY} min={-50} max={50} onChange={(v: number) => handleNestedChange('shadow', 'offsetY', v)} />
                    </div>
                )}
             </div>
             
             {/* Glow Module */}
             {layer.type === 'image' && (
                 <div>
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase">{t('properties.outer_glow')}</h4>
                        <input 
                            type="checkbox" 
                            checked={layer.glow?.enabled} 
                            onChange={(e) => handleNestedChange('glow', 'enabled', e.target.checked)}
                        />
                    </div>
                    {layer.glow?.enabled && (
                        <div className="pl-2 border-l-2 border-gray-700">
                            <ColorInput label={t('properties.color')} value={layer.glow.color} onChange={(v: string) => handleNestedChange('glow', 'color', v)} />
                            <RangeInput label={t('properties.blur')} value={layer.glow.blur} min={0} max={50} onChange={(v: number) => handleNestedChange('glow', 'blur', v)} />
                        </div>
                    )}
                 </div>
             )}
         </div>
      )}

    </div>
  );
};

export default PropertyPanel;

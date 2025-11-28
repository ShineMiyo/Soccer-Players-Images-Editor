
import React, { useRef, useState, useEffect } from 'react';
import { Layer, CanvasConfig } from '../types';
import { TEXT_EFFECT_PRESETS } from '../constants';

interface CanvasAreaProps {
  layers: Layer[];
  config: CanvasConfig;
  selectedLayerId: string | null;
  onSelectLayer: (id: string) => void;
}

const CanvasArea: React.FC<CanvasAreaProps> = ({ layers, config, selectedLayerId, onSelectLayer }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerDims, setContainerDims] = useState({ w: 0, h: 0 });

  // Use ResizeObserver to detect available space in the parent container
  // This robustly handles window resizing and layout changes
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerDims({
          w: entry.contentRect.width,
          h: entry.contentRect.height,
        });
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Calculate the style to constrain the canvas properly
  const getCanvasStyle = () => {
    const { w: contW, h: contH } = containerDims;
    if (contW === 0 || contH === 0) return { opacity: 0 }; // Hide until measured

    const { width: canvasW, height: canvasH } = config;
    const contRatio = contW / contH;
    const canvasRatio = canvasW / canvasH;

    // Logic: If canvas is wider (relative to container shape), fit width. 
    // If canvas is taller (relative to container shape), fit height.
    // This correctly handles 1:1 on landscape screens (1 < 1.77 -> fit height)
    // and correctly handles 1:1 on portrait mobile screens (1 > 0.5 -> fit width)
    if (canvasRatio > contRatio) {
       return {
         width: '100%',
         height: 'auto',
         aspectRatio: `${canvasW} / ${canvasH}`,
       };
    } else {
       return {
         height: '100%',
         width: 'auto',
         aspectRatio: `${canvasW} / ${canvasH}`,
       };
    }
  };

  const renderPattern = (layer: Layer) => {
    if (!layer.patternConfig?.enabled) return null;
    const { text, size, opacity, rotation, gapX, gapY, color } = layer.patternConfig;
    
    const items = [];
    const rows = 20;
    const cols = 20;
    
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const isStaggered = r % 2 === 1;
        items.push(
          <div
            key={`${r}-${c}`}
            style={{
              position: 'absolute',
              left: `${c * gapX + (isStaggered ? gapX / 2 : 0)}%`,
              top: `${r * gapY}%`,
              transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
              fontSize: `${size}px`,
              opacity: opacity / 100,
              color: color,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {text}
          </div>
        );
      }
    }
    return <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 2 }}>{items}</div>;
  };

  const activeFrame = layers.find(l => l.type === 'frame' && l.visible && l.frameConfig?.enabled);
  const globalRadius = activeFrame?.frameConfig?.radius || 0;

  const renderLayer = (layer: Layer) => {
    if (!layer.visible) return null;

    const isSelected = selectedLayerId === layer.id;
    
    const style: React.CSSProperties = {
      position: 'absolute',
      left: layer.type === 'frame' ? 0 : `${layer.x}%`,
      top: layer.type === 'frame' ? 0 : `${layer.y}%`,
      width: layer.type === 'frame' ? '100%' : (layer.width ? `${layer.width}%` : 'auto'),
      height: layer.type === 'frame' ? '100%' : (layer.height ? `${layer.height}%` : 'auto'),
      transform: layer.type === 'frame' ? 'none' : `translate(-50%, -50%) rotate(${layer.rotation}deg) scale(${layer.scale})`,
      opacity: layer.opacity / 100,
      zIndex: 1, 
      cursor: layer.locked ? 'default' : 'move',
      border: isSelected && !layer.locked ? '2px dashed #3b82f6' : 'none',
    };

    if (layer.type === 'background') {
      const scaleVal = (layer.backgroundScale || 100) / 100;
      
      return (
        <div
          key={layer.id}
          style={{
            ...style,
            width: '100%',
            height: '100%',
            left: 0,
            top: 0,
            transform: 'none',
            backgroundColor: layer.backgroundColor || '#000000',
            overflow: 'hidden', // Ensure scaled image doesn't overflow background layer bounds
          }}
          onClick={() => !layer.locked && onSelectLayer(layer.id)}
        >
          {layer.src && (
             <div 
               style={{
                   width: '100%',
                   height: '100%',
                   backgroundImage: `url(${layer.src})`,
                   backgroundSize: 'cover',
                   backgroundPosition: 'center',
                   transform: `scale(${scaleVal})`,
                   transformOrigin: 'center center',
               }}
             />
          )}
          {renderPattern(layer)}
        </div>
      );
    }

    if (layer.type === 'frame') {
        const { frameConfig } = layer;
        if (!frameConfig || !frameConfig.enabled) return null;
        
        const isGradient = frameConfig.type === 'gradient';
        const bgStyle = isGradient 
            ? `linear-gradient(45deg, ${frameConfig.color}, ${frameConfig.color2})` 
            : frameConfig.color;

        return (
            <div
                key={layer.id}
                style={{
                    ...style,
                    pointerEvents: 'none', 
                    border: 'none',
                    padding: `${frameConfig.width}px`,
                    borderRadius: `${frameConfig.radius}%`,
                    background: bgStyle,
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude',
                    boxSizing: 'border-box',
                }}
            />
        )
    }

    if (layer.type === 'text') {
      const { textConfig, shadow } = layer;
      if (!textConfig) return null;
      
      // Calculate Shadow
      const textShadow = shadow?.enabled 
        ? `${shadow.offsetX}px ${shadow.offsetY}px ${shadow.blur}px ${shadow.color}` 
        : 'none';

      // Get Preset Effect Style
      let presetStyle: React.CSSProperties = {};
      if (textConfig.effectPresetId) {
          const preset = TEXT_EFFECT_PRESETS.find(p => p.id === textConfig.effectPresetId);
          if (preset) {
              presetStyle = preset.style;
          }
      }

      // Merge base styles with preset styles
      // Note: Preset can override textShadow and color
      const finalStyle = {
        ...style,
        fontFamily: textConfig.fontFamily,
        fontSize: `${textConfig.fontSize}px`,
        color: textConfig.color,
        fontWeight: textConfig.bold ? 'bold' : 'normal',
        fontStyle: textConfig.italic ? 'italic' : 'normal',
        textAlign: textConfig.align,
        letterSpacing: `${textConfig.letterSpacing}px`,
        textShadow: textShadow, // Base shadow
        whiteSpace: 'nowrap',
        userSelect: 'none',
        ...presetStyle, // Apply preset overrides
      } as React.CSSProperties;
      
      // Special Handling: If preset uses WebkitBackgroundClip: text, we likely want to ignore the base color for the text fill itself,
      // but standard color might still be needed for fallbacks.
      // However, if the user picks a color manually, we assume they want that color unless the preset mandates transparency (like Gold/Silver gradients).

      return (
        <div
          key={layer.id}
          style={finalStyle}
          onMouseDown={(e) => {
             if (!layer.locked) {
                 e.stopPropagation();
                 onSelectLayer(layer.id);
             }
          }}
        >
          {textConfig.content}
        </div>
      );
    }

    if (layer.type === 'image') {
      const { shadow, glow } = layer;
      
      const dropShadow = shadow?.enabled 
        ? `drop-shadow(${shadow.offsetX}px ${shadow.offsetY}px ${shadow.blur}px ${shadow.color})` 
        : '';
        
      const dropGlow = glow?.enabled 
        ? `drop-shadow(0px 0px ${glow.blur}px ${glow.color})` 
        : '';

      const filter = [dropShadow, dropGlow].filter(Boolean).join(' ');

      return (
        <div
          key={layer.id}
          style={style}
          onMouseDown={(e) => {
            if (!layer.locked) {
                e.stopPropagation();
                onSelectLayer(layer.id);
            }
         }}
        >
          <img
            src={layer.src}
            alt={layer.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: filter,
            }}
            draggable={false}
          />
        </div>
      );
    }
  };

  return (
    <div ref={containerRef} className="flex-1 flex items-center justify-center bg-gray-900 p-8 overflow-hidden h-full relative">
      <div 
         id="canvas-container"
         className="relative bg-white shadow-2xl overflow-hidden box-content transition-all duration-200"
         style={{
            ...getCanvasStyle(),
            maxWidth: '100%',
            maxHeight: '100%',
         }}
      >
        <div 
            id="export-canvas"
            className="relative w-full h-full bg-transparent"
            style={{
                borderRadius: `${globalRadius}%`,
                overflow: 'hidden',
            }}
        >
             {layers.map(layer => renderLayer(layer))}
        </div>
      </div>
    </div>
  );
};

export default CanvasArea;

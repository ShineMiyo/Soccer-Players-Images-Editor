
// 第一步：导入 React（用于扩展其 CSSProperties 类型）
import 'react';

// 第二步：扩展 React.CSSProperties 类型，添加 Firefox/Webkit 前缀属性及高级特效属性
declare module 'react' {
  interface CSSProperties {
    // === 文本特效 (Text Effects) ===
    textFillColor?: string;
    textStroke?: string;
    textStrokeWidth?: string;
    textStrokeColor?: string;
    
    WebkitTextFillColor?: string;
    WebkitTextStroke?: string;
    WebkitTextStrokeWidth?: string;
    WebkitTextStrokeColor?: string;
    
    // === 背景裁剪 (Background Clip for Text Gradients) ===
    backgroundClip?: string; 
    WebkitBackgroundClip?: string;
    mozBackgroundClip?: string;

    // === 混合模式 (Blend Modes) ===
    mixBlendMode?: string; // 元素与背景的混合
    backgroundBlendMode?: string; // 背景图片与背景色的混合
    isolation?: 'auto' | 'isolate';

    // === 蒙版 (Masking) ===
    maskImage?: string;
    WebkitMaskImage?: string;
    maskSize?: string;
    WebkitMaskSize?: string;
    maskPosition?: string;
    WebkitMaskPosition?: string;
    maskRepeat?: string;
    WebkitMaskRepeat?: string;
    maskComposite?: string;
    WebkitMaskComposite?: string;
    maskMode?: string;
    WebkitMaskMode?: string;

    // === 倒影 (Reflection) ===
    WebkitBoxReflect?: string; // 这是一个强大的非标准属性，用于制作倒影

    // === 滤镜与特效 (Filters & Effects) ===
    backdropFilter?: string;
    WebkitBackdropFilter?: string;
    filter?: string; // 标准属性，但显式声明以防万一
    
    // === 盒子断行装饰 (Box Decoration) ===
    boxDecorationBreak?: 'slice' | 'clone';
    WebkitBoxDecorationBreak?: 'slice' | 'clone';
    
    // Firefox 专属
    mozTextFillColor?: string;
    mozTextStroke?: string;
  }
}

export type AspectRatio = '16:9' | '9:16' | '2:3' | '3:2' | '4:3' | '3:4' | '1:1';

export type LayerType = 'image' | 'text' | 'background' | 'frame';

// === 新增：混合模式类型 ===
export type BlendMode = 
  | 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' 
  | 'color-dodge' | 'color-burn' | 'hard-light' | 'soft-light' | 'difference' 
  | 'exclusion' | 'hue' | 'saturation' | 'color' | 'luminosity';

// === 新增：多层阴影支持 ===
export interface AdvancedShadow {
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
  spread?: number; // 仅用于 box-shadow，text-shadow 不支持 spread
  inset?: boolean; // 仅用于 box-shadow
  opacity?: number;
}

// === 新增：多层渐变/图案支持 ===
export interface GradientStop {
  color: string;
  position: number; // 0-100%
}

export interface GradientLayer {
  id: string;
  type: 'linear' | 'radial' | 'conic';
  angle?: number; // 线性渐变角度
  stops: GradientStop[];
  repeating?: boolean;
  blendMode?: BlendMode; // 每一层渐变都可以有混合模式
  opacity?: number;
}

export interface ShadowConfig {
  enabled: boolean;
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
  opacity: number;
}

export interface StrokeConfig {
  enabled: boolean;
  color: string;
  width: number;
  opacity: number;
}

export interface GlowConfig {
  enabled: boolean;
  color: string;
  blur: number;
  spread: number;
}

export interface TextEffectPreset {
  id: string;
  name: string;
  style: React.CSSProperties;
}

export interface TextConfig {
  content: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  bold: boolean;
  italic: boolean;
  align: 'left' | 'center' | 'right';
  letterSpacing: number;
  effectPresetId?: string; // Optional ID for the selected preset
  
  // === 新增：支持更高级的文字自定义 ===
  blendMode?: BlendMode; // 文字整体混合模式
  multiShadows?: AdvancedShadow[]; // 支持多重文字阴影
  gradientLayers?: GradientLayer[]; // 支持多重渐变叠加（用于覆盖 color）
}

export interface BackgroundPatternConfig {
  enabled: boolean;
  text: string;
  opacity: number;
  rotation: number;
  size: number;
  gapX: number;
  gapY: number;
  color: string;
}

export interface FrameConfig {
  enabled: boolean;
  type: 'solid' | 'gradient';
  color: string;
  color2?: string; // For gradient
  width: number;
  radius: number; // 0 to 50%
}

export interface Layer {
  id: string;
  type: LayerType;
  name: string;
  visible: boolean;
  locked: boolean;
  
  // Position & Transform
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scale: number;
  opacity: number;

  // Specific Data
  src?: string; // For images and background images
  
  // Styles
  shadow?: ShadowConfig; // 保留原有单层阴影以兼容旧代码
  advancedShadows?: AdvancedShadow[]; // 新增：多层阴影支持 (box-shadow or drop-shadow)
  stroke?: StrokeConfig;
  glow?: GlowConfig;
  textConfig?: TextConfig;
  patternConfig?: BackgroundPatternConfig;
  frameConfig?: FrameConfig;
  backgroundColor?: string;
  
  // === 新增：图层级混合模式 ===
  blendMode?: BlendMode;
  
  // Background specific
  backgroundScale?: number; // Added specifically for background image scaling
}

export interface CanvasConfig {
  width: number;
  height: number;
  aspectRatio: AspectRatio;
  scaleDisplay: number; // For UI zooming only
}

export interface EditorState {
  layers: Layer[];
  selectedLayerId: string | null;
  canvas: CanvasConfig;
}

// i18n Types
export type Language = 'en' | 'zh';

export interface Translations {
  [key: string]: string | Translations;
}

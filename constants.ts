
import { AspectRatio, Layer, TextEffectPreset } from './types';

export const ASPECT_RATIOS: { label: AspectRatio; ratio: number }[] = [
  { label: '1:1', ratio: 1 },
  { label: '16:9', ratio: 16 / 9 },
  { label: '9:16', ratio: 9 / 16 },
  { label: '4:3', ratio: 4 / 3 },
  { label: '3:4', ratio: 3 / 4 },
  { label: '3:2', ratio: 3 / 2 },
  { label: '2:3', ratio: 2 / 3 },
];

export const DEFAULT_CANVAS_WIDTH = 1080;

export const DEFAULT_LAYER_PROPS: Partial<Layer> = {
  x: 0,
  y: 0,
  rotation: 0,
  scale: 1,
  opacity: 100,
  visible: true,
  locked: false,
};

export const FONTS = [
  // Standard Sans
  'Arial',
  'Helvetica',
  'Inter',
  'Verdana',
  'Tahoma',
  'Trebuchet MS',
  'Geneva',
  'Segoe UI',
  'Roboto',
  'Open Sans',
  
  // Serif
  'Times New Roman',
  'Georgia',
  'Garamond',
  'Palatino Linotype',
  
  // Display / Jersey Styles
  'Impact',
  'Arial Black',
  'Courier New',
  'Lucida Console',
  'Comic Sans MS',
  'Brush Script MT',
  'Copperplate',
  'Papyrus',
  
  // System Fallbacks
  'system-ui',
  'monospace',
  'serif',
  'sans-serif'
];

export const TEXT_EFFECT_PRESETS: TextEffectPreset[] = [
  {
    id: 'none',
    name: 'None',
    style: {}
  },
  {
  id: 'gold',
  name: 'Gold',
  style: {
    // 1. 完全还原Canvas的水平渐变（90deg）+ 原11个颜色节点
    backgroundImage: `
      linear-gradient(90deg,
        rgba(223,204,162,1) 0%,
        rgba(223,204,162,1) 1%,
        rgba(213,192,145,1) 12%,
        rgba(228,210,171,1) 22%,
        rgba(223,204,162,1) 34%,
        rgba(228,210,171,1) 44%,
        rgba(213,192,145,1) 54%,
        rgba(228,210,171,1) 65%,
        rgba(223,204,162,1) 77%,
        rgba(228,210,171,1) 90%,
        rgba(196,168,117,1) 100%
      )
    `,
    // 2. 移除干扰原渐变的纹理/混合模式（Canvas无额外纹理）
    backgroundBlendMode: 'normal',
    backgroundSize: '100% 100%',

    // 3. Edge兼容的文字裁剪（仅保留必要前缀）
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    textFillColor: 'transparent',
    WebkitTextFillColor: 'transparent',

    // 4. 移除多余阴影/描边（Canvas效果无明显立体阴影）
    textShadow: 'none',
    textStroke: '0px transparent', // 完全去掉描边，匹配Canvas的“无轮廓”
    WebkitTextStroke: '0px transparent',

    // 5. 混合模式改回normal（避免亮度偏移）
    mixBlendMode: 'normal',

    // 降级颜色（原渐变中间色）
    color: 'rgba(223,204,162,1)'
  }
},
{
  id: 'silver',
  name: 'Silver',
  style: {
    // 1. 完全还原Canvas水平渐变（90deg）+ 原11个颜色节点（一一对应）
    backgroundImage: `
      linear-gradient(90deg,
        rgba(179,171,171,1) 0%,
        rgba(179,171,171,1) 1%,  /* 对应原0.01 */
        rgba(210,202,202,1) 12%, /* 对应原0.12 */
        rgba(203,197,197,1) 22%, /* 对应原0.22 */
        rgba(179,171,171,1) 34%, /* 对应原0.34 */
        rgba(235,225,225,1) 44%, /* 对应原0.44 */
        rgba(210,202,202,1) 54%, /* 对应原0.54 */
        rgba(235,225,225,1) 65%, /* 对应原0.65 */
        rgba(179,171,171,1) 77%, /* 对应原0.77 */
        rgba(235,225,225,1) 90%, /* 对应原0.90 */
        rgba(190,186,186,1) 100%  /* 对应原1 */
      )
    `,
    // 2. 纯渐变无额外纹理（还原Canvas的干净质感）
    backgroundBlendMode: 'normal',
    backgroundSize: '100% 100%',

    // 3. Edge浏览器兼容（Chromium内核原生支持+Webkit前缀兜底）
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    textFillColor: 'transparent',
    WebkitTextFillColor: 'transparent',

    // 4. 取消描边/阴影（匹配Canvas的平面柔和质感）
    textShadow: 'none',
    textStroke: '0px transparent',
    WebkitTextStroke: '0px transparent',

    // 5. 混合模式保持normal（避免颜色偏移，还原原Canvas亮度）
    mixBlendMode: 'normal',

    // 降级颜色（原渐变中间色，确保兼容时效果一致）
    color: 'rgba(203,197,197,1)'
  }
},
{
  id: 'metallic',
  name: 'Metallic',
  style: {
    // 核心：提亮冷灰渐变（弱化暗部）+ 适度拉丝纹理
    backgroundImage: `
      /* 1. 提亮哑光渐变（暗部浅化，亮部适度提升） */
      linear-gradient(90deg,
        rgba(140,145,150,1) 0%, /* 暗部调浅 */
        rgba(140,145,150,1) 1%,
        rgba(185,190,195,1) 12%, /* 亮部适度提亮 */
        rgba(175,180,185,1) 22%,
        rgba(140,145,150,1) 34%,
        rgba(195,200,205,1) 44%, /* 轻微提亮，无辉光 */
        rgba(185,190,195,1) 54%,
        rgba(195,200,205,1) 65%,
        rgba(140,145,150,1) 77%,
        rgba(195,200,205,1) 90%,
        rgba(160,165,170,1) 100% /* 收尾色调浅 */
      ),
      /* 2. 适度提亮拉丝纹理（增加细节亮度） */
      linear-gradient(90deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.08) 100%)
    `,
    backgroundBlendMode: 'overlay, multiply',
    backgroundSize: '100% 100%, 10px 10px',

    // Edge兼容配置
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    textFillColor: 'transparent',
    WebkitTextFillColor: 'transparent',

    // 浅灰描边（保持硬朗，避免压暗）
    textStroke: '0.3px #444444',
    WebkitTextStroke: '0.3px #444444',

    // 提亮阴影（降低暗度，加轻微边缘提亮）
    textShadow: `
      0px 0px 1px rgba(255,255,255,0.6), /* 轻微边缘提亮，不辉光 */
      1px 1px 2px rgba(0,0,0,0.3), /* 降低阴影透明度 */
      2px 2px 3px rgba(0,0,0,0.2)
    `,

    // 混合模式：适度提亮，无辉光
    mixBlendMode: 'screen',

    // 降级颜色（提亮后的钢铁灰）
    color: 'rgba(175,180,185,1)'
    }
  },
{
  id: 'glass',
  name: 'Glass',
  style: {
    // 1. 核心玻璃质感：半透明白色（通透不突兀）
    color: 'rgba(255, 255, 255, 0.4)',
    // 2. 玻璃发光阴影（多层模糊+低透明度，模拟折射光效）
    textShadow: `
      0 0 8px rgba(255, 255, 255, 0.6),
      0 0 15px rgba(255, 255, 255, 0.4),
      0 0 25px rgba(255, 255, 255, 0.2),
      0 1px 2px rgba(0, 0, 0, 0.1) /* 轻微暗边，避免文字融于背景 */
    `,
    // 3. 轻微渐变增强通透感（不抢戏，仅提升玻璃层次）
    backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)',
    // 4. 文字裁剪（让渐变贴合文字，增强玻璃质感）
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    MozBackgroundClip: 'text',
    // 5. 显式声明默认值，避免与其他效果冲突（独立纯净）
    textFillColor: 'inherit',
    WebkitTextFillColor: 'inherit',
    textStroke: '0.5px rgba(255, 255, 255, 0.3)', // 细描边，让文字边缘更清晰
    WebkitTextStroke: '0.5px rgba(255, 255, 255, 0.3)',
    backgroundBlendMode: 'normal',
    backgroundSize: '100% 100%',
    mixBlendMode: 'normal', // 不叠加其他模式，纯玻璃效果
    background: 'transparent' // 不占用背景色，适配任意画布背景
  }
},
{
  id: 'vintage3d',
  name: 'Vintage3D',
  style: {
    // 文字本身设为实色（原代码的#fcedd8），不再透明
    color: '#fcedd8',
    // 去掉背景渐变和文字裁剪（因为不需要透过文字显示背景了）
    backgroundImage: 'none',
    backgroundClip: 'border-box',
    WebkitBackgroundClip: 'border-box',
    MozBackgroundClip: 'border-box',
    textFillColor: 'inherit',
    WebkitTextFillColor: 'inherit',

    // 3D阴影保留（紧凑版2px步长）
    textShadow: `
      2px 2px 0px #eb452b,
      4px 4px 0px #efa032,
      6px 6px 0px #46b59b,
      8px 8px 0px #017e7f,
      10px 10px 0px #052939,
      12px 12px 0px #c11a2b,
      14px 14px 4px rgba(0, 0, 0, 0.3)
    `,

    textStroke: '1px #fcedd8',
    WebkitTextStroke: '1px #fcedd8',
    backgroundBlendMode: 'normal',
    backgroundSize: '100% 100%',
    mixBlendMode: 'normal'
  }
}
];

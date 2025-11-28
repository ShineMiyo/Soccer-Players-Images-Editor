import { toPng } from 'html-to-image';

export const exportCanvas = async (elementId: string, fileName: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    const dataUrl = await toPng(element, {
      cacheBust: true,
      pixelRatio: 2, // Export at 2x resolution for better quality
      backgroundColor: undefined, // Preserve transparency
    });

    const link = document.createElement('a');
    link.download = `${fileName}.png`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error("Export failed:", error);
    alert("Failed to export image. Please try again.");
  }
};
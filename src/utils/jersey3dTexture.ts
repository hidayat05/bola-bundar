import jerseyTemplateSrc from '../assets/jersey_3d_template.png';

const canvasCache = new Map<string, HTMLCanvasElement>();
let templateImage: HTMLImageElement | null = null;
let templateImageData: ImageData | null = null;
let isInitializing = false;
const listeners = new Set<() => void>();

function initTemplate() {
  if (typeof window === 'undefined' || isInitializing || templateImage) return;
  isInitializing = true;

  templateImage = new Image();
  templateImage.crossOrigin = 'anonymous';
  templateImage.onload = () => {
    try {
      const offCanvas = document.createElement('canvas');
      const w = templateImage!.naturalWidth || 512;
      const h = templateImage!.naturalHeight || 512;
      offCanvas.width = w;
      offCanvas.height = h;
      const ctx = offCanvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(templateImage!, 0, 0);
        templateImageData = ctx.getImageData(0, 0, w, h);
        canvasCache.clear();
        // Notify all subscribers (PlayerTokenNode instances)
        listeners.forEach((cb) => {
          try {
            cb();
          } catch {
            // ignore
          }
        });
      }
    } catch (e) {
      console.error('Failed to parse 3D jersey template image data', e);
    }
  };
  templateImage.onerror = (e) => {
    console.error('Failed to load 3D jersey template image', e);
  };
  templateImage.src = jerseyTemplateSrc;
}

/**
 * Hook or subscriber for when the 3D jersey template finishes loading
 */
export function onJerseyTemplateLoaded(callback: () => void): () => void {
  listeners.add(callback);
  if (templateImageData) {
    // Already loaded, invoke immediately
    callback();
  } else {
    initTemplate();
  }
  return () => {
    listeners.delete(callback);
  };
}

/**
 * Returns a cached, tinted HTMLCanvasElement for the given hex color.
 * Uses realistic photometric reflectance: diffuse body reflection + specular gloss highlights.
 */
export function getTintedJerseyCanvas(hexColor: string): HTMLCanvasElement | null {
  if (!templateImageData || !templateImage) {
    initTemplate();
    return null;
  }

  const cleanHex = hexColor.toLowerCase().trim();
  if (canvasCache.has(cleanHex)) {
    return canvasCache.get(cleanHex)!;
  }

  // Parse target hex color
  let hex = cleanHex.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  const tr = parseInt(hex.substring(0, 2), 16) || 255;
  const tg = parseInt(hex.substring(2, 4), 16) || 255;
  const tb = parseInt(hex.substring(4, 6), 16) || 255;

  const width = templateImageData.width;
  const height = templateImageData.height;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const outputImageData = ctx.createImageData(width, height);
  const src = templateImageData.data;
  const dst = outputImageData.data;

  // Process pixels with realistic photometric reflectance
  for (let i = 0; i < src.length; i += 4) {
    const a = src[i + 3];
    if (a === 0) {
      dst[i + 3] = 0;
      continue;
    }

    const r = src[i];
    const g = src[i + 1];
    const b = src[i + 2];

    // Perceptual luminance of the 3D shading template
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0;

    let nr: number, ng: number, nb: number;
    if (lum <= 0.8) {
      // Diffuse body reflection + ambient occlusion
      const factor = lum / 0.8;
      nr = tr * factor;
      ng = tg * factor;
      nb = tb * factor;
    } else {
      // Specular highlight / gloss sheen reflection
      const f = (lum - 0.8) / 0.2;
      nr = tr + (255 - tr) * f;
      ng = tg + (255 - tg) * f;
      nb = tb + (255 - tb) * f;
    }

    dst[i] = Math.min(255, Math.max(0, nr | 0));
    dst[i + 1] = Math.min(255, Math.max(0, ng | 0));
    dst[i + 2] = Math.min(255, Math.max(0, nb | 0));
    dst[i + 3] = a;
  }

  ctx.putImageData(outputImageData, 0, 0);
  canvasCache.set(cleanHex, canvas);
  return canvas;
}

/**
 * Adjusts hex color brightness by a percentage for realistic 3D volumetric shading.
 */
export function adjustColorBrightness(color: string, percent: number): string {
  if (!color) return percent > 0 ? '#ffffff' : '#000000';
  let hex = color.trim();
  if (hex.startsWith('#')) {
    hex = hex.slice(1);
  }
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  const num = parseInt(hex, 16);
  if (isNaN(num)) return color;

  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));

  return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
}

/**
 * Computes high-contrast text/number color (#0f172a or #ffffff) based on background luminance.
 * Follows standard perceptual luminance (ITU-R BT.709).
 */
export function getContrastingTextColor(color: string): string {
  if (!color) return '#ffffff';
  let hex = color.trim();
  if (hex.startsWith('#')) {
    hex = hex.slice(1);
  }
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  const cr = parseInt(hex.substring(0, 2), 16) || 0;
  const cg = parseInt(hex.substring(2, 4), 16) || 0;
  const cb = parseInt(hex.substring(4, 6), 16) || 0;
  const lum = 0.299 * cr + 0.587 * cg + 0.114 * cb;
  return lum > 145 ? '#0f172a' : '#ffffff';
}


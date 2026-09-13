import LZString from 'lz-string';
import { TacticsExportData } from '../types/tactics';

/**
 * Encode full tactics data into a URI-safe compressed string.
 * JSON → LZ-compress → base64 URI-safe (~5× smaller than raw JSON)
 */
export function encodeSharePayload(data: TacticsExportData): string {
  const json = JSON.stringify(data);
  return LZString.compressToEncodedURIComponent(json);
}

/**
 * Decode a share payload back into TacticsExportData.
 * Returns null if invalid or corrupt.
 */
export function decodeSharePayload(encoded: string): TacticsExportData | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const data = JSON.parse(json) as TacticsExportData;
    if (!data.frames || !Array.isArray(data.frames) || data.frames.length === 0) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * Build a shareable URL with the encoded tactics data in the hash.
 * e.g. https://app.com/#data=N4IgZg...
 */
export function buildShareUrl(data: TacticsExportData): string {
  const encoded = encodeSharePayload(data);
  const base = window.location.origin + window.location.pathname;
  return `${base}#data=${encoded}`;
}

/**
 * Read and decode tactics payload from the current URL hash.
 * Returns null if no valid #data= found.
 */
export function readShareUrlPayload(): TacticsExportData | null {
  try {
    const hash = window.location.hash;
    const match = hash.match(/[#&]data=([^&]*)/);
    if (!match || !match[1]) return null;
    return decodeSharePayload(match[1]);
  } catch {
    return null;
  }
}

/**
 * Remove the #data= hash from the URL without reloading the page.
 */
export function clearShareUrlHash(): void {
  history.replaceState(null, '', window.location.pathname + window.location.search);
}

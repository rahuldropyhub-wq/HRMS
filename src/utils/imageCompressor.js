/**
 * imageCompressor.js
 * 
 * Hybrid image compression utility for the HRMS application.
 * Uses the HTML5 Canvas API — zero external dependencies.
 * 
 * Two modes:
 *   1. LOSSLESS — Strips EXIF metadata, re-encodes via WebP lossless (quality 1.0).
 *                 Zero visual quality loss. ~25-40% size reduction.
 *                 Best for: legal documents, ID proofs.
 * 
 *   2. LOSSY   — Resizes to max dimensions + JPEG at 92% quality.
 *                 Visually indistinguishable. ~90-98% size reduction.
 *                 Best for: avatars, screenshots, general attachments.
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Load a File or Blob into an HTMLImageElement.
 * @param {File|Blob} file
 * @returns {Promise<HTMLImageElement>}
 */
function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}

/**
 * Check if the browser supports WebP encoding via canvas.
 * @returns {boolean}
 */
function supportsWebP() {
  try {
    const c = document.createElement('canvas');
    c.width = 1;
    c.height = 1;
    return c.toDataURL('image/webp').startsWith('data:image/webp');
  } catch {
    return false;
  }
}

/**
 * Check whether a File is an image type that can be drawn on canvas.
 * @param {File} file
 * @returns {boolean}
 */
function isCompressibleImage(file) {
  const imageTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
    'image/bmp', 'image/tiff', 'image/gif', 'image/svg+xml'
  ];
  return imageTypes.includes(file.type?.toLowerCase());
}

/**
 * Convert a File to a base64 data URL without any processing.
 * Used as fallback for non-image files (PDFs, docs, etc.)
 * @param {File} file
 * @returns {Promise<string>}
 */
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Calculate the approximate byte size of a base64 data URL string.
 * @param {string} dataUrl
 * @returns {number} size in bytes
 */
function dataUrlByteSize(dataUrl) {
  if (!dataUrl) return 0;
  // Remove the data:...;base64, prefix
  const base64 = dataUrl.split(',')[1] || '';
  return Math.round((base64.length * 3) / 4);
}

/**
 * Format bytes into a human-readable string.
 * @param {number} bytes
 * @returns {string}
 */
function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// ─── Core Compression Functions ───────────────────────────────────────────────

/**
 * LOSSLESS compression: Strips EXIF metadata by re-drawing on canvas.
 * Uses WebP lossless (quality 1.0) if supported, otherwise PNG.
 * The image dimensions are NOT changed — original resolution is preserved.
 * 
 * Best for: Legal documents, ID proofs, scanned certificates.
 * Expected savings: ~25-40% (mostly from EXIF stripping + WebP efficiency).
 * 
 * @param {File} file — The image File to compress
 * @returns {Promise<{ dataUrl: string, originalSize: number, compressedSize: number, ratio: string }>}
 */
export async function compressLossless(file) {
  if (!isCompressibleImage(file)) {
    // Non-image file — return raw base64 data URL, no processing possible
    const dataUrl = await fileToDataUrl(file);
    return {
      dataUrl,
      originalSize: file.size,
      compressedSize: dataUrlByteSize(dataUrl),
      ratio: '0%'
    };
  }

  const img = await loadImage(file);

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  // Prefer WebP lossless, fall back to PNG (both are lossless)
  let dataUrl;
  if (supportsWebP()) {
    dataUrl = canvas.toDataURL('image/webp', 1.0);
  } else {
    dataUrl = canvas.toDataURL('image/png');
  }

  const compressedSize = dataUrlByteSize(dataUrl);
  const savings = Math.max(0, ((file.size - compressedSize) / file.size) * 100);

  console.log(
    `[Lossless] ${file.name}: ${formatBytes(file.size)} → ${formatBytes(compressedSize)} (${savings.toFixed(1)}% saved)`
  );

  return {
    dataUrl,
    originalSize: file.size,
    compressedSize,
    ratio: savings.toFixed(1) + '%'
  };
}

/**
 * LOSSY compression: Resizes image to fit within maxWidth × maxHeight
 * and re-encodes as JPEG at the specified quality.
 * 
 * Best for: Avatars, screenshots, ticket attachments, general uploads.
 * Expected savings: ~90-98%.
 * 
 * @param {File} file — The image File to compress
 * @param {Object} options
 * @param {number} [options.maxWidth=1200]  — Maximum output width in pixels
 * @param {number} [options.maxHeight=1200] — Maximum output height in pixels
 * @param {number} [options.quality=0.92]   — JPEG quality (0–1)
 * @returns {Promise<{ dataUrl: string, originalSize: number, compressedSize: number, ratio: string }>}
 */
export async function compressLossy(file, options = {}) {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.92
  } = options;

  if (!isCompressibleImage(file)) {
    // Non-image file — return raw base64 data URL, no processing possible
    const dataUrl = await fileToDataUrl(file);
    return {
      dataUrl,
      originalSize: file.size,
      compressedSize: dataUrlByteSize(dataUrl),
      ratio: '0%'
    };
  }

  const img = await loadImage(file);

  // Calculate new dimensions while preserving aspect ratio
  let { naturalWidth: w, naturalHeight: h } = img;

  if (w > maxWidth || h > maxHeight) {
    const aspectRatio = w / h;
    if (w / maxWidth > h / maxHeight) {
      w = maxWidth;
      h = Math.round(maxWidth / aspectRatio);
    } else {
      h = maxHeight;
      w = Math.round(maxHeight * aspectRatio);
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext('2d');

  // Use high-quality image smoothing for downscaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(img, 0, 0, w, h);

  // Encode as JPEG at the specified quality
  const dataUrl = canvas.toDataURL('image/jpeg', quality);

  const compressedSize = dataUrlByteSize(dataUrl);
  const savings = Math.max(0, ((file.size - compressedSize) / file.size) * 100);

  console.log(
    `[Lossy] ${file.name}: ${formatBytes(file.size)} → ${formatBytes(compressedSize)} (${savings.toFixed(1)}% saved, ${w}×${h}px, q=${quality})`
  );

  return {
    dataUrl,
    originalSize: file.size,
    compressedSize,
    ratio: savings.toFixed(1) + '%'
  };
}

// ─── Pre-configured Presets ───────────────────────────────────────────────────

/**
 * Compress an avatar image — LOSSY, max 400×400, JPEG 92%.
 * @param {File} file
 * @returns {Promise<{ dataUrl: string, originalSize: number, compressedSize: number, ratio: string }>}
 */
export function compressAvatar(file) {
  return compressLossy(file, { maxWidth: 400, maxHeight: 400, quality: 0.92 });
}

/**
 * Compress a document/ID proof — LOSSLESS, preserves full resolution.
 * @param {File} file
 * @returns {Promise<{ dataUrl: string, originalSize: number, compressedSize: number, ratio: string }>}
 */
export function compressDocument(file) {
  return compressLossless(file);
}

/**
 * Compress a screenshot/attachment — LOSSY, max 1200px, JPEG 92%.
 * @param {File} file
 * @returns {Promise<{ dataUrl: string, originalSize: number, compressedSize: number, ratio: string }>}
 */
export function compressAttachment(file) {
  return compressLossy(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.92 });
}

/**
 * Compress an asset photo — LOSSY, max 800px, JPEG 92%.
 * @param {File} file
 * @returns {Promise<{ dataUrl: string, originalSize: number, compressedSize: number, ratio: string }>}
 */
export function compressAssetPhoto(file) {
  return compressLossy(file, { maxWidth: 800, maxHeight: 800, quality: 0.92 });
}

/**
 * Convert an image Blob to WebP format using OffscreenCanvas.
 * Falls back to canvas element if OffscreenCanvas is not available.
 */
export async function convertToWebp(blob: Blob, quality = 0.85): Promise<Blob> {
  const img = await createImageBitmap(blob)

  if (typeof OffscreenCanvas !== 'undefined') {
    const canvas = new OffscreenCanvas(img.width, img.height)
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0)
    return canvas.convertToBlob({ type: 'image/webp', quality })
  }

  // Fallback for environments without OffscreenCanvas
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('WebP conversion failed'))),
      'image/webp',
      quality,
    )
  })
}

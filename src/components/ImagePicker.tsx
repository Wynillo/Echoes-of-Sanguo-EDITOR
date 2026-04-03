import { useMemo, useEffect } from 'react'

interface Props {
  currentImage: Blob | null
  onImageChange: (blob: Blob) => void
}

export default function ImagePicker({ currentImage, onImageChange }: Props) {
  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onImageChange(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file?.type.startsWith('image/')) onImageChange(file)
  }

  const url = useMemo(() => currentImage ? URL.createObjectURL(currentImage) : null, [currentImage])

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [url])

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="border-2 border-dashed border-gray-700 rounded-lg p-3 text-center cursor-pointer hover:border-violet-500 transition-colors"
      onClick={() => document.getElementById('img-input')?.click()}
    >
      {url ? (
        <img src={url} className="w-full h-24 object-cover rounded" alt="card artwork" />
      ) : (
        <div className="text-gray-500 text-sm py-4">Drop image or click to upload</div>
      )}
      <input
        id="img-input"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInput}
      />
    </div>
  )
}

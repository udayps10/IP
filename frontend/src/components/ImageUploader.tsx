import { useRef, useState } from 'react'
import { ImagePlus, Trash2 } from 'lucide-react'
import { propertyApi } from '@/api'
import { useToast } from '@/context/ToastContext'
import type { PropertyImage } from '@/types'

export function ImageUploader({
  propertyId,
  images,
  canEdit,
  onChange,
}: {
  propertyId: number
  images: PropertyImage[]
  canEdit: boolean
  onChange: (images: PropertyImage[]) => void
}) {
  const { notify } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const upload = async (files: File[]) => {
    if (!files.length) return
    setBusy(true)
    try {
      const updated = await propertyApi.addImages(propertyId, files)
      onChange(updated.images ?? [])
      notify(`${files.length} photo${files.length > 1 ? 's' : ''} uploaded`, 'success')
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Upload failed', 'error')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const remove = async (imageId: number) => {
    try {
      await propertyApi.removeImage(propertyId, imageId)
      onChange(images.filter((image) => image.imageId !== imageId))
      notify('Photo removed', 'success')
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Could not remove photo', 'error')
    }
  }

  if (!canEdit) {
    if (!images.length) {
      return <div className="media-placeholder" style={{ height: 200, borderRadius: 14 }}>No photos</div>
    }
    return (
      <div className="thumb-grid">
        {images.map((image) => (
          <div className="thumb" key={image.imageId}>
            <img src={image.url} alt="Property photo" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div
        className={`dropzone${dragActive ? ' dropzone--active' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault()
          setDragActive(true)
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragActive(false)
          void upload(Array.from(event.dataTransfer.files))
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => event.key === 'Enter' && inputRef.current?.click()}
      >
        {busy ? (
          <span className="row" style={{ justifyContent: 'center' }}>
            <span className="spinner spinner--dark" /> Uploading…
          </span>
        ) : (
          <>
            <ImagePlus size={26} />
            <strong>Click to upload or drag photos here</strong>
            <span>JPEG, PNG or WebP · up to 5MB each</span>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(event) => void upload(Array.from(event.target.files ?? []))}
      />

      {images.length > 0 && (
        <div className="thumb-grid">
          {images.map((image) => (
            <div className="thumb" key={image.imageId}>
              <img src={image.url} alt="Property photo" />
              <button
                type="button"
                className="thumb__remove"
                onClick={() => void remove(image.imageId)}
                aria-label="Remove photo"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

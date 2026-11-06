import { useRef, useState } from 'react'
import { PRODUCT_IMAGE_ROLES, PRODUCT_IMAGE_ROLE_LABELS } from '@shared/constants/catalog'
import { uploadImage } from '../../lib/catalog'
import type { ProductImageAsset } from '../../lib/catalog'

interface ImageUploaderProps {
  label: string
  value: ProductImageAsset[]
  onChange: (value: ProductImageAsset[]) => void
  folder: string
  multiple?: boolean
  /** Show a pipeline role selector under each thumbnail (products only). */
  withRole?: boolean
}

/** Uploads images to Cloudinary through the server-signed endpoint. */
export function ImageUploader({
  label,
  value,
  onChange,
  folder,
  multiple = false,
  withRole = false,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) {
      return
    }

    setBusy(true)
    setError(null)
    try {
      const uploaded: ProductImageAsset[] = []
      for (const file of Array.from(files)) {
        uploaded.push(await uploadImage(file, folder))
      }
      onChange(multiple ? [...value, ...uploaded] : uploaded.slice(0, 1))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image upload failed.')
    } finally {
      setBusy(false)
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  function removeAt(index: number) {
    onChange(value.filter((_, position) => position !== index))
  }

  function setRole(index: number, role: string) {
    onChange(
      value.map((image, position) =>
        position === index ? { ...image, role: role as ProductImageAsset['role'] } : image,
      ),
    )
  }

  return (
    <div>
      <span className="font-sans text-xs uppercase tracking-[0.2em] text-ink/60">{label}</span>

      {value.length > 0 && (
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {value.map((image, index) => (
            <li key={image.publicId ?? image.url} className="rounded-brand border border-line p-2">
              <img
                src={image.url}
                alt={image.alt ?? ''}
                className="h-28 w-full rounded-brand object-cover"
              />
              {withRole && (
                <select
                  value={image.role ?? 'product'}
                  onChange={(event) => setRole(index, event.target.value)}
                  className="mt-2 w-full rounded-brand border border-line bg-cream px-2 py-1 font-sans text-xs text-ink outline-none focus:border-gold"
                >
                  {PRODUCT_IMAGE_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {PRODUCT_IMAGE_ROLE_LABELS[role]}
                    </option>
                  ))}
                </select>
              )}
              <button
                type="button"
                onClick={() => removeAt(index)}
                className="mt-2 w-full rounded-brand border border-line px-2 py-1 font-sans text-xs uppercase tracking-[0.15em] text-ink/70 transition-colors hover:border-gold hover:text-gold"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          disabled={busy || (!multiple && value.length >= 1)}
          onClick={() => inputRef.current?.click()}
          className="rounded-brand border border-line px-4 py-2 font-sans text-xs uppercase tracking-[0.15em] text-ink/80 transition-colors hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? 'Uploading' : 'Upload image'}
        </button>
        {error && <span className="font-sans text-xs text-gold-dark">{error}</span>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        hidden
        onChange={(event) => handleFiles(event.target.files)}
      />
    </div>
  )
}

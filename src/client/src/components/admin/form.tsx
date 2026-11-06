import type { ChangeEvent, ReactNode } from 'react'

/** Shared input styling for the admin forms. */
export const inputClass =
  'w-full rounded-brand border border-line bg-cream px-3 py-2 font-sans text-sm text-ink outline-none transition-colors focus:border-gold'

export function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="font-sans text-xs uppercase tracking-[0.2em] text-ink/60">{label}</span>
      <div className="mt-2">{children}</div>
      {hint && <span className="mt-1 block font-sans text-xs text-ink/50">{hint}</span>}
    </label>
  )
}

export function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
}) {
  return (
    <select
      value={value}
      onChange={(event: ChangeEvent<HTMLSelectElement>) => onChange(event.target.value)}
      className={inputClass}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

export function NumberInput({
  value,
  onChange,
  min,
  step,
  placeholder,
}: {
  value: number | undefined
  onChange: (value: number | undefined) => void
  min?: number
  step?: number
  placeholder?: string
}) {
  return (
    <input
      type="number"
      value={value ?? ''}
      min={min}
      step={step}
      placeholder={placeholder}
      onChange={(event) => {
        const raw = event.target.value
        onChange(raw === '' ? undefined : Number(raw))
      }}
      className={inputClass}
    />
  )
}

export function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
}) {
  return (
    <label className="flex items-center gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-gold"
      />
      <span className="font-sans text-sm text-ink/80">{label}</span>
    </label>
  )
}

import { useState, useEffect, useMemo } from 'react'
import { useApp } from '../../app/useApp'
import {
  DEFAULT_SIZE_CATEGORIES,
  ALL_DEFAULT_SIZES,
  type SizeCategoryPreset,
} from '@shared/constants/catalog'

const CATEGORIES_STORAGE_KEY = 'cmr:admin_size_categories'

export interface SizeCategoryData {
  id: string
  name: { ar: string; fr: string; en: string } | string
  sizes: string[]
  isDefault?: boolean
}

interface SizeManagerProps {
  selectedSizes: string[]
  onChange: (sizes: string[]) => void
}

export function SizeManager({ selectedSizes, onChange }: SizeManagerProps) {
  const { t, locale } = useApp()

  const [categories, setCategories] = useState<SizeCategoryData[]>(() => {
    try {
      const saved = localStorage.getItem(CATEGORIES_STORAGE_KEY)
      if (saved) {
        const parsed: SizeCategoryData[] = JSON.parse(saved)
        // Ensure default categories exist
        const defaultIds = new Set(parsed.map((c) => c.id))
        const missingDefaults = DEFAULT_SIZE_CATEGORIES.filter((d) => !defaultIds.has(d.id))
        return [...parsed, ...missingDefaults]
      }
    } catch {
      // fallback
    }
    return DEFAULT_SIZE_CATEGORIES.map((cat: SizeCategoryPreset) => ({
      id: cat.id,
      name: cat.name,
      sizes: [...cat.sizes],
      isDefault: true,
    }))
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [targetCategoryForAdd, setTargetCategoryForAdd] = useState<string>('clothing')

  // When active category tab changes (and is not 'all'), update default target category
  useEffect(() => {
    if (activeCategory !== 'all') {
      setTargetCategoryForAdd(activeCategory)
    }
  }, [activeCategory])

  // New size category creation state
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCatName, setNewCatName] = useState('')

  // Editing state for an existing size
  const [editingSize, setEditingSize] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [editCategoryTarget, setEditCategoryTarget] = useState<string>('')

  // Helper to extract localized category name
  function getCategoryName(name: { ar: string; fr: string; en: string } | string): string {
    if (typeof name === 'string') return name
    return name[locale] || name.en || name.ar
  }

  // Save categories to localStorage
  function persistCategories(cats: SizeCategoryData[]) {
    setCategories(cats)
    try {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(cats))
    } catch {
      // ignore
    }
  }

  // All known sizes across all categories + selectedSizes
  const allAvailableSizes = useMemo(() => {
    const set = new Set<string>()
    categories.forEach((cat) => cat.sizes.forEach((s) => set.add(s)))
    selectedSizes.forEach((s) => set.add(s))
    return Array.from(set)
  }, [categories, selectedSizes])

  // Filter sizes based on active category and search
  const filteredSizes = useMemo(() => {
    let list: string[] = []

    if (activeCategory === 'all') {
      list = allAvailableSizes
    } else {
      const found = categories.find((c) => c.id === activeCategory)
      list = found ? found.sizes : []
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter((s) => s.toLowerCase().includes(q))
    }

    return list
  }, [activeCategory, allAvailableSizes, categories, searchQuery])

  const exactMatchExists = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return allAvailableSizes.some((s) => s.toLowerCase() === q)
  }, [searchQuery, allAvailableSizes])

  // Add new size and attach to category
  function handleAddSize(rawName?: string) {
    const name = (rawName ?? searchQuery).trim()
    if (!name) return

    // Add to target category
    const catId = targetCategoryForAdd || categories[0]?.id || 'clothing'
    const updated = categories.map((cat) => {
      if (cat.id === catId && !cat.sizes.includes(name)) {
        return { ...cat, sizes: [...cat.sizes, name] }
      }
      return cat
    })
    persistCategories(updated)

    // Select for product
    if (!selectedSizes.includes(name)) {
      onChange([...selectedSizes, name])
    }

    setSearchQuery('')
  }

  // Toggle selection
  function handleToggleSize(size: string) {
    if (selectedSizes.includes(size)) {
      onChange(selectedSizes.filter((s) => s !== size))
    } else {
      onChange([...selectedSizes, size])
    }
  }

  // Remove selected
  function handleRemoveSelected(size: string) {
    onChange(selectedSizes.filter((s) => s !== size))
  }

  // Create new size category
  function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault()
    const name = newCatName.trim()
    if (!name) return

    const id = 'custom-' + Date.now().toString(36)
    const newCategory: SizeCategoryData = {
      id,
      name: { ar: name, fr: name, en: name },
      sizes: [],
      isDefault: false,
    }

    const updated = [...categories, newCategory]
    persistCategories(updated)
    setActiveCategory(id)
    setTargetCategoryForAdd(id)
    setNewCatName('')
    setIsAddingCategory(false)
  }

  // Delete custom category
  function handleDeleteCategory(catId: string, e: React.MouseEvent) {
    e.stopPropagation()
    const cat = categories.find((c) => c.id === catId)
    if (!cat) return

    const name = getCategoryName(cat.name)
    if (!window.confirm(`Delete size category "${name}"?`)) return

    const updated = categories.filter((c) => c.id !== catId)
    persistCategories(updated)
    if (activeCategory === catId) {
      setActiveCategory('all')
    }
  }

  // Start editing a size
  function startEditing(size: string, e: React.MouseEvent) {
    e.stopPropagation()
    setEditingSize(size)
    setEditValue(size)
    const currentCat = categories.find((c) => c.sizes.includes(size))
    setEditCategoryTarget(currentCat ? currentCat.id : categories[0]?.id || '')
  }

  // Save size edit (renaming and optional category reassignment)
  function saveEditing(e?: React.FormEvent) {
    if (e) e.preventDefault()
    if (!editingSize) return

    const newVal = editValue.trim()
    if (!newVal) {
      setEditingSize(null)
      return
    }

    const updated = categories.map((cat) => {
      let catSizes = cat.sizes.map((s) => (s === editingSize ? newVal : s))

      // If moving category
      if (editCategoryTarget && cat.id !== editCategoryTarget) {
        catSizes = catSizes.filter((s) => s !== newVal)
      } else if (cat.id === editCategoryTarget && !catSizes.includes(newVal)) {
        catSizes.push(newVal)
      }

      return { ...cat, sizes: catSizes }
    })
    persistCategories(updated)

    // Update in selected product sizes if it was selected
    if (selectedSizes.includes(editingSize)) {
      onChange(selectedSizes.map((s) => (s === editingSize ? newVal : s)))
    }

    setEditingSize(null)
  }

  // Delete size
  function handleDeleteSize(size: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!window.confirm(`Delete size "${size}"?`)) return

    const updated = categories.map((cat) => ({
      ...cat,
      sizes: cat.sizes.filter((s) => s !== size),
    }))
    persistCategories(updated)

    if (selectedSizes.includes(size)) {
      onChange(selectedSizes.filter((s) => s !== size))
    }
  }

  return (
    <div className="space-y-4 rounded-brand border border-line bg-cream-card p-4">
      {/* ── Header & Selected Sizes Summary ── */}
      <div>
        <div className="flex items-center justify-between">
          <label className="font-sans text-xs uppercase tracking-[0.2em] text-ink/70 font-semibold">
            {t('admin.productSizes')}
          </label>
          <span className="font-sans text-[11px] text-ink/50">
            {selectedSizes.length} {t('admin.sizesSelected')}
          </span>
        </div>

        {/* Selected Size Pills */}
        <div className="mt-2 min-h-11 rounded-brand border border-line/60 bg-cream/40 p-2.5">
          {selectedSizes.length === 0 ? (
            <p className="text-xs text-ink/50 italic py-1">
              {t('admin.noSizesSelected')}
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {selectedSizes.map((size) => (
                <span
                  key={size}
                  className="inline-flex items-center gap-1.5 rounded-brand bg-gold px-2.5 py-1 text-xs font-semibold text-cream-card shadow-xs animate-in fade-in"
                >
                  <span>{size}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSelected(size)}
                    title="Remove"
                    className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-cream-card/80 hover:text-cream-card hover:bg-gold-dark transition-colors"
                  >
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-[11px] text-ink/50 hover:text-red-500 underline ms-2 self-center"
              >
                {t('admin.clearAll')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Search & Dynamic Add Bar with Category Selection ── */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Category Target Selector for New Size */}
        <div className="sm:w-48 shrink-0">
          <select
            value={targetCategoryForAdd}
            onChange={(e) => setTargetCategoryForAdd(e.target.value)}
            className="w-full rounded-brand border border-line bg-cream-card px-3 py-2 text-xs text-ink focus:border-gold focus:outline-none"
            title={t('admin.targetCategory')}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {getCategoryName(cat.name)}
              </option>
            ))}
          </select>
        </div>

        {/* Search / Input Field */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddSize()
              }
            }}
            placeholder={t('admin.searchOrTypeSize')}
            className="w-full rounded-brand border border-line bg-cream-card px-3.5 py-2 text-sm text-ink placeholder:text-ink/40 focus:border-gold focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink text-xs"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Add Size Button */}
        {searchQuery.trim() && !exactMatchExists && (
          <button
            type="button"
            onClick={() => handleAddSize()}
            className="inline-flex items-center justify-center gap-1.5 rounded-brand bg-gold px-4 py-2 font-sans text-xs font-bold uppercase tracking-wider text-cream-card transition-all hover:bg-gold-dark hover:scale-[1.02] active:scale-[0.98] shrink-0"
          >
            <span>{t('admin.addSize')}</span>
            <span className="font-semibold text-cream">"{searchQuery.trim()}"</span>
          </button>
        )}
      </div>

      {/* ── Category Preset Tabs & "+ Add Size Category" ── */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-line/40 pb-2">
        <button
          type="button"
          onClick={() => setActiveCategory('all')}
          className={`rounded-brand px-2.5 py-1 text-[11px] font-sans transition-colors ${activeCategory === 'all'
              ? 'bg-ink text-cream-card font-semibold'
              : 'bg-cream/60 text-ink/70 hover:bg-cream hover:text-ink'
            }`}
        >
          {t('admin.allCategories')}
        </button>

        {categories.map((cat) => (
          <div key={cat.id} className="relative group inline-flex items-center">
            <button
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`rounded-brand px-2.5 py-1 text-[11px] font-sans transition-colors ${activeCategory === cat.id
                  ? 'bg-ink text-cream-card font-semibold'
                  : 'bg-cream/60 text-ink/70 hover:bg-cream hover:text-ink'
                }`}
            >
              {getCategoryName(cat.name)}
            </button>

            {!cat.isDefault && (
              <button
                type="button"
                onClick={(e) => handleDeleteCategory(cat.id, e)}
                title="Delete this size category"
                className="opacity-0 group-hover:opacity-100 -ms-1 p-1 text-ink/40 hover:text-red-500 transition-opacity"
              >
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}

        {/* Button to open inline Add Size Category form */}
        {!isAddingCategory ? (
          <button
            type="button"
            onClick={() => setIsAddingCategory(true)}
            className="rounded-brand border border-dashed border-gold/70 px-2.5 py-0.5 text-[11px] font-sans text-gold hover:border-gold hover:bg-gold/10 transition-colors"
          >
            {t('admin.addSizeCategory')}
          </button>
        ) : (
          <form onSubmit={handleCreateCategory} className="inline-flex items-center gap-1 animate-in fade-in">
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g. Suits, Belts..."
              autoFocus
              className="rounded-brand border border-gold px-2 py-0.5 text-xs text-ink focus:outline-none w-36"
            />
            <button
              type="submit"
              className="p-1 text-emerald-600 hover:text-emerald-700 transition-colors"
              title="Save Category"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAddingCategory(false)
                setNewCatName('')
              }}
              className="p-1 text-ink/40 hover:text-ink transition-colors"
              title="Cancel"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </form>
        )}
      </div>

      {/* ── Available Sizes Grid / Badges ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-sans text-[11px] text-ink/50 uppercase tracking-wider">
            {t('admin.availableOptions')}
          </span>
          {activeCategory !== 'all' && (
            <button
              type="button"
              onClick={() => {
                const toAdd = filteredSizes.filter((s) => !selectedSizes.includes(s))
                onChange([...selectedSizes, ...toAdd])
              }}
              className="text-[11px] text-gold hover:text-gold-dark font-medium"
            >
              {t('admin.selectAllInGroup')}
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto p-1">
          {filteredSizes.length === 0 ? (
            <div className="w-full py-4 text-center">
              <p className="text-xs text-ink/50">
                {t('admin.noSizesInSearch')}
              </p>
              {searchQuery.trim() && (
                <button
                  type="button"
                  onClick={() => handleAddSize()}
                  className="mt-2 text-xs font-bold text-gold hover:underline"
                >
                  {t('admin.addToProduct')} "{searchQuery}"
                </button>
              )}
            </div>
          ) : (
            filteredSizes.map((size) => {
              const active = selectedSizes.includes(size)
              const isDefault = ALL_DEFAULT_SIZES.includes(size)
              const isEditingThis = editingSize === size

              if (isEditingThis) {
                return (
                  <form
                    key={size}
                    onSubmit={saveEditing}
                    className="inline-flex items-center gap-1.5 rounded-brand border border-gold bg-cream-card px-2 py-1 shadow-xs"
                  >
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      autoFocus
                      className="w-16 rounded border border-line px-1.5 py-0.5 text-xs text-ink focus:outline-none"
                    />
                    <select
                      value={editCategoryTarget}
                      onChange={(e) => setEditCategoryTarget(e.target.value)}
                      className="rounded border border-line px-1 py-0.5 text-[11px] text-ink focus:outline-none"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {getCategoryName(c.name)}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      title="Save"
                      className="p-1 text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingSize(null)}
                      title="Cancel"
                      className="p-1 text-ink/40 hover:text-ink transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </form>
                )
              }

              return (
                <div
                  key={size}
                  onClick={() => handleToggleSize(size)}
                  className={`group relative inline-flex items-center gap-1.5 cursor-pointer select-none rounded-brand border px-3 py-1.5 font-sans text-xs transition-all ${active
                      ? 'border-gold bg-gold text-cream-card font-semibold shadow-xs'
                      : 'border-line bg-cream/30 text-ink/80 hover:border-gold hover:text-gold hover:bg-cream-card'
                    }`}
                >
                  <span>{size}</span>

                  {/* Clean SVG Action Icons: Edit & Delete */}
                  <div
                    className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ms-1 ps-1 border-s ${active ? 'border-cream-card/30' : 'border-line'
                      }`}
                  >
                    <button
                      type="button"
                      onClick={(e) => startEditing(size, e)}
                      title="Rename / Move category"
                      className={`p-0.5 rounded transition-transform hover:scale-110 ${active ? 'text-cream-card/80 hover:text-cream-card' : 'text-ink/50 hover:text-gold'
                        }`}
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>

                    {!isDefault && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteSize(size, e)}
                        title="Delete size"
                        className={`p-0.5 rounded transition-transform hover:scale-110 ${active ? 'text-cream-card/80 hover:text-red-300' : 'text-ink/40 hover:text-red-500'
                          }`}
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

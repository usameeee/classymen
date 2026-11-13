/**
 * Typed access to the catalog API (categories + products).
 * Mirrors the response shapes of `src/server/routes/{category,product}.routes.ts`.
 */
import type { DisplayStyle } from '@shared/constants/displayStyles'
import type { ShowcaseStyle } from '@shared/constants/showcaseStyles'
import type { ImageStatus, ProductImageRole } from '@shared/constants/catalog'
import { apiRequest } from './api'

export interface LocalizedText {
  ar: string
  fr: string
  en: string
}

export interface ImageAsset {
  url: string
  publicId?: string
  alt?: string
}

export interface ProductImageAsset extends ImageAsset {
  role?: ProductImageRole
  status?: ImageStatus
}

export interface CategoryParentSummary {
  _id: string
  slug: string
  name: LocalizedText
}

/** Category as embedded in a populated product. */
export interface CategorySummary {
  _id: string
  slug: string
  name: LocalizedText
  description?: LocalizedText
  displayStyle?: DisplayStyle
}

export interface Category extends CategorySummary {
  description: LocalizedText
  showcaseOnHome?: boolean
  showcaseStyle?: ShowcaseStyle
  parent?: CategoryParentSummary | null
  image?: ImageAsset
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Product {
  _id: string
  slug: string
  name: LocalizedText
  description: LocalizedText
  category: CategorySummary
  price: number
  compareAtPrice?: number
  currency: string
  images: ProductImageAsset[]
  sizes: string[]
  isMadeToMeasure: boolean
  stock: number
  displayStyle?: DisplayStyle
  wardrobeSection?: 'hanging' | 'folded' | 'bottom'
  tags: string[]
  isActive: boolean
  isFeatured: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductPage {
  items: Product[]
  total: number
  page: number
  limit: number
  pages: number
}

export interface CategoryPayload {
  slug?: string
  name: LocalizedText
  description?: LocalizedText
  displayStyle?: DisplayStyle
  showcaseOnHome?: boolean
  showcaseStyle?: ShowcaseStyle
  parentId?: string | null
  image?: ImageAsset
  order?: number
  isActive?: boolean
}

export interface ProductPayload {
  slug?: string
  name: LocalizedText
  description?: LocalizedText
  category: string
  price: number
  compareAtPrice?: number
  currency?: string
  images?: ProductImageAsset[]
  sizes?: string[]
  isMadeToMeasure?: boolean
  stock?: number
  displayStyle?: DisplayStyle
  wardrobeSection?: 'hanging' | 'folded' | 'bottom'
  tags?: string[]
  isActive?: boolean
  isFeatured?: boolean
}

export interface ProductListParams {
  category?: string
  featured?: boolean
  direct?: boolean
  page?: number
  limit?: number
  /** Include hidden products (admin only; ignored for anonymous requests). */
  includeInactive?: boolean
}

/* --- Categories ---------------------------------------------------------- */

export interface FetchCategoriesOptions {
  includeInactive?: boolean
  parent?: string | null
}

export async function fetchCategories(
  optionsOrIncludeInactive: FetchCategoriesOptions | boolean = true,
): Promise<Category[]> {
  const options =
    typeof optionsOrIncludeInactive === 'boolean'
      ? { includeInactive: optionsOrIncludeInactive }
      : optionsOrIncludeInactive

  const search = new URLSearchParams()
  if (options.includeInactive ?? true) {
    search.set('includeInactive', 'true')
  }
  if (options.parent !== undefined && options.parent !== null) {
    search.set('parent', options.parent)
  }

  const query = search.toString()
  const data = await apiRequest<{ items: Category[] }>(`/categories${query ? `?${query}` : ''}`)
  return data.items
}

export async function fetchCategory(idOrSlug: string): Promise<Category> {
  const data = await apiRequest<{ category: Category }>(`/categories/${idOrSlug}`)
  return data.category
}

export async function createCategory(input: CategoryPayload): Promise<Category> {
  const data = await apiRequest<{ category: Category }>('/categories', {
    method: 'POST',
    body: input,
  })
  return data.category
}

export async function updateCategory(id: string, input: CategoryPayload): Promise<Category> {
  const data = await apiRequest<{ category: Category }>(`/categories/${id}`, {
    method: 'PATCH',
    body: input,
  })
  return data.category
}

export async function deleteCategory(id: string): Promise<void> {
  await apiRequest<void>(`/categories/${id}`, { method: 'DELETE' })
}

/* --- Products ------------------------------------------------------------ */

export async function fetchProducts(params: ProductListParams = {}): Promise<ProductPage> {
  const search = new URLSearchParams()
  // Only send includeInactive=true when explicitly requested (admin-only flag)
  if (params.includeInactive === true) {
    search.set('includeInactive', 'true')
  }
  if (params.category) search.set('category', params.category)
  if (params.featured !== undefined) search.set('featured', String(params.featured))
  if (params.direct !== undefined) search.set('direct', String(params.direct))
  search.set('page', String(params.page ?? 1))
  search.set('limit', String(params.limit ?? 20))
  return apiRequest<ProductPage>(`/products?${search.toString()}`)
}

export async function fetchProduct(idOrSlug: string): Promise<Product> {
  const data = await apiRequest<{ product: Product }>(`/products/${idOrSlug}`)
  return data.product
}

export async function createProduct(input: ProductPayload): Promise<Product> {
  const data = await apiRequest<{ product: Product }>('/products', {
    method: 'POST',
    body: input,
  })
  return data.product
}

export async function updateProduct(id: string, input: ProductPayload): Promise<Product> {
  const data = await apiRequest<{ product: Product }>(`/products/${id}`, {
    method: 'PATCH',
    body: input,
  })
  return data.product
}

export async function deleteProduct(id: string): Promise<void> {
  await apiRequest<void>(`/products/${id}`, { method: 'DELETE' })
}

/* --- Image upload -------------------------------------------------------- */

interface UploadSignature {
  cloudName: string
  apiKey: string
  folder: string
  timestamp: number
  signature: string
  removeBackground?: boolean
}

/** Uploads a file straight to Cloudinary using a server-signed payload. */
export async function uploadImage(
  file: File,
  folder: string,
  options: { removeBackground?: boolean } = {},
): Promise<ImageAsset> {
  const signature = await apiRequest<UploadSignature>('/uploads/signature', {
    method: 'POST',
    body: { folder, removeBackground: options.removeBackground ?? false },
  })

  const form = new FormData()
  form.append('file', file)
  form.append('api_key', signature.apiKey)
  form.append('timestamp', String(signature.timestamp))
  form.append('folder', signature.folder)
  form.append('signature', signature.signature)

  if (signature.removeBackground) {
    form.append('background_removal', 'cloudinary_ai')
  }

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
    { method: 'POST', body: form },
  )

  const payload: unknown = await response.json().catch(() => null)
  if (!response.ok || !payload || typeof payload !== 'object') {
    throw new Error('Image upload failed.')
  }

  const result = payload as { secure_url?: string; public_id?: string }
  if (!result.secure_url) {
    throw new Error('Image upload failed.')
  }

  return { url: result.secure_url, publicId: result.public_id }
}

/**
 * Stage3dScene — SceneProps adapter for the full Stage3dShowcase component.
 *
 * Stage3dShowcase was originally designed for category-page use and requires
 * a `category` object (name, slug, description). When invoked from the homepage
 * SceneRenderer (product-level `displayStyle === 'stage-3d'`), there is no
 * explicit category passed. This wrapper derives a minimal category stub from
 * the first product's populated `category` field so Stage3dShowcase renders
 * its full luxury presentation without modification.
 */
import { Stage3dShowcase } from '../components/showcase/Stage3dShowcase'
import type { SceneProps } from './sceneIntensity'

export function Stage3dScene({ products }: SceneProps) {
  if (products.length === 0) return null

  // Derive a category stub from the first product's populated category.
  // All products in a stage-3d group share the same displayStyle but may span
  // categories — we use the first product's category as the section header.
  const firstCat = products[0].category

  const categoryStub = firstCat
    ? {
        _id: firstCat._id,
        slug: firstCat.slug ?? 'catalog',
        name: firstCat.name,
        description: 'description' in firstCat ? (firstCat as { description?: typeof firstCat.name }).description : undefined,
      }
    : {
        _id: 'featured',
        slug: 'catalog',
        name: { ar: 'المجموعة المميزة', fr: 'Collection Prestige', en: 'Featured Collection' },
        description: undefined,
      }

  return <Stage3dShowcase category={categoryStub} products={products} />
}


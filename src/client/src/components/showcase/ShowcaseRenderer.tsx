import type { Category, Product } from '../../lib/catalog'
import { Stage3dShowcase } from './Stage3dShowcase'
import { SceneRenderer } from '../../scenes/SceneRenderer'

interface ShowcaseRendererProps {
  category: Category
  products: Product[]
}

/**
 * Dynamic Showcase Style Dispatcher.
 * Renders the showcase experience directly inherited from the category's Display Style.
 */
export function ShowcaseRenderer({ category, products }: ShowcaseRendererProps) {
  // If the category's displayStyle is 'stage-3d', render the full 3D interactive stage
  if (category.displayStyle === 'stage-3d') {
    return <Stage3dShowcase category={category} products={products} />
  }

  // Otherwise, render the category's natural interactive scene (cabinet, rail, mannequin, wardrobe, shelf, floating, grid-clean)
  return (
    <section className="relative w-full py-16 bg-cream">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SceneRenderer
          style={category.displayStyle}
          products={products}
        />
      </div>
    </section>
  )
}

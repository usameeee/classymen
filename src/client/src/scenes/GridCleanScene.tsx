import { ProductCard } from '../components/catalog/ProductCard'
import type { SceneProps } from './sceneIntensity'

/** Plain responsive product grid — the safe fallback for every scene. */
export function GridCleanScene({ products }: SceneProps) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  )
}

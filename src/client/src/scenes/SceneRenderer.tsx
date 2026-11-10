import { lazy, Suspense, type ComponentType } from 'react'
import type { DisplayStyle } from '@shared/constants/displayStyles'
import type { Product } from '../lib/catalog'
import { GridCleanScene } from './GridCleanScene'
import { DEFAULT_SCENE_INTENSITY, useSceneIntensity } from './sceneIntensity'
import type { SceneIntensity, SceneProps } from './sceneIntensity'

// Lazy-loaded scene components for bundle code-splitting
const CabinetScene = lazy(() =>
  import('./CabinetScene').then((m) => ({ default: m.CabinetScene })),
)
const FloatingScene = lazy(() =>
  import('./FloatingScene').then((m) => ({ default: m.FloatingScene })),
)
const MannequinScene = lazy(() =>
  import('./MannequinScene').then((m) => ({ default: m.MannequinScene })),
)
const RailScene = lazy(() =>
  import('./RailScene').then((m) => ({ default: m.RailScene })),
)
const ShelfScene = lazy(() =>
  import('./ShelfScene').then((m) => ({ default: m.ShelfScene })),
)
const WardrobeScene = lazy(() =>
  import('./WardrobeScene').then((m) => ({ default: m.WardrobeScene })),
)
const Stage3dScene = lazy(() =>
  import('./Stage3dScene').then((m) => ({ default: m.Stage3dScene })),
)

/**
 * Registry of implemented display styles.
 * Styles without an entry (and every scene when intensity resolves to `off`)
 * fall back to the clean grid.
 */
const SCENES: Record<DisplayStyle, ComponentType<SceneProps>> = {
  'stage-3d': Stage3dScene,
  cabinet: CabinetScene,
  floating: FloatingScene,
  mannequin: MannequinScene,
  rail: RailScene,
  shelf: ShelfScene,
  wardrobe: WardrobeScene,
  'grid-clean': GridCleanScene,
}

interface SceneRendererProps {
  style: DisplayStyle
  products: Product[]
  /** Requested motion level; auto-lowered for reduced-motion users and weak devices. */
  intensity?: SceneIntensity
}

/** Resolves a display style to a scene component and applies the effective intensity. */
export function SceneRenderer({
  style,
  products,
  intensity = DEFAULT_SCENE_INTENSITY,
}: SceneRendererProps) {
  const effective = useSceneIntensity(intensity)

  if (products.length === 0) return null

  const Scene = effective === 'off' ? GridCleanScene : (SCENES[style] ?? GridCleanScene)

  return (
    <Suspense fallback={<GridCleanScene products={products} intensity="off" />}>
      <Scene products={products} intensity={effective} />
    </Suspense>
  )
}

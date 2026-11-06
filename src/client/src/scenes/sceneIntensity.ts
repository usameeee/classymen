/**
 * Scene animation intensity: how much motion a storefront scene is allowed to run.
 * The requested level is automatically lowered for `prefers-reduced-motion` users
 * and weak devices.
 * @see docs/DISPLAY_SYSTEM.md
 */
import { useEffect, useState } from 'react'
import type { Product } from '../lib/catalog'

export const SCENE_INTENSITIES = ['off', 'low', 'medium', 'high'] as const

export type SceneIntensity = (typeof SCENE_INTENSITIES)[number]

/** Default motion level for storefront scenes. */
export const DEFAULT_SCENE_INTENSITY: SceneIntensity = 'medium'

/** Props every scene implementation receives from the renderer. */
export interface SceneProps {
  products: Product[]
  intensity: SceneIntensity
}

function capAt(value: SceneIntensity, ceiling: SceneIntensity): SceneIntensity {
  return SCENE_INTENSITIES.indexOf(value) > SCENE_INTENSITIES.indexOf(ceiling) ? ceiling : value
}

/** True for low-core / low-memory devices where heavy motion would stutter. */
function isWeakDevice(): boolean {
  const cores = navigator.hardwareConcurrency ?? 8
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8
  return cores <= 4 || memory <= 4
}

function resolveIntensity(preferred: SceneIntensity): SceneIntensity {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'off'
  return isWeakDevice() ? capAt(preferred, 'low') : preferred
}

/** Resolves the effective intensity, reacting to reduced-motion changes at runtime. */
export function useSceneIntensity(
  preferred: SceneIntensity = DEFAULT_SCENE_INTENSITY,
): SceneIntensity {
  const [intensity, setIntensity] = useState<SceneIntensity>(() => resolveIntensity(preferred))

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setIntensity(resolveIntensity(preferred))
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [preferred])

  return intensity
}

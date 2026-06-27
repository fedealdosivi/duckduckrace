import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { duckHue } from '@/utils/duckColors'

const MODEL_URL = '/models/duck.glb'
/** The model's native units are tiny (FBX-exported); scales it up to match the rest of the scene. */
const MODEL_SCALE = 3.6

export interface DuckMesh {
  group: THREE.Group
  /** Random per-duck phase so idle bobbing/swim-wobble animation isn't synchronized. */
  animationPhase: number
  bodyMaterial: THREE.MeshStandardMaterial
}

let templatePromise: Promise<THREE.Object3D> | null = null

function loadTemplate(): Promise<THREE.Object3D> {
  if (!templatePromise) {
    templatePromise = new GLTFLoader().loadAsync(MODEL_URL).then((gltf) => {
      gltf.scene.scale.setScalar(MODEL_SCALE)
      return gltf.scene
    })
  }
  return templatePromise
}

/** Starts fetching the duck model immediately so it's already cached by the time a race is built. */
export function preloadDuckModel(): void {
  void loadTemplate()
}

/**
 * Clones the shared duck template and gives this instance its own material so
 * it can be tinted a distinct hue without affecting other ducks. The tint is
 * intentionally light (low saturation, high lightness) because it multiplies
 * the model's baked-in texture - a fully saturated tint would wash out the
 * painted beak/eye detail.
 */
export async function createDuckMesh(tintColor: number): Promise<DuckMesh> {
  const template = await loadTemplate()
  const instance = template.clone(true)

  let bodyMaterial: THREE.MeshStandardMaterial | null = null
  instance.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material) {
      const cloned = (child.material as THREE.MeshStandardMaterial).clone()
      cloned.color.set(tintColor)
      child.material = cloned
      bodyMaterial = cloned
    }
  })

  const group = new THREE.Group()
  group.add(instance)

  return {
    group,
    animationPhase: Math.random() * Math.PI * 2,
    bodyMaterial: bodyMaterial ?? new THREE.MeshStandardMaterial({ color: tintColor }),
  }
}

/** Light, low-saturation tint so each duck reads as a distinct color without crushing the model's texture detail. */
export function duckColorForIndex(index: number, total: number): number {
  return new THREE.Color().setHSL(duckHue(index, total), 0.55, 0.72).getHex()
}

import * as THREE from 'three'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import type { DuckRacer, FinishOrderEntry } from '@/types/race'
import { progressAt } from '@/utils/raceProgress'
import { computeLaneLayout, trackFootprint, type LaneLayout } from './track'
import { createDuckMesh, duckColorForIndex, type DuckMesh } from './duck'
import { createWaterMesh, updateWater } from './water'
import { createLabelRenderer, createNameLabel } from './labels'

export type SceneMode = 'idle' | 'racing'

interface DuckEntry {
  racer: DuckRacer
  mesh: DuckMesh
  label: CSS2DObject
  lane: LaneLayout
  finishedNotified: boolean
}

export interface RaceSceneOptions {
  onFinished?: (order: FinishOrderEntry[]) => void
}

const DUCK_BASE_Y = 0
const BOB_AMPLITUDE = 0.07
const BOB_FREQUENCY = 2.2
const WING_FLAP_FREQUENCY = 6

/**
 * Owns every Three.js object for the race track and runs its own
 * requestAnimationFrame loop (water + idle bobbing always animate; duck
 * positions only advance while `mode === 'racing'`). Vue components only ever
 * call `buildRace`, `setMode` and `resize` - no Three.js leaks into the
 * component layer.
 */
export class RaceSceneManager {
  private readonly scene = new THREE.Scene()
  private readonly camera: THREE.PerspectiveCamera
  private readonly renderer: THREE.WebGLRenderer
  private readonly labelRenderer: CSS2DRenderer
  private readonly clock = new THREE.Clock()
  private readonly container: HTMLElement
  private readonly water: THREE.Mesh
  private readonly options: RaceSceneOptions
  private readonly resizeObserver: ResizeObserver

  private ducks: DuckEntry[] = []
  private trackMarkers: THREE.Object3D[] = []
  private mode: SceneMode = 'idle'
  private raceElapsed = 0
  private raceDuration = 10
  private finishedOrder: FinishOrderEntry[] = []
  private notifiedFinish = false
  private frameId: number | null = null

  constructor(container: HTMLElement, options: RaceSceneOptions = {}) {
    this.container = container
    this.options = options

    this.camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 500)

    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(container.clientWidth, container.clientHeight)
    container.appendChild(this.renderer.domElement)

    this.labelRenderer = createLabelRenderer(container)

    this.scene.background = new THREE.Color(0x9fd8ff)
    this.scene.fog = new THREE.Fog(0x9fd8ff, 60, 220)

    const ambient = new THREE.AmbientLight(0xffffff, 0.75)
    const sun = new THREE.DirectionalLight(0xffffff, 0.85)
    sun.position.set(20, 30, 10)
    this.scene.add(ambient, sun)

    this.water = createWaterMesh(220, 220)
    this.water.position.y = -0.05
    this.scene.add(this.water)

    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(container)

    this.startLoop()
  }

  buildRace(racers: DuckRacer[], raceDurationSeconds: number): void {
    this.clearDucks()
    this.raceDuration = raceDurationSeconds
    this.raceElapsed = 0
    this.finishedOrder = []
    this.notifiedFinish = false
    this.mode = 'idle'

    const layout = computeLaneLayout(racers.length)

    racers.forEach((racer, index) => {
      const lane = layout[index]
      const mesh = createDuckMesh(duckColorForIndex(index, racers.length))
      mesh.group.position.set(lane.x, DUCK_BASE_Y, lane.startZ)
      this.scene.add(mesh.group)

      const label = createNameLabel(racer.participant.name)
      label.position.set(0, 1.55, 0)
      mesh.group.add(label)

      this.ducks.push({ racer, mesh, label, lane, finishedNotified: false })
    })

    this.buildTrackMarkers(layout)
    this.fitCameraToTrack(racers.length)
  }

  setMode(mode: SceneMode): void {
    if (mode === 'racing' && this.mode !== 'racing') {
      this.raceElapsed = 0
      this.notifiedFinish = false
      this.finishedOrder = []
      this.ducks.forEach((d) => (d.finishedNotified = false))
    }
    this.mode = mode
  }

  resize(): void {
    const { clientWidth, clientHeight } = this.container
    if (clientWidth === 0 || clientHeight === 0) return
    this.camera.aspect = clientWidth / clientHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(clientWidth, clientHeight)
    this.labelRenderer.setSize(clientWidth, clientHeight)
  }

  dispose(): void {
    if (this.frameId !== null) cancelAnimationFrame(this.frameId)
    this.resizeObserver.disconnect()
    this.clearDucks()
    this.renderer.dispose()
    this.renderer.domElement.remove()
    this.labelRenderer.domElement.remove()
  }

  private buildTrackMarkers(layout: LaneLayout[]): void {
    this.trackMarkers.forEach((m) => this.scene.remove(m))
    this.trackMarkers = []

    const xs = layout.map((l) => l.x)
    const minX = Math.min(...xs) - 1.6
    const maxX = Math.max(...xs) + 1.6
    const width = maxX - minX
    const centerX = (minX + maxX) / 2

    const startMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
    const finishMaterial = new THREE.MeshBasicMaterial({ color: 0xffd23f })

    const rows = new Map<number, { startZ: number; finishZ: number }>()
    layout.forEach((l) => rows.set(l.row, { startZ: l.startZ, finishZ: l.finishZ }))

    rows.forEach(({ startZ, finishZ }) => {
      const startLine = new THREE.Mesh(new THREE.BoxGeometry(width, 0.05, 0.3), startMaterial)
      startLine.position.set(centerX, 0.02, startZ - 0.8)
      this.scene.add(startLine)
      this.trackMarkers.push(startLine)

      const finishLine = new THREE.Mesh(new THREE.BoxGeometry(width, 0.05, 0.3), finishMaterial)
      finishLine.position.set(centerX, 0.02, finishZ + 0.8)
      this.scene.add(finishLine)
      this.trackMarkers.push(finishLine)
    })
  }

  /** Places the camera so the full track (start to finish, all lanes) stays in frame. */
  private fitCameraToTrack(count: number): void {
    const { width, depth } = trackFootprint(count)
    const verticalFov = THREE.MathUtils.degToRad(this.camera.fov)
    const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * this.camera.aspect)

    const distanceForDepth = depth / 2 / Math.tan(verticalFov / 2)
    const distanceForWidth = width / 2 / Math.tan(horizontalFov / 2)
    const distance = Math.max(distanceForDepth, distanceForWidth) * 1.25 + 6

    const elevation = THREE.MathUtils.degToRad(46)
    this.camera.position.set(0, Math.sin(elevation) * distance, -Math.cos(elevation) * distance)
    this.camera.lookAt(0, 0, depth * 0.12)
  }

  private clearDucks(): void {
    this.ducks.forEach((d) => {
      d.mesh.group.remove(d.label)
      this.scene.remove(d.mesh.group)
    })
    this.ducks = []
  }

  private startLoop(): void {
    const tick = () => {
      this.frameId = requestAnimationFrame(tick)
      const dt = this.clock.getDelta()
      const elapsed = this.clock.elapsedTime

      updateWater(this.water, elapsed)

      if (this.mode === 'racing') {
        this.raceElapsed = Math.min(this.raceElapsed + dt, this.raceDuration)
        this.updateRacingDucks(elapsed)
        if (this.raceElapsed >= this.raceDuration && !this.notifiedFinish) {
          this.notifiedFinish = true
          this.options.onFinished?.(this.finishedOrder)
        }
      } else {
        this.updateIdleDucks(elapsed)
      }

      this.renderer.render(this.scene, this.camera)
      this.labelRenderer.render(this.scene, this.camera)
    }
    tick()
  }

  private updateIdleDucks(elapsed: number): void {
    for (const duck of this.ducks) {
      const bob = Math.sin(elapsed * BOB_FREQUENCY + duck.mesh.animationPhase) * BOB_AMPLITUDE
      duck.mesh.group.position.set(duck.lane.x, DUCK_BASE_Y + bob, duck.lane.startZ)
      this.flapWings(duck, elapsed)
    }
  }

  private updateRacingDucks(elapsed: number): void {
    for (const duck of this.ducks) {
      const sample = progressAt(duck.racer.motion, this.raceElapsed)
      const z = THREE.MathUtils.lerp(duck.lane.startZ, duck.lane.finishZ, sample.progress)
      const bob = Math.sin(elapsed * BOB_FREQUENCY + duck.mesh.animationPhase) * BOB_AMPLITUDE
      duck.mesh.group.position.set(duck.lane.x, DUCK_BASE_Y + bob, z)
      this.flapWings(duck, elapsed)

      if (sample.finished && !duck.finishedNotified) {
        duck.finishedNotified = true
        this.finishedOrder.push({
          participantId: duck.racer.participant.id,
          finishTime: duck.racer.motion.finishTime,
        })
      }
    }
  }

  private flapWings(duck: DuckEntry, elapsed: number): void {
    const flap = Math.sin(elapsed * WING_FLAP_FREQUENCY + duck.mesh.animationPhase) * 0.35
    duck.mesh.leftWing.rotation.z = flap
    duck.mesh.rightWing.rotation.z = -flap
  }
}

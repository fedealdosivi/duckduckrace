import * as THREE from 'three'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import type { DuckRacer, FinishOrderEntry, RankEntry } from '@/types/race'
import { progressAt } from '@/utils/raceProgress'
import { computeLaneLayout, trackFootprint, START_X, FINISH_X, type LaneLayout } from './track'
import { createDuckMesh, duckColorForIndex, type DuckMesh } from './duck'
import { createWaterMesh, updateWater } from './water'
import { createLabelRenderer, createNameLabel } from './labels'

/** `idle` = bobbing at the start line, `racing` = animating toward the finish, `finished` = holding the final position. */
export type SceneMode = 'idle' | 'racing' | 'finished'

interface DuckEntry {
  racer: DuckRacer
  mesh: DuckMesh
  label: CSS2DObject
  lane: LaneLayout
  finishedNotified: boolean
  lastX: number
}

export interface RaceSceneOptions {
  onFinished?: (order: FinishOrderEntry[]) => void
  onProgress?: (ranking: RankEntry[]) => void
}

const DUCK_BASE_Y = 0
const BOB_AMPLITUDE = 0.07
const BOB_FREQUENCY = 2.2
const SWIM_WOBBLE_FREQUENCY = 2.9
const SWIM_WOBBLE_AMPLITUDE = 0.1
/** How often live ranking is reported to the UI, in seconds - keeps Vue reactivity cheap during a 50-duck race. */
const PROGRESS_REPORT_INTERVAL = 0.12
/** Ducks are modeled facing +Z; rotate them to face +X, the left-to-right race direction. */
const FACE_TRAVEL_DIRECTION = Math.PI / 2
const CAMERA_FOV = 55
const CAMERA_ELEVATION = THREE.MathUtils.degToRad(30)
/** How quickly the follow-camera catches up to the pack's average position (per frame, not time-based). */
const CAMERA_FOLLOW_SMOOTHING = 0.06

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
  private progressReportClock = 0
  private frameId: number | null = null
  /** Bumped on every `buildRace` call so a slow, superseded load can't stomp on a newer one once it resolves. */
  private buildGeneration = 0

  /** Distance/lookAt-bias are recomputed per race size in `fitCameraToTrack`; focusX is smoothed every frame. */
  private cameraDistance = 20
  private cameraLookAtYBias = 0
  private cameraFocusX = START_X

  constructor(container: HTMLElement, options: RaceSceneOptions = {}) {
    this.container = container
    this.options = options

    this.camera = new THREE.PerspectiveCamera(CAMERA_FOV, container.clientWidth / container.clientHeight, 0.1, 500)

    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(container.clientWidth, container.clientHeight)
    container.appendChild(this.renderer.domElement)

    this.labelRenderer = createLabelRenderer(container)

    this.scene.background = new THREE.Color(0x9fd8ff)
    this.scene.fog = new THREE.Fog(0x9fd8ff, 70, 260)

    const ambient = new THREE.AmbientLight(0xffffff, 0.75)
    const sun = new THREE.DirectionalLight(0xffffff, 0.85)
    sun.position.set(20, 30, 10)
    this.scene.add(ambient, sun)

    this.water = createWaterMesh(320, 320)
    this.water.position.y = -0.05
    this.scene.add(this.water)

    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(container)

    this.startLoop()
  }

  /** Loads/clones the duck model for every racer before touching the scene - safe to call again before a previous call finishes. */
  async buildRace(racers: DuckRacer[], raceDurationSeconds: number): Promise<void> {
    const generation = ++this.buildGeneration

    const layout = computeLaneLayout(racers.length)
    const built = await Promise.all(
      racers.map(async (racer, index) => ({
        racer,
        lane: layout[index],
        mesh: await createDuckMesh(duckColorForIndex(index, racers.length)),
      })),
    )

    // A newer buildRace call started (and possibly already finished) while we were loading - drop this stale result.
    if (generation !== this.buildGeneration) return

    this.clearDucks()
    this.raceDuration = raceDurationSeconds
    this.raceElapsed = 0
    this.finishedOrder = []
    this.notifiedFinish = false
    this.mode = 'idle'

    for (const { racer, lane, mesh } of built) {
      mesh.group.rotation.y = FACE_TRAVEL_DIRECTION
      mesh.group.position.set(START_X, DUCK_BASE_Y, lane.z)
      this.scene.add(mesh.group)

      const label = createNameLabel(racer.participant.name)
      label.position.set(0, 1.55, 0)
      mesh.group.add(label)

      this.ducks.push({ racer, mesh, label, lane, finishedNotified: false, lastX: START_X })
    }

    this.buildTrackMarkers(racers.length)
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
    this.buildGeneration++
    if (this.frameId !== null) cancelAnimationFrame(this.frameId)
    this.resizeObserver.disconnect()
    this.clearDucks()
    this.renderer.dispose()
    this.renderer.domElement.remove()
    this.labelRenderer.domElement.remove()
  }

  private buildTrackMarkers(count: number): void {
    this.trackMarkers.forEach((m) => this.scene.remove(m))
    this.trackMarkers = []

    const { depth } = trackFootprint(count)
    const startMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
    const finishMaterial = new THREE.MeshBasicMaterial({ color: 0xffd23f })

    const startLine = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, depth), startMaterial)
    startLine.position.set(START_X - 0.8, 0.02, 0)
    this.scene.add(startLine)
    this.trackMarkers.push(startLine)

    const finishLine = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, depth), finishMaterial)
    finishLine.position.set(FINISH_X + 0.8, 0.02, 0)
    this.scene.add(finishLine)
    this.trackMarkers.push(finishLine)
  }

  /**
   * Sizes the camera distance to fit every lane (depth) plus a comfortable
   * window of track length (not the whole start-to-finish span) - the camera
   * then pans along X each frame in `updateCameraFollow` to stay tight on the
   * pack instead of zooming out to show the entire track at once.
   *
   * Fits width and depth independently against the camera's rectangular
   * frustum (not a bounding sphere - a sphere fit wastes most of a wide
   * aspect ratio's spare horizontal FOV and pushes the camera much farther
   * back than necessary). The depth term is scaled by sin(elevation) because
   * a flat span on the water only projects that fraction of its length onto
   * the vertical FOV when viewed from an elevated angle.
   */
  private fitCameraToTrack(count: number): void {
    const { windowWidth, depth } = trackFootprint(count)

    const verticalFov = THREE.MathUtils.degToRad(this.camera.fov)
    const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * this.camera.aspect)

    const distanceForWidth = windowWidth / 2 / Math.tan(horizontalFov / 2)
    const distanceForDepth = (depth * Math.sin(CAMERA_ELEVATION)) / 2 / Math.tan(verticalFov / 2)

    this.cameraDistance = Math.max(distanceForWidth, distanceForDepth) + 1.5
    this.cameraLookAtYBias = depth * 0.06
    this.cameraFocusX = START_X
    this.updateCameraFollow(0)
  }

  /** Smoothly pans the camera along X to track the given race progress (0..1), keeping the pack centered. */
  private updateCameraFollow(targetProgress: number): void {
    const targetFocusX = THREE.MathUtils.lerp(START_X, FINISH_X, targetProgress)
    this.cameraFocusX = THREE.MathUtils.lerp(this.cameraFocusX, targetFocusX, CAMERA_FOLLOW_SMOOTHING)
    this.camera.position.set(
      this.cameraFocusX,
      Math.sin(CAMERA_ELEVATION) * this.cameraDistance,
      Math.cos(CAMERA_ELEVATION) * this.cameraDistance,
    )
    // Aim slightly below the water plane so the horizon sits high in frame, emphasizing the track.
    this.camera.lookAt(this.cameraFocusX, -this.cameraLookAtYBias, 0)
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
        const avgProgress = this.updateRacingDucks(elapsed, dt)
        this.updateCameraFollow(avgProgress)
        if (this.raceElapsed >= this.raceDuration && !this.notifiedFinish) {
          this.notifiedFinish = true
          this.options.onFinished?.(this.finishedOrder)
        }
      } else if (this.mode === 'finished') {
        this.updateHeldDucks(elapsed)
        this.updateCameraFollow(1)
      } else {
        this.updateIdleDucks(elapsed)
        this.updateCameraFollow(0)
      }

      this.renderer.render(this.scene, this.camera)
      this.labelRenderer.render(this.scene, this.camera)
    }
    tick()
  }

  private updateIdleDucks(elapsed: number): void {
    for (const duck of this.ducks) {
      const bob = Math.sin(elapsed * BOB_FREQUENCY + duck.mesh.animationPhase) * BOB_AMPLITUDE
      duck.mesh.group.position.set(START_X, DUCK_BASE_Y + bob, duck.lane.z)
      duck.lastX = START_X
      this.applySwimWobble(duck, elapsed)
    }
  }

  private updateHeldDucks(elapsed: number): void {
    for (const duck of this.ducks) {
      const bob = Math.sin(elapsed * BOB_FREQUENCY + duck.mesh.animationPhase) * BOB_AMPLITUDE
      duck.mesh.group.position.set(duck.lastX, DUCK_BASE_Y + bob, duck.lane.z)
      this.applySwimWobble(duck, elapsed)
    }
  }

  private updateRacingDucks(elapsed: number, dt: number): number {
    const ranking: RankEntry[] = []
    let progressSum = 0

    for (const duck of this.ducks) {
      const sample = progressAt(duck.racer.motion, this.raceElapsed)
      const x = THREE.MathUtils.lerp(START_X, FINISH_X, sample.progress)
      const bob = Math.sin(elapsed * BOB_FREQUENCY + duck.mesh.animationPhase) * BOB_AMPLITUDE
      duck.mesh.group.position.set(x, DUCK_BASE_Y + bob, duck.lane.z)
      duck.lastX = x
      this.applySwimWobble(duck, elapsed)

      progressSum += sample.progress
      ranking.push({
        participantId: duck.racer.participant.id,
        name: duck.racer.participant.name,
        progress: sample.progress,
        lane: duck.lane.lane,
      })

      if (sample.finished && !duck.finishedNotified) {
        duck.finishedNotified = true
        this.finishedOrder.push({
          participantId: duck.racer.participant.id,
          finishTime: duck.racer.motion.finishTime,
        })
      }
    }

    this.progressReportClock += dt
    if (this.progressReportClock >= PROGRESS_REPORT_INTERVAL) {
      this.progressReportClock = 0
      this.options.onProgress?.(ranking)
    }

    return this.ducks.length > 0 ? progressSum / this.ducks.length : 0
  }

  /** Gentle side-to-side rock to sell "floating on water" - the model has no separate wing meshes to flap. */
  private applySwimWobble(duck: DuckEntry, elapsed: number): void {
    const roll = Math.sin(elapsed * SWIM_WOBBLE_FREQUENCY + duck.mesh.animationPhase) * SWIM_WOBBLE_AMPLITUDE
    duck.mesh.group.rotation.z = roll
  }
}

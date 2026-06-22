/** Distance ducks travel along X, from the fixed start line to the fixed finish line. */
export const TRACK_LENGTH = 18
export const START_X = -TRACK_LENGTH / 2
export const FINISH_X = TRACK_LENGTH / 2

/**
 * How much of the track's length the camera tries to keep in frame at once.
 * Kept independent of TRACK_LENGTH so the camera stays close to the ducks
 * (it pans to follow the pack) instead of zooming out to fit the whole track.
 */
export const CAMERA_WINDOW = 9

/** Z-distance between adjacent swim lanes - one lane per duck, stacked toward the camera. */
export const LANE_SPACING = 1.7

export interface LaneLayout {
  /** Fixed Z position of this duck's lane (depth). */
  z: number
  lane: number
}

/** Every duck gets its own lane (classic duck-race look); lanes are centered on Z=0. */
export function computeLaneLayout(count: number): LaneLayout[] {
  return Array.from({ length: count }, (_, lane) => ({
    z: (lane - (count - 1) / 2) * LANE_SPACING,
    lane,
  }))
}

export function trackFootprint(count: number): { windowWidth: number; depth: number } {
  return { windowWidth: Math.min(TRACK_LENGTH, CAMERA_WINDOW) + 3, depth: count * LANE_SPACING + 3 }
}

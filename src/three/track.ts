export const TRACK_LENGTH = 38
export const LANE_WIDTH = 2.4
export const ROW_DEPTH = 3.4
const MAX_COLUMNS = 10

export interface LaneLayout {
  /** X position of the lane, centered on the track. */
  x: number
  /** Z position of this lane's start line (finish line is `start + TRACK_LENGTH`). */
  startZ: number
  finishZ: number
  row: number
  col: number
}

/**
 * Arranges N ducks into a centered grid of rows/columns so the scene stays
 * readable from 2 up to 50 participants. Each row is shifted forward in Z for
 * visual depth, but every duck still travels the exact same `TRACK_LENGTH` -
 * the row shift is applied identically to its start and finish line, so it
 * never affects race fairness.
 */
export function computeLaneLayout(count: number): LaneLayout[] {
  const columns = Math.min(MAX_COLUMNS, Math.max(1, Math.ceil(Math.sqrt(count * 1.8))))
  const rows = Math.ceil(count / columns)

  const perRow: number[] = []
  let remaining = count
  for (let r = 0; r < rows; r++) {
    const rowsLeft = rows - r
    const take = Math.ceil(remaining / rowsLeft)
    perRow.push(take)
    remaining -= take
  }

  const layout: LaneLayout[] = []
  for (let row = 0; row < rows; row++) {
    const colsInRow = perRow[row]
    const rowOffset = (row - (rows - 1) / 2) * ROW_DEPTH
    for (let col = 0; col < colsInRow; col++) {
      const x = (col - (colsInRow - 1) / 2) * LANE_WIDTH
      const startZ = -TRACK_LENGTH / 2 + rowOffset
      layout.push({ x, startZ, finishZ: startZ + TRACK_LENGTH, row, col })
    }
  }
  return layout
}

export function trackFootprint(count: number): { width: number; depth: number } {
  const layout = computeLaneLayout(count)
  const xs = layout.map((l) => l.x)
  const width = Math.max(...xs) - Math.min(...xs) + LANE_WIDTH * 2
  const rows = new Set(layout.map((l) => l.row)).size
  const depth = TRACK_LENGTH + rows * ROW_DEPTH
  return { width, depth }
}

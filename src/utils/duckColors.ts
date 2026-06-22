/** Evenly spread hue (0..1) so even 50 ducks stay visually distinct - shared by the Three.js duck material and CSS duck preview icons. */
export function duckHue(index: number, total: number): number {
  return (index / Math.max(total, 1)) % 1
}

export function duckCssColor(index: number, total: number): string {
  return `hsl(${Math.round(duckHue(index, total) * 360)}, 65%, 60%)`
}

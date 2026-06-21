import type { DuckMotionProfile } from '@/types/race'

export interface ProgressSample {
  progress: number
  finished: boolean
}

/** Closed-form integral of `amplitude * sin(2*pi*frequency*u + phase)` from 0 to u. */
function waveIntegral(amplitude: number, frequency: number, phase: number, u: number): number {
  const twoPiF = 2 * Math.PI * frequency
  return (amplitude * (Math.cos(phase) - Math.cos(twoPiF * u + phase))) / twoPiF
}

/** Integral of the duck's speed curve from 0 to normalized time u (0..1). */
function speedIntegral(motion: DuckMotionProfile, u: number): number {
  let total = motion.baseSpeed * u
  for (const wave of motion.waves) {
    total += waveIntegral(wave.amplitude, wave.frequency, wave.phase, u)
  }
  return total
}

/**
 * Position of a duck along the track (0..1) at a given race-clock time.
 * Progress is the duck's own speed-curve integral normalized so it reaches
 * exactly 1 at `motion.finishTime` - this is what guarantees the winner
 * crosses first while every duck's motion still looks organically wobbly.
 */
export function progressAt(motion: DuckMotionProfile, elapsedSeconds: number): ProgressSample {
  if (elapsedSeconds >= motion.finishTime) {
    return { progress: 1, finished: true }
  }
  const u = elapsedSeconds / motion.finishTime
  const traveled = speedIntegral(motion, u)
  const total = speedIntegral(motion, 1)
  return { progress: traveled / total, finished: false }
}

export interface Participant {
  id: string
  name: string
}

/** A single sine wave summed into a duck's speed curve to create wobble/overtakes. */
export interface SpeedWave {
  amplitude: number
  frequency: number
  phase: number
}

/**
 * Deterministic description of how a duck's progress (0..1 along the track)
 * evolves over time. Built once when the race is created; pure functions in
 * `utils/raceProgress.ts` turn this into a position at any elapsed time.
 */
export interface DuckMotionProfile {
  baseSpeed: number
  waves: SpeedWave[]
  /** Race-clock time, in seconds, at which this duck reaches the finish line. */
  finishTime: number
}

export interface DuckRacer {
  participant: Participant
  lane: number
  motion: DuckMotionProfile
}

export interface RaceResult {
  winner: Participant
  racers: DuckRacer[]
  seed: number
  raceDurationSeconds: number
}

export type ScreenName = 'setup' | 'preview' | 'race' | 'results'

export interface FinishOrderEntry {
  participantId: string
  finishTime: number
}

import type { DuckMotionProfile, DuckRacer, Participant, RaceResult } from '@/types/race'
import { createRandomSeed, mulberry32, randomBetween } from './random'

/** Total wall-clock length of the race animation, in seconds. Fixed by spec. */
export const RACE_DURATION_SECONDS = 10

/** The pre-selected winner finishes somewhere in this window, leaving a buffer before the cap. */
const WINNER_FINISH_WINDOW: [number, number] = [7, 8.8]

/** Everyone else finishes this much later than the winner. */
const LOSER_GAP_RANGE: [number, number] = [0.15, 1.8]

/** Hard cap so a straggler never finishes after the race clock runs out. */
const MAX_FINISH_TIME = 9.8

const WAVE_COUNT = 3
const WAVE_AMPLITUDE_RANGE: [number, number] = [0.08, 0.2]
const WAVE_FREQUENCY_RANGE: [number, number] = [0.6, 2.4]

/**
 * Builds a per-duck speed wobble. Amplitudes are kept small enough relative to
 * baseSpeed (1) that instantaneous speed never goes negative, which keeps the
 * progress integral in `raceProgress.ts` monotonic and closed-form.
 */
function buildMotionProfile(rng: () => number, finishTime: number): DuckMotionProfile {
  const waves = Array.from({ length: WAVE_COUNT }, () => ({
    amplitude: randomBetween(rng, ...WAVE_AMPLITUDE_RANGE),
    frequency: randomBetween(rng, ...WAVE_FREQUENCY_RANGE),
    phase: rng() * Math.PI * 2,
  }))
  return { baseSpeed: 1, waves, finishTime }
}

export function pickWinner(participants: Participant[], rng: () => number): Participant {
  const index = Math.floor(rng() * participants.length)
  return participants[index]
}

/**
 * Creates a fully-determined race: the winner is chosen first (fair, uniform
 * pick), then every duck gets a finish time and speed wobble derived from the
 * same seed. Everything after this is pure animation - replaying the same
 * seed always reproduces the same race.
 */
export function createRace(participants: Participant[], seed: number = createRandomSeed()): RaceResult {
  if (participants.length < 2) {
    throw new Error('At least 2 participants are required to start a race')
  }

  const rng = mulberry32(seed)
  const winner = pickWinner(participants, rng)
  const winnerFinishTime = randomBetween(rng, ...WINNER_FINISH_WINDOW)

  const racers: DuckRacer[] = participants.map((participant, lane) => {
    const finishTime =
      participant.id === winner.id
        ? winnerFinishTime
        : Math.min(winnerFinishTime + randomBetween(rng, ...LOSER_GAP_RANGE), MAX_FINISH_TIME)

    return { participant, lane, motion: buildMotionProfile(rng, finishTime) }
  })

  return { winner, racers, seed, raceDurationSeconds: RACE_DURATION_SECONDS }
}

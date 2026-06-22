import type { DuckRacer, FinishOrderEntry, RankEntry } from '@/types/race'

export function startingLineup(racers: DuckRacer[]): RankEntry[] {
  return racers
    .map((r) => ({ participantId: r.participant.id, name: r.participant.name, progress: 0, lane: r.lane }))
    .sort((a, b) => a.lane - b.lane)
}

export function sortByProgressDesc(ranking: RankEntry[]): RankEntry[] {
  return [...ranking].sort((a, b) => b.progress - a.progress)
}

export function finalStandings(racers: DuckRacer[], order: FinishOrderEntry[]): RankEntry[] {
  const infoByParticipant = new Map(racers.map((r) => [r.participant.id, { name: r.participant.name, lane: r.lane }]))
  return [...order]
    .sort((a, b) => a.finishTime - b.finishTime)
    .map((entry) => {
      const info = infoByParticipant.get(entry.participantId)
      return { participantId: entry.participantId, name: info?.name ?? '', progress: 1, lane: info?.lane ?? 0 }
    })
}

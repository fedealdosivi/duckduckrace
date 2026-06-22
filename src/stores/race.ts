import { defineStore } from 'pinia'
import type { ArenaPhase, RaceResult, ScreenName, WinnerHistoryEntry } from '@/types/race'
import { createRace } from '@/utils/raceEngine'
import { useParticipantsStore } from './participants'

export const useRaceStore = defineStore('race', {
  state: () => ({
    screen: 'setup' as ScreenName,
    phase: 'preview' as ArenaPhase,
    currentRace: null as RaceResult | null,
    removeWinnerNextRace: false,
    winnerHistory: [] as WinnerHistoryEntry[],
  }),
  actions: {
    /** Winner + every duck's motion is locked in here, before any animation runs. */
    goToPreview() {
      const participants = useParticipantsStore().participants
      if (participants.length < 2) return
      this.currentRace = createRace(participants)
      this.screen = 'arena'
      this.phase = 'preview'
    },
    backToSetup() {
      this.currentRace = null
      this.screen = 'setup'
      this.phase = 'preview'
    },
    startCountdown() {
      if (this.currentRace) this.phase = 'countdown'
    },
    beginRacing() {
      this.phase = 'racing'
    },
    finishRace() {
      if (this.currentRace) {
        this.winnerHistory.unshift({
          participantId: this.currentRace.winner.id,
          name: this.currentRace.winner.name,
          raceNumber: this.winnerHistory.length + 1,
        })
      }
      this.phase = 'results'
    },
    raceAgain() {
      const participantsStore = useParticipantsStore()
      if (this.removeWinnerNextRace && this.currentRace) {
        participantsStore.remove(this.currentRace.winner.id)
      }
      if (!participantsStore.canRace) {
        this.backToSetup()
        return
      }
      this.currentRace = createRace(participantsStore.participants)
      this.phase = 'preview'
    },
    editNames() {
      this.currentRace = null
      this.screen = 'setup'
      this.phase = 'preview'
    },
  },
})

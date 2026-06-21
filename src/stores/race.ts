import { defineStore } from 'pinia'
import type { RaceResult, ScreenName } from '@/types/race'
import { createRace } from '@/utils/raceEngine'
import { useParticipantsStore } from './participants'

export const useRaceStore = defineStore('race', {
  state: () => ({
    screen: 'setup' as ScreenName,
    currentRace: null as RaceResult | null,
    removeWinnerNextRace: false,
  }),
  actions: {
    /** Winner + every duck's motion is locked in here, before any animation runs. */
    goToPreview() {
      const participants = useParticipantsStore().participants
      if (participants.length < 2) return
      this.currentRace = createRace(participants)
      this.screen = 'preview'
    },
    backToSetup() {
      this.currentRace = null
      this.screen = 'setup'
    },
    startRace() {
      if (this.currentRace) this.screen = 'race'
    },
    finishRace() {
      this.screen = 'results'
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
      this.screen = 'preview'
    },
    editNames() {
      this.currentRace = null
      this.screen = 'setup'
    },
  },
})

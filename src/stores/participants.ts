import { defineStore } from 'pinia'
import type { Participant } from '@/types/race'

let counter = 0
function makeId(): string {
  counter += 1
  return `p-${Date.now()}-${counter}`
}

export const useParticipantsStore = defineStore('participants', {
  state: () => ({
    participants: [] as Participant[],
  }),
  getters: {
    count: (state) => state.participants.length,
    canRace: (state) => state.participants.length >= 2,
  },
  actions: {
    add(name: string) {
      const trimmed = name.trim()
      if (!trimmed) return
      this.participants.push({ id: makeId(), name: trimmed })
    },
    /** Splits pasted, newline-separated text into multiple participants at once. */
    addMany(rawText: string) {
      rawText
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .forEach((name) => this.add(name))
    },
    rename(id: string, name: string) {
      const participant = this.participants.find((p) => p.id === id)
      if (participant && name.trim()) participant.name = name.trim()
    },
    remove(id: string) {
      this.participants = this.participants.filter((p) => p.id !== id)
    },
    clear() {
      this.participants = []
    },
  },
})

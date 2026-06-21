<script setup lang="ts">
import { computed } from 'vue'
import { useParticipantsStore } from '@/stores/participants'
import { useRaceStore } from '@/stores/race'
import ParticipantInput from './ParticipantInput.vue'
import ParticipantList from './ParticipantList.vue'
import AppButton from '@/components/common/AppButton.vue'

const participantsStore = useParticipantsStore()
const raceStore = useRaceStore()

const canRace = computed(() => participantsStore.canRace)
</script>

<template>
  <section class="setup-screen">
    <header class="hero">
      <h1>🦆 Duck Duck Race</h1>
      <p class="subtitle">Add your participants, then let the ducks decide a winner!</p>
    </header>

    <div class="card">
      <ParticipantInput />
      <hr />
      <ParticipantList />
    </div>

    <footer class="actions">
      <p v-if="!canRace" class="hint">Add at least 2 participants to start a race.</p>
      <AppButton :disabled="!canRace" @click="raceStore.goToPreview()">🏁 Play Race</AppButton>
    </footer>
  </section>
</template>

<style scoped>
.setup-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem 1.25rem 3rem;
  max-width: 38rem;
  margin: 0 auto;
  width: 100%;
}

.hero {
  text-align: center;
}

.hero h1 {
  font-size: clamp(1.8rem, 5vw, 2.6rem);
  color: var(--color-text);
}

.subtitle {
  color: var(--color-text-muted);
  margin-top: 0.4rem;
}

.card {
  background: var(--color-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow-soft);
  padding: 1.5rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.card hr {
  border: none;
  border-top: 1px solid var(--color-border);
  width: 100%;
  margin: 0;
}

.actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
}

.hint {
  color: var(--color-text-muted);
  font-size: 0.9rem;
}
</style>

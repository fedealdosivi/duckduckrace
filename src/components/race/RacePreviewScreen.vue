<script setup lang="ts">
import { computed } from 'vue'
import { useRaceStore } from '@/stores/race'
import RaceTrack3D from './RaceTrack3D.vue'
import AppButton from '@/components/common/AppButton.vue'

const raceStore = useRaceStore()
const race = computed(() => raceStore.currentRace)
</script>

<template>
  <section v-if="race" class="preview-screen">
    <header class="bar">
      <h2>Ready, set… 🦆</h2>
      <p>{{ race.racers.length }} ducks lined up at the start line.</p>
    </header>

    <div class="stage">
      <RaceTrack3D :racers="race.racers" mode="idle" :race-duration-seconds="race.raceDurationSeconds" />
    </div>

    <footer class="actions">
      <AppButton variant="ghost" @click="raceStore.backToSetup()">← Back</AppButton>
      <AppButton @click="raceStore.startRace()">Start Race 🏁</AppButton>
    </footer>
  </section>
</template>

<style scoped>
.preview-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.25rem;
  gap: 1rem;
  min-height: 0;
}

.bar {
  text-align: center;
}

.bar h2 {
  font-size: 1.5rem;
}

.bar p {
  color: var(--color-text-muted);
  margin-top: 0.25rem;
}

.stage {
  flex: 1;
  min-height: 18rem;
  border-radius: var(--radius);
  box-shadow: var(--shadow-soft);
  overflow: hidden;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}
</style>

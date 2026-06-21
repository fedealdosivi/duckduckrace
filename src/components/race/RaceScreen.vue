<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRaceStore } from '@/stores/race'
import RaceTrack3D from './RaceTrack3D.vue'
import CountdownOverlay from './CountdownOverlay.vue'
import type { SceneMode } from '@/three/sceneManager'

const raceStore = useRaceStore()
const race = computed(() => raceStore.currentRace)
const countdownDone = ref(false)

const mode = computed<SceneMode>(() => (countdownDone.value ? 'racing' : 'idle'))

function onCountdownComplete() {
  countdownDone.value = true
}

function onFinished() {
  raceStore.finishRace()
}
</script>

<template>
  <section v-if="race" class="race-screen">
    <div class="stage">
      <RaceTrack3D
        :racers="race.racers"
        :mode="mode"
        :race-duration-seconds="race.raceDurationSeconds"
        @finished="onFinished"
      />
      <CountdownOverlay v-if="!countdownDone" @complete="onCountdownComplete" />
    </div>
  </section>
</template>

<style scoped>
.race-screen {
  flex: 1;
  display: flex;
  padding: 1.25rem;
  min-height: 0;
}

.stage {
  position: relative;
  flex: 1;
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow-soft);
}
</style>

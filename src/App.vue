<script setup lang="ts">
import { computed } from 'vue'
import { useRaceStore } from '@/stores/race'
import SetupScreen from '@/components/setup/SetupScreen.vue'
import RacePreviewScreen from '@/components/race/RacePreviewScreen.vue'
import RaceScreen from '@/components/race/RaceScreen.vue'
import ResultsScreen from '@/components/results/ResultsScreen.vue'

const raceStore = useRaceStore()
const screen = computed(() => raceStore.screen)
</script>

<template>
  <main class="app-shell">
    <SetupScreen v-if="screen === 'setup'" />
    <RacePreviewScreen v-else-if="screen === 'preview'" />
    <RaceScreen v-else-if="screen === 'race'" />
    <ResultsScreen v-else-if="screen === 'results'" />
  </main>
</template>

<style scoped>
.app-shell {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
</style>

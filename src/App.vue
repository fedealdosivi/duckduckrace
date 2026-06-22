<script setup lang="ts">
import { computed } from 'vue'
import { useRaceStore } from '@/stores/race'
import HomeScreen from '@/components/home/HomeScreen.vue'
import ArenaScreen from '@/components/arena/ArenaScreen.vue'

const raceStore = useRaceStore()
const screen = computed(() => raceStore.screen)
</script>

<template>
  <main class="app-shell">
    <HomeScreen v-if="screen === 'setup'" />
    <ArenaScreen v-else-if="screen === 'arena'" />
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

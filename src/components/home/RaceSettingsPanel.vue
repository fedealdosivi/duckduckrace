<script setup lang="ts">
import { useRaceStore } from '@/stores/race'

const raceStore = useRaceStore()
</script>

<template>
  <div class="race-settings">
    <div class="setting-row">
      <span>Race duration</span>
      <strong>10s</strong>
    </div>
    <label class="setting-row toggle">
      <span>Remove winner from next race</span>
      <input v-model="raceStore.removeWinnerNextRace" type="checkbox" />
    </label>
  </div>
</template>

<style scoped>
.race-settings {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--fs-sm);
  gap: var(--space-sm);
}

.toggle {
  cursor: pointer;
}

.toggle input {
  width: 1.2rem;
  height: 1.2rem;
  accent-color: var(--color-primary);
}
</style>

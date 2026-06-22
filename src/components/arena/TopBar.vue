<script setup lang="ts">
import { computed } from 'vue'
import type { ArenaPhase } from '@/types/race'
import SettingsPopover from './SettingsPopover.vue'

const props = defineProps<{ phase: ArenaPhase; timerSeconds: number; durationSeconds: number }>()

const statusText = computed(() => {
  switch (props.phase) {
    case 'preview':
      return '🦆 Ready when you are'
    case 'countdown':
      return '⏳ Get ready…'
    case 'racing':
      return `🏁 Racing… ${Math.max(0, Math.ceil(props.durationSeconds - props.timerSeconds))}s left`
    case 'results':
      return '🏆 Race finished!'
    default:
      return ''
  }
})
</script>

<template>
  <header class="top-bar glass-surface">
    <span class="logo">🦆 Duck Duck Race</span>
    <span class="status">{{ statusText }}</span>
    <SettingsPopover />
  </header>
</template>

<style scoped>
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-md);
}

.logo {
  font-weight: 800;
  font-size: var(--fs-base);
  flex-shrink: 0;
  white-space: nowrap;
}

.status {
  font-weight: 600;
  font-size: var(--fs-sm);
  color: var(--color-text-muted);
  text-align: center;
  flex: 1;
}
</style>

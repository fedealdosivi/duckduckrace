<script setup lang="ts">
import { computed } from 'vue'
import { useParticipantsStore } from '@/stores/participants'

const store = useParticipantsStore()
const ready = computed(() => store.canRace)
const statusText = computed(() => (ready.value ? 'Ready to race' : `Need ${Math.max(0, 2 - store.count)} more`))
</script>

<template>
  <div class="participant-counter glass-surface">
    <span class="count">{{ store.count }}</span>
    <span class="label">{{ store.count === 1 ? 'participant' : 'participants' }}</span>
    <span class="status" :class="{ ready }">{{ statusText }}</span>
  </div>
</template>

<style scoped>
.participant-counter {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-sm);
  text-align: center;
}

.count {
  font-size: var(--fs-xl);
  font-weight: 800;
  color: var(--color-primary-dark);
  line-height: 1;
}

.label {
  font-size: var(--fs-sm);
  color: var(--color-text-muted);
}

.status {
  margin-top: var(--space-xs);
  font-size: var(--fs-xs);
  font-weight: 700;
  color: var(--color-danger);
}

.status.ready {
  color: var(--color-secondary);
}
</style>

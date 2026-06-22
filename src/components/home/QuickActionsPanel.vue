<script setup lang="ts">
import { useParticipantsStore } from '@/stores/participants'
import AppButton from '@/components/common/AppButton.vue'

const store = useParticipantsStore()
</script>

<template>
  <div class="quick-actions">
    <AppButton variant="ghost" :disabled="store.count < 2" @click="store.shuffle()">🔀 Shuffle Lanes</AppButton>
    <AppButton variant="ghost" :disabled="store.count === 0" @click="store.clear()">🗑️ Clear All</AppButton>
  </div>
</template>

<style scoped>
.quick-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.quick-actions :deep(.app-button) {
  width: 100%;
  text-align: center;
}
</style>

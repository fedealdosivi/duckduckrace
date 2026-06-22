<script setup lang="ts">
import { useParticipantsStore } from '@/stores/participants'
import { duckCssColor } from '@/utils/duckColors'

const store = useParticipantsStore()
</script>

<template>
  <div class="duck-preview-strip" role="list">
    <p v-if="store.count === 0" class="empty">Your ducks will line up here…</p>
    <div v-for="(p, i) in store.participants" :key="p.id" class="duck-chip" role="listitem">
      <span class="duck-icon" :style="{ background: duckCssColor(i, store.participants.length) }"></span>
      <span class="duck-name">{{ p.name }}</span>
    </div>
  </div>
</template>

<style scoped>
.duck-preview-strip {
  display: flex;
  gap: var(--space-sm);
  overflow-x: auto;
  padding: var(--space-xs) 0;
  scrollbar-width: thin;
  flex: 1;
  min-width: 0;
  align-items: center;
}

.duck-chip {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: #fff;
  border: 2px solid var(--color-border);
  border-radius: 999px;
  padding: 0.3rem 0.7rem 0.3rem 0.3rem;
  flex-shrink: 0;
}

.duck-icon {
  width: 1.4rem;
  height: 1.4rem;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: inset 0 -2px 3px rgba(0, 0, 0, 0.15);
}

.duck-name {
  font-size: var(--fs-sm);
  font-weight: 600;
  white-space: nowrap;
}

.empty {
  color: var(--color-text-muted);
  font-style: italic;
  font-size: var(--fs-sm);
  margin: 0;
}
</style>

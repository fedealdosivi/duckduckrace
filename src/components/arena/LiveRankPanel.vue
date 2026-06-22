<script setup lang="ts">
import type { RankEntry } from '@/types/race'

defineProps<{
  title: string
  ranking: RankEntry[]
}>()
</script>

<template>
  <div class="live-rank-panel glass-surface">
    <h3>{{ title }}</h3>
    <Transition name="rank-slide" mode="out-in">
      <ol :key="title" class="rank-list">
        <li v-for="(entry, index) in ranking" :key="entry.participantId" class="rank-row">
          <span class="rank-position" :class="{ first: index === 0 }">{{ index + 1 }}</span>
          <span class="rank-name">{{ entry.name }}</span>
          <span class="rank-bar"><span class="rank-bar-fill" :style="{ width: `${entry.progress * 100}%` }"></span></span>
        </li>
      </ol>
    </Transition>
  </div>
</template>

<style scoped>
.live-rank-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: var(--space-md);
  gap: var(--space-sm);
  min-height: 0;
  overflow: hidden;
}

.live-rank-panel h3 {
  font-size: var(--fs-md);
  flex-shrink: 0;
}

.rank-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  overflow-y: auto;
  min-height: 0;
}

.rank-row {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto auto;
  align-items: center;
  gap: 0 var(--space-xs);
  font-size: var(--fs-sm);
}

.rank-position {
  width: 1.4rem;
  height: 1.4rem;
  border-radius: 50%;
  background: var(--color-border);
  color: var(--color-text);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: var(--fs-xs);
  grid-row: 1 / 3;
}

.rank-position.first {
  background: var(--color-primary);
  color: #fff;
}

.rank-name {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rank-bar {
  height: 0.3rem;
  background: var(--color-border);
  border-radius: 999px;
  overflow: hidden;
}

.rank-bar-fill {
  display: block;
  height: 100%;
  background: var(--color-secondary);
  transition: width 0.12s linear;
}

.rank-slide-enter-active {
  transition:
    transform 0.35s ease,
    opacity 0.35s ease;
}

.rank-slide-enter-from {
  transform: translateX(24px);
  opacity: 0;
}
</style>

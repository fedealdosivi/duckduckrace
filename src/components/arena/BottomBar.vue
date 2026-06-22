<script setup lang="ts">
import { computed } from 'vue'
import type { ArenaPhase, RaceResult, WinnerHistoryEntry } from '@/types/race'
import GlassCard from '@/components/common/GlassCard.vue'
import AppButton from '@/components/common/AppButton.vue'

const props = defineProps<{
  phase: ArenaPhase
  race: RaceResult | null
  winnerHistory: WinnerHistoryEntry[]
}>()

const emit = defineEmits<{ start: []; back: []; shuffle: []; editNames: [] }>()

const isRacingPhase = computed(() => props.phase === 'countdown' || props.phase === 'racing')
</script>

<template>
  <div class="bottom-bar">
    <Transition name="collapse" mode="out-in">
      <div v-if="isRacingPhase" key="slim" class="slim-strip glass-surface">
        <span>🦆 Sit back and watch the race!</span>
      </div>
      <div v-else key="full" class="full-grid">
        <GlassCard title="Participants" icon="👥" class="panel">
          <ul class="mini-list">
            <li v-for="r in race?.racers ?? []" :key="r.participant.id">
              <span class="lane-no">{{ r.lane + 1 }}</span>{{ r.participant.name }}
            </li>
          </ul>
        </GlassCard>

        <GlassCard title="Controls" icon="🎮" class="panel">
          <div v-if="phase === 'preview'" class="control-actions">
            <AppButton variant="ghost" @click="emit('back')">← Back</AppButton>
            <AppButton @click="emit('start')">Start Race 🏁</AppButton>
          </div>
          <p v-else class="hint">🏆 Check the winner above to race again.</p>
        </GlassCard>

        <GlassCard title="Actions" icon="⚡" class="panel">
          <div class="control-actions">
            <AppButton variant="ghost" :disabled="phase !== 'preview'" @click="emit('shuffle')">🔀 Shuffle</AppButton>
            <AppButton variant="ghost" @click="emit('editNames')">✏️ Edit Names</AppButton>
          </div>
        </GlassCard>

        <GlassCard title="Winner History" icon="📜" class="panel">
          <p v-if="winnerHistory.length === 0" class="hint">No races yet.</p>
          <ul v-else class="mini-list">
            <li v-for="entry in winnerHistory" :key="entry.raceNumber">
              <span class="lane-no">#{{ entry.raceNumber }}</span>{{ entry.name }}
            </li>
          </ul>
        </GlassCard>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.bottom-bar {
  min-height: 0;
}

.slim-strip {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-sm);
  font-size: var(--fs-sm);
  font-weight: 600;
  color: var(--color-text-muted);
}

.full-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md);
}

.panel {
  min-height: 0;
  max-height: clamp(8rem, 18vh, 12rem);
}

.mini-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  overflow-y: auto;
  min-height: 0;
  font-size: var(--fs-sm);
}

.lane-no {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.3rem;
  height: 1.3rem;
  border-radius: 50%;
  background: var(--color-border);
  font-size: var(--fs-xs);
  font-weight: 700;
  margin-right: 0.4rem;
}

.control-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.hint {
  color: var(--color-text-muted);
  font-size: var(--fs-sm);
  margin: 0;
}

.collapse-enter-active,
.collapse-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

@media (max-width: 860px) {
  .full-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 540px) {
  .full-grid {
    grid-template-columns: 1fr;
  }
}
</style>

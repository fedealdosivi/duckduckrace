<script setup lang="ts">
import { computed } from 'vue'
import { useParticipantsStore } from '@/stores/participants'
import { useRaceStore } from '@/stores/race'
import HeroBanner from './HeroBanner.vue'
import ParticipantCounter from './ParticipantCounter.vue'
import RaceSettingsPanel from './RaceSettingsPanel.vue'
import QuickActionsPanel from './QuickActionsPanel.vue'
import DuckPreviewStrip from './DuckPreviewStrip.vue'
import ParticipantInput from '@/components/setup/ParticipantInput.vue'
import ParticipantList from '@/components/setup/ParticipantList.vue'
import GlassCard from '@/components/common/GlassCard.vue'
import CollapsibleCard from '@/components/common/CollapsibleCard.vue'
import AppButton from '@/components/common/AppButton.vue'

const participantsStore = useParticipantsStore()
const raceStore = useRaceStore()
const canRace = computed(() => participantsStore.canRace)
</script>

<template>
  <section class="home-screen">
    <div class="cell hero"><HeroBanner /></div>
    <div class="cell counter"><ParticipantCounter /></div>

    <GlassCard class="cell input-card" title="Participants" icon="📝">
      <ParticipantInput />
      <hr />
      <ParticipantList />
    </GlassCard>

    <div class="cell side">
      <CollapsibleCard title="Race Settings" icon="⚙️">
        <RaceSettingsPanel />
      </CollapsibleCard>
      <CollapsibleCard title="Quick Actions" icon="⚡">
        <QuickActionsPanel />
      </CollapsibleCard>
    </div>

    <div class="cell preview-row glass-surface">
      <DuckPreviewStrip />
      <AppButton class="cta" :disabled="!canRace" @click="raceStore.goToPreview()">🏁 Play Race</AppButton>
    </div>
  </section>
</template>

<style scoped>
.home-screen {
  flex: 1;
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    'hero counter'
    'input side'
    'preview preview';
  gap: var(--space-md);
  padding: var(--space-lg);
  min-height: 0;
  overflow: hidden;
}

.hero {
  grid-area: hero;
}

.counter {
  grid-area: counter;
}

.input-card {
  grid-area: input;
  min-height: 0;
  overflow: hidden;
}

.input-card hr {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 0;
}

.side {
  grid-area: side;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  min-height: 0;
  overflow-y: auto;
}

.preview-row {
  grid-area: preview;
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-md);
}

.cta {
  flex-shrink: 0;
  white-space: nowrap;
}

@media (max-width: 860px) {
  .home-screen {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto auto auto;
    grid-template-areas:
      'hero'
      'counter'
      'input'
      'side'
      'preview';
    overflow-y: auto;
  }

  .preview-row {
    flex-direction: column;
    align-items: stretch;
  }

  .cta {
    width: 100%;
  }
}
</style>

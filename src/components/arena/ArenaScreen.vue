<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { useParticipantsStore } from '@/stores/participants'
import { useRaceStore } from '@/stores/race'
import type { FinishOrderEntry, RankEntry } from '@/types/race'
import { finalStandings, sortByProgressDesc, startingLineup } from '@/utils/ranking'
import RaceTrack3D from '@/components/race/RaceTrack3D.vue'
import CountdownOverlay from '@/components/race/CountdownOverlay.vue'
import WinnerModal from '@/components/results/WinnerModal.vue'
import TopBar from './TopBar.vue'
import LiveRankPanel from './LiveRankPanel.vue'
import BottomBar from './BottomBar.vue'
import type { SceneMode } from '@/three/sceneManager'

const participantsStore = useParticipantsStore()
const raceStore = useRaceStore()

const race = computed(() => raceStore.currentRace)
const phase = computed(() => raceStore.phase)

const sceneMode = computed<SceneMode>(() => {
  if (phase.value === 'racing') return 'racing'
  if (phase.value === 'results') return 'finished'
  return 'idle'
})

const rankTitle = computed(() => {
  switch (phase.value) {
    case 'racing':
      return 'Live Standings'
    case 'results':
      return 'Final Results'
    default:
      return 'Starting Lineup'
  }
})

const liveRanking = ref<RankEntry[]>([])
watch(
  race,
  (next) => {
    liveRanking.value = next ? startingLineup(next.racers) : []
  },
  { immediate: true },
)

const raceTimerSeconds = ref(0)
let timerHandle: ReturnType<typeof setInterval> | null = null

watch(phase, (next) => {
  if (next === 'racing') {
    raceTimerSeconds.value = 0
    timerHandle = setInterval(() => {
      raceTimerSeconds.value += 0.1
    }, 100)
  } else if (timerHandle) {
    clearInterval(timerHandle)
    timerHandle = null
  }
})

onUnmounted(() => {
  if (timerHandle) clearInterval(timerHandle)
})

function onCountdownComplete() {
  raceStore.beginRacing()
}

function onProgress(ranking: RankEntry[]) {
  liveRanking.value = sortByProgressDesc(ranking)
}

function onFinished(order: FinishOrderEntry[]) {
  if (race.value) liveRanking.value = finalStandings(race.value.racers, order)
  raceStore.finishRace()
}

function onShuffle() {
  participantsStore.shuffle()
  raceStore.goToPreview()
}

const rankPanelOpen = ref(false)
const bottomSheetOpen = ref(false)
</script>

<template>
  <section v-if="race" class="arena-screen">
    <TopBar
      class="cell topbar-cell"
      :phase="phase"
      :timer-seconds="raceTimerSeconds"
      :duration-seconds="race.raceDurationSeconds"
    />

    <div class="cell canvas-cell">
      <RaceTrack3D
        :racers="race.racers"
        :mode="sceneMode"
        :race-duration-seconds="race.raceDurationSeconds"
        @progress="onProgress"
        @finished="onFinished"
      />
      <CountdownOverlay v-if="phase === 'countdown'" @complete="onCountdownComplete" />
      <WinnerModal v-if="phase === 'results'" :winner="race.winner" />
    </div>

    <button class="rank-toggle" type="button" aria-label="Toggle standings" @click="rankPanelOpen = !rankPanelOpen">
      🏆
    </button>
    <div class="cell rank-cell" :class="{ 'is-open': rankPanelOpen }">
      <LiveRankPanel :title="rankTitle" :ranking="liveRanking" />
    </div>

    <button
      class="bottom-sheet-toggle"
      type="button"
      aria-label="Toggle race controls"
      @click="bottomSheetOpen = !bottomSheetOpen"
    >
      ☰ Controls
    </button>
    <div class="cell bottom-cell" :class="{ 'is-open': bottomSheetOpen }">
      <BottomBar
        :phase="phase"
        :race="race"
        :winner-history="raceStore.winnerHistory"
        @start="raceStore.startCountdown()"
        @back="raceStore.backToSetup()"
        @shuffle="onShuffle"
        @edit-names="raceStore.editNames()"
      />
    </div>
  </section>
</template>

<style scoped>
.arena-screen {
  container: arena / inline-size;
  flex: 1;
  display: grid;
  grid-template-columns: 3fr 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    'topbar topbar'
    'canvas rank'
    'bottom bottom';
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg) var(--space-lg);
  min-height: 0;
  position: relative;
}

.topbar-cell {
  grid-area: topbar;
}

.canvas-cell {
  grid-area: canvas;
  position: relative;
  min-height: 0;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-soft);
}

.rank-cell {
  grid-area: rank;
  min-height: 0;
}

.bottom-cell {
  grid-area: bottom;
}

.rank-toggle,
.bottom-sheet-toggle {
  display: none;
}

/* Tablet: the live-rank column becomes a floating panel toggled by a button over the canvas. */
@container arena (max-width: 960px) {
  .arena-screen {
    grid-template-columns: 1fr;
    grid-template-areas:
      'topbar'
      'canvas'
      'bottom';
  }

  .rank-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    z-index: 15;
    top: calc(var(--space-md) + 3.5rem);
    right: calc(var(--space-lg) + var(--space-sm));
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 50%;
    border: none;
    background: var(--color-primary);
    color: #fff;
    font-size: var(--fs-md);
    box-shadow: var(--shadow-soft);
  }

  .rank-cell {
    position: absolute;
    z-index: 14;
    top: calc(var(--space-md) + 6.5rem);
    right: var(--space-lg);
    bottom: calc(var(--space-lg) + 4.5rem);
    width: min(18rem, 80vw);
    transform: translateX(120%);
    transition: transform 0.3s ease;
  }

  .rank-cell.is-open {
    transform: translateX(0);
  }
}

/* Mobile: the controls bottom bar becomes a bottom sheet toggled by a button. */
@container arena (max-width: 640px) {
  .bottom-sheet-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-xs);
    position: absolute;
    z-index: 15;
    left: 50%;
    bottom: var(--space-lg);
    transform: translateX(-50%);
    border: none;
    border-radius: 999px;
    padding: 0.6rem 1.2rem;
    background: var(--color-text);
    color: #fff;
    font-weight: 700;
    font-size: var(--fs-sm);
    box-shadow: var(--shadow-soft);
  }

  .bottom-cell {
    position: fixed;
    z-index: 16;
    left: var(--space-sm);
    right: var(--space-sm);
    bottom: var(--space-sm);
    max-height: 70dvh;
    overflow-y: auto;
    transform: translateY(110%);
    transition: transform 0.3s ease;
  }

  .bottom-cell.is-open {
    transform: translateY(0);
  }
}

/* Portrait phones: keep the race itself wide/cinematic instead of stretching it tall. */
@media (orientation: portrait) and (max-width: 640px) {
  .canvas-cell {
    aspect-ratio: 16 / 9;
    max-height: 52dvh;
    flex: none;
  }

  .arena-screen {
    grid-template-rows: auto auto 1fr;
  }
}
</style>

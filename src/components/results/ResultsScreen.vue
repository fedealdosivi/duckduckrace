<script setup lang="ts">
import { useRaceStore } from '@/stores/race'
import AppButton from '@/components/common/AppButton.vue'

const raceStore = useRaceStore()
</script>

<template>
  <section v-if="raceStore.currentRace" class="results-screen">
    <div class="confetti" aria-hidden="true">
      <span v-for="n in 24" :key="n" class="piece" :style="{ '--i': n }"></span>
    </div>

    <div class="card">
      <p class="label">🏆 Winner</p>
      <h1 class="winner-name">{{ raceStore.currentRace.winner.name }}</h1>
      <p class="congrats">crossed the finish line first!</p>

      <label class="checkbox-row">
        <input v-model="raceStore.removeWinnerNextRace" type="checkbox" />
        Remove winner from next race
      </label>

      <div class="actions">
        <AppButton variant="ghost" @click="raceStore.editNames()">Edit Names</AppButton>
        <AppButton @click="raceStore.raceAgain()">Race Again 🔁</AppButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.results-screen {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.25rem;
  overflow: hidden;
}

.confetti {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.piece {
  position: absolute;
  top: -10%;
  width: 10px;
  height: 16px;
  left: calc(var(--i) * 4.2%);
  background: hsl(calc(var(--i) * 37), 80%, 60%);
  opacity: 0.85;
  border-radius: 2px;
  animation: fall 3.2s linear infinite;
  animation-delay: calc(var(--i) * -0.13s);
}

@keyframes fall {
  0% {
    transform: translateY(0) rotate(0deg);
  }
  100% {
    transform: translateY(110vh) rotate(360deg);
  }
}

.card {
  position: relative;
  z-index: 1;
  background: var(--color-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow-soft);
  padding: 2.5rem 2rem;
  text-align: center;
  max-width: 28rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.label {
  font-weight: 700;
  color: var(--color-text-muted);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  font-size: 0.85rem;
}

.winner-name {
  font-size: clamp(2rem, 6vw, 3rem);
  color: var(--color-primary-dark);
}

.congrats {
  color: var(--color-text-muted);
}

.checkbox-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: var(--color-text-muted);
}

.actions {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}
</style>

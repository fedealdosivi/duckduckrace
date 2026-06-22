<script setup lang="ts">
import type { Participant } from '@/types/race'
import { useRaceStore } from '@/stores/race'
import AppButton from '@/components/common/AppButton.vue'

defineProps<{ winner: Participant }>()
const raceStore = useRaceStore()
</script>

<template>
  <Transition name="modal-pop" appear>
    <div class="winner-modal-backdrop">
      <div class="confetti" aria-hidden="true">
        <span v-for="n in 24" :key="n" class="piece" :style="{ '--i': n }"></span>
      </div>
      <div class="winner-modal glass-surface glass-surface--strong">
        <p class="label">🏆 Winner</p>
        <h2 class="winner-name">{{ winner.name }}</h2>
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
    </div>
  </Transition>
</template>

<style scoped>
.winner-modal-backdrop {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(10, 30, 50, 0.25);
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

.winner-modal {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: min(26rem, 86vw);
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-lg);
}

.label {
  font-weight: 700;
  color: var(--color-text-muted);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  font-size: var(--fs-xs);
  margin: 0;
}

.winner-name {
  font-size: var(--fs-xl);
  color: var(--color-primary-dark);
}

.congrats {
  color: var(--color-text-muted);
  margin: 0;
  font-size: var(--fs-sm);
}

.checkbox-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--fs-sm);
  color: var(--color-text-muted);
}

.actions {
  display: flex;
  gap: var(--space-md);
  margin-top: var(--space-xs);
  flex-wrap: wrap;
  justify-content: center;
}

.modal-pop-enter-active {
  transition: opacity 0.25s ease;
}

.modal-pop-enter-from {
  opacity: 0;
}

.modal-pop-enter-active .winner-modal {
  transition:
    transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.3s ease;
}

.modal-pop-enter-from .winner-modal {
  transform: scale(0.85) translateY(12px);
  opacity: 0;
}
</style>

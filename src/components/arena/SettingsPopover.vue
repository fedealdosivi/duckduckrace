<script setup lang="ts">
import { ref } from 'vue'
import { onClickOutside } from '@/composables/onClickOutside'
import RaceSettingsPanel from '@/components/home/RaceSettingsPanel.vue'

const open = ref(false)
const root = ref<HTMLElement | null>(null)
onClickOutside(root, () => (open.value = false))
</script>

<template>
  <div ref="root" class="settings-popover">
    <button class="settings-btn" type="button" aria-label="Settings" @click="open = !open">⚙️</button>
    <Transition name="pop">
      <div v-if="open" class="popover-panel">
        <h4>Settings</h4>
        <RaceSettingsPanel />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.settings-popover {
  position: relative;
}

.settings-btn {
  background: none;
  border: none;
  font-size: var(--fs-lg);
  line-height: 1;
  padding: var(--space-xs);
  border-radius: 50%;
}

.settings-btn:hover {
  background: rgba(0, 0, 0, 0.06);
}

.popover-panel {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  width: min(16rem, 80vw);
  padding: var(--space-md);
  z-index: 50;
  /* Solid (not glass) - this sits over other glass panels and must stay fully legible. */
  background: #ffffff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-soft);
}

.popover-panel h4 {
  margin: 0 0 var(--space-sm);
  font-size: var(--fs-base);
}

.pop-enter-active,
.pop-leave-active {
  transition:
    transform 0.15s ease,
    opacity 0.15s ease;
}

.pop-enter-from,
.pop-leave-to {
  transform: scale(0.95) translateY(-4px);
  opacity: 0;
}
</style>

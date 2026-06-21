<script setup lang="ts">
import { onMounted, ref } from 'vue'

const emit = defineEmits<{ complete: [] }>()

type Step = '3' | '2' | '1' | 'GO!'
const sequence: Array<{ value: Step; duration: number }> = [
  { value: '3', duration: 800 },
  { value: '2', duration: 800 },
  { value: '1', duration: 800 },
  { value: 'GO!', duration: 700 },
]

const display = ref<Step>(sequence[0].value)

onMounted(() => {
  let i = 0
  const step = () => {
    setTimeout(() => {
      i += 1
      if (i < sequence.length) {
        display.value = sequence[i].value
        step()
      } else {
        emit('complete')
      }
    }, sequence[i].duration)
  }
  step()
})
</script>

<template>
  <div class="countdown-overlay">
    <span :key="display" class="count" :class="{ go: display === 'GO!' }">{{ display }}</span>
  </div>
</template>

<style scoped>
.countdown-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 10;
}

.count {
  font-size: 7rem;
  font-weight: 900;
  color: #fff;
  text-shadow: 0 4px 18px rgba(0, 0, 0, 0.35);
  animation: pop 0.4s ease;
}

.count.go {
  color: var(--color-primary);
}

@keyframes pop {
  from {
    transform: scale(0.4);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>

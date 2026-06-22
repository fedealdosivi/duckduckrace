import { onMounted, onUnmounted, type Ref } from 'vue'

export function onClickOutside(target: Ref<HTMLElement | null>, handler: () => void): void {
  function listener(event: MouseEvent) {
    if (target.value && !target.value.contains(event.target as Node)) handler()
  }
  onMounted(() => document.addEventListener('click', listener))
  onUnmounted(() => document.removeEventListener('click', listener))
}

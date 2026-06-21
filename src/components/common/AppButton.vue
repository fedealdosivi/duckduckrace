<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    disabled?: boolean
    type?: 'button' | 'submit'
  }>(),
  { variant: 'primary', disabled: false, type: 'button' },
)
</script>

<template>
  <button :class="['app-button', variant]" :disabled="disabled" :type="type">
    <slot />
  </button>
</template>

<style scoped>
.app-button {
  border: none;
  border-radius: 999px;
  padding: 0.75rem 1.75rem;
  font-size: 1.05rem;
  font-weight: 700;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    opacity 0.15s ease;
  box-shadow: var(--shadow-soft);
}
.app-button:active:not(:disabled) {
  transform: translateY(1px) scale(0.98);
}
.app-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}
.primary {
  background: var(--color-primary);
  color: #fff;
}
.primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
}
.secondary {
  background: var(--color-secondary);
  color: #fff;
}
.ghost {
  background: var(--color-surface);
  color: var(--color-text);
  border: 2px solid var(--color-border);
  box-shadow: none;
}
.danger {
  background: var(--color-danger);
  color: #fff;
}
</style>

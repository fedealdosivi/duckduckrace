<script setup lang="ts">
withDefaults(defineProps<{ title?: string; icon?: string; strong?: boolean }>(), { strong: false })
</script>

<template>
  <section class="glass-card glass-surface" :class="{ 'glass-surface--strong': strong }">
    <header v-if="title || $slots.actions" class="glass-card__header">
      <h3 v-if="title"><span v-if="icon" aria-hidden="true">{{ icon }}</span> {{ title }}</h3>
      <div v-if="$slots.actions" class="glass-card__actions"><slot name="actions" /></div>
    </header>
    <div class="glass-card__body"><slot /></div>
  </section>
</template>

<style scoped>
.glass-card {
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: var(--space-md);
  gap: var(--space-sm);
}

.glass-card__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-sm);
  flex-shrink: 0;
}

.glass-card__header h3 {
  font-size: var(--fs-md);
}

.glass-card__body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}
</style>

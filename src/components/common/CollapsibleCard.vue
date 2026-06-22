<script setup lang="ts">
withDefaults(defineProps<{ title: string; icon?: string; defaultOpen?: boolean }>(), { defaultOpen: true })
</script>

<template>
  <details class="collapsible-card glass-surface" :open="defaultOpen">
    <summary class="collapsible-card__summary">
      <span v-if="icon" aria-hidden="true">{{ icon }}</span>
      <span class="collapsible-card__title">{{ title }}</span>
      <span class="collapsible-card__chevron" aria-hidden="true">▾</span>
    </summary>
    <div class="collapsible-card__body"><slot /></div>
  </details>
</template>

<style scoped>
.collapsible-card {
  padding: var(--space-md);
}

.collapsible-card__summary {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  cursor: pointer;
  font-weight: 700;
  font-size: var(--fs-md);
  list-style: none;
}

.collapsible-card__summary::-webkit-details-marker {
  display: none;
}

.collapsible-card__title {
  flex: 1;
}

.collapsible-card__chevron {
  transition: transform 0.2s ease;
  color: var(--color-text-muted);
}

.collapsible-card[open] .collapsible-card__chevron {
  transform: rotate(180deg);
}

.collapsible-card__body {
  padding-top: var(--space-sm);
}
</style>

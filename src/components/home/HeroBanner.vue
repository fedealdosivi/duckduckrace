<template>
  <div class="hero-banner">
    <h1>🦆 Duck Duck Race</h1>
    <p>Add your participants, then let the ducks decide a winner!</p>
  </div>
</template>

<style scoped>
.hero-banner {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--space-xs);
  height: 100%;
}

.hero-banner h1 {
  font-size: var(--fs-xl);
  line-height: 1.1;
}

.hero-banner p {
  color: var(--color-text-muted);
  font-size: var(--fs-base);
  margin: 0;
}
</style>

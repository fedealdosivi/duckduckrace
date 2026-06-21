<script setup lang="ts">
import { ref } from 'vue'
import { useParticipantsStore } from '@/stores/participants'
import AppButton from '@/components/common/AppButton.vue'

const store = useParticipantsStore()
const singleName = ref('')
const showPaste = ref(false)
const pasteText = ref('')

function addSingle() {
  if (!singleName.value.trim()) return
  store.add(singleName.value)
  singleName.value = ''
}

function addPasted() {
  if (!pasteText.value.trim()) return
  store.addMany(pasteText.value)
  pasteText.value = ''
  showPaste.value = false
}
</script>

<template>
  <div class="participant-input">
    <form class="single-row" @submit.prevent="addSingle">
      <input v-model="singleName" type="text" placeholder="Enter a participant name" aria-label="Participant name" />
      <AppButton type="submit">Add</AppButton>
    </form>

    <button class="toggle-paste" type="button" @click="showPaste = !showPaste">
      {{ showPaste ? 'Hide paste box ▲' : 'Paste a list of names instead ▼' }}
    </button>

    <div v-if="showPaste" class="paste-box">
      <textarea
        v-model="pasteText"
        rows="6"
        placeholder="One name per line&#10;Alice&#10;Bob&#10;Charlie"
      ></textarea>
      <AppButton variant="secondary" @click="addPasted">Add All Names</AppButton>
    </div>
  </div>
</template>

<style scoped>
.participant-input {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.single-row {
  display: flex;
  gap: 0.5rem;
}

input,
textarea {
  font-family: inherit;
  font-size: 1rem;
  border: 2px solid var(--color-border);
  border-radius: 0.75rem;
  padding: 0.7rem 1rem;
  flex: 1;
  background: #fff;
  color: var(--color-text);
}

input:focus,
textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

textarea {
  width: 100%;
  resize: vertical;
}

.toggle-paste {
  align-self: flex-start;
  background: none;
  border: none;
  color: var(--color-secondary);
  font-weight: 700;
  padding: 0.25rem 0;
}

.paste-box {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-start;
}
</style>

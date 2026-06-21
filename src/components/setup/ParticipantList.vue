<script setup lang="ts">
import { ref } from 'vue'
import { useParticipantsStore } from '@/stores/participants'

const store = useParticipantsStore()
const editingId = ref<string | null>(null)
const editValue = ref('')

function startEdit(id: string, name: string) {
  editingId.value = id
  editValue.value = name
}

function commitEdit() {
  if (editingId.value) store.rename(editingId.value, editValue.value)
  editingId.value = null
}
</script>

<template>
  <div class="participant-list">
    <div class="list-header">
      <h3>Participants ({{ store.count }})</h3>
      <button v-if="store.count > 0" class="clear-btn" type="button" @click="store.clear()">Clear all</button>
    </div>

    <p v-if="store.count === 0" class="empty">No participants yet — add at least 2 to race.</p>

    <ul v-else class="list">
      <li v-for="(p, index) in store.participants" :key="p.id" class="item">
        <span class="lane-number">{{ index + 1 }}</span>
        <input
          v-if="editingId === p.id"
          v-model="editValue"
          class="edit-input"
          type="text"
          autofocus
          @keyup.enter="commitEdit"
          @blur="commitEdit"
        />
        <span v-else class="name" tabindex="0" @click="startEdit(p.id, p.name)" @keyup.enter="startEdit(p.id, p.name)">
          {{ p.name }}
        </span>
        <button class="remove-btn" type="button" aria-label="Remove participant" @click="store.remove(p.id)">✕</button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.participant-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.list-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.list-header h3 {
  font-size: 1.1rem;
}

.clear-btn {
  background: none;
  border: none;
  color: var(--color-danger);
  font-weight: 700;
  font-size: 0.9rem;
}

.empty {
  color: var(--color-text-muted);
  font-style: italic;
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  max-height: 18rem;
  overflow-y: auto;
}

.item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: #fff;
  border: 2px solid var(--color-border);
  border-radius: 0.75rem;
  padding: 0.45rem 0.6rem;
}

.lane-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 50%;
  background: var(--color-secondary);
  color: #fff;
  font-weight: 700;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.name {
  flex: 1;
  cursor: text;
  padding: 0.2rem 0.3rem;
  border-radius: 0.4rem;
}

.name:hover {
  background: var(--color-bg-top);
}

.edit-input {
  flex: 1;
  font-family: inherit;
  font-size: 1rem;
  border: 2px solid var(--color-primary);
  border-radius: 0.4rem;
  padding: 0.2rem 0.4rem;
}

.remove-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: 1.1rem;
  line-height: 1;
  padding: 0.2rem 0.4rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.remove-btn:hover {
  background: var(--color-danger);
  color: #fff;
}
</style>

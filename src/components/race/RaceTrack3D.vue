<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import type { DuckRacer, FinishOrderEntry, RankEntry } from '@/types/race'
import { RaceSceneManager, type SceneMode } from '@/three/sceneManager'

const props = defineProps<{
  racers: DuckRacer[]
  mode: SceneMode
  raceDurationSeconds: number
}>()

const emit = defineEmits<{
  finished: [order: FinishOrderEntry[]]
  progress: [ranking: RankEntry[]]
}>()

const container = ref<HTMLDivElement | null>(null)
let scene: RaceSceneManager | null = null

onMounted(() => {
  if (!container.value) return
  scene = new RaceSceneManager(container.value, {
    onFinished: (order) => emit('finished', order),
    onProgress: (ranking) => emit('progress', ranking),
  })
  scene.buildRace(props.racers, props.raceDurationSeconds)
  scene.setMode(props.mode)
})

onUnmounted(() => {
  scene?.dispose()
  scene = null
})

watch(
  () => props.racers,
  (racers) => {
    scene?.buildRace(racers, props.raceDurationSeconds)
    scene?.setMode(props.mode)
  },
)

watch(
  () => props.mode,
  (mode) => scene?.setMode(mode),
)
</script>

<template>
  <div ref="container" class="race-track-3d"></div>
</template>

<style scoped>
.race-track-3d {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 1rem;
}
</style>

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import { preloadDuckModel } from '@/three/duck'

preloadDuckModel()
createApp(App).use(createPinia()).mount('#app')

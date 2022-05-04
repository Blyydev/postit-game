import { createApp } from 'vue'
import App from './App.vue'
import Svg from './components/SvgIcon.vue'

const app = createApp(App)
app.component('Svg', Svg)
app.mount('#app')

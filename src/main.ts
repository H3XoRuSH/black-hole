import { createApp } from 'vue';
import App from './App.vue';
import router from './router/index.js';
import './assets/main.css';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((r) => r.unregister());
  });
}

createApp(App).use(router).mount('#app');

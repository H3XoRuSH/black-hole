import { createRouter, createWebHistory } from 'vue-router';
import Lobby from '../components/Lobby.vue';
import Game from '../components/Game.vue';

const routes = [
  {
    path: '/lobby',
    name: 'Lobby',
    component: Lobby,
  },
  {
    path: '/game/:roomKey',
    name: 'Game',
    component: Game,
    props: true, // Pass route params as props
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/lobby', // Redirect unmatched routes to lobby
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
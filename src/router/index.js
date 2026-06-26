import { createRouter, createWebHistory } from 'vue-router';
import Menu from '../components/Menu.vue';
import Lobby from '../components/Lobby.vue';
import Game from '../components/Game.vue';
import ConnectFour from '../components/ConnectFour.vue';

const routes = [
  {
    path: '/menu',
    name: 'Menu',
    component: Menu,
    meta: { title: "Gab's Arcade" },
  },
  {
    path: '/black-hole/lobby',
    name: 'Lobby',
    component: Lobby,
    props: { gameId: 'black-hole', gameName: 'Black Hole' },
    meta: { title: "Black Hole - Gab's Arcade" },
  },
  {
    path: '/black-hole/game/:roomKey',
    name: 'Game',
    component: Game,
    props: true, // Pass route params as props
    meta: { title: "Black Hole - Gab's Arcade" },
  },
  {
    path: '/connect-four/lobby',
    name: 'ConnectFourLobby',
    component: Lobby,
    props: { gameId: 'connect-four', gameName: 'Connect Four' },
    meta: { title: "Connect Four - Gab's Arcade" },
  },
  {
    path: '/connect-four/game/:roomKey',
    name: 'ConnectFourGame',
    component: ConnectFour,
    props: true, // Pass route params as props
    meta: { title: "Connect Four - Gab's Arcade" },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/menu', // Redirect unmatched routes to menu
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.afterEach((to) => {
  document.title = to.meta.title || "Gab's Arcade";
});

export default router;
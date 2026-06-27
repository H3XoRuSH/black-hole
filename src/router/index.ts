import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Menu from '../components/Menu.vue';
import Lobby from '../components/Lobby.vue';
import Game from '../components/Game.vue';
import ConnectFour from '../components/ConnectFour.vue';
import DotsAndBoxes from '../components/DotsAndBoxes.vue';

const routes: Array<RouteRecordRaw> = [
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
    props: true,
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
    props: true,
    meta: { title: "Connect Four - Gab's Arcade" },
  },
  {
    path: '/dots-and-boxes/lobby',
    name: 'DotsAndBoxesLobby',
    component: Lobby,
    props: { gameId: 'dots-and-boxes', gameName: 'Dots and Boxes' },
    meta: { title: "Dots and Boxes - Gab's Arcade" },
  },
  {
    path: '/dots-and-boxes/game/:roomKey',
    name: 'DotsAndBoxesGame',
    component: DotsAndBoxes,
    props: true,
    meta: { title: "Dots and Boxes - Gab's Arcade" },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/menu',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.afterEach((to) => {
  document.title = (to.meta.title as string) || "Gab's Arcade";
});

export default router;

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
  },
  {
    path: '/black-hole/lobby',
    name: 'Lobby',
    component: Lobby,
    props: { gameId: 'black-hole', gameName: 'Black Hole' },
  },
  {
    path: '/black-hole/game/:roomKey',
    name: 'Game',
    component: Game,
    props: true, // Pass route params as props
  },
  {
    path: '/connect-four/lobby',
    name: 'ConnectFourLobby',
    component: Lobby,
    props: { gameId: 'connect-four', gameName: 'Connect Four' },
  },
  {
    path: '/connect-four/game/:roomKey',
    name: 'ConnectFourGame',
    component: ConnectFour,
    props: true, // Pass route params as props
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

export default router;
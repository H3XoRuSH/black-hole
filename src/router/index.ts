import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Menu from '../components/Menu.vue';
import Offline from '../components/games/Offline.vue';

const Lobby = () => import('../components/Lobby.vue');
const BlackHole = () => import('../components/games/BlackHole.vue');
const ConnectFour = () => import('../components/games/ConnectFour.vue');
const DotsAndBoxes = () => import('../components/games/DotsAndBoxes.vue');
const Battleship = () => import('../components/games/Battleship.vue');
const Checkers = () => import('../components/games/Checkers.vue');
const Bingo = () => import('../components/games/Bingo.vue');
const Trivia = () => import('../components/games/Trivia.vue');
const InfiniteWordChain = () => import('../components/games/InfiniteWordChain.vue');
const Pictionary = () => import('../components/games/Pictionary.vue');
const EscapeRoom = () => import('../components/games/EscapeRoom.vue');

const routes: Array<RouteRecordRaw> = [
  {
    path: '/offline',
    name: 'Offline',
    component: Offline,
    meta: { title: 'Offline - Gab\'s Arcade' },
  },
  {
    path: '/menu',
    name: 'Menu',
    component: Menu,
    meta: { title: 'Gab\'s Arcade' },
  },
  {
    path: '/black-hole/lobby',
    name: 'Lobby',
    component: Lobby,
    props: { gameId: 'black-hole', gameName: 'Black Hole' },
    meta: { title: 'Black Hole - Gab\'s Arcade' },
  },
  {
    path: '/black-hole/game/:roomKey',
    name: 'Game',
    component: BlackHole,
    props: true,
    meta: { title: 'Black Hole - Gab\'s Arcade' },
  },
  {
    path: '/connect-four/lobby',
    name: 'ConnectFourLobby',
    component: Lobby,
    props: { gameId: 'connect-four', gameName: 'Connect Four' },
    meta: { title: 'Connect Four - Gab\'s Arcade' },
  },
  {
    path: '/connect-four/game/:roomKey',
    name: 'ConnectFourGame',
    component: ConnectFour,
    props: true,
    meta: { title: 'Connect Four - Gab\'s Arcade' },
  },
  {
    path: '/dots-and-boxes/lobby',
    name: 'DotsAndBoxesLobby',
    component: Lobby,
    props: { gameId: 'dots-and-boxes', gameName: 'Dots and Boxes' },
    meta: { title: 'Dots and Boxes - Gab\'s Arcade' },
  },
  {
    path: '/dots-and-boxes/game/:roomKey',
    name: 'DotsAndBoxesGame',
    component: DotsAndBoxes,
    props: true,
    meta: { title: 'Dots and Boxes - Gab\'s Arcade' },
  },
  {
    path: '/bingo/lobby',
    name: 'BingoLobby',
    component: Lobby,
    props: { gameId: 'bingo', gameName: 'Bingo' },
    meta: { title: 'Bingo - Gab\'s Arcade' },
  },
  {
    path: '/bingo/game/:roomKey',
    name: 'BingoGame',
    component: Bingo,
    props: true,
    meta: { title: 'Bingo - Gab\'s Arcade' },
  },
  {
    path: '/trivia/lobby',
    name: 'TriviaLobby',
    component: Lobby,
    props: { gameId: 'trivia', gameName: 'Trivia' },
    meta: { title: 'Trivia - Gab\'s Arcade' },
  },
  {
    path: '/trivia/game/:roomKey',
    name: 'TriviaGame',
    component: Trivia,
    props: true,
    meta: { title: 'Trivia - Gab\'s Arcade' },
  },
  {
    path: '/infinite-word-chain/lobby',
    name: 'InfiniteWordChainLobby',
    component: Lobby,
    props: { gameId: 'infinite-word-chain', gameName: 'Infinite Word Chain' },
    meta: { title: 'Infinite Word Chain - Gab\'s Arcade' },
  },
  {
    path: '/infinite-word-chain/game/:roomKey',
    name: 'InfiniteWordChainGame',
    component: InfiniteWordChain,
    props: true,
    meta: { title: 'Infinite Word Chain - Gab\'s Arcade' },
  },
  {
    path: '/checkers/lobby',
    name: 'CheckersLobby',
    component: Lobby,
    props: { gameId: 'checkers', gameName: 'Checkers' },
    meta: { title: 'Checkers - Gab\'s Arcade' },
  },
  {
    path: '/checkers/game/:roomKey',
    name: 'CheckersGame',
    component: Checkers,
    props: true,
    meta: { title: 'Checkers - Gab\'s Arcade' },
  },
  {
    path: '/pictionary/lobby',
    name: 'PictionaryLobby',
    component: Lobby,
    props: { gameId: 'pictionary', gameName: 'Pictionary' },
    meta: { title: 'Pictionary - Gab\'s Arcade' },
  },
  {
    path: '/pictionary/game/:roomKey',
    name: 'PictionaryGame',
    component: Pictionary,
    props: true,
    meta: { title: 'Pictionary - Gab\'s Arcade' },
  },
  {
    path: '/battleship/lobby',
    name: 'BattleshipLobby',
    component: Lobby,
    props: { gameId: 'battleship', gameName: 'Battleship' },
    meta: { title: 'Battleship - Gab\'s Arcade' },
  },
  {
    path: '/battleship/game/:roomKey',
    name: 'BattleshipGame',
    component: Battleship,
    props: true,
    meta: { title: 'Battleship - Gab\'s Arcade' },
  },
  {
    path: '/escape-room/lobby',
    name: 'EscapeRoomLobby',
    component: Lobby,
    props: { gameId: 'escape-room', gameName: 'Escape Room' },
    meta: { title: 'Escape Room - Gab\'s Arcade' },
  },
  {
    path: '/escape-room/game/:roomKey',
    name: 'EscapeRoomGame',
    component: EscapeRoom,
    props: true,
    meta: { title: 'Escape Room - Gab\'s Arcade' },
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
  document.title = (to.meta.title as string) || 'Gab\'s Arcade';
});

export default router;

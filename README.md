# Gab's Arcade

Note: This is previously just black hole game.

A real-time, multiplayer online arcade featuring classic strategic board and pen-and-paper games.

## Playable Games

- <img src="public/icons/black-hole.svg" width="20" height="20" style="vertical-align: middle; margin-right: 8px;" alt=""> **Black Hole**: A strategic 2-player game of calculation and gravity. Place numbered tiles on a triangular grid and try to keep your highest numbers away from the final empty circle (the black hole)!
- <img src="public/icons/connect-four.svg" width="20" height="20" style="vertical-align: middle; margin-right: 8px;" alt=""> **Connect Four**: The classic connection game. Take turns dropping colored discs into a 7x6 vertical grid to align four in a row horizontally, vertically, or diagonally.
- <img src="public/icons/dots-and-boxes.svg" width="20" height="20" style="vertical-align: middle; margin-right: 8px;" alt=""> **Dots and Boxes**: A classic 2-player pen-and-paper game. Connect adjacent dots to complete boxes; capturing a box gains you a point and grants you an extra turn!
- <img src="public/icons/battleship.svg" width="20" height="20" style="vertical-align: middle; margin-right: 8px;" alt=""> **Battleship**: A strategic naval guessing game. Place your fleet of ships on a 6x6 grid, and take turns firing shots to locate and sink the opponent's hidden ships.
- <img src="public/icons/checkers.svg" width="20" height="20" style="vertical-align: middle; margin-right: 8px;" alt=""> **Checkers**: Classic American draughts on an 8x8 board. Capture your opponent's pieces by jumping over them. Mandatory jumps, multi-jump chains, and king promotion included.
- <img src="public/icons/bingo.svg" width="20" height="20" style="vertical-align: middle; margin-right: 8px;" alt=""> **Bingo**: A classic multiplayer game for 2-8 players. The host draws numbers and players daub their unique 5x5 cards. First to complete a row, column, or diagonal calls BINGO!
- <img src="public/icons/trivia.svg" width="20" height="20" style="vertical-align: middle; margin-right: 8px;" alt=""> **Trivia**: A real-time quiz game for 1-8 players. Questions are fetched from Open Trivia DB across multiple categories and difficulties. Each answer starts fully hidden — letters are gradually revealed and the first player to type the correct answer scores a point. Most points after 10 questions wins!
- <img src="public/icons/infinite-word-chain.svg" width="20" height="20" style="vertical-align: middle; margin-right: 8px;" alt=""> **Infinite Word Chain**: A single-player word chain game powered by AI. Guess the missing word that completes a common two-word phrase. Wrong guesses reveal more letters as hints. Each correct answer continues the chain infinitely — how many can you get?
  
## Tech Stack

- **Frontend**: Vue 3, Vite, TailwindCSS
- **Backend**: Node.js, Express, Socket.io
- **Routing**: Vue Router

## Getting Started

### 1. Setup Dependencies

```sh
npm install
```

### 2. Run the Servers (Local Development)

Start the Express / Socket.io game server:

```sh
npm start
```

In a separate terminal, start the Vite development server for client-side hot-reloading:

```sh
npm run dev
```

### 3. Production Build

Compile production assets:

```sh
npm run build
```

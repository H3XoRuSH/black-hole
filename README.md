# Gab's Arcade

Note: This is previously just black hole game.

A real-time, multiplayer online arcade featuring classic strategic board and pen-and-paper games.

## Playable Games

- **Black Hole**: A strategic 2-player game of calculation and gravity. Place numbered tiles on a triangular grid and try to keep your highest numbers away from the final empty circle (the black hole)!
- **Connect Four**: The classic connection game. Take turns dropping colored discs into a 7x6 vertical grid to align four in a row horizontally, vertically, or diagonally.
- **Dots and Boxes**: A classic 2-player pen-and-paper game. Connect adjacent dots to complete boxes; capturing a box gains you a point and grants you an extra turn!

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

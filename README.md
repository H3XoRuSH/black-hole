<div align="center">
  <h1 align="center">GAB'S ARCADE</h1>
  <p align="center">
    <strong>A real-time, multiplayer web arcade featuring strategic board games, puzzles, and interactive party experiences.</strong>
  </p>
  <p align="center">
    <a href="https://vuejs.org/"><img src="https://img.shields.io/badge/Vue.js-3.5-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white" alt="Vue 3"></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.4-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"></a>
    <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-7.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-v4.1-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS"></a>
    <a href="https://socket.io/"><img src="https://img.shields.io/badge/Socket.io-4.8-010101?style=for-the-badge&logo=socketdotio&logoColor=white" alt="Socket.io"></a>
    <a href="https://expressjs.com/"><img src="https://img.shields.io/badge/Express-4.21-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express"></a>
  </p>
</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Playable Games](#-playable-games)
- [Repository Structure](#-repository-structure)
- [Modules & Architecture](#-modules--architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Running Locally](#running-locally)
  - [Production Build](#production-build)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌌 Overview

**Gab's Arcade** is an open-source, full-stack multiplayer arcade application built for fast, low-latency browser gaming. It blends retro game mechanics with a bold neo-brutalist aesthetic, snappy page transitions, and sound design. 

All multiplayer games operate under a **server-authoritative model** over WebSockets (Socket.io) to ensure validated moves, synchronized state, reconnect tolerance, and hidden-information mechanics (e.g. fog of war in Battleship).

---

## ✨ Key Features

- **⚡ Real-Time Multiplayer:** Instant synchronization via Socket.io with room code sharing and QR code scanning for mobile handoff.
- **🛡️ Server-Authoritative Logic:** Centralized state management and move validation preventing client-side desyncs and tampering.
- **🎨 Neo-Brutalist UI:** High-contrast borders, playful micro-animations, confetti celebrations, and responsive viewports.
- **🧩 Cooperative & Versus Modes:** Support for 1 to 8 players across strategy, drawing, guessing, trivia, pattern matching, and escape room formats.
- **🤖 Smart Fallbacks:** Graceful degradation and local mocks for LLM-powered features (such as AI game recaps and word chains) when optional API keys are omitted.

---

## 🎮 Playable Games

| Game | Players | Mode | Description |
| :--- | :---: | :---: | :--- |
| **Black Hole** | 2 | Versus | Place numbered tiles on a triangular grid; avoid letting your highest numbers get sucked into the black hole! |
| **Connect Four** | 2 | Versus | Drop colored discs into a 7x6 grid to align 4-in-a-row horizontally, vertically, or diagonally. |
| **Dots and Boxes** | 2 | Versus | Connect adjacent grid dots to close boxes. Capturing a box scores a point and awards a bonus turn. |
| **Battleship** | 2 | Versus | Position your naval fleet on a 6x6 grid, call coordinates, and sink your opponent's ships with fog-of-war secrecy. |
| **Checkers** | 2 | Versus | American draughts on an 8x8 board with mandatory jumps, multi-jump chains, and king promotions. |
| **Escape Room** | 1–8 | Co-op | Decipher clues, solve audio/visual riddles, and unlock narrative-driven themed escape rooms collaboratively. |
| **Bingo** | 2–8 | Party | Host-called numbers with interactive 5x5 player daubing cards. Complete lines to call BINGO. |
| **Trivia** | 1–8 | Party | Fast-paced quiz game powered by Open Trivia DB. Letters reveal over time; first correct answer scores! |
| **Pattern Hunt** | 2–8 | Party | Fast multiplayer visual matching race. Find the one matching icon shared between your card and the center pile! |
| **Infinite Word Chain** | 1 | Solo | Complete two-word common phrases powered by AI. Chains continue infinitely with letter hints. |
| **Pictionary** | 2–4 | Co-op / Party | Real-time synchronized canvas drawing and secret word guessing with live scoring. |

---

## 📁 Repository Structure

```tree
black-hole/
├── public/                     # Static assets, SVG game icons, SFX audio files
├── server/                     # Backend server logic
│   ├── games/                  # Game engine modules (state, rules, move validation)
│   ├── roomManager.ts          # Room lifecycles, matchmaking, and player connections
│   ├── routes.ts               # REST API endpoints (trivia proxy, AI recaps)
│   └── types.ts                # Server-specific types
├── src/                        # Vue 3 frontend source
│   ├── assets/                 # Global styles and sound effects
│   ├── components/             # Reusable UI components (Modals, QR, Toasts, Indicators)
│   ├── composables/            # Shared logic (useSocket, useGame, useSound, useToast)
│   ├── router/                 # Vue Router configuration
│   ├── types/                  # Shared TypeScript interfaces (client + server)
│   ├── views/                  # Game views, lobby views, and main menu
│   ├── App.vue                 # Root Vue application
│   └── main.ts                 # Frontend entry point
├── server.ts                   # Express & Socket.io server bootstrap
├── vite.config.ts              # Vite bundler configuration
└── package.json                # Project dependencies and npm scripts
```

---

## ⚙️ Modules & Architecture

| Module | Location | Description |
| :--- | :--- | :--- |
| **Room Manager** | `server/roomManager.ts` | Handles 6-character room codes, socket lifecycles, disconnect grace periods, and game dispatching. |
| **Game Engines** | `server/games/*.ts` | Modular game rules implementing `createInitialState`, `makeMove`, and `resetState`. |
| **Socket Composable** | `src/composables/useSocket.ts` | Reactive wrapper managing WebSocket connection events, player identity, and state sync. |
| **Lifecycle Composable** | `src/composables/useGame.ts` | Standardized game lifecycle hooks, route guards, and rematch listeners. |
| **Audio System** | `src/composables/useSound.ts` | Web Audio API / HTML5 Audio manager for sound effects and volume control. |
| **Toast Store** | `src/composables/useToast.ts` | Non-blocking reactive alert system for errors, game announcements, and notices. |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `^20.19.0` or `>=22.12.0`
- **npm**: `>=10.0.0`

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/your-username/black-hole.git
   cd black-hole
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

### Environment Configuration

Create a `.env` file in the root directory:

```env
# Server Port
PORT=3000

# Optional: Frontend target backend URL (defaults to relative proxy if omitted)
VITE_BACKEND_URL=http://localhost:3000

# Optional: AI Features (simulated local fallbacks are active if omitted)
DEEPSEEK_API_KEY=your_deepseek_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
GITHUB_TOKEN=your_github_token
```

> [!NOTE]
> All AI API keys are **optional**. If omitted, the game gracefully falls back to deterministic local mock handlers.

### Running Locally

Start the backend server and frontend client in separate terminals:

```sh
# Terminal 1: Start Backend (Port 3000 with hot reloading)
npm run server-dev

# Terminal 2: Start Frontend (Port 5173 with Vite HMR)
npm run dev
```

Visit [`http://localhost:5173`](http://localhost:5173) in your browser.

### Production Build

Build the client bundle for production:

```sh
npm run build
```

To run the production server:

```sh
npm start
```

---

## 🤝 Contributing

Contributions, game suggestions, and bug reports are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-game`)
3. Commit your changes (`git commit -m 'Add amazing game'`)
4. Push to the branch (`git push origin feature/amazing-game`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

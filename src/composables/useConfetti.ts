import { ref, onBeforeUnmount } from 'vue';

interface ConfettiPiece {
  x: number;
  y: number;
  size: number;
  color: string;
  velocityX: number;
  velocityY: number;
  rotation: number;
  rotationSpeed: number;
  shape: 'rect' | 'circle';
}

const CONFETTI_COLORS = [
  '#FF6B6B', '#FFD93D', '#4ECDC4', '#45B7D1',
  '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471',
  '#82E0AA', '#F1948A', '#AED6F1', '#D7BDE2',
];

export function useConfetti() {
  const canvasRef = ref<HTMLCanvasElement | null>(null);
  const pieces = ref<ConfettiPiece[]>([]);
  let animationId: number | null = null;
  let isRunning = false;

  function createPiece(canvas: HTMLCanvasElement): ConfettiPiece {
    return {
      x: Math.random() * canvas.width,
      y: -10 - Math.random() * 50,
      size: Math.random() * 8 + 4,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      velocityX: (Math.random() - 0.5) * 4,
      velocityY: Math.random() * 3 + 2,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 12,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
    };
  }

  function drawPiece(ctx: CanvasRenderingContext2D, piece: ConfettiPiece) {
    ctx.save();
    ctx.translate(piece.x, piece.y);
    ctx.rotate((piece.rotation * Math.PI) / 180);
    ctx.fillStyle = piece.color;

    if (piece.shape === 'rect') {
      ctx.fillRect(-piece.size / 2, -piece.size / 4, piece.size, piece.size / 2);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, piece.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function animate() {
    if (!isRunning || !canvasRef.value) return;

    const canvas = canvasRef.value;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pieces.value = pieces.value.filter((p) => {
      p.x += p.velocityX;
      p.y += p.velocityY;
      p.rotation += p.rotationSpeed;
      p.velocityY += 0.05;
      p.velocityX *= 0.995;

      if (p.y > canvas.height + 20) return false;
      if (p.x < -20 || p.x > canvas.width + 20) return false;

      drawPiece(ctx, p);
      return true;
    });

    if (pieces.value.length > 0 || (Date.now() - startTime < 3000)) {
      animationId = requestAnimationFrame(animate);
    } else {
      cleanup();
    }
  }

  let startTime = 0;

  function fire() {
    if (isRunning) return;

    const canvas = document.createElement('canvas');
    canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 9999;
    `;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    canvasRef.value = canvas;

    pieces.value = [];
    isRunning = true;
    startTime = Date.now();

    const burstCount = 120;
    for (let i = 0; i < burstCount; i++) {
      pieces.value.push(createPiece(canvas));
    }

    animate();

    setTimeout(() => {
      if (!isRunning || !canvasRef.value) return;
      for (let i = 0; i < 80; i++) {
        pieces.value.push(createPiece(canvasRef.value));
      }
    }, 300);

    setTimeout(() => {
      if (!isRunning || !canvasRef.value) return;
      for (let i = 0; i < 60; i++) {
        pieces.value.push(createPiece(canvasRef.value));
      }
    }, 600);
  }

  function cleanup() {
    isRunning = false;
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    if (canvasRef.value && canvasRef.value.parentNode) {
      canvasRef.value.parentNode.removeChild(canvasRef.value);
      canvasRef.value = null;
    }
    pieces.value = [];
  }

  onBeforeUnmount(() => {
    cleanup();
  });

  return {
    fire,
    cleanup,
  };
}

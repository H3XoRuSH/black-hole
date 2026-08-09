import barba from '@barba/core';
import gsap from 'gsap';
import type { Router } from 'vue-router';

let isInitialized = false;

export function initBarba(router: Router) {
  if (isInitialized) return;

  const wrapper = document.querySelector('[data-barba="wrapper"]');
  const container = document.querySelector('[data-barba="container"]');
  if (!wrapper || !container) {
    return;
  }

  try {
    barba.init({
      preventRunning: true,
      debug: false,
      transitions: [
        {
          name: 'black-hole-portal',
          custom: () => {
            const currentPath = window.location.pathname;
            return currentPath.includes('/game/');
          },
          leave(data) {
            const done = this.async();
            const container = data.current.container;
            if (!container) {
              done();
              return;
            }
            gsap.to(container, {
              duration: 0.45,
              scale: 0.05,
              rotation: 360,
              opacity: 0,
              filter: 'blur(12px)',
              ease: 'back.in(1.7)',
              onComplete: done,
            });
          },
          enter(data) {
            const done = this.async();
            const container = data.next.container;
            if (!container) {
              done();
              return;
            }
            gsap.set(container, {
              scale: 0.1,
              rotation: -180,
              opacity: 0,
              filter: 'blur(10px)',
            });
            gsap.to(container, {
              duration: 0.5,
              scale: 1,
              rotation: 0,
              opacity: 1,
              filter: 'blur(0px)',
              ease: 'power3.out',
              onComplete: done,
            });
          },
        },
        {
          name: 'arcade-slide-fade',
          leave(data) {
            const done = this.async();
            const container = data.current.container;
            if (!container) {
              done();
              return;
            }
            gsap.to(container, {
              duration: 0.3,
              x: -50,
              opacity: 0,
              ease: 'power2.in',
              onComplete: done,
            });
          },
          enter(data) {
            const done = this.async();
            const container = data.next.container;
            if (!container) {
              done();
              return;
            }
            gsap.set(container, {
              x: 50,
              opacity: 0,
            });
            gsap.to(container, {
              duration: 0.35,
              x: 0,
              opacity: 1,
              ease: 'power2.out',
              onComplete: done,
            });
          },
        },
      ],
    });
    isInitialized = true;
  } catch (err) {
    console.warn('[Barba.js] Deferred initialization:', err);
  }

  router.afterEach((to) => {
    if (barba.history) {
      barba.history.add(to.fullPath, 'barba', 'replace');
    }
  });
}

export function onTransitionLeave(el: Element, done: () => void) {
  const isGameRoute = window.location.pathname.includes('/game/');

  if (isGameRoute) {
    // Black Hole Portal Leave (Vortex collapse effect)
    gsap.to(el, {
      duration: 0.45,
      scale: 0.05,
      rotation: 360,
      opacity: 0,
      filter: 'blur(12px)',
      ease: 'back.in(1.7)',
      onComplete: done,
    });
  } else {
    // Arcade Slide Fade Leave
    gsap.to(el, {
      duration: 0.3,
      x: -50,
      opacity: 0,
      ease: 'power2.in',
      onComplete: done,
    });
  }
}

export function onTransitionEnter(el: Element, done: () => void) {
  const isGameRoute = window.location.pathname.includes('/game/');

  if (isGameRoute) {
    // Black Hole Portal Enter (Vortex expanding effect)
    gsap.set(el, {
      scale: 0.1,
      rotation: -180,
      opacity: 0,
      filter: 'blur(10px)',
    });
    gsap.to(el, {
      duration: 0.5,
      scale: 1,
      rotation: 0,
      opacity: 1,
      filter: 'blur(0px)',
      ease: 'power3.out',
      onComplete: done,
    });
  } else {
    // Arcade Slide Fade Enter
    gsap.set(el, {
      x: 50,
      opacity: 0,
    });
    gsap.to(el, {
      duration: 0.35,
      x: 0,
      opacity: 1,
      ease: 'power2.out',
      onComplete: done,
    });
  }
}

export { barba, gsap };

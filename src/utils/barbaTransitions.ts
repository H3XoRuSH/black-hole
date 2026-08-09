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
            const container = data.current.container as HTMLElement;
            if (!container) {
              done();
              return;
            }
            const origOverflow = container.style.overflow;
            container.style.overflow = 'hidden';
            gsap.to(container, {
              duration: 0.4,
              scale: 0.05,
              opacity: 0,
              filter: 'blur(16px)',
              ease: 'power4.in',
              onComplete: () => {
                container.style.overflow = origOverflow;
                done();
              },
            });
          },
          enter(data) {
            const done = this.async();
            const container = data.next.container as HTMLElement;
            if (!container) {
              done();
              return;
            }
            const origOverflow = container.style.overflow;
            container.style.overflow = 'hidden';
            gsap.set(container, {
              scale: 0.08,
              opacity: 0,
              filter: 'blur(16px)',
            });
            gsap.to(container, {
              duration: 0.45,
              scale: 1,
              opacity: 1,
              filter: 'blur(0px)',
              ease: 'power3.out',
              onComplete: () => {
                container.style.overflow = origOverflow;
                done();
              },
            });
          },
        },
        {
          name: 'arcade-slide-fade',
          leave(data) {
            const done = this.async();
            const container = data.current.container as HTMLElement;
            if (!container) {
              done();
              return;
            }
            const origOverflow = container.style.overflow;
            container.style.overflow = 'hidden';
            gsap.to(container, {
              duration: 0.3,
              x: -50,
              opacity: 0,
              ease: 'power2.in',
              onComplete: () => {
                container.style.overflow = origOverflow;
                done();
              },
            });
          },
          enter(data) {
            const done = this.async();
            const container = data.next.container as HTMLElement;
            if (!container) {
              done();
              return;
            }
            const origOverflow = container.style.overflow;
            container.style.overflow = 'hidden';
            gsap.set(container, {
              x: 50,
              opacity: 0,
            });
            gsap.to(container, {
              duration: 0.35,
              x: 0,
              opacity: 1,
              ease: 'power2.out',
              onComplete: () => {
                container.style.overflow = origOverflow;
                done();
              },
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
  const htmlEl = el as HTMLElement;
  const originalOverflow = htmlEl.style.overflow;
  htmlEl.style.overflow = 'hidden';

  if (isGameRoute) {
    // Black Hole Implosion (Portal Void Collapse without rotating scrollbars)
    gsap.to(el, {
      duration: 0.4,
      scale: 0.05,
      opacity: 0,
      filter: 'blur(16px)',
      ease: 'power4.in',
      onComplete: () => {
        htmlEl.style.overflow = originalOverflow;
        done();
      },
    });
  } else {
    // Arcade Slide Fade Leave
    gsap.to(el, {
      duration: 0.3,
      x: -50,
      opacity: 0,
      ease: 'power2.in',
      onComplete: () => {
        htmlEl.style.overflow = originalOverflow;
        done();
      },
    });
  }
}

export function onTransitionEnter(el: Element, done: () => void) {
  const isGameRoute = window.location.pathname.includes('/game/');
  const htmlEl = el as HTMLElement;
  const originalOverflow = htmlEl.style.overflow;
  htmlEl.style.overflow = 'hidden';

  if (isGameRoute) {
    // Black Hole Portal Expansion (Vortex zoom in without rotating scrollbars)
    gsap.set(el, {
      scale: 0.08,
      opacity: 0,
      filter: 'blur(16px)',
    });
    gsap.to(el, {
      duration: 0.45,
      scale: 1,
      opacity: 1,
      filter: 'blur(0px)',
      ease: 'power3.out',
      onComplete: () => {
        htmlEl.style.overflow = originalOverflow;
        done();
      },
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
      onComplete: () => {
        htmlEl.style.overflow = originalOverflow;
        done();
      },
    });
  }
}

export { barba, gsap };

import barba from '@barba/core';
import gsap from 'gsap';
import type { Router } from 'vue-router';

let isInitialized = false;

function applyTransitionLock(htmlEl: HTMLElement, parent: HTMLElement | null) {
  htmlEl.classList.add('barba-transitioning');
  parent?.classList.add('barba-transitioning');
}

function releaseTransitionLock(htmlEl: HTMLElement, parent: HTMLElement | null) {
  htmlEl.classList.remove('barba-transitioning');
  parent?.classList.remove('barba-transitioning');
}

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
          leave(data: any) {
            const done = (this as any).async();
            const container = data.current.container as HTMLElement;
            if (!container) {
              done();
              return;
            }
            const parent = container.parentElement;
            applyTransitionLock(container, parent);
            gsap.to(container, {
              duration: 0.4,
              scale: 0.05,
              opacity: 0,
              filter: 'blur(16px)',
              ease: 'power4.in',
              onComplete: () => {
                releaseTransitionLock(container, parent);
                done();
              },
            });
          },
          enter(data: any) {
            const done = (this as any).async();
            const container = data.next.container as HTMLElement;
            if (!container) {
              done();
              return;
            }
            const parent = container.parentElement;
            applyTransitionLock(container, parent);
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
                releaseTransitionLock(container, parent);
                done();
              },
            });
          },
        },
        {
          name: 'arcade-slide-fade',
          leave(data: any) {
            const done = (this as any).async();
            const container = data.current.container as HTMLElement;
            if (!container) {
              done();
              return;
            }
            const parent = container.parentElement;
            applyTransitionLock(container, parent);
            gsap.to(container, {
              duration: 0.3,
              x: -50,
              opacity: 0,
              ease: 'power2.in',
              onComplete: () => {
                releaseTransitionLock(container, parent);
                done();
              },
            });
          },
          enter(data: any) {
            const done = (this as any).async();
            const container = data.next.container as HTMLElement;
            if (!container) {
              done();
              return;
            }
            const parent = container.parentElement;
            applyTransitionLock(container, parent);
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
                releaseTransitionLock(container, parent);
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
  const htmlEl = el as HTMLElement;
  const parent = htmlEl.parentElement;
  const isLeavingGame = htmlEl.getAttribute('data-is-game') === 'true';
  const isEnteringGame = window.location.pathname.includes('/game/');
  const isPortalTransition = isLeavingGame || isEnteringGame;

  applyTransitionLock(htmlEl, parent);

  const onComplete = () => {
    releaseTransitionLock(htmlEl, parent);
    done();
  };

  if (isPortalTransition) {
    // Black Hole Implosion (Portal Void Collapse)
    gsap.to(el, {
      duration: 0.4,
      scale: 0.05,
      opacity: 0,
      filter: 'blur(16px)',
      ease: 'power4.in',
      onComplete,
    });
  } else {
    // Arcade Slide Fade Leave
    gsap.to(el, {
      duration: 0.3,
      x: -50,
      opacity: 0,
      ease: 'power2.in',
      onComplete,
    });
  }
}

export function onTransitionEnter(el: Element, done: () => void) {
  const htmlEl = el as HTMLElement;
  const parent = htmlEl.parentElement;
  const isEnteringGame = window.location.pathname.includes('/game/');
  const isLeavingGame = htmlEl.getAttribute('data-is-game') === 'true';
  const isPortalTransition = isEnteringGame || isLeavingGame;

  if (parent) parent.scrollTop = 0;
  htmlEl.scrollTop = 0;
  if (typeof window !== 'undefined') window.scrollTo(0, 0);

  applyTransitionLock(htmlEl, parent);

  const onComplete = () => {
    releaseTransitionLock(htmlEl, parent);
    done();
  };

  if (isPortalTransition) {
    // Black Hole Portal Expansion
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
      onComplete,
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
      onComplete,
    });
  }
}

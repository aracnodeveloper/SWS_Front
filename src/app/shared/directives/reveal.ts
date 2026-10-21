import { DestroyRef, Directive, ElementRef, afterNextRender, inject, input, numberAttribute } from '@angular/core';

/**
 * Aparición suave al entrar en pantalla: `<div appReveal>` o `<div [appReveal]="i * 80">` (retraso en ms).
 * Solo actúa en el navegador y solo sobre elementos que aún no se ven, así el HTML del
 * SSR y lo visible al cargar nunca parpadean. Respeta "reducir movimiento".
 */
@Directive({ selector: '[appReveal]' })
export class Reveal {
  readonly delay = input(0, { alias: 'appReveal', transform: (v: unknown) => numberAttribute(v, 0) });

  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      if (typeof IntersectionObserver === 'undefined') return;
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;

      el.style.setProperty('--reveal-delay', `${Math.min(this.delay(), 600)}ms`);
      el.classList.add('reveal');
      const io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          el.classList.add('is-visible');
          io.disconnect();
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
      );
      io.observe(el);
      destroyRef.onDestroy(() => io.disconnect());
    });
  }
}

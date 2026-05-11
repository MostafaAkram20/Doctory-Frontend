import { Injectable, signal, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  theme = signal<'light' | 'dark'>(this.getSaved());

  constructor() {
    effect(() => {
      document.documentElement.setAttribute('data-theme', this.theme());
      localStorage.setItem('doctory-theme', this.theme());
    });
  }

  private getSaved(): 'light' | 'dark' {
    const saved = localStorage.getItem('doctory-theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  toggle() { this.theme.set(this.theme() === 'light' ? 'dark' : 'light'); }
  isDark() { return this.theme() === 'dark'; }
}

import { Component } from '@angular/core';
import { LanguageService } from '../../../core/i18n/language.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-lang-toggle',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <button type="button" class="lang-toggle" (click)="lang.toggle()" [attr.title]="'lang.toggle' | t" [attr.aria-label]="'lang.toggle' | t">
      <span [class.on]="!lang.isAr()">EN</span>
      <span class="lang-sep">|</span>
      <span [class.on]="lang.isAr()">عربي</span>
    </button>
  `,
  styles: [`
    .lang-toggle {
      display:inline-flex; align-items:center; gap:6px; height:42px; padding:0 12px;
      border-radius:var(--r); border:1px solid var(--border-2); background:var(--bg-3);
      cursor:pointer; font-size:12px; font-weight:700; color:var(--text-muted); transition:var(--t);
    }
    .lang-toggle:hover { border-color:var(--brand-1); color:var(--text); }
    .lang-sep { opacity:.35; font-weight:500; }
    .on { color:var(--brand-1); }
  `]
})
export class LanguageToggleComponent {
  constructor(public lang: LanguageService) {}
}

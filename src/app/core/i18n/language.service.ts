import { Injectable, signal, effect } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeAr from '@angular/common/locales/ar-EG';
import { AR, EN, Lang } from './translations';

registerLocaleData(localeAr, 'ar-EG');

@Injectable({ providedIn: 'root' })
export class LanguageService {
  lang = signal<Lang>(this.getSaved());

  constructor() {
    effect(() => this.apply(this.lang()));
  }

  private getSaved(): Lang {
    const saved = localStorage.getItem('doctory-lang');
    return saved === 'ar' ? 'ar' : 'en';
  }

  private apply(lang: Lang) {
    const html = document.documentElement;
    html.setAttribute('lang', lang);
    html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    localStorage.setItem('doctory-lang', lang);
    document.title = lang === 'ar' ? 'دكتوري — حجز الرعاية الصحية' : 'Doctory — Healthcare Booking';
  }

  toggle() {
    this.lang.set(this.lang() === 'en' ? 'ar' : 'en');
  }

  isAr() { return this.lang() === 'ar'; }
  locale() { return this.lang() === 'ar' ? 'ar-EG' : 'en-US'; }

  t(key: string, params?: Record<string, string | number>): string {
    this.lang();
    const dict = this.lang() === 'ar' ? AR : EN;
    let str = dict[key] ?? EN[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        str = str.replace(new RegExp(`\\{\\{\\s*${k}\\s*\\}\\}`, 'g'), String(v));
      }
    }
    return str;
  }

  spec(name?: string): string {
    if (!name) return '';
    const key = `specialty.${name}`;
    return this.t(key) === key ? name : this.t(key);
  }

  status(s?: string): string {
    if (!s) return '';
    const key = `status.${s}`;
    return this.t(key) === key ? s : this.t(key);
  }

  apptType(t?: string): string {
    if (!t) return '';
    const key = `type.${t}`;
    return this.t(key) === key ? t.replace('_', ' ') : this.t(key);
  }

  role(r?: string | null): string {
    if (!r) return '';
    return this.t(`role.${r}`);
  }
}

import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { LanguageService } from '../../../core/i18n/language.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { LanguageToggleComponent } from '../language-toggle/language-toggle.component';

export interface NavItem { icon: string; label: string; route: string; }

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslatePipe, LanguageToggleComponent],
  template: `
    <aside class="sidebar">
      <div class="sb-logo">
        <a routerLink="/" style="background:var(--brand-gradient);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">Doctory</a>
        <small>{{ roleLabel }}</small>
      </div>

      <div class="sb-section" *ngFor="let section of sections">
        <div class="sb-label" *ngIf="section.label">{{ section.label | t }}</div>
        <a *ngFor="let item of section.items" [routerLink]="item.route"
           routerLinkActive="active" class="sb-link">
          <div class="sb-icon">{{ item.icon }}</div>
          {{ item.label | t }}
        </a>
      </div>

      <div class="sb-divider"></div>
      <div class="sb-footer">
        <app-lang-toggle style="display:block;margin-bottom:8px;width:100%"></app-lang-toggle>
        <button class="sb-link" style="border:none;width:100%;text-align:start;background:none;cursor:pointer" (click)="theme.toggle()">
          <div class="sb-icon">{{ theme.isDark() ? '☀️' : '🌙' }}</div>
          {{ (theme.isDark() ? 'common.lightMode' : 'common.darkMode') | t }}
        </button>
        <div class="sb-divider" style="margin:8px 0"></div>
        <div class="sb-user">
          <div class="sb-user-ava" [class.sb-user-ava--photo]="!!profilePhotoUrl" [style.background]="profilePhotoUrl ? 'transparent' : null">
            <img *ngIf="profilePhotoUrl" [src]="profilePhotoUrl" alt="" />
            <ng-container *ngIf="!profilePhotoUrl">{{ initials }}</ng-container>
          </div>
          <div class="sb-user-info">
            <strong>{{ userName }}</strong>
            <span>{{ roleLabel }}</span>
          </div>
          <button style="border:none;background:none;cursor:pointer;font-size:18px;color:var(--text-muted)" [title]="'nav.logout' | t" (click)="auth.logout()">➜]</button>
        </div>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  @Input() sections: { label?: string; items: NavItem[] }[] = [];

  constructor(public auth: AuthService, public theme: ThemeService, public lang: LanguageService) {}

  get roleLabel() {
    const r = this.auth.getRole();
    return this.lang.role(r || 'patient');
  }
  get userName() { return this.auth.currentUser()?.fullName?.split(' ')[0] || 'User'; }
  get profilePhotoUrl(): string {
    const raw = this.auth.currentUser()?.image_profile;
    return typeof raw === 'string' && raw.trim() ? raw.trim() : '';
  }
  get initials() {
    const n = this.auth.currentUser()?.fullName || '';
    return n.split(' ').map((x: string) => x[0]).join('').slice(0, 2).toUpperCase();
  }
}

import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { AuthService } from '../../../core/services/auth.service';
import { LanguageService } from '../../../core/i18n/language.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { LanguageToggleComponent } from '../../../shared/components/language-toggle/language-toggle.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, CommonModule, TranslatePipe, LanguageToggleComponent],
  template: `
  <div class="landing-page">
  <!-- NAV -->
  <nav class="pub-nav">
    <div class="container" style="display:flex;align-items:center;gap:40px;height:100%">
      <a routerLink="/"><div class="nav-logo"><span>Doctory</span></div></a>
      <div class="nav-links">
        <a routerLink="/" class="active">Home</a>
        <a routerLink="/doctors">Find Doctors</a>
        <a href="#how">How It Works</a>
        <a href="#specialties">Specialties</a>
      </div>
      <div class="nav-right">
        <app-lang-toggle></app-lang-toggle>
        <button class="theme-toggle" (click)="theme.toggle()" [title]="theme.isDark() ? 'Light mode' : 'Dark mode'">
          {{ theme.isDark() ? '☀️' : '🌙' }}
        </button>
        <ng-container *ngIf="auth.isLoggedIn(); else guestActions">
          <div class="user-chip" [title]="userDisplayName()">
            <span class="user-avatar" [class.user-avatar--photo]="!!userProfilePhoto()">
              <img *ngIf="userProfilePhoto()" [src]="userProfilePhoto()" alt="" />
              <ng-container *ngIf="!userProfilePhoto()">{{ userInitials() }}</ng-container>
            </span>
            <div class="user-meta">
              <span class="user-name">{{ userDisplayName() }}</span>
              <span class="user-role">{{ auth.getRole() | titlecase }}</span>
            </div>
          </div>
          <a [routerLink]="dashboardRoute()" class="btn btn-brand btn-sm">Dashboard</a>
          <button type="button" class="btn btn-ghost btn-sm" (click)="auth.logout()">Logout</button>
        </ng-container>
        <ng-template #guestActions>
          <a routerLink="/login" class="btn btn-ghost btn-sm">Sign In</a>
          <a routerLink="/register" class="btn btn-brand btn-sm">Get Started</a>
        </ng-template>
      </div>
    </div>
  </nav>

  <!-- HERO -->
  <section class="hero">
    <div class="med-bg" aria-hidden="true">
      <svg class="dna dna-left" viewBox="0 0 80 720" preserveAspectRatio="xMidYMin slice">
        <path class="strand strand-a" [attr.d]="dna.p1" />
        <path class="strand strand-b" [attr.d]="dna.p2" />
        <line *ngFor="let r of dna.rungs" class="rung" [attr.x1]="r.x1" [attr.x2]="r.x2" [attr.y1]="r.y" [attr.y2]="r.y" />
      </svg>
      <svg class="dna dna-right" viewBox="0 0 80 720" preserveAspectRatio="xMidYMin slice">
        <path class="strand strand-a" [attr.d]="dna.p1" />
        <path class="strand strand-b" [attr.d]="dna.p2" />
        <line *ngFor="let r of dna.rungs" class="rung" [attr.x1]="r.x1" [attr.x2]="r.x2" [attr.y1]="r.y" [attr.y2]="r.y" />
      </svg>
      <svg class="ecg" viewBox="0 0 1200 80" preserveAspectRatio="none">
        <path class="ecg-line" d="M0 40 H80 L95 40 L110 8 L125 72 L140 40 H220 L235 40 L250 18 L260 40 H360 L375 40 L390 10 L405 70 L420 40 H520 L535 40 L550 16 L565 40 H680 L695 40 L710 6 L725 74 L740 40 H860 L875 40 L890 20 L905 40 H1020 L1035 40 L1050 12 L1065 68 L1080 40 H1200" />
      </svg>
      <svg class="ecg ecg-2" viewBox="0 0 1200 80" preserveAspectRatio="none">
        <path class="ecg-line" d="M0 40 H80 L95 40 L110 8 L125 72 L140 40 H220 L235 40 L250 18 L260 40 H360 L375 40 L390 10 L405 70 L420 40 H520 L535 40 L550 16 L565 40 H680 L695 40 L710 6 L725 74 L740 40 H860 L875 40 L890 20 L905 40 H1020 L1035 40 L1050 12 L1065 68 L1080 40 H1200" />
      </svg>
      <span class="med-cross c1"></span>
      <span class="med-cross c2"></span>
      <span class="med-cross c3"></span>
      <span class="med-cross c4"></span>
      <span class="molecule m1"></span>
      <span class="molecule m2"></span>
      <span class="molecule m3"></span>
    </div>
    <div class="hero-noise"></div>
    <div class="hero-orb hero-orb-1"></div>
    <div class="hero-orb hero-orb-2"></div>
    <div class="hero-orb hero-orb-3"></div>
    <div class="container">
      <div class="hero-grid">
        <!-- Text -->
        <div>
          <div class="hero-eyebrow">🏥 Egypt's Leading Healthcare Platform</div>
          <h1 class="hero-title">
            Healthcare<br>
            That Fits Your<br>
            <span class="text-gradient">Schedule</span>
          </h1>
          <p class="hero-sub">Book appointments with verified doctors — clinic visits, home visits, or video calls. Fast, easy, and trusted by thousands.</p>
          <div class="hero-cta">
            <a routerLink="/register" class="btn btn-brand btn-xl">Book Appointment →</a>
            <a routerLink="/doctors" class="btn btn-glass btn-xl">Browse Doctors</a>
          </div>
          <div class="hero-numbers">
            <div class="hn-item"><strong>500+</strong><span>Verified Doctors</span></div>
            <div class="hn-sep"></div>
            <div class="hn-item"><strong>50K+</strong><span>Happy Patients</span></div>
            <div class="hn-sep"></div>
            <div class="hn-item"><strong>4.9★</strong><span>Average Rating</span></div>
          </div>
        </div>

        <!-- Visual -->
        <div class="hero-visual">
          <div class=""><img style="border-radius: 10px;" src="https://img.magnific.com/free-photo/cheerful-male-doctor-white-gown-portrait_53876-105121.jpg" alt=""></div>

          <div class="hero-float-card hero-float-card-1">
            <div style="width:40px;height:40px;border-radius:12px;background:var(--brand-gradient);display:flex;align-items:center;justify-content:center;font-size:18px">👨‍⚕️</div>
            <div>
              <strong style="font-size:13px;display:block">Dr. Ahmed Hassan</strong>
              <span style="font-size:11px;color:var(--text-muted)">Nephrologist • ⭐ 4.9</span>
            </div>
          </div>

          <div class="hero-float-card hero-float-card-2">
            <div style="font-size:22px">✅</div>
            <div>
              <strong style="font-size:12px;display:block">Appointment Confirmed</strong>
              <span style="font-size:11px;color:var(--text-muted)">Today at 10:30 AM</span>
            </div>
          </div>

          <div class="hero-float-card hero-float-card-3">
            <div style="font-size:22px">📹</div>
            <div>
              <strong style="font-size:12px;display:block">Video Call Ready</strong>
              <span style="font-size:11px;color:var(--text-muted)">Join in 5 minutes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- SPECIALTIES -->
  <section class="section" id="specialties" style="background:var(--bg-2)">
    <div class="container">
      <div style="text-align:center;margin-bottom:52px">
        <div class="section-eyebrow">Medical Fields</div>
        <h2 style="font-size:clamp(28px,4vw,42px);margin-bottom:12px">Browse by <span class="text-gradient">Specialty</span></h2>
        <p style="color:var(--text-muted);font-size:16px">Find the right specialist for your health needs</p>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:50px">
        <a *ngFor="let s of specialties; let i = index"
           [routerLink]="'/doctors'" [queryParams]="{specialty:s.name}"
           class="spec-card card card-hover"
           [style.animation-delay]="i*0.07+'s'">
          <div class="spec-icon">{{ s.icon }}</div>
          <strong>{{ s.name }}</strong>
          <span style="font-size:11px;color:var(--text-muted)">{{ s.count }}+ doctors</span>
        </a>
      </div>
    </div>
  </section>

  <!-- HOW IT WORKS -->
  <section class="section" id="how">
    <div class="container">
      <div style="text-align:center;margin-bottom:52px">
        <div class="section-eyebrow">Simple Process</div>
        <h2 style="font-size:clamp(28px,4vw,42px);margin-bottom:12px">Steps For How <span class="text-gradient">Doctory</span> Works</h2>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:24px">
        <div class="how-card card" *ngFor="let s of steps; let i = index" [style.animation-delay]="i*0.1+'s'">
          <div class="how-num">0{{ i+1 }}</div>
          <div class="how-icon">{{ s.icon }}</div>
          <h3>{{ s.title }}</h3>
          <p>{{ s.desc }}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- FEATURED DOCTORS -->
  <section class="section" style="background:var(--bg-2)" *ngIf="doctors.length > 0">
    <div class="container">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:40px;flex-wrap:wrap;gap:16px">
        <div>
          <div class="section-eyebrow">Top Rated</div>
          <h2 style="font-size:clamp(24px,3.5vw,36px)">Featured <span class="text-gradient">Doctors</span></h2>
        </div>
        <a routerLink="/doctors" class="btn btn-outline">View All →</a>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(268px,1fr));gap:20px">
        <a [routerLink]="['/doctors',d._id]" class="doc-card" *ngFor="let d of doctors">
          <div class="doc-img">
            <img *ngIf="d.image_profile" [src]="d.image_profile" [alt]="d.fullName">
            <div *ngIf="!d.image_profile" class="doc-placeholder">{{ initials(d.fullName) }}</div>
            <div class="doc-spec-tag">{{ d.specialty }}</div>
          </div>
          <div class="doc-body">
            <div class="doc-name">{{ d.title||'Dr.' }} {{ d.fullName }}</div>
            <div class="doc-rating">
              <span class="stars">{{ stars(d.rating) }}</span>
              <span style="font-weight:700">{{ d.rating | number:'1.1-1' }}</span>
              <span style="color:var(--text-muted);font-size:12px">({{ d.reviewCount }})</span>
            </div>
            <div class="doc-chips">
              <span class="chip">🏥 {{ d.experience }} yrs</span>
              <span class="chip" *ngIf="d.homeVisit?.available">🏠 Home</span>
              <span class="chip" *ngIf="d.video_consulation?.available">📹 Video</span>
            </div>
            <div class="doc-foot">
              <div class="doc-fee"><span class="lbl">From</span><span class="val">{{ minFee(d) }} EGP</span></div>
              <span class="btn btn-brand btn-sm">Book</span>
            </div>
          </div>
        </a>
      </div>
    </div>
  </section>

  <!-- CTA BANNER -->
  <section style="padding:80px 0">
    <div class="container">
      <div class="cta-banner">
        <div class="cta-glow"></div>
        <div class="cta-content">
          <div class="section-eyebrow" style="color:rgba(255,255,255,.7)">Join Us</div>
          <h2 style="font-size:clamp(28px,4vw,48px);color:#fff;margin-bottom:14px">Are You a Doctor?</h2>
          <p style="color:rgba(255,255,255,.65);font-size:16px;margin-bottom:32px;max-width:480px">Join Doctory and connect with thousands of patients across Egypt. Grow your practice digitally.</p>
          <div style="display:flex;gap:14px;flex-wrap:wrap">
            <a routerLink="/doctor-register" class="btn btn-xl" style="background:#fff;color:var(--brand-1);font-weight:700">Join as Doctor →</a>
            <a routerLink="/login" class="btn btn-xl btn-glass" style="border-color:rgba(255,255,255,.25);color:#fff">Sign In</a>
          </div>
        </div>
        <div class="cta-emoji">🩺</div>
      </div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <div style="font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:22px;color:#fff;margin-bottom:12px">Doct<span style="background:var(--brand-gradient);-webkit-background-clip:text;-webkit-text-fill-color:transparent">ory</span></div>
          <p style="color:rgba(255,255,255,.4);font-size:13px;line-height:1.7;max-width:240px">Your trusted healthcare booking platform across Egypt.</p>
        </div>
        <div>
          <h4>Patients</h4>
          <a routerLink="/doctors">Find Doctors</a>
          <a routerLink="/register">Create Account</a>
          <a routerLink="/login">Sign In</a>
        </div>
        <div>
          <h4>Doctors</h4>
          <a routerLink="/doctor-register">Join Platform</a>
          <a routerLink="/login">Doctor Login</a>
        </div>
        <div>
          <h4>Specialties</h4>
          <a *ngFor="let s of specialties.slice(0,4)" [routerLink]="'/doctors'" [queryParams]="{specialty:s.name}">{{ s.name }}</a>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2025 Doctory — NTI Final Project</span>
        <div style="display:flex;gap:16px">
          
          <span style="color:rgba(255,255,255,.3)"><a href="https://github.com/MostafaAkram20/"> Github Repository</a></span>
        </div>
      </div>
    </div>
  </footer>
  </div>
  `,
  styles: [`
    .landing-page { position:relative; }
    .med-bg {
      position:absolute; inset:0; z-index:0; pointer-events:none; overflow:hidden;
      opacity:.38;
    }
    .hero .container { position:relative; z-index:1; }
    :host-context([data-theme="dark"]) .med-bg { opacity:.34; }
    .dna { position:absolute; top:-8%; height:120%; width:110px; }
    .dna-left { left:-8px; animation: dnaDrift 28s ease-in-out infinite; }
    .dna-right { right:-12px; animation: dnaDriftRight 34s ease-in-out infinite; }
    .strand { fill:none; stroke-width:2.2; stroke-linecap:round; }
    .strand-a { stroke:#7c3aed; }
    .strand-b { stroke:#06b6d4; }
    .rung { stroke:#7c3aed; stroke-width:1.4; opacity:.55; }
    .ecg {
      position:absolute; left:-10%; width:120%; height:90px; opacity:.7;
      animation: ecgSlide 18s linear infinite;
    }
    .ecg { bottom:14%; }
    .ecg-2 { top:22%; opacity:.35; animation-duration:26s; animation-direction:reverse; }
    .ecg-line {
      fill:none; stroke:#06b6d4; stroke-width:1.6; stroke-linecap:round; stroke-linejoin:round;
      stroke-dasharray:80 420; animation: ecgPulse 2.4s ease-in-out infinite;
    }
    .med-cross {
      position:absolute; width:18px; height:18px; opacity:.55;
      background:linear-gradient(#7c3aed,#06b6d4);
      clip-path: polygon(35% 0, 65% 0, 65% 35%, 100% 35%, 100% 65%, 65% 65%, 65% 100%, 35% 100%, 35% 65%, 0 65%, 0 35%, 35% 35%);
      animation: floatSoft 9s ease-in-out infinite;
    }
    .c1 { top:18%; left:12%; animation-delay:0s; }
    .c2 { top:62%; left:22%; width:12px; height:12px; animation-delay:1.4s; }
    .c3 { top:28%; right:18%; animation-delay:2.2s; }
    .c4 { top:72%; right:26%; width:14px; height:14px; animation-delay:3s; }
    .molecule {
      position:absolute; width:10px; height:10px; border-radius:50%;
      background:rgba(6,182,212,.55); box-shadow:0 0 0 6px rgba(6,182,212,.12);
      animation: floatSoft 11s ease-in-out infinite;
    }
    .m1 { top:40%; left:8%; animation-delay:.6s; }
    .m2 { top:52%; right:10%; background:rgba(124,58,237,.5); box-shadow:0 0 0 7px rgba(124,58,237,.12); animation-delay:1.8s; }
    .m3 { top:16%; right:36%; width:7px; height:7px; animation-delay:2.8s; }
    @keyframes dnaDrift {
      0% { transform:translateY(0) rotate(-8deg); }
      50% { transform:translateY(-36px) rotate(-6deg); }
      100% { transform:translateY(0) rotate(-8deg); }
    }
    @keyframes dnaDriftRight {
      0% { transform:translateY(0) rotate(8deg) scaleX(-1); }
      50% { transform:translateY(40px) rotate(6deg) scaleX(-1); }
      100% { transform:translateY(0) rotate(8deg) scaleX(-1); }
    }
    @keyframes ecgSlide { 0% { transform:translateX(0); } 100% { transform:translateX(-8%); } }
    @keyframes ecgPulse { 0%,100% { stroke-dashoffset:0; opacity:.45; } 50% { stroke-dashoffset:-120; opacity:.9; } }
    @keyframes floatSoft {
      0%,100% { transform:translateY(0) rotate(0deg); }
      50% { transform:translateY(-18px) rotate(12deg); }
    }
    @media (max-width:768px) {
      .dna { width:72px; opacity:.85; }
      .ecg-2 { display:none; }
      .med-bg { opacity:.16; }
    }
    @media (prefers-reduced-motion: reduce) {
      .med-bg * { animation:none !important; }
    }
    .section-eyebrow { display:inline-block;background:rgba(124,58,237,.12);color:var(--brand-1);font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;padding:4px 12px;border-radius:20px;margin-bottom:12px; }
    .spec-card { display:flex;flex-direction:column;align-items:center;gap:8px;padding:24px 16px;text-align:center;cursor:pointer; .spec-icon{font-size:36px;margin-bottom:4px;} strong{font-size:13px;} }
    .how-card { padding:28px;text-align:center; .how-num{font-family:'Bricolage Grotesque',sans-serif;font-size:11px;font-weight:800;color:var(--brand-1);letter-spacing:1px;margin-bottom:12px;} .how-icon{font-size:36px;margin-bottom:14px;} h3{font-size:16px;margin-bottom:8px;} p{font-size:13px;color:var(--text-muted);line-height:1.65;} }
    .doc-placeholder { width:72px;height:72px;border-radius:50%;background:var(--brand-gradient);color:#fff;display:flex;align-items:center;justify-content:center;font-family:'Bricolage Grotesque',sans-serif;font-size:22px;font-weight:800; }
    .cta-banner { background:var(--brand-gradient);border-radius:var(--r-2xl);padding:64px 56px;display:flex;align-items:center;justify-content:space-between;gap:32px;position:relative;overflow:hidden; }
    .cta-glow { position:absolute;width:400px;height:400px;border-radius:50%;background:rgba(255,255,255,.08);top:-100px;right:-100px;pointer-events:none; }
    .cta-emoji { font-size:100px;opacity:.85;flex-shrink:0; }
    .footer { background:#080614;padding:72px 0 0; }
    .footer-grid { display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:48px;padding-bottom:48px;border-bottom:1px solid rgba(255,255,255,.06); h4{color:#fff;font-size:12px;font-weight:700;letter-spacing:.5px;margin-bottom:16px;} a{display:block;font-size:13px;color:rgba(255,255,255,.4);margin-bottom:10px;transition:var(--t); &:hover{color:#fff;}} }
    .footer-bottom { display:flex;align-items:center;justify-content:space-between;padding:20px 0;font-size:13px;color:rgba(255,255,255,.25); }
    @media(max-width:768px) { .cta-banner{flex-direction:column;padding:40px 28px;} .cta-emoji{display:none;} .footer-grid{grid-template-columns:1fr 1fr;gap:32px;} }
  `]
})
export class LandingComponent implements OnInit {
  dna = LandingComponent.buildDna();
  doctors: any[] = [];
  specialties = [
    { name:'Cardiology',   icon:'❤️',  count:48 },
    { name:'Dermatology',  icon:'🧴',  count:36 },
    { name:'Neurology',    icon:'🧠',  count:29 },
    { name:'Pediatrics',   icon:'👶',  count:54 },
    { name:'Psychiatry',   icon:'🧘',  count:22 },
  ];
  steps = [
    { icon:'🔍', title:'Find a Doctor', desc:'Search by specialty, name, or area across Egypt.' },
    { icon:'📅', title:'Pick a Slot',   desc:'Choose a time that works for you from live availability.' },
    { icon:'✅', title:'Get Confirmed', desc:'Instant confirmation and reminders for your appointment.' },
    { icon:'🩺', title:'Get Treated',   desc:'Visit in-person, at home, or via video call.' },
  ];
  constructor(public theme: ThemeService, private ds: DoctorService, public auth: AuthService) {}
  private static buildDna() {
    const height = 720;
    const steps = 48;
    const amp = 28;
    const cx = 40;
    let p1 = '';
    let p2 = '';
    const rungs: { x1: number; x2: number; y: number }[] = [];
    for (let i = 0; i <= steps; i++) {
      const y = (i / steps) * height;
      const a = (i / steps) * Math.PI * 8;
      const x1 = cx + Math.sin(a) * amp;
      const x2 = cx - Math.sin(a) * amp;
      p1 += i === 0 ? `M ${x1.toFixed(1)} ${y.toFixed(1)}` : ` L ${x1.toFixed(1)} ${y.toFixed(1)}`;
      p2 += i === 0 ? `M ${x2.toFixed(1)} ${y.toFixed(1)}` : ` L ${x2.toFixed(1)} ${y.toFixed(1)}`;
      if (i % 2 === 0) rungs.push({ x1: +x1.toFixed(1), x2: +x2.toFixed(1), y: +y.toFixed(1) });
    }
    return { p1, p2, rungs };
  }
  ngOnInit() { this.ds.getDoctors({ limit: 4 }).subscribe({ next: (r: any) => { if (r.success) this.doctors = r.data.doctors; } }); }
  stars(r: number) { return '★'.repeat(Math.round(r)) + '☆'.repeat(5 - Math.round(r)); }
  initials(n: string) { return n.split(' ').map((x: string) => x[0]).join('').slice(0, 2).toUpperCase(); }
  minFee(d: any) { const f=[d.homeVisit?.fees,d.video_consulation?.fees].filter(Boolean) as number[]; return f.length?Math.min(...f):0; }
  userDisplayName(): string {
    const u = this.auth.currentUser();
    if (!u) return '';
    return u.fullName || u.name || [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email || 'User';
  }
  userProfilePhoto(): string {
    const raw = this.auth.currentUser()?.image_profile;
    return typeof raw === 'string' && raw.trim() ? raw.trim() : '';
  }
  userInitials(): string {
    const name = this.userDisplayName().trim();
    if (!name) return 'U';
    return name.split(' ').filter(Boolean).map((x: string) => x[0]).join('').slice(0, 2).toUpperCase();
  }
  dashboardRoute(): string {
    const role = this.auth.getRole();
    if (role === 'doctor') return '/doctor/dashboard';
    if (role === 'admin') return '/admin/dashboard';
    return '/patient/dashboard';
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DoctorService } from '../../../core/services/doctor.service';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-doctors',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
  <!-- NAV -->
  <nav class="pub-nav">
    <div class="container" style="display:flex;align-items:center;gap:40px;height:100%">
      <a routerLink="/" class="nav-logo"><span>Doctory</span></a>
      <div class="nav-links">
        <a routerLink="/">Home</a>
        <a routerLink="/doctors" class="active">Find Doctors</a>
      </div>
      <div class="nav-right">
        <button class="theme-toggle" (click)="theme.toggle()">{{ theme.isDark()?'☀️':'🌙' }}</button>
        <ng-container *ngIf="auth.isLoggedIn(); else doctorsGuestNav">
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
        <ng-template #doctorsGuestNav>
          <a routerLink="/login" class="btn btn-ghost btn-sm">Sign In</a>
          <a routerLink="/register" class="btn btn-brand btn-sm">Get Started</a>
        </ng-template>
      </div>
    </div>
  </nav>

  <div class="page-wrap">
    <!-- Hero Search -->
    <div class="search-hero">
      <div class="container">
        <div style="text-align:center;margin-bottom:32px">
          <h1 style="font-size:clamp(28px,4vw,48px);margin-bottom:10px">Find Your <span class="text-gradient">Doctor</span></h1>
          <p style="color:var(--text-muted);font-size:16px">500+ verified specialists across Egypt</p>
        </div>
        <div class="search-row">
          <div class="search-bar" style="flex:1">
            <span class="search-icon">🔍</span>
            <input [(ngModel)]="search" (ngModelChange)="onSearch()" placeholder="Search doctor by name…">
          </div>
          <select class="form-control" style="max-width:200px;border-color:var(--border-2)" [(ngModel)]="specialty" (ngModelChange)="load()">
            <option value="">All Specialties</option>
            <option *ngFor="let s of specialties" [value]="s">{{ s }}</option>
          </select>
          <button class="btn btn-brand" (click)="load()">Search</button>
        </div>
      </div>
    </div>

    <div class="container" style="padding-top:32px;padding-bottom:60px">
      <!-- Specialty Pills -->
      <div class="filter-bar">
        <button class="filter-pill" [class.active]="specialty===''" (click)="setSpec('')">All</button>
        <button class="filter-pill" *ngFor="let s of specialties" [class.active]="specialty===s" (click)="setSpec(s)">
          {{ icons[s] }} {{ s }}
        </button>
      </div>

      <!-- Results -->
      <div class="results-row" *ngIf="!loading">
        <p style="font-size:14px;color:var(--text-muted)">
          <strong style="color:var(--text)">{{ total }}</strong> doctors found
          <span *ngIf="specialty"> in <strong style="color:var(--brand-1)">{{ specialty }}</strong></span>
        </p>
      </div>

      <!-- Skeleton -->
      <div class="docs-grid" *ngIf="loading">
        <div *ngFor="let s of [1,2,3,4,5,6]" class="skeleton" style="height:340px;border-radius:var(--r-xl)"></div>
      </div>

      <!-- Cards -->
      <div class="docs-grid" *ngIf="!loading && doctors.length>0">
        <a [routerLink]="['/doctors',d._id]" class="doc-card" *ngFor="let d of doctors; let i=index"
           [style.animation-delay]="i*0.06+'s'" style="animation:fadeInUp .5s ease forwards;opacity:0">
          <div class="doc-img">
            <img *ngIf="d.image_profile" [src]="d.image_profile" [alt]="d.fullName">
            <div *ngIf="!d.image_profile" class="doc-ava-big">{{ ini(d.fullName) }}</div>
            <div class="doc-spec-tag">{{ d.specialty }}</div>
            <div *ngIf="d.isVerified" class="doc-verified-badge">✓</div>
          </div>
          <div class="doc-body">
            <div class="doc-name">{{ d.title||'Dr.' }} {{ d.fullName }}</div>
            <div class="doc-rating">
              <span class="stars">{{ stars(d.rating) }}</span>
              <span style="font-weight:700;font-size:13px">{{ d.rating | number:'1.1-1' }}</span>
              <span style="color:var(--text-muted);font-size:12px">({{ d.reviewCount }})</span>
            </div>
            <div class="doc-chips">
              <span class="chip">🏥 {{ d.experience }} yrs</span>
              <span class="chip" *ngIf="d.homeVisit?.available">🏠 Home</span>
              <span class="chip" *ngIf="d.video_consulation?.available">📹 Video</span>
              <span class="chip">📍 {{ d.region }}</span>
            </div>
            <div class="doc-foot">
              <div class="doc-fee"><span class="lbl">From</span><span class="val">{{ minFee(d) }} EGP</span></div>
              <span class="btn btn-brand btn-sm">Book Now</span>
            </div>
          </div>
        </a>
      </div>

      <!-- Empty -->
      <div class="empty-state" *ngIf="!loading && doctors.length===0">
        <div class="es-icon">🔍</div>
        <h3>No doctors found</h3>
        <p>Try a different specialty or search term</p>
        <button class="btn btn-outline mt-16" (click)="clear()">Clear Filters</button>
      </div>

      <!-- Pagination -->
      <div class="pagination" *ngIf="pages>1 && !loading">
        <button class="page-btn" (click)="go(page-1)" [disabled]="page===1">←</button>
        <button class="page-btn" *ngFor="let p of pageArr()" [class.active]="p===page" (click)="go(p)">{{ p }}</button>
        <button class="page-btn" (click)="go(page+1)" [disabled]="page===pages">→</button>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .search-hero { background:linear-gradient(180deg,var(--bg-2) 0%,var(--bg) 100%);padding:48px 0 40px;border-bottom:1px solid var(--border-2); }
    .search-row { display:flex;gap:12px;max-width:760px;margin:0 auto;flex-wrap:wrap; }
    .docs-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(272px,1fr));gap:20px;margin-top:20px; }
    .doc-ava-big { width:80px;height:80px;border-radius:50%;background:var(--brand-gradient);color:#fff;display:flex;align-items:center;justify-content:center;font-family:'Bricolage Grotesque',sans-serif;font-size:24px;font-weight:800; }
    .doc-verified-badge { position:absolute;top:10px;right:10px;width:24px;height:24px;border-radius:50%;background:var(--success);color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700; }
    .results-row { display:flex;align-items:center;justify-content:space-between;margin-bottom:4px; }
  `]
})
export class DoctorsComponent implements OnInit {
  doctors: any[] = []; loading = true; search = ''; specialty = ''; page = 1; pages = 1; total = 0;
  specialties: string[]; icons: Record<string,string> = { Cardiology:'❤️',Dermatology:'🧴',Neurology:'🧠',Pediatrics:'👶',Psychiatry:'🧘' };
  private st: any;
  constructor(public theme: ThemeService, public auth: AuthService, private ds: DoctorService, private route: ActivatedRoute) { this.specialties = ds.specialties; }
  ngOnInit() { this.route.queryParams.subscribe(p => { if(p['specialty']) this.specialty=p['specialty']; this.load(); }); }
  load() { this.loading=true; this.ds.getDoctors({specialty:this.specialty,search:this.search,page:this.page,limit:12}).subscribe({ next:(r:any)=>{ this.loading=false; if(r.success){this.doctors=r.data.doctors;this.total=r.data.pagination.total;this.pages=r.data.pagination.pages;} }, error:()=>this.loading=false }); }
  onSearch() { clearTimeout(this.st); this.st=setTimeout(()=>{this.page=1;this.load();},400); }
  setSpec(s: string) { this.specialty=s; this.page=1; this.load(); }
  clear() { this.search=''; this.specialty=''; this.page=1; this.load(); }
  go(p: number) { if(p>=1&&p<=this.pages){this.page=p;this.load();} }
  pageArr() { return Array.from({length:this.pages},(_,i)=>i+1).slice(Math.max(0,this.page-3),this.page+2); }
  stars(r: number) { return '★'.repeat(Math.round(r))+'☆'.repeat(5-Math.round(r)); }
  ini(n: string) { return n.split(' ').map((x: string)=>x[0]).join('').slice(0,2).toUpperCase(); }
  minFee(d: any) { const f=[d.homeVisit?.fees,d.video_consulation?.fees].filter(Boolean) as number[]; return f.length?Math.min(...f):0; }
  userDisplayName(): string {
    const u = this.auth.currentUser();
    if (!u) return '';
    return u.fullName || u.name || [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email || 'User';
  }
  userInitials(): string {
    const name = this.userDisplayName().trim();
    if (!name) return 'U';
    return name.split(/\s+/).filter(Boolean).map((x: string) => x[0]).join('').slice(0, 2).toUpperCase();
  }
  userProfilePhoto(): string {
    const raw = this.auth.currentUser()?.image_profile;
    return typeof raw === 'string' && raw.trim() ? raw.trim() : '';
  }
  dashboardRoute(): string {
    const role = this.auth.getRole();
    if (role === 'doctor') return '/doctor/dashboard';
    if (role === 'admin') return '/admin/dashboard';
    return '/patient/dashboard';
  }
}

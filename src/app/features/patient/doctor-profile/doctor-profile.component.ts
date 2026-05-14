import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { DoctorService } from '../../../core/services/doctor.service';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-doctor-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
  <nav class="pub-nav">
    <div class="container" style="display:flex;align-items:center;gap:32px;height:100%">
      <a routerLink="/" class="nav-logo"><span>Doctory</span></a>
      <div class="nav-links"><a routerLink="/">Home</a><a routerLink="/doctors">Doctors</a></div>
      <div class="nav-right">
        <button class="theme-toggle" (click)="theme.toggle()">{{ theme.isDark()?'☀️':'🌙' }}</button>
        <ng-container *ngIf="auth.isLoggedIn(); else profileGuestNav">
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
        <ng-template #profileGuestNav>
          <a routerLink="/login" class="btn btn-ghost btn-sm">Sign In</a>
          <a routerLink="/register" class="btn btn-brand btn-sm">Get Started</a>
        </ng-template>
      </div>
    </div>
  </nav>

  <div class="page-wrap" *ngIf="!doc && !loading" style="display:flex;align-items:center;justify-content:center">
    <div class="empty-state"><div class="es-icon">❌</div><h3>Doctor not found</h3></div>
  </div>

  <div class="page-wrap" *ngIf="loading" style="display:flex;align-items:center;justify-content:center">
    <div class="spinner" style="width:48px;height:48px"></div>
  </div>

  <div class="page-wrap" *ngIf="doc && !loading">
    <div class="container" style="padding:36px 28px">
      <a routerLink="/doctors" class="back-btn">← Back to Doctors</a>

      <!-- Profile Header -->
      <div class="prof-header card" style="display:flex;gap:28px;flex-wrap:wrap;align-items:flex-start;margin-bottom:24px">
        <div style="position:relative;flex-shrink:0">
          <div class="prof-img">
            <img *ngIf="doc.image_profile" [src]="doc.image_profile" [alt]="doc.fullName" style="width:100%;height:100%;object-fit:cover;border-radius:20px">
            <div *ngIf="!doc.image_profile" class="prof-ava">{{ ini(doc.fullName) }}</div>
          </div>
          <div class="verified-pill" *ngIf="doc.isVerified">✓ Verified</div>
        </div>
        <div style="flex:1;min-width:200px">
          <h1 style="font-size:28px;margin-bottom:6px">{{ doc.title||'Dr.' }} {{ doc.fullName }}</h1>
          <div class="spec-pill">{{ doc.specialty }}</div>
          <div class="prof-meta-row">
            <div class="pm-item prof-rating-line">
              <span class="stars-prof" [attr.aria-label]="'Average rating ' + displayRating() + ' out of 5'">{{ stars(displayRating()) }}</span>
              <span><strong>{{ displayRating() | number:'1.1-1' }}</strong> · {{ displayReviewCount() }} {{ displayReviewCount() === 1 ? 'review' : 'reviews' }}</span>
            </div>
            <div class="pm-item"><span>🏥</span><span>{{ doc.experience }} Years Experience</span></div>
            <div class="pm-item"><span>📍</span><span>{{ doc.region }}</span></div>
            <div class="pm-item" *ngIf="doc.languages?.length"><span>🌍</span><span>{{ doc.languages?.join(', ') }}</span></div>
          </div>
          <div class="prof-counters">
            <div class="pc-item"><strong>{{ doc.totalPatients }}</strong><span>Patients</span></div>
            <div class="pc-sep"></div>
            <div class="pc-item"><strong>{{ doc.acceptanceRate }}%</strong><span>Acceptance</span></div>
            <div class="pc-sep"></div>
            <div class="pc-item"><strong>{{ doc.profileViews }}</strong><span>Profile Views</span></div>
          </div>
        </div>
        <div class="prof-cta">
          <a [routerLink]="['/patient/book',doc._id]" class="btn btn-brand btn-lg" *ngIf="auth.isPatient()">📅 Book Appointment</a>
          <a routerLink="/login" class="btn btn-brand btn-lg" *ngIf="!auth.isLoggedIn()">📅 Book Appointment</a>
          <div class="fee-badge" *ngIf="minFee()>0">From <strong>{{ minFee() }} EGP</strong></div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:2fr 1fr;gap:20px">
        <div>
          <!-- Bio -->
          <div class="card mb-20" *ngIf="doc.bio">
            <div class="section-tag">About</div>
            <p style="color:var(--text-muted);line-height:1.8;font-size:14px">{{ doc.bio }}</p>
          </div>

          <div class="card mb-20" *ngIf="reviews.length || displayReviewCount()">
            <div class="section-tag">Patient reviews</div>
            <p *ngIf="!reviews.length" style="font-size:13px;color:var(--text-muted);line-height:1.6;margin:0 0 8px 0">
              Average <strong>{{ displayRating() | number:'1.1-1' }}</strong> out of 5 from <strong>{{ displayReviewCount() }}</strong> patient {{ displayReviewCount() === 1 ? 'rating' : 'ratings' }}. Written reviews will show below when patients add them.
            </p>
            <div class="patient-review-list" *ngIf="reviews.length">
              <div class="patient-review-card" *ngFor="let rev of reviews">
                <div class="pr-head">
                  <span class="stars-prof sm">{{ stars(reviewStars(rev)) }}</span>
                  <span class="pr-meta">{{ reviewAuthor(rev) }}<ng-container *ngIf="rev.createdAt"> · {{ rev.createdAt | date:'mediumDate' }}</ng-container></span>
                </div>
                <p class="pr-body" *ngIf="reviewText(rev)">{{ reviewText(rev) }}</p>
              </div>
            </div>
          </div>

          <!-- Consultation Types -->
          <div class="card mb-20">
            <div class="section-tag">Consultation Types</div>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px">
              <div class="consult-tile" *ngFor="let c of consultTypes()">
                <div style="font-size:28px;margin-bottom:8px">{{ c.icon }}</div>
                <strong style="font-size:13px;display:block">{{ c.label }}</strong>
                <div style="font-size:14px;font-weight:700;color:var(--brand-1);margin-top:4px">{{ c.fee }} EGP</div>
              </div>
            </div>
          </div>

          <!-- Clinics -->
          <div class="card" *ngIf="doc.clinic?.length">
            <div class="section-tag">Clinic Locations</div>
            <div class="clinic-rows">
              <div class="clinic-row" *ngFor="let c of doc.clinic">
                <div class="cr-icon">🏥</div>
                <div><strong style="font-size:14px;display:block">{{ c.name }}</strong><span style="font-size:12px;color:var(--text-muted)">📍 {{ c.address?.city }}</span></div>
                <div style="font-size:16px;font-weight:800;color:var(--brand-1);margin-left:auto">{{ c.feveseta }} EGP</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Quick Info -->
        <div class="card" style="height:fit-content">
          <div class="section-tag">Quick Info</div>
          <div class="info-rows">
            <div class="ir"><span>Specialty</span><strong>{{ doc.specialty }}</strong></div>
            <div class="ir"><span>Experience</span><strong>{{ doc.experience }} years</strong></div>
            <div class="ir"><span>Gender</span><strong style="text-transform:capitalize">{{ doc.gender||'—' }}</strong></div>
            <div class="ir"><span>Languages</span><strong>{{ doc.languages?.join(', ')||'English' }}</strong></div>
            <div class="ir"><span>Home Visit</span><strong [style.color]="doc.homeVisit?.available?'var(--success)':'var(--danger)'">{{ doc.homeVisit?.available?'Available':'Not Available' }}</strong></div>
            <div class="ir"><span>Video Call</span><strong [style.color]="doc.video_consulation?.available?'var(--success)':'var(--danger)'">{{ doc.video_consulation?.available?'Available':'Not Available' }}</strong></div>
          </div>
          <a [routerLink]="['/patient/book',doc._id]" class="btn btn-brand btn-block mt-20" *ngIf="auth.isPatient()">Book Appointment</a>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .back-btn { display:inline-flex;align-items:center;gap:6px;font-size:13px;color:var(--text-muted);margin-bottom:20px;transition:var(--t); &:hover{color:var(--brand-1);} }
    .prof-img { width:120px;height:120px;border-radius:20px;overflow:hidden;background:rgba(124,58,237,.08);display:flex;align-items:center;justify-content:center; }
    .prof-ava { font-family:'Bricolage Grotesque',sans-serif;font-size:36px;font-weight:800;color:var(--brand-1); }
    .verified-pill { position:absolute;bottom:-8px;left:50%;transform:translateX(-50%);background:var(--success);color:#fff;font-size:10px;font-weight:700;padding:2px 10px;border-radius:10px;white-space:nowrap; }
    .spec-pill { display:inline-block;background:rgba(124,58,237,.1);color:var(--brand-1);font-size:13px;font-weight:600;padding:4px 12px;border-radius:20px;margin-bottom:14px; }
    .prof-meta-row { display:flex;flex-wrap:wrap;gap:14px;margin-bottom:16px; }
    .pm-item { display:flex;align-items:center;gap:6px;font-size:13px;color:var(--text-muted); }
    .prof-rating-line { flex-wrap:wrap; align-items:center; gap:8px; }
    .stars-prof { color:#f59e0b; font-size:15px; letter-spacing:1px; font-family:system-ui,sans-serif; line-height:1; }
    .stars-prof.sm { font-size:13px; }
    .patient-review-list { display:flex; flex-direction:column; gap:14px; }
    .patient-review-card { padding:14px 16px; background:var(--bg-3); border-radius:var(--r-lg); border:1px solid var(--border-2); }
    .pr-head { display:flex; flex-wrap:wrap; align-items:center; gap:10px; margin-bottom:8px; }
    .pr-meta { font-size:12px; color:var(--text-muted); }
    .pr-body { font-size:14px; color:var(--text); line-height:1.6; margin:0; }
    .prof-counters { display:flex;align-items:center;gap:20px; }
    .pc-item { display:flex;flex-direction:column; strong{font-family:'Bricolage Grotesque',sans-serif;font-size:20px;font-weight:800;} span{font-size:11px;color:var(--text-muted);} }
    .pc-sep { width:1px;height:32px;background:var(--border-2); }
    .prof-cta { display:flex;flex-direction:column;gap:10px;align-items:flex-end;margin-left:auto;flex-shrink:0; }
    .fee-badge { background:rgba(124,58,237,.08);border:1px solid rgba(124,58,237,.15);border-radius:var(--r);padding:8px 14px;text-align:right;font-size:12px;color:var(--text-muted); strong{display:block;font-family:'Bricolage Grotesque',sans-serif;font-size:18px;color:var(--brand-1);} }
    .section-tag { font-size:11px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:var(--text-muted);margin-bottom:16px; }
    .consult-tile { background:var(--bg-3);border:1px solid var(--border-2);border-radius:var(--r-lg);padding:18px;text-align:center;transition:var(--t); &:hover{border-color:var(--brand-1);} }
    .clinic-rows { display:flex;flex-direction:column;gap:12px; }
    .clinic-row { display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg-3);border-radius:var(--r-lg); }
    .cr-icon { font-size:22px; }
    .info-rows { display:flex;flex-direction:column; }
    .ir { display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border-2);font-size:13px; span{color:var(--text-muted);} strong{font-size:13px;} &:last-child{border:none;} }
    .mb-20 { margin-bottom:20px; }
  `]
})
export class DoctorProfileComponent implements OnInit {
  doc: any = null; loading = true; reviews: any[] = [];
  constructor(private route: ActivatedRoute, private ds: DoctorService, public auth: AuthService, public theme: ThemeService) {}
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.ds.getDoctorById(id).subscribe({
      next: (r: any) => {
        this.loading = false;
        if (r.success) {
          this.doc = r.data.doctor;
          const embedded = this.doc?.reviews;
          this.reviews = Array.isArray(embedded) ? embedded : [];
        }
        if (!this.reviews.length) {
          this.ds.getDoctorReviews(id).pipe(catchError(() => of(null))).subscribe((rev: any) => {
            if (rev?.success && Array.isArray(rev.data?.reviews)) this.reviews = rev.data.reviews;
          });
        }
      },
      error: () => (this.loading = false),
    });
  }
  displayRating(): number {
    const n = Number(this.doc?.rating);
    return Number.isFinite(n) ? n : 0;
  }
  displayReviewCount(): number {
    const n = Number(this.doc?.reviewCount);
    return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
  }
  stars(r: number): string {
    const n = Math.min(5, Math.max(0, Math.round(r || 0)));
    return '★'.repeat(n) + '☆'.repeat(5 - n);
  }
  reviewStars(rev: any): number {
    const v = rev?.rating ?? rev?.stars;
    return v != null ? Number(v) : 0;
  }
  reviewText(rev: any): string {
    const t = rev?.comment ?? rev?.review ?? rev?.text;
    return typeof t === 'string' ? t.trim() : '';
  }
  reviewAuthor(rev: any): string {
    const n = rev?.patientName ?? rev?.patient?.fullName ?? rev?.author;
    return typeof n === 'string' && n.trim() ? n.trim() : 'Patient';
  }
  ini(n: string) { return n.split(' ').map((x: string)=>x[0]).join('').slice(0,2).toUpperCase(); }
  minFee() { const f=[this.doc?.homeVisit?.fees,this.doc?.video_consulation?.fees].filter(Boolean) as number[]; return f.length?Math.min(...f):0; }
  consultTypes() { const t=[]; if(this.doc?.homeVisit?.available)t.push({icon:'🏠',label:'Home Visit',fee:this.doc.homeVisit.fees}); if(this.doc?.video_consulation?.available)t.push({icon:'📹',label:'Video Call',fee:this.doc.video_consulation.fees}); if(this.doc?.clinic?.length)t.push({icon:'🏥',label:'Clinic Visit',fee:this.doc.clinic[0]?.feveseta||0}); t.push({icon:'🎤',label:'Voice Call',fee:this.doc?.video_consulation?.fees||0}); return t; }
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

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, SidebarComponent],
  template: `
  <div class="app-shell">
    <app-sidebar [sections]="nav"></app-sidebar>
    <div class="main-wrap">
      <div class="topbar">
        <div>
          <h2>Good {{ greeting }}, {{ firstName }} 👋</h2>
          <p style="font-size:13px;color:var(--text-muted);margin-top:2px">Here's your health overview</p>
        </div>
        <div class="topbar-right">
          <a routerLink="/doctors" class="btn btn-brand btn-sm">+ Book Appointment</a>
        </div>
      </div>

      <div class="page-body">
        <!-- Stats -->
        <div class="stats-row">
          <div class="stat-card" *ngFor="let s of stats">
            <div class="sc-icon" [style.background]="s.bg">{{ s.icon }}</div>
            <div class="sc-info">
              <div class="sc-val">{{ s.val }}</div>
              <div class="sc-label">{{ s.label }}</div>
            </div>
          </div>
        </div>

        <div class="grid-2">
          <!-- Recent Appointments -->
          <div class="card">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
              <h3 style="font-size:15px">Recent Appointments</h3>
              <a routerLink="/patient/appointments" class="btn btn-ghost btn-sm">View All</a>
            </div>

            <div *ngIf="loading" style="display:flex;flex-direction:column;gap:12px">
              <div *ngFor="let i of [1,2,3]" class="skeleton" style="height:64px;border-radius:var(--r-lg)"></div>
            </div>

            <div *ngIf="!loading && appointments.length > 0" style="display:flex;flex-direction:column;gap:10px">
              <div class="appt-row" *ngFor="let a of appointments">
                <div class="ar-avatar">{{ a.doctor?.specialty?.[0] || '👨‍⚕️' }}</div>
                <div class="ar-info">
                  <strong>{{ a.doctor?.title }} {{ a.doctor?.fullName }}</strong>
                  <span>{{ a.doctor?.specialty }}</span>
                </div>
                <div class="ar-date">
                  <strong>{{ a.date | date:'MMM d' }}</strong>
                  <span>{{ a.Time }}</span>
                </div>
                <span class="badge badge-{{ a.status }}">{{ a.status }}</span>
              </div>
            </div>

            <div class="empty-state" style="padding:36px" *ngIf="!loading && appointments.length === 0">
              <div class="es-icon">📅</div>
              <h3>No appointments yet</h3>
              <p>Book your first appointment now</p>
              <a routerLink="/doctors" class="btn btn-brand btn-sm mt-16">Find a Doctor</a>
            </div>
          </div>

          <!-- Quick Actions + Specialties -->
          <div style="display:flex;flex-direction:column;gap:16px">
            <div class="card">
              <h3 style="font-size:15px;margin-bottom:14px">Quick Actions</h3>
              <div style="display:flex;flex-direction:column;gap:8px">
                <a *ngFor="let q of quickActions" [routerLink]="q.route" [queryParams]="q.params" class="quick-action">
                  <div class="qa-icon">{{ q.icon }}</div>
                  <div>
                    <strong style="font-size:13px;display:block">{{ q.label }}</strong>
                    <span style="font-size:11px;color:var(--text-muted)">{{ q.sub }}</span>
                  </div>
                  <span style="margin-left:auto;color:var(--text-muted);font-size:16px">›</span>
                </a>
              </div>
            </div>

            <div class="card">
              <h3 style="font-size:15px;margin-bottom:14px">Browse Specialties</h3>
              <div class="spec-mini-grid">
                <a *ngFor="let s of specialties" [routerLink]="'/doctors'" [queryParams]="{specialty:s.name}" class="spec-mini">
                  <span style="font-size:24px">{{ s.icon }}</span>
                  <span style="font-size:11px;font-weight:500;text-align:center">{{ s.name }}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .appt-row { display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg-3);border-radius:var(--r-lg); }
    .ar-avatar { width:42px;height:42px;border-radius:var(--r);background:var(--brand-gradient);color:#fff;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0; }
    .ar-info { flex:1; strong{display:block;font-size:13px;} span{font-size:11px;color:var(--text-muted);} }
    .ar-date { text-align:right;margin-right:8px; strong{display:block;font-size:13px;} span{font-size:11px;color:var(--text-muted);} }
    .quick-action { display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg-3);border-radius:var(--r-lg);transition:var(--t); &:hover{background:rgba(124,58,237,.08);border-color:var(--brand-1);} }
    .qa-icon { width:36px;height:36px;border-radius:var(--r-sm);background:var(--bg-2);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0; }
    .spec-mini-grid { display:grid;grid-template-columns:repeat(5,1fr);gap:8px; }
    .spec-mini { display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 6px;background:var(--bg-3);border-radius:var(--r);transition:var(--t); &:hover{background:rgba(124,58,237,.08);} }
  `]
})
export class PatientDashboardComponent implements OnInit {
  appointments: any[] = [];
  loading = true;
  stats: any[] = [];
  nav = [{ label: 'Menu', items: [{ icon: '🏠', label: 'Dashboard', route: '/patient/dashboard' }, { icon: '🔍', label: 'Find Doctors', route: '/doctors' }, { icon: '📅', label: 'My Appointments', route: '/patient/appointments' }] }];
  quickActions = [
    { icon: '🔍', label: 'Find a Doctor', sub: 'Browse 500+ specialists', route: '/doctors', params: {} },
    { icon: '❤️', label: 'Cardiology', sub: 'Heart specialists', route: '/doctors', params: { specialty: 'Cardiology' } },
    { icon: '🧠', label: 'Neurology', sub: 'Brain & nervous system', route: '/doctors', params: { specialty: 'Neurology' } },
    { icon: '📋', label: 'All Appointments', sub: 'View your history', route: '/patient/appointments', params: {} },
  ];
  specialties = [
    { name: 'Cardiology', icon: '❤️' }, { name: 'Dermatology', icon: '🧴' },
    { name: 'Neurology', icon: '🧠' }, { name: 'Pediatrics', icon: '👶' }, { name: 'Psychiatry', icon: '🧘' },
  ];

  constructor(public auth: AuthService, private as: AppointmentService) {}

  get firstName() { return this.auth.currentUser()?.fullName?.split(' ')[0] || 'there'; }
  get greeting() { const h = new Date().getHours(); return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'; }

  ngOnInit() {
    this.as.getMyAppointments({ limit: 5 }).subscribe({
      next: (r: any) => {
        this.loading = false;
        if (r.success) {
          this.appointments = r.data.appointments;
          const all = r.data.appointments;
          this.stats = [
            { icon: '📅', label: 'Total Appointments', val: r.data.pagination.total, bg: 'rgba(99,102,241,.12)' },
            { icon: '✅', label: 'Completed', val: all.filter((a: any) => a.status === 'completed').length, bg: 'rgba(16,185,129,.12)' },
            { icon: '⏳', label: 'Pending', val: all.filter((a: any) => a.status === 'pending').length, bg: 'rgba(245,158,11,.12)' },
            { icon: '❌', label: 'Cancelled', val: all.filter((a: any) => a.status === 'cancelled').length, bg: 'rgba(244,63,94,.12)' },
          ];
        }
      },
      error: () => this.loading = false
    });
  }
}

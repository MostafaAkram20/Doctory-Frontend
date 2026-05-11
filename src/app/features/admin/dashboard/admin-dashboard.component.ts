import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, SidebarComponent],
  template: `
  <div class="app-shell">
    <app-sidebar [sections]="nav"></app-sidebar>
    <div class="main-wrap">
      <div class="topbar">
        <div><h2>Admin Dashboard</h2><p style="font-size:13px;color:var(--text-muted);margin-top:2px">Platform overview</p></div>
        <div class="admin-crown">🛡 Administrator</div>
      </div>
      <div class="page-body">
        <div *ngIf="loading" style="display:flex;justify-content:center;padding:60px"><div class="spinner" style="width:48px;height:48px"></div></div>
        <div *ngIf="!loading">
          <div class="stats-row">
            <div class="stat-card big-stat" *ngFor="let s of stats">
              <div class="sc-icon" [style.background]="s.bg">{{ s.icon }}</div>
              <div class="sc-info">
                <div class="sc-val">{{ s.val }}</div>
                <div class="sc-label">{{ s.label }}</div>
              </div>
              <a [routerLink]="s.link" class="stat-link" *ngIf="s.link">View →</a>
            </div>
          </div>

          <div class="grid-3">
            <a routerLink="/admin/users" class="admin-nav-card card card-hover">
              <div class="anc-icon" style="background:linear-gradient(135deg,#3b82f6,#1d4ed8)">👥</div>
              <h3>Manage Users</h3>
              <p>View, activate, and deactivate patient accounts</p>
              <span class="anc-arrow">→</span>
            </a>
            <a routerLink="/admin/doctors" class="admin-nav-card card card-hover">
              <div class="anc-icon" style="background:linear-gradient(135deg,#10b981,#059669)">👨‍⚕️</div>
              <h3>Manage Doctors</h3>
              <p>Update, verify, and manage doctor profiles</p>
              <span class="anc-arrow">→</span>
            </a>
            <a routerLink="/admin/clinics" class="admin-nav-card card card-hover">
              <div class="anc-icon" style="background:linear-gradient(135deg,#f59e0b,#d97706)">🏥</div>
              <h3>Manage Clinics</h3>
              <p>Create clinics, assign doctors, manage schedules</p>
              <span class="anc-arrow">→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .admin-crown { background:rgba(244,63,94,.1);border:1px solid rgba(244,63,94,.2);color:var(--danger);padding:6px 14px;border-radius:20px;font-size:13px;font-weight:700; }
    .big-stat { position:relative; }
    .stat-link { position:absolute;top:16px;right:16px;font-size:12px;color:var(--brand-1);font-weight:600; }
    .admin-nav-card { display:flex;flex-direction:column;gap:10px;padding:28px;position:relative; .anc-icon{width:52px;height:52px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:24px;} h3{font-size:16px;} p{font-size:13px;color:var(--text-muted);line-height:1.5;flex:1;} .anc-arrow{font-size:18px;color:var(--brand-1);} }
  `]
})
export class AdminDashboardComponent implements OnInit {
  stats: any[] = []; loading = true;
  nav = [{ label: 'Admin', items: [{ icon: '📊', label: 'Dashboard', route: '/admin/dashboard' }, { icon: '👥', label: 'Users', route: '/admin/users' }, { icon: '👨‍⚕️', label: 'Doctors', route: '/admin/doctors' }, { icon: '🏥', label: 'Clinics', route: '/admin/clinics' }] }];
  constructor(public auth: AuthService, private http: HttpClient) {}
  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/admin/dashboard`).subscribe({
      next: (r: any) => {
        this.loading = false;
        if (r.success) {
          const d = r.data;
          this.stats = [
            { icon: '👥', label: 'Total Patients', val: d.totalUsers, bg: 'rgba(59,130,246,.12)', link: '/admin/users' },
            { icon: '👨‍⚕️', label: 'Total Doctors', val: d.totalDoctors, bg: 'rgba(16,185,129,.12)', link: '/admin/doctors' },
            { icon: '📅', label: 'Total Appointments', val: d.totalAppointments, bg: 'rgba(124,58,237,.12)', link: null },
            { icon: '⏳', label: 'Pending Appointments', val: d.pendingAppointments, bg: 'rgba(245,158,11,.12)', link: null },
          ];
        }
      },
      error: () => this.loading = false
    });
  }
}

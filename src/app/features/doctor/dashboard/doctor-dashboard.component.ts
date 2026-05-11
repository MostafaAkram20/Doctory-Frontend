import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, SidebarComponent],
  template: `
  <div class="app-shell">
    <app-sidebar [sections]="nav"></app-sidebar>
    <div class="main-wrap">
      <div class="topbar">
        <div>
          <h2>Doctor Dashboard 👨‍⚕️</h2>
          <p style="font-size:13px;color:var(--text-muted);margin-top:2px">{{ today | date:'EEEE, MMMM d, y' }}</p>
        </div>
        <div class="topbar-right">
          <div class="doc-tag">{{ auth.currentUser()?.specialty || 'Specialist' }}</div>
        </div>
      </div>

      <div class="page-body">
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
          <!-- Pending Appointments -->
          <div class="card">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
              <h3 style="font-size:15px">Pending Confirmations</h3>
              <a routerLink="/doctor/appointments" class="btn btn-ghost btn-sm">View All</a>
            </div>

            <div *ngIf="loading" style="display:flex;flex-direction:column;gap:12px">
              <div *ngFor="let i of [1,2,3]" class="skeleton" style="height:60px;border-radius:var(--r-lg)"></div>
            </div>

            <div style="display:flex;flex-direction:column;gap:10px" *ngIf="!loading && pending.length">
              <div class="pend-row" *ngFor="let a of pending">
                <div class="pr-avatar">🧑</div>
                <div class="pr-info">
                  <strong>{{ a.patient?.fullName || 'Patient' }}</strong>
                  <span>{{ a.date | date:'MMM d' }} at {{ a.Time }} · {{ a.appointmentType.replace('_',' ') }}</span>
                </div>
                <button class="btn btn-success btn-xs" (click)="confirm(a)" [disabled]="busy===a._id">
                  {{ busy===a._id ? '…' : '✓ Confirm' }}
                </button>
              </div>
            </div>

            <div class="empty-state" style="padding:32px" *ngIf="!loading && !pending.length">
              <div class="es-icon" style="font-size:36px">🎉</div>
              <p>No pending appointments!</p>
            </div>
          </div>

          <!-- Today's Schedule -->
          <div class="card">
            <h3 style="font-size:15px;margin-bottom:20px">Today's Schedule</h3>
            <div style="display:flex;flex-direction:column;gap:10px" *ngIf="todayAppts.length">
              <div class="today-slot" *ngFor="let a of todayAppts">
                <div class="ts-time">{{ a.Time }}</div>
                <div>
                  <strong style="font-size:14px;display:block">{{ a.patient?.fullName || 'Patient' }}</strong>
                  <span style="font-size:12px;color:var(--text-muted);text-transform:capitalize">{{ a.appointmentType.replace('_',' ') }}</span>
                </div>
                <span class="badge badge-{{ a.status }}" style="margin-left:auto">{{ a.status }}</span>
              </div>
            </div>
            <div class="empty-state" style="padding:32px" *ngIf="!todayAppts.length">
              <div class="es-icon" style="font-size:36px">📅</div>
              <p>No appointments today</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .doc-tag { background:rgba(124,58,237,.1);color:var(--brand-1);padding:6px 14px;border-radius:20px;font-size:13px;font-weight:600; }
    .pend-row { display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg-3);border-radius:var(--r-lg); }
    .pr-avatar { width:38px;height:38px;border-radius:var(--r-sm);background:rgba(6,182,212,.1);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0; }
    .pr-info { flex:1; strong{display:block;font-size:13px;} span{font-size:11px;color:var(--text-muted);text-transform:capitalize;} }
    .today-slot { display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg-3);border-radius:var(--r-lg); }
    .ts-time { font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:14px;color:var(--brand-1);min-width:52px; }
  `]
})
export class DoctorDashboardComponent implements OnInit {
  all: any[] = []; pending: any[] = []; todayAppts: any[] = [];
  loading = true; busy = ''; today = new Date();
  stats: any[] = [];
  nav = [{ label: 'Menu', items: [{ icon: '🏠', label: 'Dashboard', route: '/doctor/dashboard' }, { icon: '📅', label: 'Appointments', route: '/doctor/appointments' }] }];

  constructor(public auth: AuthService, private as: AppointmentService, private toast: ToastService) {}

  ngOnInit() {
    this.as.getDoctorAppointments({ limit: 100 }).subscribe({
      next: (r: any) => {
        this.loading = false;
        if (r.success) {
          this.all = r.data.appointments;
          this.pending = this.all.filter(a => a.status === 'pending').slice(0, 5);
          const todayStr = new Date().toDateString();
          this.todayAppts = this.all.filter(a => new Date(a.date).toDateString() === todayStr);
          const earnings = this.all.filter(a => a.status === 'completed').reduce((s: number, a: any) => s + a.finalFees, 0);
          this.stats = [
            { icon: '📅', label: 'Total Appointments', val: r.data.pagination.total, bg: 'rgba(99,102,241,.12)' },
            { icon: '⏳', label: 'Pending', val: this.pending.length, bg: 'rgba(245,158,11,.12)' },
            { icon: '✅', label: 'Completed', val: this.all.filter(a => a.status === 'completed').length, bg: 'rgba(16,185,129,.12)' },
            { icon: '💰', label: 'Earnings (EGP)', val: earnings.toLocaleString(), bg: 'rgba(6,182,212,.12)' },
          ];
        }
      },
      error: () => this.loading = false
    });
  }

  confirm(a: any) {
    this.busy = a._id;
    this.as.confirmAppointment(a._id).subscribe({
      next: (r: any) => {
        this.busy = '';
        if (r.success) { a.status = 'confirmed'; this.pending = this.pending.filter(p => p._id !== a._id); this.toast.success('Appointment confirmed!'); }
      },
      error: () => this.busy = ''
    });
  }
}

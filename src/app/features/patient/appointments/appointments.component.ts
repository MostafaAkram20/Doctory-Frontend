import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-patient-appointments',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, SidebarComponent],
  template: `
  <div class="app-shell">
    <app-sidebar [sections]="nav"></app-sidebar>
    <div class="main-wrap">
      <div class="topbar">
        <h2>My Appointments</h2>
        <a routerLink="/doctors" class="btn btn-brand btn-sm">+ New Appointment</a>
      </div>
      <div class="page-body">
        <!-- Filter tabs -->
        <div class="filter-bar">
          <button *ngFor="let f of filters" class="filter-pill" [class.active]="active===f.val" (click)="setFilter(f.val)">
            {{ f.label }}
            <span *ngIf="count(f.val)" style="background:rgba(255,255,255,.25);padding:1px 6px;border-radius:10px;font-size:10px;margin-left:4px">{{ count(f.val) }}</span>
          </button>
        </div>

        <!-- Loading -->
        <div *ngIf="loading" style="display:flex;flex-direction:column;gap:14px">
          <div *ngFor="let i of [1,2,3]" class="skeleton" style="height:140px;border-radius:var(--r-xl)"></div>
        </div>

        <!-- Cards -->
        <div style="display:flex;flex-direction:column;gap:14px" *ngIf="!loading">
          <div *ngFor="let a of filtered; let i=index"
               class="appt-card status-{{ a.status }}"
               [style.animation-delay]="i*0.05+'s'" style="animation:fadeInUp .4s ease forwards;opacity:0">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
              <div style="display:flex;align-items:center;gap:12px">
                <div class="doc-avatar-sm">
                  <img *ngIf="a.doctor?.image_profile" [src]="a.doctor.image_profile" style="width:100%;height:100%;object-fit:cover;border-radius:50%">
                  <span *ngIf="!a.doctor?.image_profile">👨‍⚕️</span>
                </div>
                <div>
                  <strong style="font-size:15px;display:block">{{ a.doctor?.title }} {{ a.doctor?.fullName }}</strong>
                  <span style="font-size:12px;color:var(--brand-1);font-weight:600">{{ a.doctor?.specialty }}</span>
                </div>
              </div>
              <span class="badge badge-{{ a.status }}">{{ a.status }}</span>
            </div>
            <div class="appt-meta-grid">
              <div class="amg-item"><span>📅</span><span>{{ a.date | date:'EEE, MMM d, y' }}</span></div>
              <div class="amg-item"><span>🕐</span><span>{{ a.Time }}</span></div>
              <div class="amg-item"><span>🏥</span><span style="text-transform:capitalize">{{ a.appointmentType.replace('_',' ') }}</span></div>
              <div class="amg-item"><span>💰</span><span>{{ a.finalFees }} EGP</span></div>
            </div>
            <div *ngIf="a.reasonForVisit" style="font-size:13px;color:var(--text-muted);margin-top:10px">
              <strong>Reason:</strong> {{ a.reasonForVisit }}
            </div>
            <div *ngIf="a.prescription" style="background:rgba(16,185,129,.06);border:1px solid rgba(16,185,129,.15);border-radius:var(--r);padding:12px;margin-top:10px">
              <div style="font-size:12px;font-weight:700;color:var(--success);margin-bottom:4px">📋 Prescription</div>
              <p style="font-size:13px;color:var(--text-muted)">{{ a.prescription }}</p>
            </div>
            <div *ngIf="a.symptoms?.length" style="margin-top:10px;display:flex;flex-wrap:wrap;gap:6px">
              <span *ngFor="let s of a.symptoms" class="tag">{{ s }}</span>
            </div>
            <div *ngIf="['pending','confirmed'].includes(a.status)" style="margin-top:14px;padding-top:14px;border-top:1px solid var(--border-2);display:flex;justify-content:flex-end;gap:8px">
              <button class="btn btn-danger btn-sm" (click)="openCancel(a)" [disabled]="actionId===a._id">Cancel Appointment</button>
            </div>
          </div>
        </div>

        <div class="empty-state" *ngIf="!loading && !filtered.length">
          <div class="es-icon">📅</div>
          <h3>No {{ active === 'all' ? '' : active }} appointments</h3>
          <p>{{ active === 'all' ? 'You have not booked any appointments yet.' : 'Nothing here yet.' }}</p>
          <a routerLink="/doctors" class="btn btn-brand mt-16">Book an Appointment</a>
        </div>
      </div>
    </div>
  </div>

  <!-- Cancel Modal -->
  <div class="overlay" *ngIf="cancelTarget" (click)="cancelTarget=null">
    <div class="modal" (click)="$event.stopPropagation()">
      <div class="modal-head">
        <h3>Cancel Appointment</h3>
        <button class="close" (click)="cancelTarget=null">×</button>
      </div>
      <p style="font-size:14px;color:var(--text-muted);margin-bottom:16px">Are you sure you want to cancel this appointment with <strong>{{ cancelTarget?.doctor?.fullName }}</strong>?</p>
      <div class="form-group">
        <label>Reason (optional)</label>
        <textarea class="form-control" rows="3" [(ngModel)]="cancelReason" placeholder="Let us know why you're cancelling…"></textarea>
      </div>
      <div style="display:flex;gap:10px;justify-content:flex-end">
        <button class="btn btn-ghost" (click)="cancelTarget=null">Keep It</button>
        <button class="btn btn-danger" (click)="confirmCancel()" [disabled]="cancelLoading">
          {{ cancelLoading ? 'Cancelling…' : 'Yes, Cancel' }}
        </button>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .doc-avatar-sm { width:46px;height:46px;border-radius:50%;background:rgba(124,58,237,.1);display:flex;align-items:center;justify-content:center;font-size:20px;overflow:hidden;flex-shrink:0; }
    .appt-meta-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:10px;background:var(--bg-3);border-radius:var(--r-lg);padding:12px; }
    .amg-item { display:flex;align-items:center;gap:6px;font-size:13px; }
    @media(max-width:600px){.appt-meta-grid{grid-template-columns:repeat(2,1fr);}}
  `]
})
export class PatientAppointmentsComponent implements OnInit {
  all: any[] = []; filtered: any[] = []; loading = true; active = 'all';
  actionId = ''; cancelTarget: any = null; cancelReason = ''; cancelLoading = false;
  nav = [{ label: 'Menu', items: [{ icon: '🏠', label: 'Dashboard', route: '/patient/dashboard' }, { icon: '🔍', label: 'Find Doctors', route: '/doctors' }, { icon: '📅', label: 'My Appointments', route: '/patient/appointments' }] }];
  filters = [
    { label: 'All', val: 'all' }, { label: '⏳ Pending', val: 'pending' },
    { label: '✅ Confirmed', val: 'confirmed' }, { label: '🏁 Completed', val: 'completed' },
    { label: '❌ Cancelled', val: 'cancelled' },
  ];

  constructor(public auth: AuthService, private as: AppointmentService, private toast: ToastService) {}

  ngOnInit() {
    this.as.getMyAppointments({ limit: 100 }).subscribe({
      next: (r: any) => { this.loading = false; if (r.success) { this.all = r.data.appointments; this.filtered = this.all; } },
      error: () => this.loading = false
    });
  }

  setFilter(v: string) { this.active = v; this.filtered = v === 'all' ? this.all : this.all.filter(a => a.status === v); }
  count(v: string) { return v === 'all' ? 0 : this.all.filter(a => a.status === v).length; }
  openCancel(a: any) { this.cancelTarget = a; this.cancelReason = ''; }
  confirmCancel() {
    if (!this.cancelTarget) return;
    this.cancelLoading = true;
    this.as.cancelAppointment(this.cancelTarget._id, this.cancelReason).subscribe({
      next: (r: any) => {
        this.cancelLoading = false;
        if (r.success) {
          const i = this.all.findIndex(a => a._id === this.cancelTarget._id);
          if (i !== -1) this.all[i].status = 'cancelled';
          this.setFilter(this.active);
          this.cancelTarget = null;
          this.toast.success('Appointment cancelled.');
        }
      },
      error: () => this.cancelLoading = false
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-doctor-appointments',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, SidebarComponent],
  template: `
  <div class="app-shell">
    <app-sidebar [sections]="nav"></app-sidebar>
    <div class="main-wrap">
      <div class="topbar"><h2>Appointments</h2></div>
      <div class="page-body">
        <div class="filter-bar">
          <button *ngFor="let f of filters" class="filter-pill" [class.active]="active===f" (click)="setFilter(f)">
            {{ f === 'all' ? 'All' : f }}
          </button>
        </div>

        <div *ngIf="loading" style="display:flex;flex-direction:column;gap:14px">
          <div *ngFor="let i of [1,2,3]" class="skeleton" style="height:140px;border-radius:var(--r-xl)"></div>
        </div>

        <div style="display:flex;flex-direction:column;gap:14px" *ngIf="!loading">
          <div *ngFor="let a of filtered" class="appt-card status-{{ a.status }}">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
              <div style="display:flex;align-items:center;gap:12px">
                <div class="pat-avatar">🧑</div>
                <div>
                  <strong style="font-size:15px;display:block">{{ a.patient?.fullName || 'Patient' }}</strong>
                  <span style="font-size:12px;color:var(--text-muted)">{{ a.patient?.phone || a.patient?.email }}</span>
                </div>
              </div>
              <span class="badge badge-{{ a.status }}">{{ a.status }}</span>
            </div>

            <div class="appt-meta-g">
              <div class="amg"><span>📅</span><span>{{ a.date | date:'EEE, MMM d, y' }}</span></div>
              <div class="amg"><span>🕐</span><span>{{ a.Time }}</span></div>
              <div class="amg"><span>🏥</span><span style="text-transform:capitalize">{{ a.appointmentType.replace('_',' ') }}</span></div>
              <div class="amg"><span>💰</span><span>{{ a.finalFees }} EGP</span></div>
            </div>

            <div *ngIf="a.reasonForVisit" style="margin-top:10px;font-size:13px;color:var(--text-muted)"><strong>Reason:</strong> {{ a.reasonForVisit }}</div>
            <div *ngIf="a.symptoms?.length" style="margin-top:8px;display:flex;flex-wrap:wrap;gap:5px">
              <span *ngFor="let s of a.symptoms" class="tag">{{ s }}</span>
            </div>

            <!-- Notes form -->
            <div class="notes-panel" *ngIf="notesId===a._id">
              <div class="form-group">
                <label>Doctor Notes</label>
                <textarea class="form-control" rows="3" [(ngModel)]="noteTxt" placeholder="Diagnosis and observations…"></textarea>
              </div>
              <div class="form-group">
                <label>Prescription</label>
                <textarea class="form-control" rows="2" [(ngModel)]="prescTxt" placeholder="Medications and dosage…"></textarea>
              </div>
              <div style="display:flex;gap:8px">
                <button class="btn btn-ghost btn-sm" (click)="notesId=''">Cancel</button>
                <button class="btn btn-brand btn-sm" (click)="saveNotes(a)">Save Notes</button>
              </div>
            </div>

            <div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border-2);display:flex;gap:8px;flex-wrap:wrap">
              <button class="btn btn-success btn-sm" *ngIf="a.status==='pending'" (click)="doAction('confirm',a)" [disabled]="busy===a._id">✓ Confirm</button>
              <button class="btn btn-cyan btn-sm" *ngIf="a.status==='confirmed'" (click)="doAction('complete',a)" [disabled]="busy===a._id">🏁 Complete</button>
              <button class="btn btn-ghost btn-sm" *ngIf="a.status==='completed' && notesId!==a._id" (click)="notesId=a._id;noteTxt=a.doctorNotes||'';prescTxt=a.prescription||''">📋 Add Notes</button>
              <button class="btn btn-ghost btn-sm" *ngIf="a.status==='confirmed'" (click)="doAction('noshow',a)" [disabled]="busy===a._id">🚫 No Show</button>
              <button class="btn btn-danger btn-sm" *ngIf="['pending','confirmed'].includes(a.status)" (click)="doAction('cancel',a)" [disabled]="busy===a._id">Cancel</button>
            </div>
          </div>
        </div>

        <div class="empty-state" *ngIf="!loading && !filtered.length">
          <div class="es-icon">📅</div>
          <h3>No {{ active==='all'?'':active }} appointments</h3>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .pat-avatar { width:44px;height:44px; border-radius:50%;background:rgba(6,182,212,.1);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0; }
    .appt-meta-g { display:grid;grid-template-columns:repeat(4,1fr);gap:10px;background:var(--bg-3);border-radius:var(--r-lg);padding:12px;margin-top:4px; }
    .amg { display:flex;align-items:center;gap:6px;font-size:13px; }
    .notes-panel { background:var(--bg-3);border-radius:var(--r-lg);padding:16px;margin-top:12px; }
    @media(max-width:600px){.appt-meta-g{grid-template-columns:repeat(2,1fr);}}
  `]
})
export class DoctorAppointmentsComponent implements OnInit {
  all: any[] = []; filtered: any[] = []; loading = true; active = 'all'; busy = '';
  notesId = ''; noteTxt = ''; prescTxt = '';
  filters = ['all', 'pending', 'confirmed', 'completed', 'cancelled', 'no_show'];
  nav = [{ label: 'Menu', items: [{ icon: '🏠', label: 'Dashboard', route: '/doctor/dashboard' }, { icon: '📅', label: 'Appointments', route: '/doctor/appointments' }] }];

  constructor(public auth: AuthService, private as: AppointmentService, private toast: ToastService) {}

  ngOnInit() {
    this.as.getDoctorAppointments({ limit: 100 }).subscribe({
      next: (r: any) => { this.loading = false; if (r.success) { this.all = r.data.appointments; this.filtered = this.all; } },
      error: () => this.loading = false
    });
  }

  setFilter(f: string) { this.active = f; this.filtered = f === 'all' ? this.all : this.all.filter(a => a.status === f); }

  doAction(action: string, a: any) {
    this.busy = a._id;
    const obs = action === 'confirm' ? this.as.confirmAppointment(a._id) : action === 'complete' ? this.as.completeAppointment(a._id) : action === 'noshow' ? this.as.markNoShow(a._id) : this.as.cancelAppointment(a._id, 'Cancelled by doctor');
    obs.subscribe({
      next: (r: any) => {
        this.busy = '';
        if (r.success) {
          a.status = action === 'confirm' ? 'confirmed' : action === 'complete' ? 'completed' : action === 'noshow' ? 'no_show' : 'cancelled';
          this.toast.success(`Appointment ${a.status}!`);
        }
      },
      error: () => this.busy = ''
    });
  }

  saveNotes(a: any) {
    this.as.addNotes(a._id, { doctorNotes: this.noteTxt, prescription: this.prescTxt }).subscribe({
      next: (r: any) => { if (r.success) { a.doctorNotes = this.noteTxt; a.prescription = this.prescTxt; this.notesId = ''; this.toast.success('Notes saved!'); } }
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorService } from '../../../core/services/doctor.service';
import { ClinicService } from '../../../core/services/clinic.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SidebarComponent],
  template: `
  <div class="app-shell">
    <app-sidebar [sections]="nav"></app-sidebar>
    <div class="main-wrap">
      <div class="topbar">
        <h2>Book Appointment</h2>
        <a routerLink="/doctors" class="btn btn-ghost btn-sm">← Back to Doctors</a>
      </div>
      <div class="page-body">
        <div class="book-layout">
          <div class="card" style="padding:32px">
            <!-- Step Bar -->
            <div class="step-bar">
              <div class="step-dot" [class.active]="step>=1" [class.done]="step>1"><div class="dot">{{ step>1?'✓':'1' }}</div><div class="step-name">Type</div></div>
              <div class="step-bar-line" [class.done]="step>1"></div>
              <div class="step-dot" [class.active]="step>=2" [class.done]="step>2"><div class="dot">{{ step>2?'✓':'2' }}</div><div class="step-name">Schedule</div></div>
              <div class="step-bar-line" [class.done]="step>2"></div>
              <div class="step-dot" [class.active]="step>=3" [class.done]="step>3"><div class="dot">{{ step>3?'✓':'3' }}</div><div class="step-name">Details</div></div>
              <div class="step-bar-line" [class.done]="step>3"></div>
              <div class="step-dot" [class.active]="step>=4"><div class="dot">4</div><div class="step-name">Confirm</div></div>
            </div>

            <!-- Step 1 -->
            <div *ngIf="step===1">
              <h3 style="font-size:18px;margin-bottom:6px">Choose Appointment Type</h3>
              <p style="color:var(--text-muted);font-size:13px;margin-bottom:24px">How would you like to consult?</p>
              <div class="type-card-grid">
                <div class="type-card" [class.selected]="apptType==='clinic'" (click)="apptType='clinic'">
                  <span class="tc-icon">🏥</span><strong>Clinic Visit</strong><p>In-person at the clinic</p>
                </div>
                <div class="type-card" [class.selected]="apptType==='home_visit'" [class.disabled]="!doc?.homeVisit?.available" (click)="doc?.homeVisit?.available&&(apptType='home_visit')">
                  <span class="tc-icon">🏠</span><strong>Home Visit</strong><p>Doctor visits you</p>
                  <div class="tc-fee" *ngIf="doc?.homeVisit?.available">{{ doc.homeVisit.fees }} EGP</div>
                  <div style="font-size:10px;color:var(--danger);margin-top:4px" *ngIf="!doc?.homeVisit?.available">Not Available</div>
                </div>
                <div class="type-card" [class.selected]="apptType==='video'" [class.disabled]="!doc?.video_consulation?.available" (click)="doc?.video_consulation?.available&&(apptType='video')">
                  <span class="tc-icon">📹</span><strong>Video Call</strong><p>Online consultation</p>
                  <div class="tc-fee" *ngIf="doc?.video_consulation?.available">{{ doc.video_consulation.fees }} EGP</div>
                </div>
                <div class="type-card" [class.selected]="apptType==='voice'" (click)="apptType='voice'">
                  <span class="tc-icon">🎤</span><strong>Voice Call</strong><p>Phone consultation</p>
                </div>
              </div>
              <button class="btn btn-brand btn-lg mt-24" (click)="step=2" [disabled]="!apptType">Continue →</button>
            </div>

            <!-- Step 2 -->
            <div *ngIf="step===2">
              <h3 style="font-size:18px;margin-bottom:20px">Choose Date & Time</h3>
              <div class="form-group" *ngIf="apptType==='clinic' && doc?.clinic?.length">
                <label>Select Clinic</label>
                <select class="form-control" [(ngModel)]="clinicId" (ngModelChange)="onClinicChange()">
                  <option value="">Choose a clinic</option>
                  <option *ngFor="let c of doc.clinic" [value]="c._id">{{ c.name }} — {{ c.address?.city }} · {{ c.feveseta }} EGP</option>
                </select>
              </div>
              <ng-container *ngIf="apptType==='clinic' && clinicId">
                <label style="font-size:13px;font-weight:600;display:block;margin-bottom:10px">Days with open slots</label>
                <p style="font-size:12px;color:var(--text-muted);margin:0 0 14px">Pick a day, then choose a time. Only dates that still have free slots are listed.</p>
                <div *ngIf="slotsLoading" style="text-align:center;padding:24px"><div class="spinner" style="margin:0 auto;width:32px;height:32px"></div></div>
                <div class="date-chip-row" *ngIf="!slotsLoading && datesWithSlots.length">
                  <button type="button" *ngFor="let d of datesWithSlots" class="date-chip" [class.selected]="date===d" (click)="pickClinicDate(d)">
                    <span class="dc-dow">{{ d | date:'EEE' }}</span>
                    <span class="dc-day">{{ d | date:'MMM d' }}</span>
                  </button>
                </div>
                <div class="empty-state" style="padding:28px" *ngIf="!slotsLoading && !datesWithSlots.length">
                  <div class="es-icon" style="font-size:32px">📅</div><p>No upcoming slots at this clinic yet. Try another location or check back later.</p>
                </div>
                <div *ngIf="!slotsLoading && date && slots.length" style="margin-top:20px">
                  <label style="font-size:13px;font-weight:600;display:block;margin-bottom:12px">Times on {{ date | date:'EEEE, MMMM d' }}</label>
                  <div class="slot-grid">
                    <button type="button" *ngFor="let s of slots" class="slot-pill" [class.selected]="slot?._id===s._id" [disabled]="s.isBooked" (click)="slot=s;time=s.startTime">{{ s.startTime }}</button>
                  </div>
                </div>
                <div class="empty-state" style="padding:20px" *ngIf="!slotsLoading && date && !slots.length"><p style="margin:0;font-size:14px;color:var(--text-muted)">No times left on this day.</p></div>
              </ng-container>
              <div class="form-group" *ngIf="apptType!=='clinic'">
                <label>Select Date</label>
                <input class="form-control" type="date" [(ngModel)]="date" [min]="minDate" (ngModelChange)="onDateChange()">
              </div>
              <div class="form-group mt-16" *ngIf="apptType!=='clinic'">
                <label>Preferred Time</label>
                <input class="form-control" type="time" [(ngModel)]="time">
              </div>
              <div style="display:flex;gap:10px;margin-top:24px">
                <button class="btn btn-ghost" (click)="step=1">← Back</button>
                <button class="btn btn-brand btn-lg" (click)="step=3" [disabled]="!canStep2()">Continue →</button>
              </div>
            </div>

            <!-- Step 3 -->
            <div *ngIf="step===3">
              <h3 style="font-size:18px;margin-bottom:20px">Visit Details</h3>
              <div class="form-group">
                <label>Reason for Visit</label>
                <textarea class="form-control" rows="3" [(ngModel)]="reason" placeholder="Describe your symptoms or reason for the visit…"></textarea>
              </div>
              <div class="form-group">
                <label>Symptoms <span style="color:var(--text-muted);font-weight:400">(comma separated)</span></label>
                <input class="form-control" [(ngModel)]="sympInput" placeholder="e.g. fever, headache, fatigue">
              </div>
              <div style="display:flex;gap:10px;margin-top:24px">
                <button class="btn btn-ghost" (click)="step=2">← Back</button>
                <button class="btn btn-brand btn-lg" (click)="step=4">Review Booking →</button>
              </div>
            </div>

            <!-- Step 4 -->
            <div *ngIf="step===4">
              <h3 style="font-size:18px;margin-bottom:20px">Confirm Your Appointment</h3>
              <div class="confirm-box">
                <div class="cb-row"><span>Doctor</span><strong>{{ doc?.title }} {{ doc?.fullName }}</strong></div>
                <div class="cb-row"><span>Type</span><strong style="text-transform:capitalize">{{ apptType?.replace('_',' ') }}</strong></div>
                <div class="cb-row"><span>Date</span><strong>{{ date | date:'EEEE, MMMM d, y' }}</strong></div>
                <div class="cb-row"><span>Time</span><strong>{{ time }}</strong></div>
                <div class="cb-row" *ngIf="apptType==='clinic'"><span>Clinic</span><strong>{{ clinicName() }}</strong></div>
                <div class="cb-row" *ngIf="reason"><span>Reason</span><strong>{{ reason }}</strong></div>
                <div class="cb-row cb-total"><span>Consultation Fee</span><strong style="font-size:22px;color:var(--brand-1)">{{ fee() }} EGP</strong></div>
              </div>
              <div class="error-box mt-16" *ngIf="err">{{ err }}</div>
              <div style="display:flex;gap:10px;margin-top:20px">
                <button class="btn btn-ghost" (click)="step=3">← Back</button>
                <button class="btn btn-brand btn-lg" style="flex:1;justify-content:center" (click)="book()" [disabled]="loading">
                  <span class="spinner" style="width:18px;height:18px" *ngIf="loading"></span>
                  {{ loading ? 'Booking…' : '✅ Confirm Booking' }}
                </button>
              </div>
            </div>

            <!-- Step 5: Success -->
            <div *ngIf="step===5" style="text-align:center;padding:40px 0">
              <div style="font-size:72px;margin-bottom:20px;animation:pulse 1s ease">🎉</div>
              <h2 style="font-size:28px;margin-bottom:12px">Appointment Booked!</h2>
              <p style="color:var(--text-muted);font-size:15px;margin-bottom:32px">Your request has been submitted. The doctor will confirm shortly.</p>
              <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
                <a routerLink="/patient/appointments" class="btn btn-brand btn-lg">View My Appointments</a>
                <a routerLink="/doctors" class="btn btn-ghost btn-lg">Find More Doctors</a>
              </div>
            </div>
          </div>

          <!-- Doctor Summary -->
          <div class="card doc-summary" *ngIf="doc && step<5">
            <div class="ds-img">
              <img *ngIf="doc.image_profile" [src]="doc.image_profile" style="width:100%;height:100%;object-fit:cover">
              <div *ngIf="!doc.image_profile" class="ds-ava">{{ ini(doc.fullName) }}</div>
            </div>
            <h3 style="font-size:15px;text-align:center;margin-bottom:4px">{{ doc.title }} {{ doc.fullName }}</h3>
            <p style="text-align:center;color:var(--brand-1);font-size:13px;font-weight:600;margin-bottom:8px">{{ doc.specialty }}</p>
            <p style="text-align:center;font-size:12px;color:var(--text-muted)">⭐ {{ (doc.rating ?? 0) | number:'1.1-1' }} ({{ doc.reviewCount ?? 0 }}) · {{ doc.experience }} yrs exp</p>
            <div class="divider"></div>
            <div style="font-size:12px;color:var(--text-muted)">
              <div style="margin-bottom:6px">📍 {{ doc.region }}</div>
              <div>🏥 {{ doc.clinic?.length || 0 }} clinic location(s)</div>
            </div>
            <div *ngIf="apptType && fee()>0" style="margin-top:14px;background:rgba(124,58,237,.08);border-radius:var(--r);padding:12px;text-align:center">
              <div style="font-size:11px;color:var(--text-muted)">Consultation fee</div>
              <div style="font-family:'Bricolage Grotesque',sans-serif;font-size:22px;font-weight:800;color:var(--brand-1)">{{ fee() }} EGP</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .book-layout { display:grid;grid-template-columns:1fr 240px;gap:20px;align-items:start; }
    .confirm-box { background:var(--bg-3);border-radius:var(--r-xl);padding:20px; }
    .cb-row { display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border-2);font-size:14px; span{color:var(--text-muted);} &:last-child{border:none;} &.cb-total{padding-top:14px;} }
    .doc-summary { padding:24px;position:sticky;top:80px;height:fit-content; }
    .ds-img { width:80px;height:80px;border-radius:50%;overflow:hidden;margin:0 auto 14px;background:rgba(124,58,237,.1);display:flex;align-items:center;justify-content:center; }
    .ds-ava { font-family:'Bricolage Grotesque',sans-serif;font-size:24px;font-weight:800;color:var(--brand-1); }
    .date-chip-row { display:flex;flex-wrap:wrap;gap:10px; }
    .date-chip { display:flex;flex-direction:column;align-items:center;gap:2px;padding:10px 14px;border-radius:var(--r-lg);border:2px solid var(--border-2);background:var(--bg-2);cursor:pointer;font:inherit;transition:background .15s,border-color .15s; }
    .date-chip:hover { border-color:var(--brand-1);background:rgba(124,58,237,.06); }
    .date-chip.selected { border-color:var(--brand-1);background:rgba(124,58,237,.12);box-shadow:0 0 0 1px var(--brand-1); }
    .dc-dow { font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em; }
    .dc-day { font-size:14px;font-weight:800;color:var(--text-1); }
    @media(max-width:900px){.book-layout{grid-template-columns:1fr;}.doc-summary{display:none;}}
  `]
})
export class BookAppointmentComponent implements OnInit {
  doc: any = null; step = 1; apptType = ''; clinicId = ''; date = ''; time = '';
  slot: any = null; slots: any[] = []; slotsLoading = false;
  /** All bookable clinic slots for selected clinic (across dates). */
  clinicSlotsAll: any[] = [];
  /** ISO date strings (YYYY-MM-DD) that have at least one free slot. */
  datesWithSlots: string[] = [];
  reason = ''; sympInput = ''; loading = false; err = '';
  minDate = new Date().toISOString().split('T')[0];
  nav = [{ items: [{ icon:'🏠', label:'Dashboard', route:'/patient/dashboard' }, { icon:'🔍', label:'Find Doctors', route:'/doctors' }, { icon:'📅', label:'My Appointments', route:'/patient/appointments' }] }];

  constructor(private route: ActivatedRoute, private router: Router, private ds: DoctorService, private cs: ClinicService, private as: AppointmentService, private toast: ToastService) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('doctorId')!;
    this.ds.getDoctorById(id).subscribe({ next: (r: any) => { if (r.success) this.doc = r.data.doctor; } });
  }

  onClinicChange() {
    this.slots = [];
    this.slot = null;
    this.time = '';
    this.date = '';
    this.clinicSlotsAll = [];
    this.datesWithSlots = [];
    if (this.clinicId) this.loadClinicSchedule();
  }
  onDateChange() {
    this.slot = null;
  }
  private slotIsBookable(s: any): boolean {
    return !!(s && s.isAvailable && !s.isBooked && s.date && String(s.date) >= this.minDate);
  }
  private mergeSlotsFromDoctorClinic(apiSlots: any[]): any[] {
    if (apiSlots.length) return apiSlots;
    const c = this.doc?.clinic?.find((x: any) => x._id === this.clinicId);
    const emb = c?.schedule_clinic;
    return Array.isArray(emb) ? [...emb] : [];
  }
  loadClinicSchedule() {
    this.slotsLoading = true;
    this.cs.getScheduleSlots(this.clinicId).subscribe({
      next: (r: any) => {
        this.slotsLoading = false;
        let raw: any[] = [];
        if (r?.success) raw = r.data?.slots || r.data?.schedule || [];
        raw = this.mergeSlotsFromDoctorClinic(raw);
        this.applyClinicSlotData(raw);
      },
      error: () => {
        this.slotsLoading = false;
        const raw = this.mergeSlotsFromDoctorClinic([]);
        this.applyClinicSlotData(raw);
      }
    });
  }
  private applyClinicSlotData(raw: any[]) {
    const list = raw.filter((s: any) => this.slotIsBookable(s));
    this.clinicSlotsAll = list;
    const set = new Set<string>();
    list.forEach((s: any) => {
      if (s.date) set.add(String(s.date).slice(0, 10));
    });
    this.datesWithSlots = Array.from(set).sort();
    if (this.date && !this.datesWithSlots.includes(this.date)) {
      this.date = '';
      this.slots = [];
      this.slot = null;
      this.time = '';
    }
    if (this.date) this.slots = list.filter((s: any) => String(s.date).slice(0, 10) === this.date);
    else this.slots = [];
  }
  pickClinicDate(d: string) {
    this.date = d;
    this.slot = null;
    this.time = '';
    this.slots = this.clinicSlotsAll.filter((s: any) => String(s.date).slice(0, 10) === d);
  }
  canStep2() { if (!this.date) return false; if (this.apptType === 'clinic') return !!(this.clinicId && this.slot); return !!this.time; }
  clinicName() { return this.doc?.clinic?.find((c: any) => c._id === this.clinicId)?.name || ''; }
  fee() { if (this.apptType === 'clinic') return this.doc?.clinic?.find((c: any) => c._id === this.clinicId)?.feveseta || 0; if (this.apptType === 'home_visit') return this.doc?.homeVisit?.fees || 0; return this.doc?.video_consulation?.fees || 0; }
  ini(n: string) { return n.split(' ').map((x: string) => x[0]).join('').slice(0, 2).toUpperCase(); }
  book() {
    this.loading = true; this.err = '';
    const payload: any = { doctorId: this.doc._id, appointmentType: this.apptType, date: this.date, Time: this.time || this.slot?.startTime, reasonForVisit: this.reason, symptoms: this.sympInput.split(',').map((s: string) => s.trim()).filter(Boolean) };
    if (this.apptType === 'clinic') { payload.clinicId = this.clinicId; payload.slotId = this.slot?._id; }
    this.as.bookAppointment(payload).subscribe({ next: (r: any) => { this.loading = false; if (r.success) { this.step = 5; this.toast.success('Appointment booked!'); } else { this.err = r.message; } }, error: (e: any) => { this.loading = false; this.err = e.error?.message || 'Booking failed.'; } });
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClinicService } from '../../../core/services/clinic.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { AuthService } from '../../../core/services/auth.service';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-clinics',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule, SidebarComponent],
  template: `
  <div class="app-shell">
    <app-sidebar [sections]="nav"></app-sidebar>
    <div class="main-wrap">
      <div class="topbar">
        <h2>Clinics Management</h2>
        <button class="btn btn-brand btn-sm" (click)="openCreate()">+ Add Clinic</button>
      </div>
      <div class="page-body">
        <div style="display:flex;gap:12px;margin-bottom:20px">
          <div class="search-bar" style="max-width:320px">
            <span class="search-icon">🔍</span>
            <input [(ngModel)]="search" (ngModelChange)="onSearch()" placeholder="Search clinics…">
          </div>
        </div>

        <div *ngIf="loading" style="display:flex;justify-content:center;padding:60px"><div class="spinner" style="width:40px;height:40px"></div></div>

        <div class="clinics-grid" *ngIf="!loading && clinics.length">
          <div class="clinic-card card" *ngFor="let c of clinics">
            <div class="cc-head">
              <div class="cc-icon">🏥</div>
              <div class="cc-info">
                <h3>{{ c.name }}</h3>
                <p>📍 {{ c.address?.city }}<span *ngIf="c.address?.governorate">, {{ c.address.governorate }}</span></p>
              </div>
              <div style="display:flex;gap:6px;flex-shrink:0">
                <button class="btn btn-ghost btn-xs" (click)="openEdit(c)">Edit</button>
                <button class="btn btn-danger btn-xs" (click)="del(c)">Delete</button>
              </div>
            </div>

            <div class="cc-meta">
              <div class="cc-meta-item"><span>💰</span><span>{{ c.feveseta }} EGP / visit</span></div>
              <div class="cc-meta-item" *ngIf="c.phone"><span>📞</span><span>{{ c.phone }}</span></div>
              <div class="cc-meta-item"><span>👨‍⚕️</span><span>{{ c.Doctor?.length || 0 }} doctors</span></div>
              <div class="cc-meta-item"><span>📅</span><span>{{ c.schedule_clinic?.length || 0 }} slots</span></div>
            </div>

            <!-- Slots preview -->
            <div *ngIf="c.schedule_clinic?.length" style="margin-top:12px">
              <div style="font-size:11px;font-weight:700;color:var(--text-muted);letter-spacing:.6px;margin-bottom:8px">SLOTS</div>
              <div style="display:flex;flex-wrap:wrap;gap:6px">
                <span *ngFor="let s of (c.schedule_clinic || []).slice(0,8)"
                  style="padding:3px 8px;border-radius:6px;font-size:11px;font-weight:600"
                  [style.background]="s.isBooked?'var(--danger-bg)':'rgba(124,58,237,.08)'"
                  [style.color]="s.isBooked?'var(--danger)':'var(--brand-1)'">
                  {{ s.startTime }}
                </span>
                <span *ngIf="(c.schedule_clinic?.length||0) > 8" style="padding:3px 8px;border-radius:6px;font-size:11px;background:var(--bg-3);color:var(--text-muted)">
                  +{{ (c.schedule_clinic?.length||0) - 8 }} more
                </span>
              </div>
            </div>

            <div style="display:flex;flex-direction:column;gap:8px;margin-top:14px">
              <button class="btn btn-outline btn-sm" style="width:100%;justify-content:center" (click)="openSlots(c)">
                📅 Manage Schedule
              </button>
              <button class="btn btn-outline btn-sm" style="width:100%;justify-content:center" (click)="openAddDoctor(c)">
                👨‍⚕️ Add Doctor
              </button>
            </div>
          </div>
        </div>

        <div class="empty-state" *ngIf="!loading && !clinics.length">
          <div class="es-icon">🏥</div>
          <h3>No clinics yet</h3>
          <p>Create your first clinic to get started</p>
          <button class="btn btn-brand mt-16" (click)="openCreate()">Add Clinic</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Create / Edit Modal -->
  <div class="overlay" *ngIf="showModal" (click)="closeModal()">
    <div class="modal" (click)="$event.stopPropagation()">
      <div class="modal-head">
        <h3>{{ editTarget ? 'Edit Clinic' : 'Add New Clinic' }}</h3>
        <button class="close" (click)="closeModal()">×</button>
      </div>
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="form-group">
          <label>Clinic Name *</label>
          <input class="form-control" formControlName="name" placeholder="Cairo Heart Center">
          <div class="error-msg" *ngIf="form.get('name')?.touched && form.get('name')?.invalid">Required</div>
        </div>
        <div class="form-row-2">
          <div class="form-group">
            <label>City *</label>
            <input class="form-control" formControlName="city" placeholder="Cairo">
            <div class="error-msg" *ngIf="form.get('city')?.touched && form.get('city')?.invalid">Required</div>
          </div>
          <div class="form-group">
            <label>Governorate</label>
            <input class="form-control" formControlName="governorate" placeholder="Cairo Governorate">
          </div>
        </div>
        <div class="form-row-2">
          <div class="form-group">
            <label>Street Address</label>
            <input class="form-control" formControlName="street" placeholder="15 Tahrir Square">
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input class="form-control" formControlName="phone" placeholder="+20212345678">
          </div>
        </div>
        <div class="form-group">
          <label>Consultation Fee (EGP) *</label>
          <input class="form-control" type="number" formControlName="feveseta" placeholder="300">
          <div class="error-msg" *ngIf="form.get('feveseta')?.touched && form.get('feveseta')?.invalid">Required</div>
        </div>
        <div class="error-box" *ngIf="formErr">{{ formErr }}</div>
        <div style="display:flex;gap:10px;justify-content:flex-end">
          <button type="button" class="btn btn-ghost" (click)="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-brand" [disabled]="saving">
            <span class="spinner" style="width:16px;height:16px" *ngIf="saving"></span>
            {{ saving ? 'Saving…' : (editTarget ? 'Save Changes' : 'Create Clinic') }}
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- Schedule Modal -->
  <div class="overlay" *ngIf="slotTarget" (click)="slotTarget=null">
    <div class="modal" style="max-width:580px" (click)="$event.stopPropagation()">
      <div class="modal-head">
        <h3>Schedule — {{ slotTarget.name }}</h3>
        <button class="close" (click)="slotTarget=null">×</button>
      </div>

      <!-- Add Slot Form -->
      <div class="add-slot-panel">
        <h4 style="font-size:14px;margin-bottom:16px;color:var(--text-2)">Add New Slot</h4>
        <div class="form-row-2">
          <div class="form-group">
            <label>Day of Week</label>
            <select class="form-control" [(ngModel)]="ns.dayOfWeek">
              <option *ngFor="let d of days" [value]="d">{{ d | titlecase }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Date</label>
            <input class="form-control" type="date" [(ngModel)]="ns.date" [min]="minDate">
          </div>
        </div>
        <div class="form-row-2">
          <div class="form-group">
            <label>Start Time</label>
            <input class="form-control" type="time" [(ngModel)]="ns.startTime">
          </div>
          <div class="form-group">
            <label>End Time</label>
            <input class="form-control" type="time" [(ngModel)]="ns.endTime">
          </div>
        </div>
        <button class="btn btn-brand btn-sm" (click)="addSlot()" [disabled]="addingSlot || !ns.date">
          {{ addingSlot ? 'Adding…' : '+ Add Slot' }}
        </button>
      </div>

      <!-- Existing Slots -->
      <div *ngIf="slotTarget.schedule_clinic?.length" style="margin-top:20px">
        <div style="font-size:12px;font-weight:700;color:var(--text-muted);letter-spacing:.6px;margin-bottom:12px">
          EXISTING SLOTS ({{ slotTarget.schedule_clinic.length }})
        </div>
        <div class="slots-scroll">
          <div class="slot-row" *ngFor="let s of slotTarget.schedule_clinic">
            <span class="sr-day">{{ s.dayOfWeek | titlecase }}</span>
            <span class="sr-date">{{ s.date | date:'MMM d' }}</span>
            <span class="sr-time">{{ s.startTime }} – {{ s.endTime }}</span>
            <span class="badge" [class]="s.isBooked ? 'badge-cancelled' : 'badge-completed'">{{ s.isBooked ? 'Booked' : 'Free' }}</span>
          </div>
        </div>
      </div>

      <div class="empty-state" style="padding:28px" *ngIf="!slotTarget.schedule_clinic?.length">
        <div class="es-icon" style="font-size:32px">📅</div>
        <p>No slots added yet</p>
      </div>
    </div>
  </div>

  <!-- Add doctor to clinic -->
  <div class="overlay" *ngIf="addDoctorClinic" (click)="closeAddDoctor()">
    <div class="modal" style="max-width:520px" (click)="$event.stopPropagation()">
      <div class="modal-head">
        <h3>Add Doctor — {{ addDoctorClinic.name }}</h3>
        <button class="close" (click)="closeAddDoctor()">×</button>
      </div>
      <div class="search-bar" style="margin-bottom:14px">
        <span class="search-icon">🔍</span>
        <input [(ngModel)]="doctorPickSearch" placeholder="Search by name, email, or specialty…">
      </div>
      <div *ngIf="pickDoctorsLoading" style="display:flex;justify-content:center;padding:32px"><div class="spinner" style="width:36px;height:36px"></div></div>
      <div class="doctor-pick-scroll" *ngIf="!pickDoctorsLoading && filteredPickDoctors().length">
        <div class="doctor-pick-row" *ngFor="let d of filteredPickDoctors()">
          <div class="dp-info">
            <strong>{{ d.title || 'Dr.' }} {{ d.fullName }}</strong>
            <span>{{ d.specialty }} · {{ d.email }}</span>
          </div>
          <button type="button" class="btn btn-brand btn-xs" (click)="assignDoctor(d)" [disabled]="assigningDoctorId === d._id">
            <span class="spinner" style="width:14px;height:14px" *ngIf="assigningDoctorId === d._id"></span>
            {{ assigningDoctorId === d._id ? 'Adding…' : 'Add' }}
          </button>
        </div>
      </div>
      <div class="empty-state" style="padding:24px" *ngIf="!pickDoctorsLoading && !filteredPickDoctors().length">
        <div class="es-icon" style="font-size:28px">👨‍⚕️</div>
        <p *ngIf="!pickDoctors.length">No doctors in the system yet.</p>
        <p *ngIf="pickDoctors.length">No matching doctors, or everyone is already linked to this clinic.</p>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .clinics-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:20px; }
    .clinic-card { padding:20px; }
    .cc-head { display:flex;align-items:flex-start;gap:12px;margin-bottom:14px; }
    .cc-icon { width:44px;height:44px;border-radius:var(--r-lg);background:rgba(124,58,237,.1);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0; }
    .cc-info { flex:1; h3{font-size:15px;margin-bottom:3px;} p{font-size:12px;color:var(--text-muted);} }
    .cc-meta { display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:4px; }
    .cc-meta-item { display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-muted); }
    .add-slot-panel { background:var(--bg-3);border-radius:var(--r-xl);padding:20px; }
    .slots-scroll { max-height:220px;overflow-y:auto;display:flex;flex-direction:column;gap:8px; }
    .slot-row { display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--bg-3);border-radius:var(--r-lg);font-size:13px; }
    .sr-day { font-weight:600;min-width:72px; }
    .sr-date { color:var(--text-muted);min-width:52px; }
    .sr-time { flex:1; }
    .doctor-pick-scroll { max-height:280px;overflow-y:auto;display:flex;flex-direction:column;gap:8px; }
    .doctor-pick-row { display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px;background:var(--bg-3);border-radius:var(--r-lg); }
    .dp-info { flex:1;min-width:0; strong{display:block;font-size:13px;margin-bottom:2px;} span{font-size:11px;color:var(--text-muted);} }
  `]
})
export class AdminClinicsComponent implements OnInit {
  clinics: any[] = []; loading = true; search = ''; showModal = false;
  editTarget: any = null; form: FormGroup; saving = false; formErr = '';
  slotTarget: any = null; addingSlot = false;
  addDoctorClinic: any = null; pickDoctors: any[] = []; pickDoctorsLoading = false;
  doctorPickSearch = ''; assigningDoctorId: string | null = null;
  minDate = new Date().toISOString().split('T')[0];
  days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  ns = { dayOfWeek: 'monday', date: '', startTime: '09:00', endTime: '09:30' };
  nav = [{ label: 'Admin', items: [{ icon: '📊', label: 'Dashboard', route: '/admin/dashboard' }, { icon: '👥', label: 'Users', route: '/admin/users' }, { icon: '👨‍⚕️', label: 'Doctors', route: '/admin/doctors' }, { icon: '🏥', label: 'Clinics', route: '/admin/clinics' }] }];
  private st: any;

  constructor(public auth: AuthService, private cs: ClinicService, private ds: DoctorService, private fb: FormBuilder, private toast: ToastService) {
    this.form = this.fb.group({ name: ['', Validators.required], city: ['', Validators.required], governorate: [''], street: [''], phone: [''], feveseta: ['', Validators.required] });
  }

  ngOnInit() { this.load(); }
  load() {
    this.loading = true;
    this.cs.getClinics({ search: this.search }).subscribe({
      next: (r: any) => { this.loading = false; if (r.success) this.clinics = r.data.clinics; },
      error: () => this.loading = false
    });
  }
  onSearch() { clearTimeout(this.st); this.st = setTimeout(() => this.load(), 400); }
  openCreate() { this.editTarget = null; this.form.reset(); this.formErr = ''; this.showModal = true; }
  openEdit(c: any) { this.editTarget = c; this.form.patchValue({ name: c.name, city: c.address?.city, governorate: c.address?.governorate, street: c.address?.street, phone: c.phone, feveseta: c.feveseta }); this.formErr = ''; this.showModal = true; }
  closeModal() { this.showModal = false; this.editTarget = null; }
  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true; this.formErr = '';
    const v = this.form.value;
    const payload = { name: v.name, phone: v.phone, feveseta: +v.feveseta, address: { city: v.city, governorate: v.governorate, street: v.street, country: 'Egypt' } };
    const obs = this.editTarget ? this.cs.updateClinic(this.editTarget._id, payload) : this.cs.createClinic(payload);
    obs.subscribe({
      next: (r: any) => { this.saving = false; if (r.success) { this.load(); this.closeModal(); this.toast.success(this.editTarget ? 'Clinic updated!' : 'Clinic created!'); } else { this.formErr = r.message; } },
      error: (e: any) => { this.saving = false; this.formErr = e.error?.message || 'Failed to save.'; }
    });
  }
  del(c: any) {
    if (!confirm(`Delete "${c.name}"? Cannot be undone.`)) return;
    this.cs.deleteClinic(c._id).subscribe({ next: (r: any) => { if (r.success) { this.clinics = this.clinics.filter(x => x._id !== c._id); this.toast.success('Clinic deleted.'); } } });
  }
  openSlots(c: any) { this.slotTarget = c; this.ns = { dayOfWeek: 'monday', date: '', startTime: '09:00', endTime: '09:30' }; }
  addSlot() {
    if (!this.slotTarget || !this.ns.date) return;
    this.addingSlot = true;
    this.cs.addScheduleSlots(this.slotTarget._id, [{ ...this.ns, isAvailable: true }]).subscribe({
      next: (r: any) => {
        this.addingSlot = false;
        if (r.success && this.slotTarget) {
          this.slotTarget.schedule_clinic = r.data.schedule;
          const c = this.clinics.find(x => x._id === this.slotTarget._id);
          if (c) c.schedule_clinic = r.data.schedule;
          this.toast.success('Slot added!');
        }
      },
      error: () => this.addingSlot = false
    });
  }

  openAddDoctor(c: any) {
    this.addDoctorClinic = c;
    this.doctorPickSearch = '';
    this.pickDoctors = [];
    this.pickDoctorsLoading = true;
    this.ds.getDoctors({ limit: 200 }).subscribe({
      next: (r: any) => {
        this.pickDoctorsLoading = false;
        if (r.success) this.pickDoctors = r.data.doctors || [];
      },
      error: () => { this.pickDoctorsLoading = false; this.toast.error('Could not load doctors.'); }
    });
  }
  closeAddDoctor() {
    this.addDoctorClinic = null;
    this.pickDoctors = [];
    this.assigningDoctorId = null;
  }
  clinicHasDoctor(docId: string): boolean {
    const list = this.addDoctorClinic?.Doctor || [];
    return list.some((x: any) => (typeof x === 'string' ? x : x?._id) === docId);
  }
  filteredPickDoctors(): any[] {
    const q = (this.doctorPickSearch || '').toLowerCase().trim();
    return this.pickDoctors.filter((d: any) => {
      if (this.clinicHasDoctor(d._id)) return false;
      if (!q) return true;
      return `${d.fullName || ''} ${d.email || ''} ${d.specialty || ''}`.toLowerCase().includes(q);
    });
  }
  assignDoctor(doc: any) {
    if (!this.addDoctorClinic) return;
    this.assigningDoctorId = doc._id;
    this.cs.addDoctorToClinic(this.addDoctorClinic._id, doc._id).subscribe({
      next: (r: any) => {
        this.assigningDoctorId = null;
        if (!r.success) {
          this.toast.error(r.message || 'Could not add doctor.');
          return;
        }
        const updated = r.data?.clinic;
        if (updated?.Doctor) {
          this.addDoctorClinic.Doctor = updated.Doctor;
          const c = this.clinics.find(x => x._id === this.addDoctorClinic._id);
          if (c) c.Doctor = updated.Doctor;
        } else {
          this.load();
        }
        this.toast.success(`${doc.title || 'Dr.'} ${doc.fullName} added to this clinic.`);
      },
      error: (e: any) => {
        this.assigningDoctorId = null;
        this.toast.error(e.error?.message || 'Could not add doctor.');
      }
    });
  }
}

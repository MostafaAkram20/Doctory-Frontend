import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { DoctorService } from '../../../core/services/doctor.service';
import { AuthService } from '../../../core/services/auth.service';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-doctors',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule, SidebarComponent],
  template: `
  <div class="app-shell">
    <app-sidebar [sections]="nav"></app-sidebar>
    <div class="main-wrap">
      <div class="topbar">
        <h2>Doctors Management</h2>
        <span style="font-size:13px;color:var(--text-muted)">{{ total }} doctors</span>
      </div>
      <div class="page-body">
        <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap">
          <div class="search-bar" style="flex:1;min-width:200px">
            <span class="search-icon">🔍</span>
            <input [(ngModel)]="search" (ngModelChange)="onSearch()" placeholder="Search doctors…">
          </div>
          <select class="form-control" style="max-width:200px" [(ngModel)]="specialty" (ngModelChange)="load()">
            <option value="">All Specialties</option>
            <option *ngFor="let s of ds.specialties" [value]="s">{{ s }}</option>
          </select>
        </div>

        <div class="card" style="padding:0;overflow:hidden">
          <div *ngIf="loading" style="padding:60px;text-align:center"><div class="spinner" style="margin:0 auto;width:40px;height:40px"></div></div>
          <table class="data-table" *ngIf="!loading && doctors.length">
            <thead>
              <tr><th>Doctor</th><th>Specialty</th><th>Experience</th><th>Rating</th><th>Status</th><th>Verified</th><th>Actions</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let d of doctors">
                <td>
                  <div style="display:flex;align-items:center;gap:10px">
                    <div class="table-avatar" [style.background]="'linear-gradient(135deg,#10b981,#06b6d4)'">
                      <span style="color:#fff;font-size:12px;font-weight:800">{{ ini(d.fullName) }}</span>
                    </div>
                    <div><strong style="font-size:14px;display:block">{{ d.title }} {{ d.fullName }}</strong><span style="font-size:12px;color:var(--text-muted)">{{ d.email }}</span></div>
                  </div>
                </td>
                <td><span class="badge badge-brand">{{ d.specialty }}</span></td>
                <td style="font-size:13px">{{ d.experience }} yrs</td>
                <td style="font-size:13px"><span style="color:#f59e0b">⭐</span> {{ d.rating | number:'1.1-1' }}</td>
                <td><span class="badge" [class]="d.isActive?'badge-completed':'badge-cancelled'">{{ d.isActive?'Active':'Inactive' }}</span></td>
                <td><span class="badge" [class]="d.isVerified?'badge-confirmed':'badge-pending'">{{ d.isVerified?'Verified':'Pending' }}</span></td>
                <td>
                  <div style="display:flex;gap:6px">
                    <button class="btn btn-ghost btn-xs" (click)="openEdit(d)">Edit</button>
                    <button class="btn btn-danger btn-xs" (click)="del(d)">Delete</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="empty-state" style="padding:48px" *ngIf="!loading && !doctors.length"><div class="es-icon">👨‍⚕️</div><h3>No doctors found</h3></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Edit Modal -->
  <div class="overlay" *ngIf="editTarget" (click)="editTarget=null">
    <div class="modal" (click)="$event.stopPropagation()">
      <div class="modal-head">
        <h3>Edit: {{ editTarget.fullName }}</h3>
        <button class="close" (click)="editTarget=null">×</button>
      </div>
      <form [formGroup]="editForm" (ngSubmit)="save()">
        <div class="form-group">
          <label>Specialty</label>
          <select class="form-control" formControlName="specialty">
            <option *ngFor="let s of ds.specialties" [value]="s">{{ s }}</option>
          </select>
        </div>
        <div class="form-row-2">
          <div class="form-group"><label>Experience (years)</label><input class="form-control" type="number" formControlName="experience"></div>
          <div class="form-group">
            <label>Title</label>
            <select class="form-control" formControlName="title">
              <option value="Dr.">Dr.</option><option value="Prof.">Prof.</option><option value="Ass. Prof.">Ass. Prof.</option>
            </select>
          </div>
        </div>
        <div class="form-group"><label>Bio</label><textarea class="form-control" rows="3" formControlName="bio"></textarea></div>
        <div class="form-row-2">
          <div class="form-group">
            <label>Active</label>
            <select class="form-control" formControlName="isActive">
              <option [ngValue]="true">Yes</option><option [ngValue]="false">No</option>
            </select>
          </div>
          <div class="form-group">
            <label>Verified</label>
            <select class="form-control" formControlName="isVerified">
              <option [ngValue]="true">Yes</option><option [ngValue]="false">No</option>
            </select>
          </div>
        </div>
        <div style="display:flex;gap:10px;justify-content:flex-end">
          <button type="button" class="btn btn-ghost" (click)="editTarget=null">Cancel</button>
          <button type="submit" class="btn btn-brand" [disabled]="saving">{{ saving?'Saving…':'Save Changes' }}</button>
        </div>
      </form>
    </div>
  </div>
  `,
  styles: [`
    .filter-bar { display:flex; gap:8px; margin-bottom:20px; flex-wrap:wrap; }
  `]
})
export class AdminDoctorsComponent implements OnInit {
  doctors: any[] = []; loading = true; search = ''; specialty = ''; total = 0;
  editTarget: any = null; editForm: FormGroup; saving = false;
  nav = [{ label: 'Admin', items: [{ icon: '📊', label: 'Dashboard', route: '/admin/dashboard' }, { icon: '👥', label: 'Users', route: '/admin/users' }, { icon: '👨‍⚕️', label: 'Doctors', route: '/admin/doctors' }, { icon: '🏥', label: 'Clinics', route: '/admin/clinics' }] }];
  private st: any;

  constructor(public auth: AuthService, public ds: DoctorService, private fb: FormBuilder, private toast: ToastService) {
    this.editForm = this.fb.group({ specialty: [''], experience: [0], title: ['Dr.'], bio: [''], isActive: [true], isVerified: [false] });
  }

  ngOnInit() { this.load(); }
  load() {
    this.loading = true;
    this.ds.getDoctors({ specialty: this.specialty, search: this.search, limit: 50 }).subscribe({
      next: (r: any) => { this.loading = false; if (r.success) { this.doctors = r.data.doctors; this.total = r.data.pagination.total; } },
      error: () => this.loading = false
    });
  }
  onSearch() { clearTimeout(this.st); this.st = setTimeout(() => this.load(), 400); }
  openEdit(d: any) { this.editTarget = d; this.editForm.patchValue({ specialty: d.specialty, experience: d.experience, title: d.title, bio: d.bio || '', isActive: d.isActive, isVerified: d.isVerified }); }
  save() {
    if (!this.editTarget) return;
    this.saving = true;
    this.ds.updateDoctor(this.editTarget._id, this.editForm.value).subscribe({
      next: (r: any) => { this.saving = false; if (r.success) { Object.assign(this.editTarget, this.editForm.value); this.editTarget = null; this.toast.success('Doctor updated!'); } },
      error: () => this.saving = false
    });
  }
  del(d: any) {
    if (!confirm(`Delete Dr. ${d.fullName}? This cannot be undone.`)) return;
    this.ds.deleteDoctor(d._id).subscribe({ next: (r: any) => { if (r.success) { this.doctors = this.doctors.filter(x => x._id !== d._id); this.toast.success('Doctor deleted.'); } } });
  }
  ini(n: string) { return n.split(' ').map((x: string) => x[0]).join('').slice(0, 2).toUpperCase(); }
}

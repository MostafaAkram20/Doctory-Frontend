import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, SidebarComponent],
  template: `
  <div class="app-shell">
    <app-sidebar [sections]="nav"></app-sidebar>
    <div class="main-wrap">
      <div class="topbar">
        <h2>Users Management</h2>
        <span style="font-size:13px;color:var(--text-muted)">{{ total }} total users</span>
      </div>
      <div class="page-body">
        <div class="toolbar-row">
          <div class="search-bar" style="max-width:320px">
            <span class="search-icon">🔍</span>
            <input [(ngModel)]="search" (ngModelChange)="onSearch()" placeholder="Search users…">
          </div>
        </div>

        <div class="card" style="padding:0;overflow:hidden">
          <div *ngIf="loading" style="padding:60px;text-align:center"><div class="spinner" style="margin:0 auto;width:40px;height:40px"></div></div>
          <table class="data-table" *ngIf="!loading && users.length">
            <thead>
              <tr>
                <th>User</th><th>Email</th><th>Phone</th><th>Gender</th><th>Status</th><th>Joined</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let u of users">
                <td>
                  <div style="display:flex;align-items:center;gap:10px">
                    <div class="table-avatar" [style.background]="'linear-gradient(135deg,#7c3aed,#06b6d4)'">
                      <span style="color:#fff;font-size:12px;font-weight:800">{{ ini(u.fullName) }}</span>
                    </div>
                    <strong style="font-size:14px">{{ u.fullName }}</strong>
                  </div>
                </td>
                <td style="font-size:13px;color:var(--text-muted)">{{ u.email }}</td>
                <td style="font-size:13px">{{ u.phone || '—' }}</td>
                <td style="font-size:13px;text-transform:capitalize">{{ u.gender || '—' }}</td>
                <td><span class="badge" [class]="u.isVerified?'badge-completed':'badge-cancelled'">{{ u.isVerified?'Active':'Inactive' }}</span></td>
                <td style="font-size:12px;color:var(--text-muted)">{{ u.createdAt | date:'MMM d, y' }}</td>
                <td>
                  <button class="btn btn-ghost btn-xs" (click)="toggle(u)">{{ u.isVerified?'Deactivate':'Activate' }}</button>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="empty-state" style="padding:48px" *ngIf="!loading && !users.length">
            <div class="es-icon">👥</div><h3>No users found</h3>
          </div>
        </div>

        <div class="pagination" *ngIf="pages>1">
          <button class="page-btn" (click)="go(page-1)" [disabled]="page===1">←</button>
          <button class="page-btn" *ngFor="let p of pArr()" [class.active]="p===page" (click)="go(p)">{{ p }}</button>
          <button class="page-btn" (click)="go(page+1)" [disabled]="page===pages">→</button>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`.toolbar-row{display:flex;gap:12px;margin-bottom:20px;}`]
})
export class AdminUsersComponent implements OnInit {
  users: any[] = []; loading = true; search = ''; page = 1; pages = 1; total = 0;
  nav = [{ label: 'Admin', items: [{ icon: '📊', label: 'Dashboard', route: '/admin/dashboard' }, { icon: '👥', label: 'Users', route: '/admin/users' }, { icon: '👨‍⚕️', label: 'Doctors', route: '/admin/doctors' }, { icon: '🏥', label: 'Clinics', route: '/admin/clinics' }] }];
  private st: any;
  constructor(public auth: AuthService, private http: HttpClient, private toast: ToastService) {}
  ngOnInit() { this.load(); }
  load() {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/admin/users?page=${this.page}&limit=15`).subscribe({
      next: (r: any) => { this.loading = false; if (r.success) { this.users = r.data.users; this.total = r.data.pagination.total; this.pages = r.data.pagination.pages; } },
      error: () => this.loading = false
    });
  }
  onSearch() { clearTimeout(this.st); this.st = setTimeout(() => { this.page = 1; this.load(); }, 400); }
  toggle(u: any) {
    this.http.patch<any>(`${environment.apiUrl}/admin/users/${u.id}/toggle-status`, {}).subscribe({
      next: (r: any) => { if (r.success) { u.isVerified = !u.isVerified; this.toast.success(`User ${u.isVerified ? 'activated' : 'deactivated'}.`); } }
    });
  }
  go(p: number) { if (p >= 1 && p <= this.pages) { this.page = p; this.load(); } }
  pArr() { return Array.from({ length: this.pages }, (_, i) => i + 1); }
  ini(n: string) { return n.split(' ').map((x: string) => x[0]).join('').slice(0, 2).toUpperCase(); }
}

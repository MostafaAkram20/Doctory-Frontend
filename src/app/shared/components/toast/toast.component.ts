import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-stack">
      <div *ngFor="let t of toast.toasts()"
           class="toast toast-{{t.type}}"
           (click)="toast.dismiss(t.id)">
        <span class="toast-icon">{{ icons[t.type] }}</span>
        <span>{{ t.message }}</span>
        <button class="toast-close" (click)="toast.dismiss(t.id)">×</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-stack { position:fixed;bottom:28px;right:28px;z-index:9999;display:flex;flex-direction:column;gap:10px;max-width:380px; }
    .toast { display:flex;align-items:center;gap:10px;padding:14px 18px;border-radius:16px;font-size:13px;font-weight:600;box-shadow:0 8px 32px rgba(0,0,0,.2);animation:slideInRight .3s cubic-bezier(.34,1.56,.64,1);cursor:pointer;border:1px solid rgba(255,255,255,.15); }
    .toast-icon { font-size:18px;flex-shrink:0; }
    .toast-close { background:none;border:none;color:inherit;font-size:20px;cursor:pointer;margin-left:auto;opacity:.7;padding:0 2px;line-height:1; &:hover{opacity:1;} }
    .toast-success { background:linear-gradient(135deg,#059669,#10b981); color:#fff; }
    .toast-error   { background:linear-gradient(135deg,#e11d48,#f43f5e); color:#fff; }
    .toast-info    { background:linear-gradient(135deg,#7c3aed,#06b6d4); color:#fff; }
  `]
})
export class ToastComponent {
  icons = { success: '✅', error: '❌', info: 'ℹ️' };
  constructor(public toast: ToastService) {}
}

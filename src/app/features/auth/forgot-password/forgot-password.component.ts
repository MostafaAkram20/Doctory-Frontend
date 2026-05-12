import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
  <div class="auth-page">
    <div class="auth-panel">
      <div class="auth-panel-inner">
        <a routerLink="/" class="auth-logo">Doct<span>ory</span></a>
        <h2 class="panel-title">Reset your password</h2>
        <p class="panel-sub">We will email you a one-time code. Choose the same account type you use to sign in.</p>
      </div>
    </div>
    <div class="auth-form-side">
      <div class="auth-form-wrap anim-scale">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:28px">
          <div>
            <h1 style="font-size:26px;margin-bottom:4px">Forgot password</h1>
            <p style="color:var(--text-muted);font-size:14px">Enter your email to receive a code</p>
          </div>
          <button class="theme-toggle" (click)="theme.toggle()">{{ theme.isDark() ? '☀️' : '🌙' }}</button>
        </div>

        <div class="role-switch">
          <button type="button" [class.rs-active]="role==='patient'" (click)="role='patient'">
            <span>🧑</span> Patient / Admin
          </button>
          <button type="button" [class.rs-active]="role==='doctor'" (click)="role='doctor'">
            <span>👨‍⚕️</span> Doctor
          </button>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-group">
            <label>Email Address</label>
            <div class="input-icon-wrap">
              <span class="input-icon">✉️</span>
              <input class="form-control" type="email" formControlName="email" placeholder="you@example.com">
            </div>
            <div class="error-msg" *ngIf="form.get('email')?.touched && form.get('email')?.invalid">Enter a valid email</div>
          </div>
          <div class="error-box" *ngIf="err">{{ err }}</div>
          <button type="submit" class="btn btn-brand btn-lg btn-block mt-8" [disabled]="loading">
            <span class="spinner" style="width:18px;height:18px" *ngIf="loading"></span>
            {{ loading ? 'Sending code…' : 'Send verification code' }}
          </button>
        </form>

        <div class="auth-links">
          <p><a routerLink="/login">← Back to sign in</a></p>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .auth-page { display:grid;grid-template-columns:1fr 1fr;min-height:100vh; }
    .auth-panel { background:linear-gradient(145deg,#0d0b1e 0%,#1a1040 50%,#0d1f3c 100%);display:flex;align-items:center;justify-content:center;padding:48px; }
    .auth-panel-inner { width:100%;max-width:400px; }
    .auth-logo { font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:24px;color:#fff;display:block;margin-bottom:32px; span{background:var(--brand-gradient);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;} }
    .panel-title { color:#fff;font-size:24px;font-weight:700;margin-bottom:12px; }
    .panel-sub { color:rgba(255,255,255,.55);font-size:14px;line-height:1.6; }
    .auth-form-side { display:flex;align-items:center;justify-content:center;padding:48px;background:var(--bg); }
    .auth-form-wrap { width:100%;max-width:420px; }
    .role-switch { display:flex;gap:8px;background:var(--bg-3);border-radius:14px;padding:5px;margin-bottom:24px; button{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:9px;border:none;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;transition:var(--t);background:transparent;color:var(--text-muted); &.rs-active{background:var(--bg-2);color:var(--brand-1);box-shadow:var(--shadow-sm);} } }
    .auth-links { margin-top:20px;text-align:center; p{font-size:13px;} a{color:var(--brand-1);font-weight:600;} }
    @media(max-width:768px){.auth-page{grid-template-columns:1fr;}.auth-panel{display:none;}}
  `]
})
export class ForgotPasswordComponent implements OnInit {
  form: FormGroup;
  role: 'patient' | 'doctor' = 'patient';
  loading = false;
  err = '';

  constructor(
    private fb: FormBuilder,
    public auth: AuthService,
    public theme: ThemeService,
    private toast: ToastService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.form = this.fb.group({ email: ['', [Validators.required, Validators.email]] });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(p => {
      const r = p['role'];
      if (r === 'doctor') this.role = 'doctor';
      else if (r === 'patient' || r === 'admin') this.role = 'patient';
    });
  }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.err = '';
    const email = this.form.value.email as string;
    const isDoctor = this.role === 'doctor';
    this.auth.requestPasswordReset(email, isDoctor).subscribe({
      next: (r: any) => {
        this.loading = false;
        if (r.success) {
          this.toast.success('Check your email for the code.');
          const type = isDoctor ? 'doctor' : 'patient';
          this.router.navigate(['/verify-otp'], { queryParams: { email, type, intent: 'reset' } });
        } else {
          this.err = r.message || 'Could not send code.';
        }
      },
      error: (e: any) => {
        this.loading = false;
        this.err = e.error?.message || 'Could not send code.';
      }
    });
  }
}

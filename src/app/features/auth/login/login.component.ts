import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
  <div class="auth-page">
    <!-- Left Panel -->
    <div class="auth-panel">
      <div class="auth-panel-inner">
        <a routerLink="/" class="auth-logo">Doctory</a>
        <div class="auth-visual-area">
          <div class="av-blob">🏥</div>
          <div class="av-stat av-stat-1">
            <div class="av-stat-icon">⭐</div>
            <div><strong>4.9 / 5</strong><br><span>Patient Rating</span></div>
          </div>
          <div class="av-stat av-stat-2">
            <div class="av-stat-icon">👨‍⚕️</div>
            <div><strong>500+</strong><br><span>Specialists</span></div>
          </div>
          <div class="av-stat av-stat-3">
            <div class="av-stat-icon">✅</div>
            <div><strong>50K+</strong><br><span>Appointments</span></div>
          </div>
        </div>
        <div class="auth-panel-quote">
          <p>"The best healthcare experience I've ever had. Booked in under 2 minutes."</p>
          <!-- <div class="quote-author"><div class="qa-avatar">S</div><div><strong></strong><span>Cairo, Egypt</span></div></div> -->
        </div>
      </div>
    </div>

    <!-- Right Form -->
    <div class="auth-form-side">
      <div class="auth-form-wrap anim-scale">
        <!-- Top Bar -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:36px">
          <div>
            <h1 style="font-size:28px;margin-bottom:4px">Welcome back</h1>
            <p style="color:var(--text-muted);font-size:14px">Sign in to your account</p>
          </div>
          <button class="theme-toggle" (click)="theme.toggle()">{{ theme.isDark() ? '☀️' : '🌙' }}</button>
        </div>

        <!-- Role Switch -->
        <div class="role-switch">
          <button [class.rs-active]="role==='patient'" (click)="role='patient'">
            <span>🧑</span> Patient
          </button>
          <button [class.rs-active]="role==='doctor'" (click)="role='doctor'">
            <span>👨‍⚕️</span> Doctor
          </button>
          <button [class.rs-active]="role==='admin'" (click)="role='admin'">
            <span>🛡</span> Admin
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

          <div class="form-group">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
              <label style="margin:0">Password</label>
              <a routerLink="/forgot-password" [queryParams]="{ role: role }" style="font-size:13px;font-weight:600;color:var(--brand-1)">Forgot password?</a>
            </div>
            <div class="input-icon-wrap">
              <span class="input-icon">🔒</span>
              <input class="form-control" [type]="showPass?'text':'password'" formControlName="password" placeholder="••••••••">
              <button type="button" class="input-icon-right" (click)="showPass=!showPass">{{ showPass?'🙈':'👁' }}</button>
            </div>
            <div class="error-msg" *ngIf="form.get('password')?.touched && form.get('password')?.invalid">Password is required</div>
          </div>

          <div class="error-box" *ngIf="err">{{ err }}</div>

          <button type="submit" class="btn btn-brand btn-lg btn-block" [disabled]="loading" style="margin-top:8px">
            <span class="spinner" style="width:18px;height:18px" *ngIf="loading"></span>
            {{ loading ? 'Signing in…' : 'Sign In' }}
          </button>
        </form>

        <div class="auth-links">
          <p>New to Doctory? <a routerLink="/register">Create patient account</a></p>
          <p>Are you a doctor? <a routerLink="/doctor-register">Join as doctor</a></p>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .auth-page { display:grid;grid-template-columns:1fr 1fr;min-height:100vh; }
    .auth-panel { background:linear-gradient(145deg,#0d0b1e 0%,#1a1040 50%,#0d1f3c 100%);display:flex;align-items:center;justify-content:center;padding:48px;position:relative;overflow:hidden; }
    .auth-panel-inner { width:100%;max-width:420px; }
    .auth-logo { font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:24px;color:#fff;display:block;margin-bottom:48px; span{background:var(--brand-gradient);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;} }
    .auth-visual-area { position:relative;height:280px;display:flex;align-items:center;justify-content:center;margin-bottom:40px; }
    .av-blob { width:200px;height:200px;border-radius:50%;background:rgba(124,58,237,.15);border:1px solid rgba(124,58,237,.25);display:flex;align-items:center;justify-content:center;font-size:72px;animation:pulse 3s ease-in-out infinite; }
    .av-stat { position:absolute;background:rgba(255,255,255,.07);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:10px 14px;display:flex;align-items:center;gap:10px;color:#fff;animation:floatY 3s ease-in-out infinite; strong{display:block;font-size:15px;} span{font-size:11px;color:rgba(255,255,255,.5);} .av-stat-icon{font-size:20px;} }
    .av-stat-1 { top:0;left:0;animation-delay:0s; }
    .av-stat-2 { top:0;right:0;animation-delay:1s; }
    .av-stat-3 { bottom:0;left:50%;transform:translateX(-50%);animation-delay:.5s; }
    .auth-panel-quote { border-top:1px solid rgba(255,255,255,.08);padding-top:24px; p{color:rgba(255,255,255,.6);font-size:14px;line-height:1.7;font-style:italic;margin-bottom:16px;} }
    .quote-author { display:flex;align-items:center;gap:10px; .qa-avatar{width:36px;height:36px;border-radius:50%;background:var(--brand-gradient);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;} strong{display:block;color:#fff;font-size:13px;} span{font-size:11px;color:rgba(255,255,255,.4);} }
    .auth-form-side { display:flex;align-items:center;justify-content:center;padding:48px;background:var(--bg); }
    .auth-form-wrap { width:100%;max-width:420px; }
    .role-switch { display:flex;gap:8px;background:var(--bg-3);border-radius:14px;padding:5px;margin-bottom:28px; button{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:9px;border:none;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;transition:var(--t);background:transparent;color:var(--text-muted); &.rs-active{background:var(--bg-2);color:var(--brand-1);box-shadow:var(--shadow-sm);} } }
    .auth-links { margin-top:20px;text-align:center; p{font-size:13px;color:var(--text-muted);margin-bottom:6px; a{color:var(--brand-1);font-weight:600;} } }
    @media(max-width:768px){.auth-page{grid-template-columns:1fr;}.auth-panel{display:none;}}
  `]
})
export class LoginComponent {
  form: FormGroup;
  role: 'patient' | 'doctor' | 'admin' = 'patient';
  loading = false;
  showPass = false;
  err = '';

  constructor(private fb: FormBuilder, public auth: AuthService, public theme: ThemeService, private toast: ToastService, private router: Router) {
    this.form = this.fb.group({ email: ['', [Validators.required, Validators.email]], password: ['', Validators.required] });
  }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true; this.err = '';
    const { email, password } = this.form.value;
    const obs = this.role === 'doctor' ? this.auth.loginDoctor(email, password) : this.auth.login(email, password);
    obs.subscribe({
      next: (r: any) => {
        this.loading = false;
        if (r.success) {
          this.toast.success('Welcome back!');
          const role = this.auth.getRole();
          this.router.navigate([role === 'admin' ? '/admin/dashboard' : role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard']);
        } else { this.err = r.message; }
      },
      error: (e: any) => { this.loading = false; this.err = e.error?.message || 'Login failed.'; }
    });
  }
}

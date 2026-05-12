import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { ToastService } from '../../../core/services/toast.service';

function matchPasswords(c: AbstractControl): ValidationErrors | null {
  const p = c.get('password')?.value;
  const cfm = c.get('confirmPassword')?.value;
  if (!p || !cfm) return null;
  return p === cfm ? null : { mismatch: true };
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
  <div class="auth-page">
    <div class="auth-panel">
      <div class="auth-panel-inner">
        <a routerLink="/" class="auth-logo">Doct<span>ory</span></a>
        <h2 class="panel-title">Choose a new password</h2>
        <p class="panel-sub">Use at least 8 characters. After saving, sign in with your new password.</p>
      </div>
    </div>
    <div class="auth-form-side">
      <div class="auth-form-wrap anim-scale">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:28px">
          <div>
            <h1 style="font-size:26px;margin-bottom:4px">New password</h1>
            <p style="color:var(--text-muted);font-size:14px" *ngIf="email">{{ email }}</p>
          </div>
          <button class="theme-toggle" (click)="theme.toggle()">{{ theme.isDark() ? '☀️' : '🌙' }}</button>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-group">
            <label>New password</label>
            <div class="input-icon-wrap">
              <span class="input-icon">🔒</span>
              <input class="form-control" [type]="show1 ? 'text' : 'password'" formControlName="password" placeholder="Min 8 characters">
              <button type="button" class="input-icon-right" (click)="show1 = !show1">{{ show1 ? '🙈' : '👁' }}</button>
            </div>
            <div class="error-msg" *ngIf="form.get('password')?.touched && form.get('password')?.errors?.['required']">Required</div>
            <div class="error-msg" *ngIf="form.get('password')?.touched && form.get('password')?.errors?.['minlength']">At least 8 characters</div>
          </div>
          <div class="form-group">
            <label>Confirm password</label>
            <div class="input-icon-wrap">
              <span class="input-icon">🔒</span>
              <input class="form-control" [type]="show2 ? 'text' : 'password'" formControlName="confirmPassword" placeholder="Repeat password">
              <button type="button" class="input-icon-right" (click)="show2 = !show2">{{ show2 ? '🙈' : '👁' }}</button>
            </div>
            <div class="error-msg" *ngIf="form.touched && form.errors?.['mismatch']">Passwords do not match</div>
          </div>
          <div class="error-box" *ngIf="err">{{ err }}</div>
          <button type="submit" class="btn btn-brand btn-lg btn-block mt-8" [disabled]="loading">
            <span class="spinner" style="width:18px;height:18px" *ngIf="loading"></span>
            {{ loading ? 'Saving…' : 'Save new password' }}
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
    .auth-links { margin-top:20px;text-align:center; p{font-size:13px;} a{color:var(--brand-1);font-weight:600;} }
    @media(max-width:768px){.auth-page{grid-template-columns:1fr;}.auth-panel{display:none;}}
  `]
})
export class ResetPasswordComponent implements OnInit {
  form: FormGroup;
  loading = false;
  err = '';
  email = '';
  show1 = false;
  show2 = false;

  constructor(
    private fb: FormBuilder,
    public auth: AuthService,
    public theme: ThemeService,
    private toast: ToastService,
    private router: Router,
  ) {
    this.form = this.fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: matchPasswords }
    );
  }

  ngOnInit() {
    if (!this.auth.hasPasswordResetPending()) {
      this.router.navigate(['/forgot-password']);
    } else {
      this.email = this.auth.passwordResetPending!.email;
    }
  }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const pending = this.auth.passwordResetPending;
    if (!pending) {
      this.router.navigate(['/forgot-password']);
      return;
    }
    this.loading = true;
    this.err = '';
    const pwd = this.form.value.password as string;
    this.auth.completePasswordReset(pending.email, pending.otp, pwd, pending.isDoctor).subscribe({
      next: (r: any) => {
        this.loading = false;
        if (r.success) {
          this.auth.clearPasswordResetPending();
          this.toast.success('Password updated. Sign in with your new password.');
          this.router.navigate(['/login']);
        } else {
          this.err = r.message || 'Could not update password.';
        }
      },
      error: (e: any) => {
        this.loading = false;
        this.err = e.error?.message || 'Could not update password.';
      }
    });
  }
}

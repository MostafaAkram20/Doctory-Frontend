import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
  <div class="auth-page">
    <div class="auth-panel reg-panel">
      <div class="auth-panel-inner">
        <a routerLink="/" class="auth-logo">Doct<span>ory</span></a>
        <h2 class="panel-title">Start your health journey today</h2>
        <div class="benefits-list">
          <div class="benefit" *ngFor="let b of benefits">
            <div class="b-icon">{{ b.icon }}</div>
            <div><strong>{{ b.title }}</strong><p>{{ b.desc }}</p></div>
          </div>
        </div>
        <div class="panel-illustration">🧬</div>
      </div>
    </div>

    <div class="auth-form-side">
      <div class="auth-form-wrap anim-scale">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:28px">
          <div>
            <h1 style="font-size:26px;margin-bottom:4px">Create Account</h1>
            <p style="color:var(--text-muted);font-size:13px">Step {{ step }} of 2</p>
          </div>
          <button class="theme-toggle" (click)="theme.toggle()">{{ theme.isDark()?'☀️':'🌙' }}</button>
        </div>

        <!-- Step bar -->
        <div class="step-bar" style="margin-bottom:28px">
          <div class="step-dot" [class.active]="step>=1" [class.done]="step>1">
            <div class="dot">{{ step>1?'✓':'1' }}</div><div class="step-name">Account</div>
          </div>
          <div class="step-bar-line" [class.done]="step>1"></div>
          <div class="step-dot" [class.active]="step>=2">
            <div class="dot">2</div><div class="step-name">Personal</div>
          </div>
        </div>

        <!-- Step 1 -->
        <form [formGroup]="f1" *ngIf="step===1">
          <div class="form-group">
            <label>Full Name</label>
            <div class="input-icon-wrap"><span class="input-icon">👤</span>
              <input class="form-control" formControlName="fullName" placeholder="Ahmed Hassan">
            </div>
            <div class="error-msg" *ngIf="f1.get('fullName')?.touched && f1.get('fullName')?.invalid">Min 2 characters required</div>
          </div>
          <div class="form-group">
            <label>Email Address</label>
            <div class="input-icon-wrap"><span class="input-icon">✉️</span>
              <input class="form-control" type="email" formControlName="email" placeholder="you@example.com">
            </div>
            <div class="error-msg" *ngIf="f1.get('email')?.touched && f1.get('email')?.invalid">Valid email required</div>
          </div>
          <div class="form-group">
            <label>Password</label>
            <div class="input-icon-wrap"><span class="input-icon">🔒</span>
              <input class="form-control" [type]="sp?'text':'password'" formControlName="password" placeholder="Min 8 chars, 1 uppercase, 1 number">
              <button type="button" class="input-icon-right" (click)="sp=!sp">{{ sp?'🙈':'👁' }}</button>
            </div>
            <div class="error-msg" *ngIf="f1.get('password')?.touched && f1.get('password')?.invalid">8+ chars with uppercase &amp; number</div>
          </div>
          <button type="button" class="btn btn-brand btn-lg btn-block mt-8" (click)="next()">Continue →</button>
        </form>

        <!-- Step 2 -->
        <form [formGroup]="f2" (ngSubmit)="submit()" *ngIf="step===2">
          <div class="form-group">
            <label>Phone Number <span style="color:var(--text-muted);font-weight:400">(optional)</span></label>
            <div class="input-icon-wrap"><span class="input-icon">📱</span>
              <input class="form-control" formControlName="phone" placeholder="+201234567890">
            </div>
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label>Gender</label>
              <select class="form-control" formControlName="gender">
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div class="form-group">
              <label>Date of Birth</label>
              <input class="form-control" type="date" formControlName="dateOfBirth">
            </div>
          </div>
          <div class="error-box" *ngIf="err">{{ err }}</div>
          <div style="display:flex;gap:10px;margin-top:8px">
            <button type="button" class="btn btn-ghost" (click)="step=1">← Back</button>
            <button type="submit" class="btn btn-brand btn-lg" style="flex:1;justify-content:center" [disabled]="loading">
              <span class="spinner" style="width:18px;height:18px" *ngIf="loading"></span>
              {{ loading?'Creating…':'Create Account' }}
            </button>
          </div>
        </form>

        <div class="auth-links">
          <p>Already have an account? <a routerLink="/login">Sign in</a></p>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .auth-page { display:grid;grid-template-columns:1fr 1fr;min-height:100vh; }
    .auth-panel { background:linear-gradient(145deg,#0c1a2e,#0d1f3c 50%,#1a0d3c);display:flex;align-items:center;justify-content:center;padding:48px; }
    .auth-panel-inner { max-width:400px;width:100%; }
    .auth-logo { font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:24px;color:#fff;display:block;margin-bottom:32px; span{background:var(--brand-gradient);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;} }
    .panel-title { color:#fff;font-size:26px;font-weight:700;margin-bottom:32px;line-height:1.3; }
    .benefits-list { display:flex;flex-direction:column;gap:18px;margin-bottom:40px; }
    .benefit { display:flex;gap:14px;align-items:flex-start; .b-icon{width:38px;height:38px;border-radius:10px;background:rgba(124,58,237,.2);border:1px solid rgba(124,58,237,.3);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;} strong{display:block;font-size:14px;color:#fff;margin-bottom:2px;} p{font-size:12px;color:rgba(255,255,255,.45);line-height:1.5;} }
    .panel-illustration { font-size:80px;text-align:center;opacity:.7;animation:floatY 3s ease-in-out infinite; }
    .auth-form-side { display:flex;align-items:center;justify-content:center;padding:48px;background:var(--bg);overflow-y:auto; }
    .auth-form-wrap { width:100%;max-width:420px; }
    .auth-links { margin-top:20px;text-align:center; p{font-size:13px;color:var(--text-muted);margin-bottom:6px; a{color:var(--brand-1);font-weight:600;} } }
    @media(max-width:768px){.auth-page{grid-template-columns:1fr;}.auth-panel{display:none;}}
  `]
})
export class RegisterComponent {
  step = 1; loading = false; err = ''; sp = false;
  f1: FormGroup; f2: FormGroup;
  benefits = [
    { icon:'🔒', title:'Secure & Private',   desc:'Your data is encrypted and never shared.' },
    { icon:'📅', title:'Book Anytime',        desc:'24/7 booking with instant confirmation.' },
    { icon:'⭐', title:'Verified Doctors',    desc:'All doctors are licensed and reviewed.' },
    { icon:'💊', title:'All Specialties',     desc:'Cardiology, Neurology, Pediatrics & more.' },
  ];
  constructor(private fb: FormBuilder, public auth: AuthService, public theme: ThemeService, private toast: ToastService, private router: Router) {
    this.f1 = this.fb.group({ fullName:['',[ Validators.required, Validators.minLength(2)]], email:['',[Validators.required,Validators.email]], password:['',[Validators.required,Validators.minLength(8),Validators.pattern(/^(?=.*[A-Z])(?=.*[0-9])/)]],});
    this.f2 = this.fb.group({ phone:[''], gender:[''], dateOfBirth:[''] });
  }
  next() { if(this.f1.invalid){this.f1.markAllAsTouched();return;} this.step=2; }
  submit() {
    this.loading=true; this.err='';
    const data={...this.f1.value,...this.f2.value};
    Object.keys(data).forEach(k=>{if(!data[k])delete data[k];});
    this.auth.register(data).subscribe({
      next:(r:any)=>{ this.loading=false; if(r.success){this.toast.success('Account created! Check your email.');this.router.navigate(['/verify-otp'],{queryParams:{email:this.f1.value.email,type:'patient'}});}else{this.err=r.message;} },
      error:(e:any)=>{ this.loading=false; this.err=e.error?.message||'Registration failed.'; }
    });
  }
}

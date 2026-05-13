import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { ToastService } from '../../../core/services/toast.service';
import { DoctorService } from '../../../core/services/doctor.service';

@Component({
  selector: 'app-doctor-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
  <div class="auth-page">
    <div class="auth-panel" style="background:linear-gradient(145deg,#0a2010,#0d2d1a 50%,#0a1f2e)">
      <div class="auth-panel-inner">
        <a routerLink="/" class="auth-logo">Doct<span>ory</span></a>
        <h2 class="panel-title">Join Our Network of<br><span style="background:linear-gradient(135deg,#10b981,#06b6d4);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">Top Specialists</span></h2>
        <div class="doc-perks">
          <div class="doc-perk" *ngFor="let p of perks"><span>{{ p.icon }}</span><span>{{ p.text }}</span></div>
        </div>
        <div class="doc-stats">
          <div class="ds-item"><strong>500+</strong><span>Doctors</span></div>
          <div class="ds-item"><strong>50K+</strong><span>Patients</span></div>
          <div class="ds-item"><strong>4.9★</strong><span>Rating</span></div>
        </div>
      </div>
    </div>

    <div class="auth-form-side">
      <div class="auth-form-wrap anim-scale" style="max-width:500px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:28px">
          <div>
            <div class="doc-badge-tag">👨‍⚕️ Doctor Registration</div>
            <h1 style="font-size:24px;margin-top:8px">Create Your Profile</h1>
          </div>
          <button class="theme-toggle" (click)="theme.toggle()">{{ theme.isDark()?'☀️':'🌙' }}</button>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-row-2">
            <div class="form-group">
              <label>Full Name</label>
              <input class="form-control" formControlName="fullName" placeholder="Mostafa Akram">
              <div class="error-msg" *ngIf="form.get('fullName')?.touched && form.get('fullName')?.invalid">Required</div>
            </div>
            <div class="form-group">
              <label>Gender</label>
              <select class="form-control" formControlName="gender">
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Email Address</label>
            <div class="input-icon-wrap"><span class="input-icon">✉️</span>
              <input class="form-control" type="email" formControlName="email" placeholder="doctor@example.com">
            </div>
            <div class="error-msg" *ngIf="form.get('email')?.touched && form.get('email')?.invalid">Valid email required</div>
          </div>
          <div class="form-group">
            <label>Password</label>
            <div class="input-icon-wrap"><span class="input-icon">🔒</span>
              <input class="form-control" type="password" formControlName="password" placeholder="Min 8 characters">
            </div>
            <div class="error-msg" *ngIf="form.get('password')?.touched && form.get('password')?.invalid">Min 8 characters</div>
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label>Phone</label>
              <input class="form-control" formControlName="phone" placeholder="+201234567890">
              <div class="error-msg" *ngIf="form.get('phone')?.touched && form.get('phone')?.invalid">Required</div>
            </div>
            <div class="form-group">
              <label>Region / City</label>
              <input class="form-control" formControlName="region" placeholder="Cairo">
              <div class="error-msg" *ngIf="form.get('region')?.touched && form.get('region')?.invalid">Required</div>
            </div>
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label>Specialty</label>
              <select class="form-control" formControlName="specialty">
                <option value="">Choose specialty</option>
                <option *ngFor="let s of specialties" [value]="s">{{ s }}</option>
              </select>
              <div class="error-msg" *ngIf="form.get('specialty')?.touched && form.get('specialty')?.invalid">Required</div>
            </div>
            <div class="form-group">
              <label>Years of experience</label>
              <input class="form-control" type="number" formControlName="experience" min="0" max="70" step="1" placeholder="e.g. 8">
              <div class="error-msg" *ngIf="form.get('experience')?.touched && form.get('experience')?.errors?.['required']">Required</div>
              <div class="error-msg" *ngIf="form.get('experience')?.touched && (form.get('experience')?.errors?.['min'] || form.get('experience')?.errors?.['max'])">Enter a whole number from 0 to 70</div>
            </div>
          </div>
          <div class="form-group">
            <label>Medical License No.</label>
            <input class="form-control" type="number" formControlName="medical_license" placeholder="123456">
            <div class="error-msg" *ngIf="form.get('medical_license')?.touched && form.get('medical_license')?.invalid">Required</div>
          </div>
          <div class="form-group">
            <label>Profile image URL <span style="font-weight:400;color:var(--text-muted)">(optional)</span></label>
            <input class="form-control" type="url" formControlName="image_profile" placeholder="https://example.com/photo.jpg">
            <div class="error-msg" *ngIf="form.get('image_profile')?.touched && form.get('image_profile')?.invalid">Enter a valid URL</div>
          </div>
          <div class="error-box" *ngIf="err">{{ err }}</div>
          <button type="submit" class="btn btn-brand btn-lg btn-block mt-8" [disabled]="loading">
            <span class="spinner" style="width:18px;height:18px" *ngIf="loading"></span>
            {{ loading?'Registering…':'Create Doctor Account' }}
          </button>
        </form>

        <div class="auth-links">
          <p>Already registered? <a routerLink="/login">Sign in</a></p>
          <p>Register as patient? <a routerLink="/register">Patient signup</a></p>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .auth-page { display:grid;grid-template-columns:1fr 1.4fr;min-height:100vh; }
    .auth-panel { display:flex;align-items:center;justify-content:center;padding:48px; }
    .auth-panel-inner { max-width:380px;width:100%; }
    .auth-logo { font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:24px;color:#fff;display:block;margin-bottom:28px; span{background:linear-gradient(135deg,#10b981,#06b6d4);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;} }
    .panel-title { color:#fff;font-size:26px;margin-bottom:28px;line-height:1.3; }
    .doc-perks { display:flex;flex-direction:column;gap:12px;margin-bottom:32px; div{display:flex;align-items:center;gap:12px;color:rgba(255,255,255,.7);font-size:13px; span:first-child{font-size:18px;}} }
    .doc-stats { display:flex;gap:24px; .ds-item{strong{display:block;color:#fff;font-family:'Bricolage Grotesque',sans-serif;font-size:22px;font-weight:800;} span{font-size:11px;color:rgba(255,255,255,.4);}} }
    .auth-form-side { display:flex;align-items:center;justify-content:center;padding:40px;background:var(--bg);overflow-y:auto; }
    .auth-form-wrap { width:100%; }
    .doc-badge-tag { display:inline-flex;align-items:center;gap:6px;background:rgba(16,185,129,.1);color:#059669;font-size:12px;font-weight:700;padding:4px 12px;border-radius:20px;border:1px solid rgba(16,185,129,.2); }
    .auth-links { margin-top:16px;text-align:center; p{font-size:13px;color:var(--text-muted);margin-bottom:4px; a{color:var(--brand-1);font-weight:600;} } }
    @media(max-width:768px){.auth-page{grid-template-columns:1fr;}.auth-panel{display:none;}}
  `]
})
export class DoctorRegisterComponent {
  form: FormGroup; loading = false; err = '';
  specialties: string[];
  perks = [
    { icon:'🌍', text:'Reach thousands of patients across Egypt' },
    { icon:'💰', text:'Manage earnings & appointment analytics' },
    { icon:'📅', text:'Full control over your schedule & slots' },
    { icon:'✅', text:'Verified badge after profile review' },
  ];
  constructor(private fb: FormBuilder, public auth: AuthService, public theme: ThemeService, private toast: ToastService, private ds: DoctorService, private router: Router) {
    this.specialties = ds.specialties;
    this.form = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      phone: ['', Validators.required],
      gender: [''],
      region: ['', Validators.required],
      specialty: ['', Validators.required],
      experience: ['', [Validators.required, Validators.min(0), Validators.max(70)]],
      medical_license: ['', Validators.required],
      image_profile: ['', [Validators.pattern(/^(|https?:\/\/.+)$/i)]],
    });
  }
  submit() {
    if(this.form.invalid){this.form.markAllAsTouched();return;}
    this.loading=true; this.err='';
    const payload = { ...this.form.value, experience: Number(this.form.value.experience) };
    this.auth.registerDoctor(payload).subscribe({
      next:(r:any)=>{ this.loading=false; if(r.success){this.toast.success('Doctor account created!');this.router.navigate(['/verify-otp'],{queryParams:{email:this.form.value.email,type:'doctor'}});}else{this.err=r.message;} },
      error:(e:any)=>{ this.loading=false; this.err=e.error?.message||'Registration failed.'; }
    });
  }
}

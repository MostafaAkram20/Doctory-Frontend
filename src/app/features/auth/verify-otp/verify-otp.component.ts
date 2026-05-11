import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
  <div class="verify-page">
    <div class="verify-bg-orb orb1"></div>
    <div class="verify-bg-orb orb2"></div>

    <div class="verify-card anim-scale">
      <button class="theme-toggle" style="position:absolute;top:20px;right:20px" (click)="theme.toggle()">{{ theme.isDark()?'☀️':'🌙' }}</button>

      <a routerLink="/" class="verify-logo">Doct<span>ory</span></a>

      <div class="verify-icon-wrap">
        <div class="verify-icon-ring"></div>
        <div class="verify-icon">📧</div>
      </div>

      <h1 style="font-size:26px;margin-bottom:10px">Verify Your Email</h1>
      <p style="color:var(--text-muted);font-size:14px;line-height:1.7;margin-bottom:32px">
        We sent a 6-digit code to<br>
        <strong style="color:var(--text)">{{ email }}</strong>
      </p>

      <div class="otp-row">
        <input *ngFor="let i of [0,1,2,3,4,5]" type="text" maxlength="1"
          inputmode="numeric" [id]="'o'+i" class="otp-box"
          (input)="onInput($event,i)" (keydown)="onKey($event,i)" (paste)="onPaste($event)">
      </div>

      <div class="otp-progress">
        <div class="otp-fill" [style.width]="(otp.length/6*100)+'%'"></div>
      </div>

      <div class="error-box" *ngIf="err" style="text-align:left">{{ err }}</div>
      <div class="success-box" *ngIf="ok" style="text-align:left">{{ ok }}</div>

      <button class="btn btn-brand btn-lg btn-block mt-16" (click)="verify()" [disabled]="loading || otp.length<6">
        <span class="spinner" style="width:18px;height:18px" *ngIf="loading"></span>
        {{ loading ? 'Verifying…' : 'Verify Email' }}
      </button>

      <div class="resend-area">
        <span style="color:var(--text-muted);font-size:13px">Didn't get the code?</span>
        <button class="resend-btn" (click)="resend()" [disabled]="cooldown>0||resending">
          {{ cooldown>0 ? 'Resend in '+cooldown+'s' : resending ? 'Sending…' : 'Resend Code' }}
        </button>
      </div>

      <a routerLink="/login" style="display:block;text-align:center;font-size:13px;color:var(--text-muted);margin-top:8px">← Back to Login</a>
    </div>
  </div>
  `,
  styles: [`
    .verify-page { min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:var(--bg);position:relative;overflow:hidden; }
    .verify-bg-orb { position:absolute;border-radius:50%;pointer-events:none; &.orb1{width:600px;height:600px;background:radial-gradient(circle,rgba(124,58,237,.1) 0%,transparent 65%);top:-200px;right:-100px;} &.orb2{width:400px;height:400px;background:radial-gradient(circle,rgba(6,182,212,.07) 0%,transparent 65%);bottom:-100px;left:-50px;} }
    .verify-card { background:var(--bg-2);border:1px solid var(--border-2);border-radius:var(--r-2xl);padding:48px 40px;max-width:440px;width:100%;text-align:center;box-shadow:var(--shadow-lg);position:relative; }
    .verify-logo { font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:22px;display:block;margin-bottom:32px; span{background:var(--brand-gradient);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;} }
    .verify-icon-wrap { position:relative;width:90px;height:90px;margin:0 auto 24px;display:flex;align-items:center;justify-content:center; }
    .verify-icon-ring { position:absolute;inset:0;border-radius:50%;border:2px solid transparent;background:linear-gradient(var(--bg-2),var(--bg-2)) padding-box, var(--brand-gradient) border-box;animation:spin 3s linear infinite; }
    .verify-icon { font-size:40px;animation:pulse 2s ease-in-out infinite; }
    .otp-row { display:flex;gap:8px;justify-content:center;margin-bottom:16px; }
    .otp-progress { height:3px;background:var(--bg-3);border-radius:2px;margin-bottom:20px;overflow:hidden; }
    .otp-fill { height:100%;background:var(--brand-gradient);border-radius:2px;transition:width .3s ease; }
    .resend-area { display:flex;align-items:center;justify-content:center;gap:10px;margin-top:16px; }
    .resend-btn { border:none;background:none;color:var(--brand-1);font-weight:700;font-size:13px;cursor:pointer;transition:var(--t); &:disabled{color:var(--text-muted);cursor:not-allowed;} &:hover:not(:disabled){text-decoration:underline;} }
  `]
})
export class VerifyOtpComponent implements OnInit, OnDestroy {
  email = ''; type = 'patient'; otp = ''; loading = false; resending = false;
  err = ''; ok = ''; cooldown = 0;
  private timer: any;

  constructor(private route: ActivatedRoute, private router: Router, public auth: AuthService, public theme: ThemeService, private toast: ToastService) {}

  ngOnInit() { this.route.queryParams.subscribe(p => { this.email = p['email']||''; this.type = p['type']||'patient'; }); }
  ngOnDestroy() { clearInterval(this.timer); }

  onInput(e: any, i: number) { e.target.value = e.target.value.replace(/\D/g,'').slice(0,1); this.buildOtp(); if(e.target.value && i<5) (document.getElementById(`o${i+1}`) as HTMLInputElement)?.focus(); }
  onKey(e: KeyboardEvent, i: number) { if(e.key==='Backspace'&&!(e.target as HTMLInputElement).value&&i>0)(document.getElementById(`o${i-1}`) as HTMLInputElement)?.focus(); }
  onPaste(e: ClipboardEvent) { const t=e.clipboardData?.getData('text')?.replace(/\D/g,'').slice(0,6)||''; t.split('').forEach((c,i)=>{ const el=document.getElementById(`o${i}`) as HTMLInputElement; if(el) el.value=c; }); this.buildOtp(); (document.getElementById(`o${Math.min(t.length,5)}`) as HTMLInputElement)?.focus(); e.preventDefault(); }
  buildOtp() { this.otp = Array.from({length:6},(_,i)=>(document.getElementById(`o${i}`) as HTMLInputElement)?.value||'').join(''); }

  verify() {
    if(this.otp.length<6) return;
    this.loading=true; this.err=''; this.ok='';
    const obs = this.type==='doctor' ? this.auth.verifyDoctorOTP(this.email,this.otp) : this.auth.verifyOTP(this.email,this.otp);
    obs.subscribe({
      next:(r:any)=>{ this.loading=false; if(r.success){ this.ok='✅ Email verified! Redirecting to login…'; this.toast.success('Email verified!'); setTimeout(()=>this.router.navigate(['/login']),1800); }else{ this.err=r.message; } },
      error:(e:any)=>{ this.loading=false; this.err=e.error?.message||'Verification failed.'; }
    });
  }

  resend() {
    this.resending=true; this.err=''; this.ok='';
    const obs = this.type==='doctor' ? this.auth.resendDoctorOTP(this.email) : this.auth.resendOTP(this.email);
    obs.subscribe({
      next:()=>{ this.resending=false; this.ok='New code sent to your email!'; this.cooldown=60; this.timer=setInterval(()=>{ this.cooldown--; if(this.cooldown<=0){clearInterval(this.timer);this.ok='';} },1000); },
      error:(e:any)=>{ this.resending=false; this.err=e.error?.message||'Failed to resend.'; }
    });
  }
}

import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = environment.apiUrl;
  currentUser = signal<any>(this.loadUser());
  isLoggedIn = signal<boolean>(!!localStorage.getItem('token'));
  constructor(private http: HttpClient, private router: Router) {}
  private loadUser(): any { const u = localStorage.getItem('user'); return u ? JSON.parse(u) : null; }
  register(data: any): Observable<any> { return this.http.post<any>(`${this.api}/auth/register`, data); }
  verifyOTP(email: string, otp: string): Observable<any> { return this.http.post<any>(`${this.api}/auth/verify-otp`, {email,otp}); }
  resendOTP(email: string): Observable<any> { return this.http.post<any>(`${this.api}/auth/resend-otp`, {email}); }
  login(email: string, password: string): Observable<any> { return this.http.post<any>(`${this.api}/auth/login`, {email,password}).pipe(tap((r:any) => { if(r.success&&r.data.token) this.save(r.data.token, r.data.user); })); }
  registerDoctor(data: any): Observable<any> { return this.http.post<any>(`${this.api}/auth/doctor/register`, data); }
  verifyDoctorOTP(email: string, otp: string): Observable<any> { return this.http.post<any>(`${this.api}/auth/doctor/verify-otp`, {email,otp}); }
  resendDoctorOTP(email: string): Observable<any> { return this.http.post<any>(`${this.api}/auth/doctor/resend-otp`, {email}); }
  loginDoctor(email: string, password: string): Observable<any> { return this.http.post<any>(`${this.api}/auth/doctor/login`, {email,password}).pipe(tap((r:any) => { if(r.success&&r.data.token) this.save(r.data.token, {...r.data.doctor, role:'doctor'}); })); }
  private save(token: string, user: any) { localStorage.setItem('token',token); localStorage.setItem('user',JSON.stringify(user)); this.currentUser.set(user); this.isLoggedIn.set(true); }
  logout() { localStorage.clear(); this.currentUser.set(null); this.isLoggedIn.set(false); this.router.navigate(['/']); }
  getToken() { return localStorage.getItem('token'); }
  getRole() { return this.currentUser()?.role || ''; }
  isAdmin()   { return this.getRole()==='admin'; }
  isDoctor()  { return this.getRole()==='doctor'; }
  isPatient() { return this.getRole()==='patient'; }
}

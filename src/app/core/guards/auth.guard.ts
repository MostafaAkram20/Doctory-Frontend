import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const a = inject(AuthService), r = inject(Router);
  if (a.isLoggedIn()) return true;
  r.navigate(['/login']); return false;
};

export const roleGuard = (role: string): CanActivateFn => () => {
  const a = inject(AuthService), r = inject(Router);
  if (a.getRole() === role) return true;
  r.navigate(['/']); return false;
};

export const guestGuard: CanActivateFn = () => {
  const a = inject(AuthService), r = inject(Router);
  if (!a.isLoggedIn()) return true;
  const role = a.getRole();
  r.navigate([role === 'admin' ? '/admin/dashboard' : role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard']);
  return false;
};

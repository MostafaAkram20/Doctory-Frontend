import { Routes } from '@angular/router';
import { authGuard, roleGuard, guestGuard } from './core/guards/auth.guard';
export const routes: Routes = [
  { path:'', loadComponent:()=>import('./features/auth/landing/landing.component').then(m=>m.LandingComponent) },
  { path:'login', canActivate:[guestGuard], loadComponent:()=>import('./features/auth/login/login.component').then(m=>m.LoginComponent) },
  { path:'forgot-password', canActivate:[guestGuard], loadComponent:()=>import('./features/auth/forgot-password/forgot-password.component').then(m=>m.ForgotPasswordComponent) },
  { path:'reset-password', canActivate:[guestGuard], loadComponent:()=>import('./features/auth/reset-password/reset-password.component').then(m=>m.ResetPasswordComponent) },
  { path:'register', canActivate:[guestGuard], loadComponent:()=>import('./features/auth/register/register.component').then(m=>m.RegisterComponent) },
  { path:'doctor-register', canActivate:[guestGuard], loadComponent:()=>import('./features/auth/doctor-register/doctor-register.component').then(m=>m.DoctorRegisterComponent) },
  { path:'verify-otp', loadComponent:()=>import('./features/auth/verify-otp/verify-otp.component').then(m=>m.VerifyOtpComponent) },
  { path:'doctors', loadComponent:()=>import('./features/patient/doctors/doctors.component').then(m=>m.DoctorsComponent) },
  { path:'doctors/:id', loadComponent:()=>import('./features/patient/doctor-profile/doctor-profile.component').then(m=>m.DoctorProfileComponent) },
  { path:'patient', canActivate:[authGuard,roleGuard('patient')], children:[
    { path:'dashboard', loadComponent:()=>import('./features/patient/dashboard/dashboard.component').then(m=>m.PatientDashboardComponent) },
    { path:'appointments', loadComponent:()=>import('./features/patient/appointments/appointments.component').then(m=>m.PatientAppointmentsComponent) },
    { path:'book/:doctorId', loadComponent:()=>import('./features/patient/book-appointment/book-appointment.component').then(m=>m.BookAppointmentComponent) },
    { path:'', redirectTo:'dashboard', pathMatch:'full' },
  ]},
  { path:'doctor', canActivate:[authGuard,roleGuard('doctor')], children:[
    { path:'dashboard', loadComponent:()=>import('./features/doctor/dashboard/doctor-dashboard.component').then(m=>m.DoctorDashboardComponent) },
    { path:'appointments', loadComponent:()=>import('./features/doctor/appointments/doctor-appointments.component').then(m=>m.DoctorAppointmentsComponent) },
    { path:'', redirectTo:'dashboard', pathMatch:'full' },
  ]},
  { path:'admin', canActivate:[authGuard,roleGuard('admin')], children:[
    { path:'dashboard', loadComponent:()=>import('./features/admin/dashboard/admin-dashboard.component').then(m=>m.AdminDashboardComponent) },
    { path:'users', loadComponent:()=>import('./features/admin/users/admin-users.component').then(m=>m.AdminUsersComponent) },
    { path:'doctors', loadComponent:()=>import('./features/admin/doctors/admin-doctors.component').then(m=>m.AdminDoctorsComponent) },
    { path:'clinics', loadComponent:()=>import('./features/admin/clinics/admin-clinics.component').then(m=>m.AdminClinicsComponent) },
    { path:'', redirectTo:'dashboard', pathMatch:'full' },
  ]},
  { path:'**', redirectTo:'' }
];

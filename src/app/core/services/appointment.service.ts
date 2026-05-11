import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private api = `${environment.apiUrl}/appointments`;
  constructor(private http: HttpClient) {}
  bookAppointment(data:any): Observable<any> { return this.http.post<any>(this.api,data); }
  getMyAppointments(f:any={}): Observable<any> { let p=new HttpParams(); Object.keys(f).forEach(k=>{if(f[k])p=p.set(k,String(f[k]));}); return this.http.get<any>(`${this.api}/my`,{params:p}); }
  getDoctorAppointments(f:any={}): Observable<any> { let p=new HttpParams(); Object.keys(f).forEach(k=>{if(f[k])p=p.set(k,String(f[k]));}); return this.http.get<any>(`${this.api}/doctor`,{params:p}); }
  getAllAppointments(f:any={}): Observable<any> { let p=new HttpParams(); Object.keys(f).forEach(k=>{if(f[k])p=p.set(k,String(f[k]));}); return this.http.get<any>(this.api,{params:p}); }
  confirmAppointment(id:string): Observable<any> { return this.http.patch<any>(`${this.api}/${id}/confirm`,{}); }
  completeAppointment(id:string): Observable<any> { return this.http.patch<any>(`${this.api}/${id}/complete`,{}); }
  cancelAppointment(id:string,reason?:string): Observable<any> { return this.http.patch<any>(`${this.api}/${id}/cancel`,{cancellationReason:reason}); }
  addNotes(id:string,data:any): Observable<any> { return this.http.patch<any>(`${this.api}/${id}/notes`,data); }
  markNoShow(id:string): Observable<any> { return this.http.patch<any>(`${this.api}/${id}/no-show`,{}); }
}

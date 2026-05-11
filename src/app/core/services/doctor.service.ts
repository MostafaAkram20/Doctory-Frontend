import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
@Injectable({ providedIn: 'root' })
export class DoctorService {
  private api = `${environment.apiUrl}/doctors`;
  readonly specialties = ['Cardiology','Dermatology','Neurology','Pediatrics','Psychiatry'];
  constructor(private http: HttpClient) {}
  getDoctors(f:any={}): Observable<any> { let p=new HttpParams(); Object.keys(f).forEach(k=>{if(f[k])p=p.set(k,String(f[k]));}); return this.http.get<any>(this.api,{params:p}); }
  getDoctorById(id:string): Observable<any> { return this.http.get<any>(`${this.api}/${id}`); }
  updateDoctor(id:string,data:any): Observable<any> { return this.http.patch<any>(`${this.api}/${id}`,data); }
  deleteDoctor(id:string): Observable<any> { return this.http.delete<any>(`${this.api}/${id}`); }
}

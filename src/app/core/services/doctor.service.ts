import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/** Backend sometimes stores or returns profile photo under camelCase or other keys; UI uses `image_profile`. */
export function applyDoctorProfileImageAliases(doc: any): void {
  if (!doc || typeof doc !== 'object') return;
  const raw =
    doc.image_profile ??
    doc.imageProfile ??
    doc.profile_image ??
    doc.profileImage;
  if (typeof raw === 'string' && raw.trim()) {
    doc.image_profile = raw.trim();
  }
}

@Injectable({ providedIn: 'root' })
export class DoctorService {
  private api = `${environment.apiUrl}/doctors`;
  readonly specialties = ['Cardiology','Dermatology','Neurology','Pediatrics','Psychiatry'];
  constructor(private http: HttpClient) {}
  getDoctors(f:any={}): Observable<any> {
    let p=new HttpParams(); Object.keys(f).forEach(k=>{if(f[k])p=p.set(k,String(f[k]));});
    return this.http.get<any>(this.api,{params:p}).pipe(
      map((r: any) => {
        if (r?.data?.doctors?.length) {
          for (const d of r.data.doctors) applyDoctorProfileImageAliases(d);
        }
        return r;
      })
    );
  }
  getDoctorById(id:string): Observable<any> {
    return this.http.get<any>(`${this.api}/${id}`).pipe(
      map((r: any) => {
        if (r?.data?.doctor) applyDoctorProfileImageAliases(r.data.doctor);
        else if (r?.data && typeof r.data === 'object' && r.data.fullName) applyDoctorProfileImageAliases(r.data);
        return r;
      })
    );
  }
  /** Optional; falls back to `doctor.reviews` on getDoctorById if this route is absent. */
  getDoctorReviews(id: string): Observable<any> { return this.http.get<any>(`${this.api}/${id}/reviews`); }
  updateDoctor(id:string,data:any): Observable<any> { return this.http.patch<any>(`${this.api}/${id}`,data); }
  deleteDoctor(id:string): Observable<any> { return this.http.delete<any>(`${this.api}/${id}`); }
}

import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

/** Construye URLs absolutas contra SWS.Api (mismo patrón que VE_Front / RISE_Front). */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = environment.apiUrl;

  url(path: string): string {
    return `${this.baseUrl}/${path.replace(/^\//, '')}`;
  }

  isApiRequest(url: string): boolean {
    return url.startsWith(this.baseUrl);
  }
}

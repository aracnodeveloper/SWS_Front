import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { Category, PagedList, Product } from '../models/catalog';
import { ApiService } from './api';

export interface ProductQuery {
  category?: string | null;
  search?: string | null;
  featured?: boolean;
  sort?: string | null;
  page?: number;
  pageSize?: number;
}

@Injectable({ providedIn: 'root' })
export class CatalogApi {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiService);

  /** Las categorías cambian poco: una sola petición por sesión. */
  private readonly categories$ = this.http
    .get<Category[]>(this.api.url('category'))
    .pipe(shareReplay({ bufferSize: 1, refCount: false }));

  categories(): Observable<Category[]> {
    return this.categories$;
  }

  products(query: ProductQuery = {}): Observable<PagedList<Product>> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== null && value !== undefined && value !== '') params = params.set(key, String(value));
    }
    return this.http.get<PagedList<Product>>(this.api.url('product'), { params });
  }

  bySlug(slug: string): Observable<Product> {
    return this.http.get<Product>(this.api.url(`product/slug/${encodeURIComponent(slug)}`));
  }
}

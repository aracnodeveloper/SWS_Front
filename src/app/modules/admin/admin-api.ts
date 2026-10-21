import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../shared/services/api';
import { PagedList, Product } from '../../shared/models/catalog';
import { AdminOrder, AdminTransaction, OrderStatus } from '../../shared/models/order';

function params(obj: Record<string, string | number | boolean | null | undefined>): HttpParams {
  let p = new HttpParams();
  for (const [k, v] of Object.entries(obj)) if (v !== null && v !== undefined && v !== '') p = p.set(k, String(v));
  return p;
}

@Injectable({ providedIn: 'root' })
export class AdminApi {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiService);

  orders(q: { status?: string | null; search?: string | null; page?: number; pageSize?: number }): Observable<PagedList<AdminOrder>> {
    return this.http.get<PagedList<AdminOrder>>(this.api.url('order'), { params: params(q) });
  }

  order(id: string): Observable<{ order: AdminOrder; transactions: AdminTransaction[] }> {
    return this.http.get<{ order: AdminOrder; transactions: AdminTransaction[] }>(this.api.url(`order/${id}`));
  }

  setOrderStatus(id: string, status: OrderStatus, note?: string): Observable<null> {
    return this.http.patch<null>(this.api.url(`order/${id}/status`), { status, note });
  }

  products(q: { search?: string | null; page?: number; pageSize?: number }): Observable<PagedList<Product>> {
    return this.http.get<PagedList<Product>>(this.api.url('product/admin'), { params: params(q) });
  }

  product(id: string): Observable<Product> {
    return this.http.get<Product>(this.api.url(`product/${id}`));
  }

  createProduct(p: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(this.api.url('product'), p);
  }

  updateProduct(id: string, p: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(this.api.url(`product/${id}`), { ...p, id });
  }

  setStock(id: string, stock: number): Observable<null> {
    return this.http.patch<null>(this.api.url(`product/${id}/stock`), { stock });
  }

  setActive(id: string, isStatus: boolean): Observable<null> {
    return this.http.patch<null>(this.api.url(`product/${id}/status`), { isStatus });
  }

  uploadImage(id: string, file: File): Observable<Product> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<Product>(this.api.url(`product/${id}/image`), form);
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { CheckoutRequest, CheckoutResponse, PublicOrder, StoreConfig } from '../models/order';
import { ApiService } from './api';

@Injectable({ providedIn: 'root' })
export class OrderApi {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiService);

  private readonly config$ = this.http
    .get<StoreConfig>(this.api.url('checkout/config'))
    .pipe(shareReplay({ bufferSize: 1, refCount: false }));

  config(): Observable<StoreConfig> {
    return this.config$;
  }

  checkout(request: CheckoutRequest): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(this.api.url('checkout'), request);
  }

  publicOrder(token: string): Observable<PublicOrder> {
    return this.http.get<PublicOrder>(this.api.url(`order/public/${token}`));
  }

  confirmPayPhone(id: number, clientTransactionId: string): Observable<PublicOrder> {
    return this.http.post<PublicOrder>(this.api.url('payment/payphone/confirm'), { id, clientTransactionId });
  }

  cancelPayment(clientTransactionId: string, token: string): Observable<PublicOrder> {
    return this.http.post<PublicOrder>(this.api.url('payment/cancel'), { clientTransactionId, token });
  }
}

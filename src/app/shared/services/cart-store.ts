import { Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Product } from '../models/catalog';

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  imageUrl: string | null;
  stock: number;
  quantity: number;
}

const STORAGE_KEY = 'sws.cart.v1';
const MAX_PER_ITEM = 20;

/** Carrito en signals, persistido en localStorage (solo en el navegador; en SSR queda vacío). */
@Injectable({ providedIn: 'root' })
export class CartStore {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly _items = signal<CartItem[]>(this.load());

  readonly items = this._items.asReadonly();
  readonly count = computed(() => this._items().reduce((n, i) => n + i.quantity, 0));
  readonly itemsTotal = computed(() => this._items().reduce((sum, i) => sum + i.price * i.quantity, 0));
  readonly isEmpty = computed(() => this._items().length === 0);

  /** Abre el panel lateral del carrito al agregar un producto. */
  readonly drawerOpen = signal(false);

  constructor() {
    effect(() => {
      const items = this._items();
      if (!this.isBrowser) return;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch {
        /* modo privado o storage lleno: el carrito sigue en memoria */
      }
    });
  }

  add(product: Product, quantity = 1): void {
    const limit = this.limitFor(product.stock);
    this._items.update((items) => {
      const existing = items.find((i) => i.productId === product.id);
      if (existing) {
        return items.map((i) =>
          i.productId === product.id
            ? { ...i, stock: product.stock, price: product.price, quantity: Math.min(limit, i.quantity + quantity) }
            : i,
        );
      }
      return [
        ...items,
        {
          productId: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          stock: product.stock,
          quantity: Math.min(limit, quantity),
        },
      ];
    });
    this.drawerOpen.set(true);
  }

  setQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) return this.remove(productId);
    this._items.update((items) =>
      items.map((i) => (i.productId === productId ? { ...i, quantity: Math.min(this.limitFor(i.stock), quantity) } : i)),
    );
  }

  remove(productId: string): void {
    this._items.update((items) => items.filter((i) => i.productId !== productId));
  }

  clear(): void {
    this._items.set([]);
  }

  limitFor(stock: number): number {
    return Math.max(1, Math.min(MAX_PER_ITEM, stock));
  }

  private load(): CartItem[] {
    if (!this.isBrowser) return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as CartItem[]) : [];
      return Array.isArray(parsed) ? parsed.filter((i) => i?.productId && i.quantity > 0) : [];
    } catch {
      return [];
    }
  }
}

import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AdminApi } from '../admin-api';
import { CatalogApi } from '../../../shared/services/catalog-api';
import { Product } from '../../../shared/models/catalog';
import { MediaPipe } from '../../../shared/pipes/media';
import { Icon } from '../../../shared/components/icon';
import { ToastService } from '../../../shared/services/toast';
import { httpErrorMessage } from '../../../shared/utils/http-error';

const slugify = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

@Component({
  selector: 'app-admin-product-form',
  imports: [ReactiveFormsModule, RouterLink, MediaPipe, Icon],
  template: `
    <a routerLink="/admin/productos" class="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600"><app-icon name="arrow-left" [size]="16" /> Productos</a>
    <h1 class="mt-3 text-2xl font-bold">{{ isNew() ? 'Nuevo producto' : form.controls.name.value }}</h1>

    <form [formGroup]="form" (ngSubmit)="save()" class="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
      <section class="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
        <div class="sm:col-span-2"><label class="field-label" for="name">Nombre</label><input id="name" class="field" formControlName="name" (blur)="autoSlug()" /></div>
        <div><label class="field-label" for="slug">Slug (URL)</label><input id="slug" class="field" formControlName="slug" /></div>
        <div><label class="field-label" for="sku">SKU</label><input id="sku" class="field" formControlName="sku" /></div>
        <div>
          <label class="field-label" for="categoryId">Categoría</label>
          <select id="categoryId" class="field" formControlName="categoryId">
            <option value="" disabled>Selecciona</option>
            @for (c of categories(); track c.id) { <option [value]="c.id">{{ c.name }}</option> }
          </select>
        </div>
        <div><label class="field-label" for="brand">Marca</label><input id="brand" class="field" formControlName="brand" /></div>
        <div><label class="field-label" for="price">Precio (USD, IVA incl.)</label><input id="price" type="number" step="0.01" min="0" class="field" formControlName="price" /></div>
        <div><label class="field-label" for="compareAtPrice">Precio anterior (tachado)</label><input id="compareAtPrice" type="number" step="0.01" min="0" class="field" formControlName="compareAtPrice" /></div>
        <div><label class="field-label" for="stock">Stock</label><input id="stock" type="number" min="0" class="field" formControlName="stock" /></div>
        <div><label class="field-label" for="badge">Etiqueta</label><input id="badge" class="field" formControlName="badge" placeholder="3 obsequios, Nuevo…" /></div>
        <div class="sm:col-span-2"><label class="field-label" for="description">Descripción</label><textarea id="description" rows="3" class="field" formControlName="description"></textarea></div>
        <div class="sm:col-span-2"><label class="field-label" for="features">Características (una por línea)</label><textarea id="features" rows="5" class="field" formControlName="features"></textarea></div>
        <div><label class="field-label" for="sortOrder">Orden</label><input id="sortOrder" type="number" class="field" formControlName="sortOrder" /></div>
        <label class="flex items-center gap-3 self-end pb-3 text-sm font-medium"><input type="checkbox" class="size-5 accent-brand-500" formControlName="isFeatured" /> Destacado en el inicio</label>
      </section>

      <aside class="space-y-4">
        <section class="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 class="font-semibold">Imagen</h2>
          <img [src]="imageUrl() | media" alt="" class="mt-3 aspect-square w-full rounded-xl bg-brand-50 object-cover" />
          @if (isNew()) {
            <p class="mt-3 text-xs text-slate-500">Guarda el producto para subir su imagen.</p>
          } @else {
            <label class="btn-outline mt-3 w-full cursor-pointer">
              <app-icon name="image" [size]="18" /> {{ uploading() ? 'Subiendo…' : 'Cambiar imagen' }}
              <input type="file" accept="image/jpeg,image/png,image/webp" class="sr-only" (change)="upload($event)" [disabled]="uploading()" />
            </label>
            <p class="mt-2 text-xs text-slate-400">JPG, PNG o WebP · máx. 5 MB · cuadrada se ve mejor.</p>
          }
        </section>
        @if (error()) { <p class="rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">{{ error() }}</p> }
        <button type="submit" class="btn-primary w-full" [disabled]="form.invalid || saving()">{{ saving() ? 'Guardando…' : 'Guardar' }}</button>
      </aside>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProductForm {
  private readonly api = inject(AdminApi);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly id = input.required<string>();

  protected readonly categories = toSignal(inject(CatalogApi).categories(), { initialValue: [] });
  protected readonly isNew = computed(() => this.id() === 'nuevo');
  protected readonly imageUrl = signal<string | null>(null);
  protected readonly saving = signal(false);
  protected readonly uploading = signal(false);
  protected readonly error = signal<string | null>(null);
  private original: Product | null = null;

  protected readonly form = inject(FormBuilder).nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(160)]],
    slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
    sku: ['', [Validators.required, Validators.maxLength(40)]],
    categoryId: ['', Validators.required],
    brand: [''],
    price: [0, [Validators.required, Validators.min(0.01)]],
    compareAtPrice: [null as number | null],
    stock: [0, [Validators.required, Validators.min(0)]],
    badge: [''],
    description: [''],
    features: [''],
    sortOrder: [100],
    isFeatured: [false],
  });

  constructor() {
    effect(() => {
      if (this.isNew()) return;
      this.api.product(this.id()).subscribe((p) => {
        this.original = p;
        this.imageUrl.set(p.imageUrl);
        this.form.patchValue({ ...p, brand: p.brand ?? '', badge: p.badge ?? '', description: p.description ?? '', features: p.features.join('\n') });
      });
    });
  }

  protected autoSlug(): void {
    if (!this.form.controls.slug.value) this.form.controls.slug.setValue(slugify(this.form.controls.name.value));
  }

  protected save(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const body: Partial<Product> = {
      ...(this.original ?? {}),
      ...v,
      brand: v.brand || null,
      badge: v.badge || null,
      description: v.description || null,
      compareAtPrice: v.compareAtPrice || null,
      features: v.features.split('\n').map((f) => f.trim()).filter(Boolean),
      imageUrl: this.imageUrl(),
    };
    delete body.category;

    this.saving.set(true);
    this.error.set(null);
    const req = this.isNew() ? this.api.createProduct(body) : this.api.updateProduct(this.id(), body);
    req.subscribe({
      next: (p) => {
        this.saving.set(false);
        this.toast.success('Producto guardado');
        if (this.isNew()) void this.router.navigate(['/admin/productos', p.id]);
      },
      error: (e: unknown) => {
        this.saving.set(false);
        this.error.set(httpErrorMessage(e, 'No se pudo guardar. ¿El slug o SKU ya existe?'));
      },
    });
  }

  protected upload(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploading.set(true);
    this.api.uploadImage(this.id(), file).subscribe({
      next: (p) => {
        this.imageUrl.set(p.imageUrl);
        if (this.original) this.original.imageUrl = p.imageUrl;
        this.uploading.set(false);
        this.toast.success('Imagen actualizada');
      },
      error: (e: unknown) => {
        this.uploading.set(false);
        this.toast.error(httpErrorMessage(e));
      },
    });
  }
}

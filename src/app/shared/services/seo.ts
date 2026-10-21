import { DOCUMENT, Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

export interface SeoData {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  type?: 'website' | 'product';
  jsonLd?: Record<string, unknown> | null;
}

/** Title, description, Open Graph (vista previa en WhatsApp) y JSON-LD. Se renderiza en SSR. */
@Injectable({ providedIn: 'root' })
export class Seo {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  set(data: SeoData): void {
    const url = `${environment.webUrl}${data.path}`;
    const image = absoluteImage(data.image ?? '/brand/sws-logo-light.webp');

    this.title.setTitle(data.title);
    this.meta.updateTag({ name: 'description', content: data.description });
    this.meta.updateTag({ property: 'og:title', content: data.title });
    this.meta.updateTag({ property: 'og:description', content: data.description });
    this.meta.updateTag({ property: 'og:type', content: data.type ?? 'website' });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:site_name', content: 'Sale World Sale' });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.setCanonical(url);
    this.setJsonLd(data.jsonLd ?? null);
  }

  private setCanonical(url: string): void {
    let link = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.rel = 'canonical';
      this.document.head.appendChild(link);
    }
    link.href = url;
  }

  private setJsonLd(data: Record<string, unknown> | null): void {
    this.document.head.querySelector('script[data-seo="jsonld"]')?.remove();
    if (!data) return;
    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo', 'jsonld');
    script.textContent = JSON.stringify(data).replace(/</g, '\\u003c');
    this.document.head.appendChild(script);
  }
}

export function absoluteImage(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const origin = path.startsWith('/uploads/') ? environment.apiOrigin : environment.webUrl;
  return `${origin}${path}`;
}

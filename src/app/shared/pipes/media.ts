import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Resuelve la imagen de un producto: "/products/x.webp" es asset del front;
 * "/uploads/..." la sirve el API (subida desde el admin).
 */
@Pipe({ name: 'media' })
export class MediaPipe implements PipeTransform {
  transform(path: string | null | undefined): string {
    if (!path) return '/brand/sws-isotipo.webp';
    if (path.startsWith('/uploads/')) return `${environment.apiOrigin}${path}`;
    return path;
  }
}

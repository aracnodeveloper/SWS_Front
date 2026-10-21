export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sortOrder: number;
  productCount: number;
}

export interface Product {
  id: string;
  sku: string;
  slug: string;
  name: string;
  brand: string | null;
  description: string | null;
  features: string[];
  price: number;
  compareAtPrice: number | null;
  stock: number;
  imageUrl: string | null;
  badge: string | null;
  isFeatured: boolean;
  sortOrder: number;
  categoryId: string;
  category?: { id: string; slug: string; name: string } | null;
  isStatus: boolean;
}

export interface PagedList<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

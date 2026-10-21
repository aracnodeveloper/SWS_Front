import { Routes } from '@angular/router';
import { ShopLayout } from './core/layout/shop-layout';
import { adminGuard } from './shared/guards/admin.guard';

export const routes: Routes = [
  {
    path: 'admin/login',
    title: 'Ingresar · Admin SWS',
    loadComponent: () => import('./modules/admin/login/admin-login').then((m) => m.AdminLogin),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadChildren: () => import('./modules/admin/admin.routes').then((m) => m.adminRoutes),
  },
  {
    path: '',
    component: ShopLayout,
    children: [
      { path: '', loadComponent: () => import('./modules/home/home-page').then((m) => m.HomePage) },
      {
        path: 'catalogo',
        title: 'Catálogo · Sale World Sale',
        loadComponent: () => import('./modules/catalog/catalog-page').then((m) => m.CatalogPage),
      },
      {
        path: 'producto/:slug',
        loadComponent: () => import('./modules/product/product-page').then((m) => m.ProductPage),
      },
      {
        path: 'carrito',
        title: 'Tu carrito · Sale World Sale',
        loadComponent: () => import('./modules/cart/cart-page').then((m) => m.CartPage),
      },
      {
        path: 'checkout',
        title: 'Finalizar compra · Sale World Sale',
        loadComponent: () => import('./modules/checkout/checkout-page').then((m) => m.CheckoutPage),
      },
      {
        path: 'pago/respuesta',
        title: 'Resultado del pago · Sale World Sale',
        loadComponent: () => import('./modules/payment/payment-result').then((m) => m.PaymentResult),
      },
      {
        path: 'pedido/:token',
        title: 'Tu pedido · Sale World Sale',
        loadComponent: () => import('./modules/order/order-page').then((m) => m.OrderPage),
      },
      {
        path: '**',
        title: 'Página no encontrada · Sale World Sale',
        loadComponent: () => import('./modules/not-found/not-found').then((m) => m.NotFound),
      },
    ],
  },
];

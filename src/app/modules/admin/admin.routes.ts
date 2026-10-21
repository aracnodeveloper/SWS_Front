import { Routes } from '@angular/router';
import { AdminLayout } from './admin-layout';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayout,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'pedidos' },
      {
        path: 'pedidos',
        title: 'Pedidos · Admin SWS',
        loadComponent: () => import('./orders/admin-orders').then((m) => m.AdminOrders),
      },
      {
        path: 'pedidos/:id',
        title: 'Pedido · Admin SWS',
        loadComponent: () => import('./orders/admin-order-detail').then((m) => m.AdminOrderDetail),
      },
      {
        path: 'productos',
        title: 'Productos · Admin SWS',
        loadComponent: () => import('./products/admin-products').then((m) => m.AdminProducts),
      },
      {
        path: 'productos/:id',
        title: 'Producto · Admin SWS',
        loadComponent: () => import('./products/admin-product-form').then((m) => m.AdminProductForm),
      },
    ],
  },
];

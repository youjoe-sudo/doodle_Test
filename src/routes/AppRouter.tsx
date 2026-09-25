import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { StoreLayout } from '../layouts/StoreLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';

// Eagerly loaded (core store pages — needed on first load)
import { Homepage } from '../pages/store/Homepage';
import { LoginPage } from '../pages/auth/LoginPage';
import { ProductsPage } from '../pages/products/ProductsPage';
import { ProductDetailsPage } from '../pages/products/ProductDetailsPage';
import { CartPage } from '../pages/cart/CartPage';

// Lazy loaded (code-split chunks)
const AdminLayout = lazy(() => import('../layouts/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard').then(m => ({ default: m.AdminDashboard })));
const AdminProducts = lazy(() => import('../pages/admin/Products').then(m => ({ default: m.AdminProducts })));
const AdminCategories = lazy(() => import('../pages/admin/Categories').then(m => ({ default: m.AdminCategories })));
const AdminOrders = lazy(() => import('../pages/admin/Orders').then(m => ({ default: m.AdminOrders })));
const AdminInventory = lazy(() => import('../pages/admin/Inventory').then(m => ({ default: m.AdminInventory })));
const AdminCustomers = lazy(() => import('../pages/admin/Customers').then(m => ({ default: m.AdminCustomers })));
const AdminUsers = lazy(() => import('../pages/admin/Users').then(m => ({ default: m.AdminUsers })));
const AdminReviews = lazy(() => import('../pages/admin/Reviews').then(m => ({ default: m.AdminReviews })));
const AdminSupport = lazy(() => import('../pages/admin/Support').then(m => ({ default: m.AdminSupport })));
const AdminShipping = lazy(() => import('../pages/admin/Shipping').then(m => ({ default: m.AdminShipping })));
const AdminPayments = lazy(() => import('../pages/admin/Payments').then(m => ({ default: m.AdminPayments })));
const AdminSettings = lazy(() => import('../pages/admin/Settings').then(m => ({ default: m.AdminSettings })));
const AdminCoupons = lazy(() => import('../pages/admin/Coupons').then(m => ({ default: m.AdminCoupons })));
const AdminNotifications = lazy(() => import('../pages/admin/Notifications').then(m => ({ default: m.AdminNotifications })));
const AdminColoring = lazy(() => import('../pages/admin/Coloring').then(m => ({ default: m.AdminColoring })));
const AdminHeroBanners = lazy(() => import('../pages/admin/HeroBanners').then(m => ({ default: m.AdminHeroBanners })));
const AdminAboutBuilder = lazy(() => import('../pages/admin/AboutBuilder').then(m => ({ default: m.AdminAboutBuilder })));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const BannedScreen = lazy(() => import('../pages/auth/BannedScreen').then(m => ({ default: m.BannedScreen })));
const AccountPage = lazy(() => import('../pages/account/AccountPage').then(m => ({ default: m.AccountPage })));
const OrdersPage = lazy(() => import('../pages/account/OrdersPage').then(m => ({ default: m.OrdersPage })));
const OrderTrackingPage = lazy(() => import('../pages/account/OrderTrackingPage').then(m => ({ default: m.OrderTrackingPage })));
const WishlistPage = lazy(() => import('../pages/account/WishlistPage').then(m => ({ default: m.WishlistPage })));
const SupportPage = lazy(() => import('../pages/account/SupportPage').then(m => ({ default: m.SupportPage })));
const CheckoutPage = lazy(() => import('../pages/checkout/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const OrderSuccessPage = lazy(() => import('../pages/orders/SuccessPage').then(m => ({ default: m.OrderSuccessPage })));
const ColoringOnlinePage = lazy(() => import('../pages/coloring/ColoringOnlinePage').then(m => ({ default: m.ColoringOnlinePage })));
const ColoringCanvasPage = lazy(() => import('../pages/coloring/ColoringCanvasPage').then(m => ({ default: m.ColoringCanvasPage })));
const AboutPage = lazy(() => import('../pages/about/AboutPage').then(m => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('../pages/contact/ContactPage').then(m => ({ default: m.ContactPage })));
const SearchPage = lazy(() => import('../pages/search/SearchPage').then(m => ({ default: m.SearchPage })));
const CategoriesPage = lazy(() => import('../pages/categories/CategoriesPage').then(m => ({ default: m.CategoriesPage })));
const NotFoundPage = lazy(() => import('../pages/not-found/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

const AdminLoading = () => (
  <div className="min-h-screen flex items-center justify-center bg-cream">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-terracotta border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-muted text-sm">جاري التحميل...</p>
    </div>
  </div>
);

export const router = createBrowserRouter([
    {
      path: '/',
      element: <StoreLayout />,
      children: [
        { index: true, element: <Homepage /> },
        { path: 'shop', element: <ProductsPage /> },
        { path: 'products', element: <ProductsPage /> },
        { path: 'products/:slug', element: <ProductDetailsPage /> },
        { path: 'categories', element: <Suspense fallback={<AdminLoading />}><CategoriesPage /></Suspense> },
        { path: 'categories/:slug', element: <Suspense fallback={<AdminLoading />}><CategoriesPage /></Suspense> },
        { path: 'search', element: <Suspense fallback={<AdminLoading />}><SearchPage /></Suspense> },
        { path: 'about', element: <Suspense fallback={<AdminLoading />}><AboutPage /></Suspense> },
        { path: 'contact', element: <Suspense fallback={<AdminLoading />}><ContactPage /></Suspense> },
        { path: 'coloring-online', element: <Suspense fallback={<AdminLoading />}><ColoringOnlinePage /></Suspense> },
        { path: 'coloring/:id', element: <ProtectedRoute><Suspense fallback={<AdminLoading />}><ColoringCanvasPage /></Suspense></ProtectedRoute> },
        { path: 'cart', element: <ProtectedRoute><CartPage /></ProtectedRoute> },
        { path: 'checkout', element: <ProtectedRoute><Suspense fallback={<AdminLoading />}><CheckoutPage /></Suspense></ProtectedRoute> },
        { path: 'orders/success', element: <Suspense fallback={<AdminLoading />}><OrderSuccessPage /></Suspense> },
        { path: 'account', element: <ProtectedRoute><Suspense fallback={<AdminLoading />}><AccountPage /></Suspense></ProtectedRoute> },
        { path: 'account/orders', element: <ProtectedRoute><Suspense fallback={<AdminLoading />}><OrdersPage /></Suspense></ProtectedRoute> },
        { path: 'account/orders/:id', element: <ProtectedRoute><Suspense fallback={<AdminLoading />}><OrderTrackingPage /></Suspense></ProtectedRoute> },
        { path: 'wishlist', element: <ProtectedRoute><Suspense fallback={<AdminLoading />}><WishlistPage /></Suspense></ProtectedRoute> },
        { path: 'support', element: <ProtectedRoute><Suspense fallback={<AdminLoading />}><SupportPage /></Suspense></ProtectedRoute> },
      ],
    },
    { path: '/login', element: <LoginPage /> },
    { path: '/register', element: <Suspense fallback={<AdminLoading />}><RegisterPage /></Suspense> },
    { path: '/forgot-password', element: <Suspense fallback={<AdminLoading />}><ForgotPasswordPage /></Suspense> },
    { path: '/reset-password', element: <Suspense fallback={<AdminLoading />}><ResetPasswordPage /></Suspense> },
    { path: '/banned', element: <Suspense fallback={<AdminLoading />}><BannedScreen /></Suspense> },
    {
      path: '/admin',
      element: <Suspense fallback={<AdminLoading />}><AdminLayout /></Suspense>,
      children: [
        { index: true, element: <AdminRoute><Suspense fallback={<AdminLoading />}><AdminDashboard /></Suspense></AdminRoute> },
        { path: 'products', element: <AdminRoute><Suspense fallback={<AdminLoading />}><AdminProducts /></Suspense></AdminRoute> },
        { path: 'categories', element: <AdminRoute><Suspense fallback={<AdminLoading />}><AdminCategories /></Suspense></AdminRoute> },
        { path: 'orders', element: <AdminRoute><Suspense fallback={<AdminLoading />}><AdminOrders /></Suspense></AdminRoute> },
        { path: 'inventory', element: <AdminRoute><Suspense fallback={<AdminLoading />}><AdminInventory /></Suspense></AdminRoute> },
        { path: 'customers', element: <AdminRoute><Suspense fallback={<AdminLoading />}><AdminCustomers /></Suspense></AdminRoute> },
        { path: 'users', element: <AdminRoute><Suspense fallback={<AdminLoading />}><AdminUsers /></Suspense></AdminRoute> },
        { path: 'coupons', element: <AdminRoute><Suspense fallback={<AdminLoading />}><AdminCoupons /></Suspense></AdminRoute> },
        { path: 'reviews', element: <AdminRoute><Suspense fallback={<AdminLoading />}><AdminReviews /></Suspense></AdminRoute> },
        { path: 'support', element: <AdminRoute><Suspense fallback={<AdminLoading />}><AdminSupport /></Suspense></AdminRoute> },
        { path: 'shipping', element: <AdminRoute><Suspense fallback={<AdminLoading />}><AdminShipping /></Suspense></AdminRoute> },
        { path: 'payments', element: <AdminRoute><Suspense fallback={<AdminLoading />}><AdminPayments /></Suspense></AdminRoute> },
        { path: 'notifications', element: <AdminRoute><Suspense fallback={<AdminLoading />}><AdminNotifications /></Suspense></AdminRoute> },
        { path: 'coloring', element: <AdminRoute><Suspense fallback={<AdminLoading />}><AdminColoring /></Suspense></AdminRoute> },
        { path: 'hero-banners', element: <AdminRoute><Suspense fallback={<AdminLoading />}><AdminHeroBanners /></Suspense></AdminRoute> },
        { path: 'about-builder', element: <AdminRoute><Suspense fallback={<AdminLoading />}><AdminAboutBuilder /></Suspense></AdminRoute> },
        { path: 'settings', element: <AdminRoute><Suspense fallback={<AdminLoading />}><AdminSettings /></Suspense></AdminRoute> },
      ],
    },
    { path: '*', element: <Suspense fallback={<AdminLoading />}><NotFoundPage /></Suspense> },
]);

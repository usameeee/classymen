import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppProvider } from './app/AppProvider'
import { AuthProvider } from './app/AuthProvider'
import { CartProvider } from './app/CartProvider'
import { ToastProvider } from './app/ToastProvider'
import { StorefrontLayout } from './pages/StorefrontLayout'
import { HomePage } from './pages/HomePage'
import './App.css'

// Lazy-loaded Storefront pages
const CatalogPage = lazy(() => import('./pages/CatalogPage').then((m) => ({ default: m.CatalogPage })))
const CategoryPage = lazy(() => import('./pages/CategoryPage').then((m) => ({ default: m.CategoryPage })))
const ProductPage = lazy(() => import('./pages/ProductPage').then((m) => ({ default: m.ProductPage })))
const CartPage = lazy(() => import('./pages/CartPage').then((m) => ({ default: m.CartPage })))
const CustomerLoginPage = lazy(() => import('./pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })))
const SignupPage = lazy(() => import('./pages/auth/SignupPage').then((m) => ({ default: m.SignupPage })))
const VerifyOtpPage = lazy(() => import('./pages/auth/VerifyOtpPage').then((m) => ({ default: m.VerifyOtpPage })))
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })))
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })))

// Lazy-loaded Admin pages
const AdminLoginPage = lazy(() => import('./pages/admin/LoginPage').then((m) => ({ default: m.LoginPage })))
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })))
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const OrdersPage = lazy(() => import('./pages/admin/OrdersPage').then((m) => ({ default: m.OrdersPage })))
const CouponsPage = lazy(() => import('./pages/admin/CouponsPage').then((m) => ({ default: m.CouponsPage })))
const CategoriesPage = lazy(() => import('./pages/admin/CategoriesPage').then((m) => ({ default: m.CategoriesPage })))
const CategoryFormPage = lazy(() => import('./pages/admin/CategoryFormPage').then((m) => ({ default: m.CategoryFormPage })))
const ProductsPage = lazy(() => import('./pages/admin/ProductsPage').then((m) => ({ default: m.ProductsPage })))
const ProductFormPage = lazy(() => import('./pages/admin/ProductFormPage').then((m) => ({ default: m.ProductFormPage })))
const RequireAuth = lazy(() => import('./pages/admin/RequireAuth').then((m) => ({ default: m.RequireAuth })))

function PageLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold border-t-transparent" />
    </div>
  )
}

function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <ToastProvider>
        <CartProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoading />}>
              <Routes>
                <Route element={<StorefrontLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="catalog" element={<CatalogPage />} />
                  <Route path="category/:slug" element={<CategoryPage />} />
                  <Route path="product/:slug" element={<ProductPage />} />
                  <Route path="cart" element={<CartPage />} />
                  <Route path="login" element={<CustomerLoginPage />} />
                  <Route path="signup" element={<SignupPage />} />
                  <Route path="verify-otp" element={<VerifyOtpPage />} />
                  <Route path="forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="reset-password" element={<ResetPasswordPage />} />
                </Route>

                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route
                  path="/admin"
                  element={
                    <RequireAuth>
                      <AdminLayout />
                    </RequireAuth>
                  }
                >
                  <Route index element={<DashboardPage />} />
                  <Route path="orders" element={<OrdersPage />} />
                  <Route path="coupons" element={<CouponsPage />} />
                  <Route path="categories" element={<CategoriesPage />} />
                  <Route path="categories/new" element={<CategoryFormPage />} />
                  <Route path="categories/:id/edit" element={<CategoryFormPage />} />
                  <Route path="products" element={<ProductsPage />} />
                  <Route path="products/new" element={<ProductFormPage />} />
                  <Route path="products/:id/edit" element={<ProductFormPage />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </AppProvider>
  )
}

export default App

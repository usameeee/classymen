import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppProvider } from './app/AppProvider'
import { AuthProvider } from './app/AuthProvider'
import { CartProvider } from './app/CartProvider'
import { StorefrontLayout } from './pages/StorefrontLayout'
import { HomePage } from './pages/HomePage'
import './App.css'

// Lazy-loaded Storefront pages
const CatalogPage = lazy(() => import('./pages/CatalogPage').then((m) => ({ default: m.CatalogPage })))
const CategoryPage = lazy(() => import('./pages/CategoryPage').then((m) => ({ default: m.CategoryPage })))
const ProductPage = lazy(() => import('./pages/ProductPage').then((m) => ({ default: m.ProductPage })))
const CartPage = lazy(() => import('./pages/CartPage').then((m) => ({ default: m.CartPage })))
const AuthPage = lazy(() => import('./pages/AuthPage').then((m) => ({ default: m.AuthPage })))

// Lazy-loaded Admin pages
const LoginPage = lazy(() => import('./pages/admin/LoginPage').then((m) => ({ default: m.LoginPage })))
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
                  <Route path="login" element={<AuthPage />} />
                  <Route path="signup" element={<AuthPage />} />
                </Route>

                <Route path="/admin/login" element={<LoginPage />} />
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
      </AuthProvider>
    </AppProvider>
  )
}

export default App

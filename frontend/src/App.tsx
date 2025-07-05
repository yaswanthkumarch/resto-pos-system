import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { SocketProvider } from './contexts/SocketContext';
import { SyncProvider } from './contexts/SyncContext';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoadingSpinner from './components/ui/LoadingSpinner';
import './index.css';

// Lazy load pages for better performance
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const POSPage = lazy(() => import('./pages/POSPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const CustomersPage = lazy(() => import('./pages/CustomersPage'));
const TablesPage = lazy(() => import('./pages/TablesPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" replace />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={
            <Suspense fallback={<LoadingSpinner />}>
              <DashboardPage />
            </Suspense>
          } />
          <Route path="pos" element={
            <Suspense fallback={<LoadingSpinner />}>
              <POSPage />
            </Suspense>
          } />
          <Route path="orders" element={
            <Suspense fallback={<LoadingSpinner />}>
              <OrdersPage />
            </Suspense>
          } />
          <Route path="products" element={
            <Suspense fallback={<LoadingSpinner />}>
              <ProductsPage />
            </Suspense>
          } />
          <Route path="customers" element={
            <Suspense fallback={<LoadingSpinner />}>
              <CustomersPage />
            </Suspense>
          } />
          <Route path="tables" element={
            <Suspense fallback={<LoadingSpinner />}>
              <TablesPage />
            </Suspense>
          } />
          <Route path="reports" element={
            <Suspense fallback={<LoadingSpinner />}>
              <ReportsPage />
            </Suspense>
          } />
          <Route path="settings" element={
            <Suspense fallback={<LoadingSpinner />}>
              <SettingsPage />
            </Suspense>
          } />
        </Route>
      </Routes>
      <Toaster position="top-right" />
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <SyncProvider>
            <CartProvider>
              <AppRoutes />
            </CartProvider>
          </SyncProvider>
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App; 
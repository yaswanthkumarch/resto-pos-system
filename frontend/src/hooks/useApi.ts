import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from 'react-query';
import apiService from '../services/apiService';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export function useApiQuery<T>(
  key: string | string[],
  url: string,
  params?: any,
  options?: Omit<UseQueryOptions<ApiResponse<T>>, 'queryKey' | 'queryFn'>
) {
  return useQuery(
    key,
    () => apiService.get<T>(url, params),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
      ...options,
    } as any
  );
}

export function useApiMutation<T, V>(
  url: string,
  options?: Omit<UseMutationOptions<ApiResponse<T>, Error, V>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation(
    (data: V) => apiService.post<T>(url, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries();
      },
      ...options,
    }
  );
}

export function useApiUpdate<T, V>(
  url: string,
  options?: Omit<UseMutationOptions<ApiResponse<T>, Error, V>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation(
    (data: V) => apiService.put<T>(url, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries();
      },
      ...options,
    }
  );
}

export function useApiPatch<T, V>(
  url: string,
  options?: Omit<UseMutationOptions<ApiResponse<T>, Error, V>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation(
    (data: V) => apiService.patch<T>(url, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries();
      },
      ...options,
    }
  );
}

export function useApiDelete<T>(
  url: string,
  options?: Omit<UseMutationOptions<ApiResponse<T>, Error, void>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation(
    () => apiService.delete<T>(url),
    {
      onSuccess: () => {
        queryClient.invalidateQueries();
      },
      ...options,
    }
  );
}

// Specific hooks for common entities
export function useOrders(params?: any) {
  return useApiQuery(['orders', params], '/orders', params);
}

export function useOrder(id: string) {
  return useApiQuery(['order', id], `/orders/${id}`);
}

export function useProducts(params?: any) {
  return useApiQuery(['products', params], '/products', params);
}

export function useCategories() {
  return useApiQuery(['categories'], '/categories');
}

export function useCustomers(params?: any) {
  return useApiQuery(['customers', params], '/customers', params);
}

export function useTables() {
  return useApiQuery(['tables'], '/tables');
}

export function useCreateOrder() {
  return useApiMutation('/orders');
}

export function useUpdateOrder() {
  return useApiUpdate('/orders');
}

export function useDeleteOrder() {
  return useApiDelete('/orders');
}

export function useUpdateOrderStatus() {
  return useApiPatch('/orders');
}

export function useUpdateTableStatus() {
  return useApiPatch('/tables');
} 
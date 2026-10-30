import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

import { newIdempotencyKey, type FeeItem, type FinanceSummary, type Invoice, type Payment } from './fees';

type PaymentInput = components['schemas']['PaymentInput'];

function fail(error: { detail?: string } | undefined, fallback: string): never {
  throw new Error(error?.detail ?? fallback);
}

/** Invoices the person can see: their own or their children's, or their schools' for finance staff. */
export function useInvoices() {
  return useQuery({
    queryKey: ['finance', 'invoices'],
    queryFn: async (): Promise<Invoice[]> => {
      const { data, error } = await api.GET('/api/v1/finance/invoices/');
      if (error || !data) fail(error, 'Could not load invoices.');
      return data.results;
    },
  });
}

export function useSummary(school: number | null) {
  return useQuery({
    queryKey: ['finance', 'summary', school],
    enabled: school != null,
    queryFn: async (): Promise<FinanceSummary> => {
      const { data, error } = await api.GET('/api/v1/finance/summary/', { params: { query: { school: school as number } } });
      if (error || !data) fail(error, 'Could not load the fees summary.');
      return data;
    },
  });
}

export function useFeeItems(school: number | null) {
  return useQuery({
    queryKey: ['finance', 'fee-items', school],
    enabled: school != null,
    queryFn: async (): Promise<FeeItem[]> => {
      const { data, error } = await api.GET('/api/v1/finance/fee-items/', { params: { query: { school: school as number } } });
      if (error || !data) fail(error, 'Could not load fee items.');
      return data.results;
    },
  });
}

/** Watches one payment until the provider confirms or fails it. */
export function usePayment(id: number | null) {
  return useQuery({
    queryKey: ['finance', 'payment', id],
    enabled: id != null,
    refetchInterval: (query) => (query.state.data?.status === 'pending' ? 3000 : false),
    queryFn: async (): Promise<Payment> => {
      const { data, error } = await api.GET('/api/v1/finance/payments/{id}/', { params: { path: { id: id as number } } });
      if (error || !data) fail(error, 'Could not load the payment.');
      return data;
    },
  });
}

function useFinanceMutation<TArgs, TResult>(run: (args: TArgs) => Promise<TResult>) {
  const client = useQueryClient();
  return useMutation({ mutationFn: run, onSuccess: () => client.invalidateQueries({ queryKey: ['finance'] }) });
}

export function useAddFeeItem() {
  return useFinanceMutation(async (body: components['schemas']['FeeItemInput']) => {
    const { data, error } = await api.POST('/api/v1/finance/fee-items/', { body });
    if (error || !data) fail(error, 'Could not add the fee.');
    return data;
  });
}

export function useGenerateInvoices() {
  return useFinanceMutation(async (body: { class: number; fee_items: number[]; due_date?: string }) => {
    const { data, error } = await api.POST('/api/v1/finance/invoices/generate/', { body });
    if (error || !data) fail(error, 'Could not create the invoices.');
    return data;
  });
}

/** Mobile money or card from a parent or student. One idempotency key per tap. */
export function useCheckout() {
  return useFinanceMutation(async (body: PaymentInput) => {
    const { data, error } = await api.POST('/api/v1/finance/payments/checkout/', {
      params: { header: { 'Idempotency-Key': newIdempotencyKey() } },
      body,
    });
    if (error || !data) fail(error, 'Could not start the payment.');
    return data;
  });
}

/** Cash or bank recorded by finance staff. */
export function useRecordPayment() {
  return useFinanceMutation(async (body: PaymentInput) => {
    const { data, error } = await api.POST('/api/v1/finance/payments/', {
      params: { header: { 'Idempotency-Key': newIdempotencyKey() } },
      body,
    });
    if (error || !data) fail(error, 'Could not record the payment.');
    return data;
  });
}

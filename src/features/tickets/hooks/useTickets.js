import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { ticketsApi } from '@/api/tickets.api';
import { queryKeys } from '@/lib/queryKeys';
import { saveBlob } from '@/lib/downloadFile';

const fetchList = (scope, params) => (scope === 'all' ? ticketsApi.listAll(params) : ticketsApi.listMine(params));

// Ticket list ('mine' or 'all'), paginated.
// - keeps showing the previous page while the next one loads (no flicker)
// - preloads the next page in the background, so "Next" is instant
export function useTicketList(scope, params) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: queryKeys.tickets.list(scope, params),
    queryFn: () => fetchList(scope, params),
    placeholderData: keepPreviousData,
  });

  const hasNextPage = query.data?.pagination?.hasNextPage;
  const currentPage = query.data?.pagination?.page;
  useEffect(() => {
    if (!hasNextPage || !currentPage) return;
    const nextParams = { ...params, page: String(currentPage + 1) };
    queryClient.prefetchQuery({
      queryKey: queryKeys.tickets.list(scope, nextParams),
      queryFn: () => fetchList(scope, nextParams),
    });
  }, [hasNextPage, currentPage, params, scope, queryClient]);

  return query;
}

// One ticket. Refreshes every 30 s while the tab is visible (new replies appear by themselves).
export function useTicket(id) {
  return useQuery({
    queryKey: queryKeys.tickets.detail(id),
    queryFn: () => ticketsApi.get(id),
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, files }) => ticketsApi.create(data, files),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.tickets.lists() }),
  });
}

// After any change to a ticket: refresh this ticket and every list
function useInvalidateTicket(id) {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.detail(id) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.lists() }),
    ]);
}

export function useReplyToTicket(id) {
  const invalidate = useInvalidateTicket(id);
  return useMutation({
    mutationFn: ({ message, files }) => ticketsApi.reply(id, message, files),
    onSuccess: invalidate,
  });
}

export function useUpdatePriority(id) {
  const invalidate = useInvalidateTicket(id);
  return useMutation({
    mutationFn: (priority) => ticketsApi.updatePriority(id, priority),
    onSuccess: invalidate,
  });
}

// ---- Admin actions (the backend refuses them for normal users) ----

export function useUpdateStatus(id) {
  const invalidate = useInvalidateTicket(id);
  return useMutation({
    mutationFn: (status) => ticketsApi.updateStatus(id, status),
    onSuccess: invalidate,
  });
}

// Assign the ticket to the logged-in admin (also takes it over from another admin)
export function useAssignToMe(id) {
  const invalidate = useInvalidateTicket(id);
  return useMutation({
    mutationFn: () => ticketsApi.assignToMe(id),
    onSuccess: invalidate,
  });
}

// Soft delete. Only the lists are refreshed here: the caller leaves the ticket page
// first, then forgets the ticket (see forgetTicket), so the page never re-asks for it.
export function useDeleteTicket(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ deleteFiles }) => ticketsApi.remove(id, { deleteFiles }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.tickets.lists() }),
  });
}

export function useForgetTicket() {
  const queryClient = useQueryClient();
  return (id) => queryClient.removeQueries({ queryKey: queryKeys.tickets.detail(id) });
}

// Download an attachment through the API (sends the token), then save it
export function useDownloadAttachment(ticketId) {
  return useMutation({
    mutationFn: async ({ type, attachment }) => {
      const blob = await ticketsApi.downloadAttachment(ticketId, type, attachment._id);
      saveBlob(blob, attachment.originalName);
    },
  });
}

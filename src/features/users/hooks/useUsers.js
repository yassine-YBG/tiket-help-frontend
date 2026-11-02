import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/api/users.api';
import { queryKeys } from '@/lib/queryKeys';

export function useUserList(params) {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => usersApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function usePendingUsers() {
  return useQuery({ queryKey: queryKeys.users.pending(), queryFn: usersApi.pending });
}

// Any change to an account: refresh every user list (and the tickets, since a removed
// admin's open tickets go back to the team)
function useUserMutation(mutationFn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (result) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
        result?.ticketsReleased ? queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all }) : null,
      ]),
  });
}

export const useSetActivated = () => useUserMutation(({ id, activated }) => usersApi.setActivated(id, activated));
export const useSetRole = () => useUserMutation(({ id, role }) => usersApi.setRole(id, role));
export const useDeleteUser = () => useUserMutation(({ id }) => usersApi.remove(id));
export const useRestoreUser = () => useUserMutation(({ id }) => usersApi.restore(id));

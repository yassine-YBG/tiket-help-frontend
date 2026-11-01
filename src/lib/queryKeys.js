// One place for every TanStack Query cache key.
// Invalidate a whole group after a change, e.g.
//   queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all })
export const queryKeys = {
  tickets: {
    all: ['tickets'],
    lists: () => ['tickets', 'list'],
    list: (scope, params) => ['tickets', 'list', scope, params], // scope: 'mine' | 'all'
    detail: (id) => ['tickets', 'detail', id],
    summary: () => ['tickets', 'summary'], // menu counters
  },
  users: {
    all: ['users'],
    list: (params) => ['users', 'list', params],
    pending: () => ['users', 'pending'],
  },
  stats: (params) => ['stats', params],
  activityLogs: (params) => ['activity-logs', params],
};

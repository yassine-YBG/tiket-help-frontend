import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { activityLogsApi } from '@/api/activityLogs.api';
import { queryKeys } from '@/lib/queryKeys';

export function useActivityLogs(params) {
  return useQuery({
    queryKey: queryKeys.activityLogs(params),
    queryFn: () => activityLogsApi.list(params),
    placeholderData: keepPreviousData,
  });
}

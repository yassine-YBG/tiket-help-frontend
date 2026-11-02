import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { statsApi } from '@/api/stats.api';
import { queryKeys } from '@/lib/queryKeys';

export function useStats(params) {
  return useQuery({
    queryKey: queryKeys.stats(params),
    queryFn: () => statsApi.get(params),
    placeholderData: keepPreviousData,
  });
}

import { useQuery } from "@tanstack/react-query";

import { getJob } from "@/shared/api/jobs";

export function useJobDetailsQuery(jobId: string | null) {
  return useQuery({
    queryKey: ["job", jobId],
    queryFn: () => getJob(jobId as string),
    enabled: Boolean(jobId),
    refetchInterval: 3000,
  });
}
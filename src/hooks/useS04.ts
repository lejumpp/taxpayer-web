import { useQuery } from '@tanstack/react-query'
import { getS04 } from '@/services/s04'

export function useS04(year: number) {
  return useQuery({
    queryKey: ['s04', year],
    queryFn: () => getS04(year),
    staleTime: 1000 * 60 * 5,
    retry: false,
  })
}

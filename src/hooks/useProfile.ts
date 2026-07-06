import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProfile, patchProfile } from '../services/profile'

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof patchProfile>[0]) => patchProfile(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] }),
  })
}

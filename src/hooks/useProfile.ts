import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProfile, updateProfile } from '../services/profile'
import type { UpdateProfilePayload } from '../types/profile'

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateProfile(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] }),
  })
}

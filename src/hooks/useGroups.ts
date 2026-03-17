import useSWR, { mutate } from 'swr'
import { getGroups } from '../lib/api/groups'
import type { Group } from '../lib/api/groups'
import { useAuth } from './useAuth'

export function useGroups() {
  const { user } = useAuth()

  const { data, isLoading } = useSWR<Group[]>(
    user ? 'groups' : null,
    () => getGroups(),
  )

  return {
    groups: data || [],
    loading: isLoading,
  }
}

export function mutateGroups() {
  return mutate('groups')
}

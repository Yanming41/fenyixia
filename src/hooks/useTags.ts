import useSWR, { mutate } from 'swr'
import { getTags } from '../lib/api/tags'
import type { Tag } from '../lib/api/tags'
import { useAuth } from './useAuth'

export function useTags() {
  const { user } = useAuth()

  const { data, isLoading } = useSWR<Tag[]>(
    user ? 'tags' : null,
    () => getTags(),
  )

  return {
    tags: data || [],
    loading: isLoading,
  }
}

export function mutateTags() {
  return mutate('tags')
}

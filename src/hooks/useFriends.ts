import useSWR, { mutate } from 'swr'
import { getFriends, getReceivedRequests, getSentRequests } from '../lib/api/friends'
import type { FriendWithAlias, FriendRequest } from '../lib/api/friends'
import { useAuth } from './useAuth'

export function useFriends() {
  const { user } = useAuth()

  const { data: friends, isLoading: friendsLoading } = useSWR<FriendWithAlias[]>(
    user ? 'friends' : null,
    () => getFriends(),
  )

  return {
    friends: friends || [],
    loading: friendsLoading,
  }
}

export function useReceivedRequests() {
  const { user } = useAuth()

  const { data, isLoading } = useSWR<FriendRequest[]>(
    user ? 'received-requests' : null,
    () => getReceivedRequests(),
  )

  return {
    received: data || [],
    loading: isLoading,
  }
}

export function useSentRequests() {
  const { user } = useAuth()

  const { data, isLoading } = useSWR<FriendRequest[]>(
    user ? 'sent-requests' : null,
    () => getSentRequests(),
  )

  return {
    sent: data || [],
    loading: isLoading,
  }
}

export function mutateFriends() {
  return mutate('friends')
}

export function mutateReceivedRequests() {
  return mutate('received-requests')
}

export function mutateSentRequests() {
  return mutate('sent-requests')
}

export function mutateAllFriendData() {
  return Promise.all([mutateFriends(), mutateReceivedRequests(), mutateSentRequests()])
}

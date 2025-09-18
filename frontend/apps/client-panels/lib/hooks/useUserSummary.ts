import useSWR from 'swr'

interface UserSummary {
  balance: number
  exposure: number
  creditLimit: number
  availableBalance: number
}

const fetcher = async (url: string): Promise<UserSummary> => {
  const response = await fetch(url, {
    credentials: 'include',
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch user summary')
  }
  
  const data = await response.json()
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch user summary')
  }
  
  return data.data
}

export function useUserSummary() {
  const { data, error, isLoading, mutate } = useSWR<UserSummary>(
    '/api/user/summary',
    fetcher,
    {
      refreshInterval: parseInt(process.env.NEXT_PUBLIC_REFRESH_INTERVAL || '10000'), // Refresh interval
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // Dedupe requests within 5 seconds
    }
  )

  return {
    balance: data?.balance || 0,
    exposure: data?.exposure || 0,
    creditLimit: data?.creditLimit || 0,
    availableBalance: data?.availableBalance || 0,
    isLoading,
    error,
    mutate
  }
}

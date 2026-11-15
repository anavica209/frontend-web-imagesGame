import { useQuery } from '@tanstack/react-query'
import createClient from 'openapi-fetch'
import type { paths } from '../types/api'

const apiClient = createClient<paths>()

export const useExampleData = () =>
  useQuery({
    queryKey: ['example-data'],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/api/example/')

      if (error) {
        throw new Error('Failed to load example data')
      }

      return data
    },
  })

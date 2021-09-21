import { ClaimableDraw, initializeClaimableDraws } from '.yalc/@pooltogether/v4-js-client/dist'
import { NO_REFETCH } from 'lib/constants/queryKeys'
import { useContractListChainIds } from 'lib/hooks/useContractListChainIds'
import { useProvidersKeyedByNumbers } from 'lib/hooks/useProvidersKeyedbyNumbers'
import { useQuery, UseQueryOptions } from 'react-query'
import { useContractList } from '../useContractList'

export const useClaimableDraws = () => {
  const linkedPrizePoolContractList = useContractList()
  const chainIds = useContractListChainIds(linkedPrizePoolContractList.contracts)
  const readProviders = useProvidersKeyedByNumbers(chainIds)
  const enabled = Boolean(readProviders)
  return useQuery(
    ['useClaimableDraws', chainIds],
    async () => initializeClaimableDraws(readProviders, linkedPrizePoolContractList),
    { ...NO_REFETCH, enabled } as UseQueryOptions<ClaimableDraw[]>
  )
}
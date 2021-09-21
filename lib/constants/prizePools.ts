import { APP_ENVIRONMENT } from '.yalc/@pooltogether/hooks/dist'
import { NETWORK } from '@pooltogether/utilities'

export const PRIZE_POOLS = Object.freeze({
  [APP_ENVIRONMENT.mainnets]: {
    [NETWORK.mainnet]: '',
    [NETWORK.polygon]: ''
  },
  [APP_ENVIRONMENT.testnets]: {
    [NETWORK.rinkeby]: '0x23FbBf9803e773B569E7448A7dBc1CDA330a7b0C',
    [NETWORK.mumbai]: '0x3e4ED61e49148AB1AC46962d8D0553175a8Da217'
  }
})
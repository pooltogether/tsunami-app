import { TransparentDiv } from '@components/TransparentDiv'
import { useUsersTotalBalances } from '@hooks/useUsersTotalBalances'
import { useUsersPrizePoolNetworkOdds } from '@hooks/v4/PrizePoolNetwork/useUsersPrizePoolNetworkOdds'
import { useAllUsersPrizePoolTwabs } from '@hooks/v4/PrizePool/useUsersPrizePoolTwab'
import { ThemedClipSpinner, CountUp, Tooltip } from '@pooltogether/react-components'
import { shorten, formatCurrencyNumberForDisplay } from '@pooltogether/utilities'
import { unionProbabilities } from '@utils/unionProbabilities'
import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import { useTranslation } from 'next-i18next'
import React, { useMemo } from 'react'
import { AccountCardImage } from './AccountCardImage'
import { TotalWinningsCard } from './TotalWinnings'

export const AccountCard: React.FC<{
  usersAddress: string
  className?: string
  showAddress?: boolean
  showActive?: boolean
}> = (props) => {
  const { showAddress, showActive, usersAddress, className } = props
  return (
    <div className={classNames('flex flex-col rounded-lg space-y-2', className)}>
      <TransparentDiv className='flex justify-between p-4 rounded-lg'>
        <TotalBalance
          showAddress={showAddress}
          usersAddress={usersAddress}
          showActive={showActive}
        />
        <AccountCardImage usersAddress={usersAddress} />
      </TransparentDiv>
      <div className='flex sm:hidden space-x-2'>
        <DailyOdds usersAddress={usersAddress} />
        <WeeklyOdds usersAddress={usersAddress} />
      </div>
      <TotalWinningsCard usersAddress={usersAddress} className='block sm:hidden' />
    </div>
  )
}

const TotalBalance: React.FC<{
  usersAddress: string
  showAddress?: boolean
  showActive?: boolean
  className?: string
}> = (props) => {
  const { showAddress, showActive, usersAddress, className } = props
  const { t } = useTranslation()
  const {
    data: balancesData,
    isStillFetching,
    isFullyFetched
  } = useUsersTotalBalances(usersAddress)

  // Querying user's total TWAB (active balance)
  const allUsersPrizePoolTwabsQueryResults = showActive && useAllUsersPrizePoolTwabs(usersAddress)
  const activeBalance = useMemo(() => {
    const isPrizePoolTwabsFetched = allUsersPrizePoolTwabsQueryResults.every(
      ({ isFetched }) => isFetched
    )
    if (!isPrizePoolTwabsFetched) {
      return null
    }
    return allUsersPrizePoolTwabsQueryResults.reduce((acc, qr) => {
      acc['amount'] = qr.data.twab.amount
      acc['amountPretty'] = qr.data.twab.amountPretty
      return acc
    }, {} as { amount: string; amountPretty: string })
  }, [allUsersPrizePoolTwabsQueryResults])

  return (
    <a href='#deposits' className={className}>
      {showAddress && (
        <span className='font-semibold text-xs mr-1'>{shorten({ hash: usersAddress }) + `'s`}</span>
      )}

      <span className='font-semibold text-xs'>{t('totalBalance', 'Total balance')}</span>
      <span className='leading-none flex text-2xl xs:text-4xl font-bold relative'>
        <TotalBalanceAmount usersAddress={usersAddress} />
        {isStillFetching ? (
          <ThemedClipSpinner sizeClassName='w-4 h-4' className='ml-2 my-auto' />
        ) : (
          <FeatherIcon icon='chevron-right' className='w-6 h-6 opacity-50 my-auto ml-1' />
        )}
      </span>

      {showActive &&
        activeBalance &&
        isFullyFetched &&
        Number(activeBalance.amount) !== balancesData.totalV4Balance && (
          <ActiveBalance value={activeBalance.amount} />
        )}
    </a>
  )
}

export const TotalBalanceAmount: React.FC<{ usersAddress: string }> = (props) => {
  const { usersAddress } = props
  const { data: balancesData, isFullyFetched } = useUsersTotalBalances(usersAddress)

  // If not fetched
  // If no token price or balance
  if (
    !isFullyFetched ||
    !balancesData?.totalBalanceUsd.amountUnformatted.isZero() ||
    (balancesData?.totalBalanceUsd.amountUnformatted.isZero() && !balancesData?.totalV4Balance)
  ) {
    return (
      <>
        $<CountUp countTo={Number(balancesData?.totalBalanceUsd.amount)} />
      </>
    )
  }

  return <CountUp countTo={Number(balancesData?.totalV4Balance)} />
}

export const ActiveBalance: React.FC<{ value: string }> = (props) => {
  const { value } = props
  const { t } = useTranslation()
  return (
    <span className='flex items-center gap-1 font-semibold text-xs'>
      <span className='opacity-80'>{t('active')}:</span>
      <span className='opacity-80'>
        {formatCurrencyNumberForDisplay(value, 'usd', { hideZeroes: true })}
      </span>
      <Tooltip
        id={`activeBalanceTooltip`}
        iconClassName='opacity-80'
        tip={t('activeBalanceTooltip')}
      />
    </span>
  )
}

const DailyOdds: React.FC<{ usersAddress: string }> = (props) => (
  <OddsBox usersAddress={props.usersAddress} i18nKey='dailyOdds' daysOfPrizes={1} />
)
const WeeklyOdds: React.FC<{ usersAddress: string }> = (props) => (
  <OddsBox usersAddress={props.usersAddress} i18nKey='weeklyOdds' daysOfPrizes={7} />
)

const OddsBox = (props: { usersAddress: string; i18nKey: string; daysOfPrizes: number }) => {
  const { usersAddress, i18nKey, daysOfPrizes } = props
  const { data, isFetched, isFetching, isError } = useUsersPrizePoolNetworkOdds(usersAddress)
  const { t } = useTranslation()

  const oneOverOddstring = useMemo(() => {
    if (!isFetched) return null
    const totalOdds = unionProbabilities(...Array(daysOfPrizes).fill(data.odds))
    const oneOverOdds = 1 / totalOdds
    return Number(oneOverOdds.toFixed(2)) < 1.01 ? 1 : oneOverOdds.toFixed(2)
  }, [isFetched, isFetching])

  if (!isFetched || data?.odds === undefined) {
    return (
      <div className='bg-white dark:bg-actually-black dark:bg-opacity-10 rounded-lg w-full p-4 flex flex-col leading-none text-center'>
        <ThemedClipSpinner sizeClassName='w-5 h-5' className='mx-auto' />
      </div>
    )
  }

  if (!data || isError) return <p>Error</p>

  if (data.odds === 0) {
    return (
      <div className='bg-white dark:bg-actually-black dark:bg-opacity-10 rounded-lg w-full p-4 flex flex-col leading-none text-center'>
        <span className='font-bold flex text-lg mx-auto'>
          {daysOfPrizes === 1 ? '0 😔' : '0 😭'}
        </span>
        <span className='mt-1 opacity-80 font-bold'>{t(i18nKey)}*</span>
      </div>
    )
  }

  return (
    <div className='bg-white dark:bg-actually-black dark:bg-opacity-10 rounded-lg w-full p-4 flex flex-col leading-none text-center'>
      <span className='font-bold flex text-lg mx-auto'>1 in {oneOverOddstring}</span>
      <span className='mt-1 opacity-80 text-xxxs xs:text-xs font-bold uppercase'>
        {t(i18nKey)}*
      </span>
    </div>
  )
}

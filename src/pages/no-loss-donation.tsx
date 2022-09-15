import Layout from '@components/Layout'
import { DonateUI } from '@views/DonateUI'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import nextI18NextConfig from '../../next-i18next.config.js'

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'], nextI18NextConfig))
    }
  }
}

export default function Donate(props) {
  return (
    <Layout>
      <DonateUI />
    </Layout>
  )
}

import type { NextPage } from 'next'
import Head from 'next/head'

import { LeverGamePreview } from '../../components/LeverGame'
import styles from '../../styles/Home.module.css'

const MidgamePreview: NextPage = () => {
  return (
    <div className="page">
      <div className={styles.container}>
        <Head>
          <title>bbb party - midgame preview</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className={styles.main}>
          <LeverGamePreview preview="midgame" />
        </main>
      </div>
    </div>
  )
}

export default MidgamePreview

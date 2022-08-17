import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import LeverGame from './LeverGame'
// import Room from './Room'

const Home: NextPage = () => {
  return (
    <div className='page'>
      <div className={styles.container}>
        <Head>
          <title>bbb party</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel='icon' href='/favicon.ico' />
        </Head>

        <main className={styles.main}>
          <span className='counter'>
            <h1 className={styles.title}>
              welcome to bbb party🥳!
            </h1>
          </span>
          <LeverGame />
          {/* <Room /> */}
        </main>
      </div>
    </div>
  )
}

export default Home

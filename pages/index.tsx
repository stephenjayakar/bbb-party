import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import LeverGame from './LeverGame'
import Room from './Room'
import { useQuery, useMutation } from '../convex/_generated/react'
import { useCallback } from 'react'

const Home: NextPage = () => {
  const counter = useQuery('getCounter', 'clicks') ?? 0
  const increment = useMutation('incrementCounter')
  const incrementByOne = useCallback(() => increment('clicks', 1), [increment])

  return (
    <div className={styles.container}>
      <Head>
        <title>Next.js with Convex</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a href="https://nextjs.org">Next.js</a> with{' '}
          <a href="https://convex.dev">Convex</a>
        </h1>

        <p className={styles.description}>
          {"Here's the counter:"} {counter}
        </p>
        <button className={styles.button} onClick={incrementByOne}>
          Add One!
        </button>
        <LeverGame />
        <Room />
      </main>

      <footer className={styles.footer}>
        <a
          href="https://www.convex.dev/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/convex.svg" alt="Convex Logo" width={90} height={18} />
          </span>
        </a>
      </footer>
    </div>
  )
}

export default Home

import type { ReactNode } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { ConvexProvider, ConvexReactClient } from 'convex/react'

import LeverGame, { LeverGamePreview } from '../components/LeverGame'
import Room from './Room'
import styles from '../styles/Home.module.css'

const convexUrl = import.meta.env.VITE_CONVEX_URL
const convexClient = convexUrl ? new ConvexReactClient(convexUrl) : null

function Shell (props: { children: ReactNode }) {
  return (
    <div className="page">
      <div className={styles.container}>
        <main className={styles.main}>{props.children}</main>
      </div>
    </div>
  )
}

function HomePage () {
  return (
    <Shell>
      <span className="counter">
        <h1 className={styles.title}>welcome to bbb party🥳!</h1>
      </span>
      {convexClient ? (
        <ConvexProvider client={convexClient}>
          <LeverGame />
        </ConvexProvider>
      ) : (
        <div className="setupNotice">
          <p>
            Set <code>VITE_CONVEX_URL</code> in <code>.env.local</code> after
            running <code>npx convex dev</code> to use the live game.
          </p>
          <LeverGamePreview preview="midgame" />
        </div>
      )}
    </Shell>
  )
}

function MidgamePage () {
  return (
    <Shell>
      <LeverGamePreview preview="midgame" />
    </Shell>
  )
}

function RoomPage () {
  if (!convexClient) {
    return (
      <Shell>
        <div className="setupNotice">
          <p>
            Set <code>VITE_CONVEX_URL</code> in <code>.env.local</code> to use
            the room lobby.
          </p>
        </div>
      </Shell>
    )
  }

  return (
    <Shell>
      <nav className="routeNav">
        <Link to="/">Game</Link>
        <Link to="/mock/midgame">Preview</Link>
      </nav>
      <ConvexProvider client={convexClient}>
        <Room />
      </ConvexProvider>
    </Shell>
  )
}

export default function App () {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/mock/midgame" element={<MidgamePage />} />
      <Route path="/room" element={<RoomPage />} />
    </Routes>
  )
}

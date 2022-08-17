import '../styles/globals.css'
import type { AppProps } from 'next/app'

import { ConvexProvider, ConvexReactClient } from 'convex/react'
import convexConfig from '../convex.json'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles.css'
const convex = new ConvexReactClient(convexConfig.origin)

function MyApp ({ Component, pageProps }: AppProps) {
  return (
    <ConvexProvider client={convex}>
      <Component {...pageProps} />;
    </ConvexProvider>
  )
}

export default MyApp

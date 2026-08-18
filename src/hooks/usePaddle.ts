import { useEffect } from 'react'

export interface PaddleCheckoutEvent {
  name: string
  data?: unknown
}

export interface PaddleCheckoutOpenOptions {
  settings: {
    displayMode: 'inline' | 'overlay'
    frameTarget?: string
    frameStyle?: string
    successUrl?: string
  }
  transactionId?: string
  items?: Array<{ priceId: string; quantity: number }>
  customData?: Record<string, unknown>
  eventCallback?: (event: PaddleCheckoutEvent) => void
}

export interface PaddleInstance {
  Environment: { set: (env: string) => void }
  Initialize: (options: { token: string }) => void
  Checkout: { open: (options: PaddleCheckoutOpenOptions) => void }
}

declare global {
  interface Window {
    Paddle: PaddleInstance
  }
}

export function usePaddle() {
  useEffect(() => {
    const token = import.meta.env.VITE_PADDLE_CLIENT_TOKEN
    if (!window.Paddle || !token) return

    window.Paddle.Environment.set(import.meta.env.VITE_PADDLE_ENV ?? 'sandbox')
    window.Paddle.Initialize({ token })
  }, [])
}

import type { Instrumentation } from 'next'

export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { default: handler } = await import('./on-request-error.node')
    await handler(err, request, context)
  } else {
    const { default: handler } = await import('./on-request-error.edge')
    await handler(err)
  }
}

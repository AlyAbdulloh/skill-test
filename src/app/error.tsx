'use client'

import Link from 'next/link'

export default function ErrorPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-300">Error</h1>
        <p className="text-slate-500 mt-4">Something went wrong</p>
        <Link href="/dashboard" className="mt-6 inline-block text-cyan-600 hover:underline">
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}

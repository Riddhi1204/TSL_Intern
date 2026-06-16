/**
 * App.jsx — Root component
 *
 * Fix #17: onError now accepts null to clear the error state, so that
 * submitting a new request always starts from a clean slate.
 */

import React, { useState } from 'react'
import EmailForm from './components/EmailForm.jsx'
import ResultsPanel from './components/ResultsPanel.jsx'

// ---------------------------------------------------------------------------
// Header component
// ---------------------------------------------------------------------------
function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-700/40 bg-slate-900/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-none tracking-tight">EmailIQ</p>
            <p className="text-slate-400 text-xs leading-none mt-0.5">AI Email Content Checker</p>
          </div>
        </div>

        {/* Status badge */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-800/60 border border-slate-700/40 rounded-full px-3.5 py-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse" />
          <span className="text-slate-400 text-xs">GPT-4o-mini</span>
        </div>
      </div>
    </header>
  )
}

// ---------------------------------------------------------------------------
// Hero section
// ---------------------------------------------------------------------------
function Hero() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-10 text-center">
      {/* Phase badge */}
      <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 text-indigo-400 text-xs font-semibold mb-6 tracking-wide uppercase">
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        Phase 1 · Grammar & Subject Analysis
      </div>

      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-5 leading-tight tracking-tight">
        Write emails that{' '}
        <span className="gradient-text">actually land</span>
      </h1>

      <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
        Paste your draft below. Our AI will fix every grammar mistake and craft
        three high-impact subject lines — in seconds.
      </p>

      {/* Feature pills */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
        {[
          { icon: '✦', label: 'Grammar Correction' },
          { icon: '◈', label: 'Issue Detection' },
          { icon: '⚡', label: 'Subject Optimization' },
        ].map(({ icon, label }) => (
          <span
            key={label}
            className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/40 text-slate-300 text-xs font-medium px-3.5 py-1.5 rounded-full"
          >
            <span className="text-indigo-400">{icon}</span>
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// App root
// ---------------------------------------------------------------------------
function App() {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fix #17: Accept null to explicitly clear the error state
  const handleError = (message) => {
    setError(message)
    if (message !== null) setResults(null)
  }

  const handleResults = (data) => {
    setResults(data)
    setError(null)
  }

  const handleReset = () => {
    setResults(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-[#0c1120]">
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none overflow-hidden"
      >
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute -top-20 right-0 w-80 h-80 bg-purple-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-indigo-900/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <Header />
        <Hero />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
          <EmailForm
            onResults={handleResults}
            onError={handleError}
            loading={loading}
            setLoading={setLoading}
            onReset={handleReset}
            hasResults={!!results}
          />

          {/* Error banner */}
          {error && (
            <div className="mt-5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 animate-slide-up">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-rose-400 font-semibold text-sm">Analysis Failed</p>
                <p className="text-rose-300/70 text-sm mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Results section */}
          {results && (
            <div className="mt-8">
              <ResultsPanel results={results} />
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800/60 py-8 text-center">
          <p className="text-slate-600 text-sm">
            EmailIQ · AI Email Content Checker · Phase 1 · Powered by GPT-4o-mini
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App

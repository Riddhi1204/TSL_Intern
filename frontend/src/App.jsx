import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import EmailForm from './components/EmailForm.jsx'
import ResultsPanel from './components/ResultsPanel.jsx'

// ---------------------------------------------------------------------------
// Header component
// ---------------------------------------------------------------------------
function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-30 h-[72px] premium-navbar shadow-sm">
      <div className="max-w-[1200px] h-full mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-indigo-400 flex items-center justify-center shadow-md shadow-violet-200">
            <svg className="w-5.5 h-5.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-800 font-bold text-lg leading-none tracking-tight">EmailIQ</span>
            <span className="text-slate-400 text-[10px] uppercase font-semibold tracking-wider mt-0.5">AI Content Checker</span>
          </div>
        </div>

        {/* User Profile Avatar with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 transition-all duration-200 focus:outline-none border border-transparent hover:border-slate-200"
            aria-label="User menu"
          >
            <div className="w-8 h-8 rounded-full bg-violet-100 border border-violet-200 flex items-center justify-center text-violet-600 font-bold text-sm select-none">
              RK
            </div>
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-40"
              >
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs text-slate-400">Signed in as</p>
                  <p className="text-sm font-semibold text-slate-700 truncate">riddhi@intern.tsl</p>
                </div>
                <button className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                  Profile
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                  Settings
                </button>
                <div className="border-t border-slate-100 my-1"></div>
                <button className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50/50 transition-colors">
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
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
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-10 pb-8 text-center animate-fade-in">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-800 mb-3 tracking-tight">
        Write better emails with <span className="gradient-text">AI</span>
      </h1>

      <p className="text-slate-500 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
        Improve grammar, polish tone, and generate better subject lines in seconds.
      </p>

      {/* Feature pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
        {[
          { icon: '✦', label: 'Grammar Correction', bg: 'bg-violet-50 text-violet-600 border-violet-100' },
          { icon: '⚡', label: 'Tone Improvement', bg: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
          { icon: '◈', label: 'Subject Suggestions', bg: 'bg-blue-50 text-blue-600 border-blue-100' },
        ].map(({ icon, label, bg }) => (
          <span
            key={label}
            className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full border ${bg}`}
          >
            <span>{icon}</span>
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
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Decorative ambient background spots */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-10 left-10 w-[350px] h-[350px] bg-violet-200/25 rounded-full blur-3xl" />
        <div className="absolute top-40 right-10 w-[300px] h-[300px] bg-indigo-200/25 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <Header />
        <Hero />

        <main className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-20">
          <EmailForm
            onResults={handleResults}
            onError={handleError}
            loading={loading}
            setLoading={setLoading}
            onReset={handleReset}
            hasResults={!!results}
          />

          {/* Error banner using Framer Motion */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="mt-6 p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-start gap-3 shadow-sm max-w-3xl mx-auto"
              >
                <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-rose-700 font-bold text-sm">Analysis Failed</p>
                  <p className="text-rose-600/80 text-sm mt-0.5">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results section using AnimatePresence */}
          <AnimatePresence>
            {results && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4, cubicBezier: [0.16, 1, 0.3, 1] }}
                className="mt-12"
              >
                <ResultsPanel results={results} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 py-8 text-center bg-white">
          <p className="text-slate-400 text-xs font-medium">
            EmailIQ · AI Email Content Checker · Phase 1 · Powered by Google Gemini 2.5 Flash
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App

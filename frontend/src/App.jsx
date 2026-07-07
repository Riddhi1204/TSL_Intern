import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Sparkles, Mail, BookOpen, AlertCircle } from 'lucide-react'
import EmailForm from './components/EmailForm.jsx'
import ResultsPanel from './components/ResultsPanel.jsx'

// ---------------------------------------------------------------------------
// Custom Logo Component (Flowing M shape merged with an AI Sparkle)
// ---------------------------------------------------------------------------
function Logo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7C6CF6" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>
      </defs>
      {/* Background Rounded Square */}
      <rect width="32" height="32" rx="8" fill="url(#logo-gradient)" />
      {/* Stylized M formed with lines */}
      <path d="M8 22V11L13 16L18 11V22" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Small integrated Sparkle */}
      <path d="M22 8L22.5 10L24.5 10.5L22.5 11L22 13L21.5 11L19.5 10.5L21.5 10L22 8Z" fill="white" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Header component (Minimal Sticky Glassmorphism Navbar)
// ---------------------------------------------------------------------------
function Header() {
  return (
    <header className="sticky top-0 z-30 h-[72px] premium-navbar shadow-sm">
      <div className="max-w-[1100px] h-full mx-auto px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo />
          <div className="flex items-center gap-2.5">
            <span className="text-xl font-extrabold text-slate-800 tracking-tight">MailMuse</span>
            <span className="hidden md:inline-block w-px h-4 bg-slate-200" />
            <span className="hidden md:inline-block text-xs font-semibold text-slate-400">
              AI-Powered Email Writing Assistant
            </span>
          </div>
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
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 pt-10 pb-8 text-center animate-fade-in">
      <h1 className="text-4xl md:text-[56px] font-[800] tracking-tight text-slate-800 mb-4 leading-tight md:leading-[1.1]">
        Write Better Emails with <span className="text-[#7C6CF6]">AI</span>
      </h1>

      <p className="text-slate-500 text-[17px] max-w-xl mx-auto leading-relaxed">
        Improve grammar, refine tone, enhance clarity, and generate stronger subject lines in seconds.
      </p>

      {/* Feature chips */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 mt-6">
        {[
          { icon: <Check className="w-3.5 h-3.5" />, label: 'Grammar', bg: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
          { icon: <Sparkles className="w-3.5 h-3.5" />, label: 'Tone', bg: 'bg-[#EEF2FF] text-[#7C6CF6] border-indigo-100' },
          { icon: <Mail className="w-3.5 h-3.5" />, label: 'Subject Lines', bg: 'bg-blue-50 text-blue-600 border-blue-100' },
          { icon: <BookOpen className="w-3.5 h-3.5" />, label: 'Readability', bg: 'bg-violet-50 text-violet-600 border-violet-100' },
        ].map(({ icon, label, bg }, idx) => (
          <span
            key={idx}
            className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-full border ${bg}`}
          >
            {icon}
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Empty State Component
// ---------------------------------------------------------------------------
function EmptyState() {
  return (
    <div className="max-w-3xl mx-auto mt-12 p-8 text-center bg-white border border-slate-200/60 rounded-[24px] shadow-sm animate-fade-in">
      <div className="flex justify-center mb-6">
        <svg width="120" height="90" viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Abstract background blobs */}
          <circle cx="60" cy="45" r="35" fill="#EEF2FF" />
          <circle cx="85" cy="30" r="15" fill="#7C6CF6" fillOpacity="0.08" />
          {/* Envelope representation */}
          <rect x="35" y="28" width="50" height="34" rx="4" fill="white" stroke="#E5E7EB" strokeWidth="2" />
          <path d="M35 32L60 48L85 32" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {/* Sparkles */}
          <path d="M22 18L23 21L26 22L23 23L22 26L21 23L18 22L21 21L22 18Z" fill="#7C6CF6" />
          <path d="M96 52L97 55L100 56L97 57L96 60L95 57L92 56L95 55L96 52Z" fill="#A78BFA" />
          {/* Flowing lines representing AI editing */}
          <path d="M30 65C45 75 75 75 90 65" stroke="#7C6CF6" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center justify-center gap-1.5">
        <Sparkles className="w-5 h-5 text-[#7C6CF6] animate-pulse" />
        Ready to improve your email?
      </h3>
      <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
        Paste your email above and let MailMuse help you write with confidence.
      </p>
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
    <div className="min-h-screen bg-[#FAFBFD] font-sans antialiased text-slate-800">
      {/* Modern minimal background spots */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#EEF2FF]/40 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] bg-violet-50/40 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        
        <main className="max-w-[1100px] w-full mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col justify-start">
          <Hero />

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
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                className="mt-6 p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-start gap-3 shadow-sm max-w-3xl mx-auto w-full"
              >
                <AlertCircle className="w-5 h-5 text-[#EF4444] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[#EF4444] font-bold text-sm">Analysis Failed</p>
                  <p className="text-rose-600/80 text-sm mt-0.5">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Conditional Empty State or ResultsPanel */}
          <AnimatePresence mode="wait">
            {!results && !loading ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <EmptyState />
              </motion.div>
            ) : results ? (
              <motion.div
                key="results-panel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, cubicBezier: [0.16, 1, 0.3, 1] }}
                className="mt-10"
              >
                <ResultsPanel results={results} />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="border-t border-[#E5E7EB] py-8 bg-white mt-16">
          <div className="max-w-[1100px] mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 text-center md:text-left">
              <div className="flex items-center gap-2">
                <Logo />
                <span className="font-bold text-slate-800">MailMuse</span>
              </div>
              <span className="hidden md:inline text-slate-300">|</span>
              <span className="text-xs text-[#6B7280]">AI-Powered Email Writing Assistant</span>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6 text-center md:text-right text-xs text-[#6B7280]">
              <div className="flex items-center gap-4">
                <span>Powered by Google Gemini</span>
                <span>•</span>
                <span>Secure • Fast • Privacy First</span>
              </div>
              <span className="font-semibold">© 2026 MailMuse</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App

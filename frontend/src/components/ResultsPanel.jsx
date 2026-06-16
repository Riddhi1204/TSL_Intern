/**
 * ResultsPanel component — renders three result cards.
 *
 * Fixes applied:
 *  #15 — key={idx} added to all .map() renders to avoid React reconciliation warnings.
 *  #18 — navigator.clipboard is undefined on HTTP origins (non-HTTPS). CopyButton now
 *          includes an execCommand('copy') fallback for insecure contexts (localhost dev).
 */

import React, { useState } from 'react'

// ---------------------------------------------------------------------------
// CopyButton — Fix #18: clipboard fallback for HTTP origins
// ---------------------------------------------------------------------------
function CopyButton({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      // Preferred: Clipboard API (requires HTTPS or localhost secure context)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
      } else {
        // Fix #18: Fallback for HTTP origins where clipboard API is unavailable
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0'
        document.body.appendChild(textarea)
        textarea.focus()
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.warn('Copy failed:', err)
    }
  }

  return (
    <button
      onClick={handleCopy}
      title={copied ? 'Copied!' : `Copy ${label}`}
      className={`
        flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg
        transition-all duration-150 flex-shrink-0
        ${copied
          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          : 'bg-slate-700/60 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-600/50'
        }
      `}
    >
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {label}
        </>
      )}
    </button>
  )
}

// ---------------------------------------------------------------------------
// ScoreBar
// ---------------------------------------------------------------------------
function ScoreBar({ score }) {
  const colorClass =
    score >= 90
      ? 'from-emerald-500 to-teal-400'
      : score >= 75
      ? 'from-indigo-500 to-violet-400'
      : 'from-amber-500 to-orange-400'

  return (
    <div className="flex items-center gap-3 mt-1.5">
      <div className="flex-1 bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${colorClass}`}
          style={{ width: `${score}%`, transition: 'width 0.9s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </div>
      <span
        className={`text-xs font-bold tabular-nums w-7 text-right ${
          score >= 90 ? 'text-emerald-400' : score >= 75 ? 'text-indigo-400' : 'text-amber-400'
        }`}
      >
        {score}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Card wrapper
// ---------------------------------------------------------------------------
function Card({ children, className = '' }) {
  return (
    <div className={`glass-card rounded-2xl p-6 animate-fade-in ${className}`}>
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Card headers
// ---------------------------------------------------------------------------
function CardHeader({ icon, iconBg, iconColor, title, badge }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className={`w-9 h-9 rounded-xl ${iconBg} border ${iconColor.replace('text-', 'border-').replace('400', '500/25')} flex items-center justify-center flex-shrink-0`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <h3 className="text-white font-semibold text-sm flex-1">{title}</h3>
      {badge !== undefined && (
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
          badge === 0
            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
            : 'bg-amber-500/15 text-amber-400 border-amber-500/25'
        }`}>
          {badge} {badge === 1 ? 'issue' : 'issues'}
        </span>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main ResultsPanel
// ---------------------------------------------------------------------------
function ResultsPanel({ results }) {
  const { corrected_body, grammar_issues, improved_subjects } = results

  return (
    <section aria-label="Analysis results">
      {/* Results meta bar */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
          <span className="text-emerald-400 text-sm font-medium">Analysis Complete</span>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-slate-600/50 to-transparent" />
        <span className="text-slate-500 text-xs">
          {grammar_issues.length} grammar {grammar_issues.length === 1 ? 'issue' : 'issues'} ·{' '}
          {improved_subjects.length} subject {improved_subjects.length === 1 ? 'suggestion' : 'suggestions'}
        </span>
      </div>

      {/* Grid layout: corrected body (wide) + right column (stacked cards) */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">

        {/* ----------------------------------------------------------------
            Card 1 — Corrected Email Body (spans 3/5 columns on xl)
        ---------------------------------------------------------------- */}
        <Card className="xl:col-span-3 delay-100">
          <CardHeader
            icon={
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            iconBg="bg-emerald-500/10"
            iconColor="text-emerald-400"
            title="Corrected Email Body"
          />
          <div className="flex items-start justify-between gap-3 mb-3">
            <p className="text-slate-400 text-xs">
              {grammar_issues.length === 0
                ? 'No corrections needed — your grammar is perfect!'
                : `${grammar_issues.length} correction${grammar_issues.length > 1 ? 's' : ''} applied.`}
            </p>
            <CopyButton text={corrected_body} label="Body" />
          </div>
          <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-4">
            <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
              {corrected_body}
            </p>
          </div>
        </Card>

        {/* Right column */}
        <div className="xl:col-span-2 flex flex-col gap-4">

          {/* ----------------------------------------------------------
              Card 2 — Grammar Issues
          ---------------------------------------------------------- */}
          <Card className="flex-1 delay-200">
            <CardHeader
              icon={
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              }
              iconBg="bg-amber-500/10"
              iconColor="text-amber-400"
              title="Grammar Issues"
              badge={grammar_issues.length}
            />

            {grammar_issues.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-emerald-400 text-sm font-semibold">No issues found!</p>
                <p className="text-slate-500 text-xs mt-1">Your email grammar is excellent.</p>
              </div>
            ) : (
              /* Fix #15: key prop added to mapped elements */
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {grammar_issues.map((issue, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-3.5 animate-slide-up"
                    style={{ animationDelay: `${idx * 60}ms` }}
                  >
                    {/* Before */}
                    <div className="flex items-start gap-2 mb-2">
                      <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-rose-500/20 flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </span>
                      <p className="text-rose-300/80 text-xs leading-relaxed line-through decoration-rose-500/40">
                        {issue.original}
                      </p>
                    </div>
                    {/* After */}
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <p className="text-emerald-300 text-xs leading-relaxed font-medium">
                        {issue.corrected}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* ----------------------------------------------------------
              Card 3 — Improved Subject Suggestions
          ---------------------------------------------------------- */}
          <Card className="delay-300">
            <CardHeader
              icon={
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              iconBg="bg-indigo-500/10"
              iconColor="text-indigo-400"
              title="Subject Suggestions"
            />

            {/* Fix #15: key prop added to mapped elements */}
            <div className="space-y-5">
              {improved_subjects.map((item, idx) => (
                <div key={idx} className="animate-slide-up" style={{ animationDelay: `${idx * 80}ms` }}>
                  <div className="flex items-start gap-2.5 mb-1">
                    {/* Rank badge */}
                    <span className={`
                      flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5
                      ${idx === 0
                        ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-500/30'
                        : idx === 1
                        ? 'bg-slate-600/50 text-slate-300 border border-slate-600/50'
                        : 'bg-slate-700/50 text-slate-400 border border-slate-700/50'
                      }
                    `}>
                      {idx + 1}
                    </span>
                    <p className="text-slate-200 text-xs leading-snug flex-1">{item.subject}</p>
                    <CopyButton text={item.subject} label="Subject" />
                  </div>
                  <div className="pl-7">
                    <ScoreBar score={item.score} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>
      </div>
    </section>
  )
}

export default ResultsPanel

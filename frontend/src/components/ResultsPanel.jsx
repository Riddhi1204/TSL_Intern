/**
 * ResultsPanel component — renders three premium white cards.
 *
 * Fixes applied:
 *  #15 — key={idx} added to all .map() renders.
 *  #18 — CopyButton includes fallback for insecure contexts.
 *  Redesigned to use Framer Motion animations and premium light pastel aesthetics.
 */

import React, { useState } from 'react'
import { motion } from 'framer-motion'

// ---------------------------------------------------------------------------
// CopyButton — Fix #18: clipboard fallback for HTTP origins
// ---------------------------------------------------------------------------
function CopyButton({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
      } else {
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
        flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl
        transition-all duration-150 flex-shrink-0 border
        ${copied
          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
          : 'bg-slate-50 text-slate-500 hover:text-slate-800 hover:bg-slate-100 border-slate-200/60'
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
      ? 'from-blue-400 to-indigo-400'
      : score >= 75
      ? 'from-violet-400 to-indigo-400'
      : 'from-amber-400 to-orange-400'

  const scoreColor =
    score >= 90 ? 'text-blue-600' : score >= 75 ? 'text-violet-600' : 'text-amber-600'

  return (
    <div className="flex items-center gap-3 mt-1.5">
      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${colorClass}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <span className={`text-xs font-bold tabular-nums w-8 text-right ${scoreColor}`}>
        {score}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Card wrapper (Framer Motion)
// ---------------------------------------------------------------------------
function MotionCard({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`premium-card rounded-[20px] p-6 glow-lavender ${className}`}
    >
      {children}
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Card headers
// ---------------------------------------------------------------------------
function CardHeader({ icon, iconBg, iconColor, title, badge, badgeColor = 'bg-slate-100 text-slate-600 border-slate-200' }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className={`w-9 h-9 rounded-xl ${iconBg} border flex items-center justify-center flex-shrink-0`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <h3 className="text-slate-800 font-bold text-sm flex-1">{title}</h3>
      {badge !== undefined && (
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${badgeColor}`}>
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
    <section aria-label="Analysis results" className="max-w-[1200px] mx-auto">
      {/* Results meta bar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.6)] animate-pulse" />
          <span className="text-violet-600 text-sm font-bold">Analysis Complete</span>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
        <span className="text-slate-400 text-xs font-semibold">
          {grammar_issues.length} grammar {grammar_issues.length === 1 ? 'issue' : 'issues'} ·{' '}
          {improved_subjects.length} subject {improved_subjects.length === 1 ? 'suggestion' : 'suggestions'}
        </span>
      </div>

      {/* Grid layout: corrected body (wide) + right column (stacked cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ----------------------------------------------------------------
            Card 1 — Corrected Email Body (spans 3/5 columns on lg)
        ---------------------------------------------------------------- */}
        <MotionCard className="lg:col-span-3" delay={0.05}>
          <CardHeader
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            iconBg="bg-violet-50 border-violet-100"
            iconColor="text-violet-500"
            title="Corrected Email Body"
          />
          <div className="flex items-center justify-between gap-3 mb-4">
            <p className="text-slate-400 text-xs font-medium">
              {grammar_issues.length === 0
                ? 'No corrections needed — your draft looks excellent!'
                : `${grammar_issues.length} correction${grammar_issues.length > 1 ? 's' : ''} applied to email body.`}
            </p>
            <CopyButton text={corrected_body} label="Copy Body" />
          </div>
          <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 min-h-[220px]">
            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-sans">
              {corrected_body}
            </p>
          </div>
        </MotionCard>

        {/* Right column */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* ----------------------------------------------------------
              Card 2 — Grammar Issues
          ---------------------------------------------------------- */}
          <MotionCard delay={0.15}>
            <CardHeader
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
              iconBg="bg-emerald-50 border-emerald-100"
              iconColor="text-emerald-500"
              title="Detected Issues"
              badge={grammar_issues.length}
              badgeColor={
                grammar_issues.length === 0
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  : 'bg-amber-50 text-amber-600 border-amber-100'
              }
            />

            {grammar_issues.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center bg-emerald-50/20 rounded-2xl border border-dashed border-emerald-100">
                <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-emerald-700 text-xs font-bold">Perfect Grammar</p>
                <p className="text-slate-400 text-[11px] mt-0.5">No grammatical errors were found.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {grammar_issues.map((issue, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 flex flex-col gap-1.5"
                  >
                    {/* Original incorrect */}
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100 mt-0.5">
                        Original
                      </span>
                      <p className="text-rose-600 text-xs font-medium leading-relaxed line-through decoration-rose-400/40">
                        {issue.original}
                      </p>
                    </div>
                    {/* Corrected */}
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 mt-0.5">
                        Correction
                      </span>
                      <p className="text-emerald-700 text-xs font-bold leading-relaxed">
                        {issue.corrected}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </MotionCard>

          {/* ----------------------------------------------------------
              Card 3 — Improved Subject Suggestions
          ---------------------------------------------------------- */}
          <MotionCard delay={0.25}>
            <CardHeader
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              iconBg="bg-blue-50 border-blue-100"
              iconColor="text-blue-500"
              title="Subject Alternatives"
            />

            <div className="space-y-4">
              {improved_subjects.map((item, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200/50 rounded-xl p-3">
                  <div className="flex items-start gap-2.5 justify-between">
                    <div className="flex items-start gap-2">
                      {/* Rank badge */}
                      <span className={`
                        flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5
                        ${idx === 0
                          ? 'bg-blue-100 text-blue-600 border border-blue-200'
                          : idx === 1
                          ? 'bg-slate-200 text-slate-600 border border-slate-300'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }
                      `}>
                        {idx + 1}
                      </span>
                      <p className="text-slate-800 text-xs font-semibold leading-relaxed flex-1">{item.subject}</p>
                    </div>
                    <CopyButton text={item.subject} label="Copy" />
                  </div>
                  <div className="pl-7 mt-1">
                    <ScoreBar score={item.score} />
                  </div>
                </div>
              ))}
            </div>
          </MotionCard>

        </div>
      </div>
    </section>
  )
}

export default ResultsPanel

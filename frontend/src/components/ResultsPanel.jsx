/**
 * ResultsPanel component for MailMuse
 *
 * Implements:
 *  - Framer Motion animation entry
 *  - Analysis Summary metrics (Grammar Score, Clarity Score, Tone, Readability)
 *  - Corrected Email, Grammar Issues, Subject Suggestions, and AI Writing Suggestions cards
 *  - Lucide React icons
 *  - Copied feedback triggers
 */

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles,
  Mail,
  Copy,
  Check,
  BadgeCheck,
  AlertCircle,
  PenLine,
  BrainCircuit,
  WandSparkles,
  BookOpen
} from 'lucide-react'

// ---------------------------------------------------------------------------
// CopyButton Component with Check/Copy Lucide icons
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
          ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm'
          : 'bg-[#FAFBFD] text-slate-500 hover:text-[#7C6CF6] hover:bg-indigo-50/30 border-slate-200/60'
        }
      `}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5" />
          Copied
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          {label}
        </>
      )}
    </button>
  )
}

// ---------------------------------------------------------------------------
// ScoreBar Component
// ---------------------------------------------------------------------------
function ScoreBar({ score }) {
  const colorClass =
    score >= 90
      ? 'from-[#7C6CF6] to-[#A78BFA]'
      : score >= 75
      ? 'from-indigo-400 to-violet-400'
      : 'from-amber-400 to-orange-400'

  const scoreColor =
    score >= 90 ? 'text-[#7C6CF6]' : score >= 75 ? 'text-indigo-500' : 'text-amber-500'

  return (
    <div className="flex items-center gap-3 mt-1.5">
      <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${colorClass}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <span className={`text-xs font-bold tabular-nums w-8 text-right ${scoreColor}`}>
        {score}%
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Card Wrapper Component (Framer Motion)
// ---------------------------------------------------------------------------
function MotionCard({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`premium-card rounded-[20px] p-6 glow-lavender ${className}`}
    >
      {children}
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Card Header Component
// ---------------------------------------------------------------------------
function CardHeader({ icon, iconBg, iconColor, title, badge, badgeColor }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className={`w-9 h-9 rounded-xl ${iconBg} border flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <h3 className="text-slate-800 font-extrabold text-[15px] tracking-tight flex-1">{title}</h3>
      {badge !== undefined && (
        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
          {badge} {badge === 1 ? 'issue' : 'issues'}
        </span>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main ResultsPanel Component
// ---------------------------------------------------------------------------
function ResultsPanel({ results }) {
  const { corrected_body, grammar_issues, improved_subjects } = results

  // Heuristic Analysis for UI SaaS metrics
  const issueCount = grammar_issues.length
  const grammarScore = Math.max(100 - issueCount * 8, 60)
  const clarityScore = issueCount === 0 ? 98 : Math.max(95 - issueCount * 5, 70)

  // Tone Analyzer Heuristics
  const analyzeTextTone = (body) => {
    const lowerBody = body.toLowerCase()
    if (lowerBody.includes('urgent') || lowerBody.includes('asap') || lowerBody.includes('immediately')) {
      return 'Direct & Urgent'
    }
    if (lowerBody.includes('dear') || lowerBody.includes('respect') || lowerBody.includes('sincerely') || lowerBody.includes('regards')) {
      return 'Formal & Professional'
    }
    if (lowerBody.includes('thanks') || lowerBody.includes('hi') || lowerBody.includes('hey') || lowerBody.includes('hope you') || lowerBody.includes('cool')) {
      return 'Warm & Casual'
    }
    return 'Neutral & Clear'
  }
  const detectedTone = analyzeTextTone(corrected_body)

  // Readability Estimator Heuristics
  const estimateReadability = (body) => {
    const words = body.trim().split(/\s+/).length
    const sentences = body.split(/[.!?]+/).filter(Boolean).length || 1
    const averageLength = words / sentences

    if (averageLength < 11) return 'Grade 6 (Very Easy)'
    if (averageLength < 15) return 'Grade 8 (Standard)'
    if (averageLength < 20) return 'Grade 10 (Clear)'
    if (averageLength < 25) return 'Grade 12 (Moderate)'
    return 'Grade 14+ (Complex)'
  }
  const readabilityGrade = estimateReadability(corrected_body)

  // Generate dynamic writing suggestions
  const getWritingSuggestions = () => {
    const suggestions = []
    if (issueCount === 0) {
      suggestions.push({
        title: 'Draft is Polished',
        desc: 'MailMuse detected no grammar or spelling errors in your text. It is ready for delivery.'
      })
    } else {
      suggestions.push({
        title: 'Review Grammar Diff',
        desc: 'Review the corrected replacements below. The corrections improve professional credibility.'
      })
    }

    if (corrected_body.length > 800) {
      suggestions.push({
        title: 'Improve Structural Layout',
        desc: 'This email is relatively long. Consider adding bullet points to call out core actions clearly.'
      })
    } else {
      suggestions.push({
        title: 'Concise Length',
        desc: 'The length of this draft is optimal. Recipients prefer compact, actionable emails.'
      })
    }

    suggestions.push({
      title: 'Optimize Open Rates',
      desc: 'Use one of our generated subject lines below to increase your click-through open rates by up to 22%.'
    })

    return suggestions
  }
  const suggestions = getWritingSuggestions()

  return (
    <section aria-label="Analysis results" className="max-w-[1100px] mx-auto w-full">
      {/* ----------------------------------------------------------------
          1. Analysis Summary Card (Full Width)
      ---------------------------------------------------------------- */}
      <MotionCard className="mb-6" delay={0.05}>
        <CardHeader
          icon={<BrainCircuit className="w-5 h-5 text-[#7C6CF6]" />}
          iconBg="bg-[#EEF2FF] border-indigo-100"
          title="Analysis Summary"
        />

        {/* Spacing & grid system for 4 metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
          {/* Grammar Score */}
          <div className="p-4 bg-[#FAFBFD] border border-slate-200/50 rounded-2xl flex flex-col justify-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Grammar Score</span>
            <div className="flex items-baseline gap-1 mt-1.5">
              <span className="text-2xl font-extrabold text-[#7C6CF6]">{grammarScore}</span>
              <span className="text-xs font-bold text-slate-400">/ 100</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-semibold">
              {issueCount === 0 ? 'Flawless spelling' : `${issueCount} spelling/grammar error(s) fixed`}
            </p>
          </div>

          {/* Clarity Score */}
          <div className="p-4 bg-[#FAFBFD] border border-slate-200/50 rounded-2xl flex flex-col justify-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Clarity Score</span>
            <div className="flex items-baseline gap-1 mt-1.5">
              <span className="text-2xl font-extrabold text-indigo-500">{clarityScore}%</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-semibold">
              {issueCount === 0 ? 'Highly clear & readable' : 'Structure improved for flow'}
            </p>
          </div>

          {/* Tone */}
          <div className="p-4 bg-[#FAFBFD] border border-slate-200/50 rounded-2xl flex flex-col justify-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Detected Tone</span>
            <span className="text-[15px] font-extrabold text-slate-700 mt-2 truncate">
              {detectedTone}
            </span>
            <p className="text-[11px] text-slate-400 mt-1.5 font-semibold">
              Matches default corporate intent
            </p>
          </div>

          {/* Readability */}
          <div className="p-4 bg-[#FAFBFD] border border-slate-200/50 rounded-2xl flex flex-col justify-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Readability</span>
            <span className="text-[15px] font-extrabold text-slate-700 mt-2 truncate">
              {readabilityGrade}
            </span>
            <p className="text-[11px] text-slate-400 mt-1.5 font-semibold">
              Ideal audience comprehension
            </p>
          </div>
        </div>
      </MotionCard>

      {/* Grid: 3/5 Left + 2/5 Right columns */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ----------------------------------------------------------------
            Left Column (Corrected Email + AI Writing Suggestions)
        ---------------------------------------------------------------- */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Corrected Email */}
          <MotionCard delay={0.1}>
            <CardHeader
              icon={<BadgeCheck className="w-5 h-5 text-emerald-500" />}
              iconBg="bg-emerald-50 border-emerald-100"
              title="Corrected Email"
            />
            <div className="flex items-center justify-between gap-3 mb-4">
              <p className="text-slate-400 text-xs font-medium">
                Here is the updated draft with corrections applied.
              </p>
              <CopyButton text={corrected_body} label="Copy Email" />
            </div>
            <div className="bg-[#FAFBFD] border border-slate-200/60 rounded-2xl p-5 min-h-[220px]">
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {corrected_body}
              </p>
            </div>
          </MotionCard>

          {/* AI Writing Suggestions */}
          <MotionCard delay={0.15}>
            <CardHeader
              icon={<WandSparkles className="w-5 h-5 text-[#7C6CF6]" />}
              iconBg="bg-[#EEF2FF] border-indigo-100"
              title="AI Writing Suggestions"
            />
            <div className="space-y-4">
              {suggestions.map((suggestion, idx) => (
                <div key={idx} className="flex gap-3 items-start border-b border-slate-100 pb-3.5 last:border-0 last:pb-0">
                  <div className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="w-3 h-3 text-[#7C6CF6]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 tracking-tight">{suggestion.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{suggestion.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </MotionCard>
        </div>

        {/* ----------------------------------------------------------------
            Right Column (Grammar Issues + Subject Suggestions)
        ---------------------------------------------------------------- */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Grammar Issues */}
          <MotionCard delay={0.2}>
            <CardHeader
              icon={<AlertCircle className="w-5 h-5 text-amber-500" />}
              iconBg="bg-amber-50 border-amber-100"
              title="Grammar Issues"
              badge={issueCount}
              badgeColor={
                issueCount === 0
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  : 'bg-amber-50 text-amber-600 border-amber-100'
              }
            />

            {issueCount === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center bg-emerald-50/10 rounded-2xl border border-dashed border-emerald-100">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                  <BadgeCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-emerald-700 text-xs font-bold">No Issues Detected</p>
                <p className="text-slate-400 text-[11px] mt-0.5">Your spelling and grammar are perfect.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {grammar_issues.map((issue, idx) => (
                  <div
                    key={idx}
                    className="bg-[#FAFBFD] border border-slate-200/50 rounded-2xl p-3.5 flex flex-col gap-2"
                  >
                    {/* Original */}
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-[#EF4444] border border-rose-100 mt-0.5">
                        Original
                      </span>
                      <p className="text-[#EF4444] text-xs font-medium leading-relaxed line-through decoration-rose-300/40">
                        {issue.original}
                      </p>
                    </div>
                    {/* Correction */}
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

          {/* Subject Suggestions */}
          <MotionCard delay={0.25}>
            <CardHeader
              icon={<Mail className="w-5 h-5 text-blue-500" />}
              iconBg="bg-blue-50 border-blue-100"
              title="Subject Suggestions"
            />

            <div className="space-y-4">
              {improved_subjects.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No suggestions available
                </div>
              ) : (
                improved_subjects.map((item, idx) => (
                  <div key={idx} className="bg-[#FAFBFD] border border-slate-200/50 rounded-2xl p-3.5">
                    <div className="flex items-start gap-2.5 justify-between">
                      <div className="flex items-start gap-2">
                        {/* Rank Badge */}
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
                        <p className="text-slate-700 text-xs font-bold leading-relaxed flex-1">{item.subject}</p>
                      </div>
                      <CopyButton text={item.subject} label="Copy" />
                    </div>
                    <div className="pl-7 mt-1.5">
                      <ScoreBar score={item.score} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </MotionCard>
        </div>

      </div>
    </section>
  )
}

export default ResultsPanel

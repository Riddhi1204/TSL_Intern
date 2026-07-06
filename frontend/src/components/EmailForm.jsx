/**
 * EmailForm component
 *
 * Fixes applied:
 *  #16 — Added noValidate to <form> to suppress browser native validation
 *          UI from conflicting with our React-controlled validation.
 *  #17 — Error state cleared at the start of handleSubmit before the API call.
 *  Redesigned into a premium white card with soft pastel elements and rounded borders.
 */

import React, { useState } from 'react'
import { checkEmail } from '../services/api.js'

// ---------------------------------------------------------------------------
// Icons (inline SVG)
// ---------------------------------------------------------------------------
const IconSparkles = () => (
  <svg className="w-5 h-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
)

const IconRefresh = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
)

const IconSpinner = () => (
  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
)

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
function EmailForm({ onResults, onError, loading, setLoading, onReset, hasResults }) {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  // Client-side validation
  const validate = () => {
    const errors = {}
    if (!subject.trim()) {
      errors.subject = 'Subject line is required.'
    } else if (subject.trim().length > 200) {
      errors.subject = 'Subject must be 200 characters or fewer.'
    }
    if (!body.trim()) {
      errors.body = 'Email body is required.'
    } else if (body.trim().length < 10) {
      errors.body = 'Email body must be at least 10 characters.'
    } else if (body.trim().length > 5000) {
      errors.body = 'Email body must be 5,000 characters or fewer.'
    }
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})
    setLoading(true)
    onError(null)

    try {
      const data = await checkEmail(subject.trim(), body.trim())
      onResults(data)
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.message ||
        'Something went wrong. Please check your connection and try again.'
      onError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSubject('')
    setBody('')
    setFieldErrors({})
    onReset()
  }

  const clearFieldError = (field) =>
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }))

  const bodyLength = body.length
  const isNearLimit = bodyLength > 4500

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-3xl mx-auto">
      <div className="premium-card rounded-[20px] p-6 md:p-8 glow-lavender transition-all duration-300">
        {/* Form header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-slate-800 font-bold text-lg">Compose Email</h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Input your draft below for instant AI analysis
            </p>
          </div>
          {hasResults && (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors duration-150 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/70"
            >
              <IconRefresh />
              New draft
            </button>
          )}
        </div>

        {/* Subject Input */}
        <div className="mb-5">
          <label htmlFor="email-subject" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Email Subject <span className="text-rose-400">*</span>
          </label>
          <input
            id="email-subject"
            type="text"
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value)
              clearFieldError('subject')
            }}
            placeholder="e.g. Project status update or follow-up request"
            maxLength={200}
            disabled={loading}
            autoComplete="off"
            className={`
              w-full bg-slate-50 border rounded-xl px-4 py-3 text-slate-800
              placeholder-slate-400 text-sm focus:outline-none focus:ring-2
              transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed
              ${fieldErrors.subject
                ? 'border-rose-300 focus:ring-rose-200/50 focus:border-rose-400'
                : 'border-slate-200 focus:ring-violet-200/50 focus:border-violet-300 hover:border-slate-300'
              }
            `}
          />
          {fieldErrors.subject && (
            <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {fieldErrors.subject}
            </p>
          )}
        </div>

        {/* Body Textarea */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="email-body" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Email Body <span className="text-rose-400">*</span>
            </label>
            <span className={`text-xs font-semibold tabular-nums ${isNearLimit ? 'text-amber-500 font-bold' : 'text-slate-400'}`}>
              {bodyLength.toLocaleString()} / 5,000
            </span>
          </div>
          <textarea
            id="email-body"
            value={body}
            onChange={(e) => {
              setBody(e.target.value)
              clearFieldError('body')
            }}
            placeholder="Write or paste your email body draft here. The AI will correct spelling/grammar mistakes and help improve readability..."
            maxLength={5000}
            rows={10}
            disabled={loading}
            className={`
              w-full bg-slate-50 border rounded-xl px-4 py-3 text-slate-800
              placeholder-slate-400 text-sm focus:outline-none focus:ring-2
              transition-all duration-150 resize-none disabled:opacity-60
              disabled:cursor-not-allowed leading-relaxed font-sans
              ${fieldErrors.body
                ? 'border-rose-300 focus:ring-rose-200/50 focus:border-rose-400'
                : 'border-slate-200 focus:ring-violet-200/50 focus:border-violet-300 hover:border-slate-300'
              }
            `}
          />
          {fieldErrors.body && (
            <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {fieldErrors.body}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          id="analyze-btn"
          type="submit"
          disabled={loading}
          className="
            w-full relative overflow-hidden
            bg-gradient-to-r from-violet-400 to-indigo-400
            hover:from-violet-500 hover:to-indigo-500
            disabled:from-slate-300 disabled:to-slate-400
            text-white font-bold py-3.5 px-6 rounded-xl
            transition-all duration-200
            flex items-center justify-center gap-2
            shadow-md shadow-violet-200
            hover:shadow-lg hover:shadow-violet-200 hover:-translate-y-0.5
            active:translate-y-0 active:shadow-md
            disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
          "
        >
          {loading ? (
            <>
              <IconSpinner />
              <span>Analyzing draft...</span>
            </>
          ) : (
            <>
              <IconSparkles />
              <span>Analyze Email</span>
            </>
          )}
        </button>

        {loading && (
          <p className="text-center text-slate-400 text-[11px] mt-3 animate-pulse">
            Analyzing text for grammar issues and evaluating alternative subject lines...
          </p>
        )}
      </div>
    </form>
  )
}

export default EmailForm

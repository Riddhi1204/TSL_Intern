/**
 * EmailForm component
 *
 * Fixes applied:
 *  #16 — Added noValidate to <form> to suppress browser native validation
 *          UI from conflicting with our React-controlled validation.
 *  #17 — Error state cleared at the start of handleSubmit before the API call.
 */

import React, { useState } from 'react'
import { checkEmail } from '../services/api.js'

// ---------------------------------------------------------------------------
// Icons (inline SVG to avoid icon library dependency)
// ---------------------------------------------------------------------------
const IconBolt = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
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

    // Fix #17: Clear previous error state before making a new request
    // so a stale error message never appears alongside a loading spinner.
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
    /* Fix #16: noValidate disables browser built-in validation popups */
    <form onSubmit={handleSubmit} noValidate>
      <div className="glass-card rounded-2xl p-6 md:p-8 glow-indigo transition-all duration-300">
        {/* Form header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-white font-semibold text-lg">Compose Your Email</h2>
            <p className="text-slate-400 text-sm mt-0.5">
              Paste your draft below for AI-powered analysis
            </p>
          </div>
          {hasResults && (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors duration-150 px-3 py-1.5 rounded-lg hover:bg-slate-700/50"
            >
              <IconRefresh />
              New Analysis
            </button>
          )}
        </div>

        {/* Subject Input */}
        <div className="mb-5">
          <label htmlFor="email-subject" className="block text-sm font-medium text-slate-300 mb-2">
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
            placeholder="e.g. Meeting update for Q3 review"
            maxLength={200}
            disabled={loading}
            autoComplete="off"
            className={`
              w-full bg-slate-900/60 border rounded-xl px-4 py-3 text-white
              placeholder-slate-500 text-sm focus:outline-none focus:ring-2
              transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed
              ${fieldErrors.subject
                ? 'border-rose-500/60 focus:ring-rose-500/20 focus:border-rose-500/60'
                : 'border-slate-600/50 focus:ring-indigo-500/30 focus:border-indigo-500/60 hover:border-slate-500/60'
              }
            `}
          />
          {fieldErrors.subject && (
            <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
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
            <label htmlFor="email-body" className="block text-sm font-medium text-slate-300">
              Email Body <span className="text-rose-400">*</span>
            </label>
            <span className={`text-xs tabular-nums transition-colors ${isNearLimit ? 'text-amber-400 font-medium' : 'text-slate-500'}`}>
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
            placeholder="Paste your email body here. Our AI will identify grammar issues and suggest improvements..."
            maxLength={5000}
            rows={11}
            disabled={loading}
            className={`
              w-full bg-slate-900/60 border rounded-xl px-4 py-3 text-white
              placeholder-slate-500 text-sm focus:outline-none focus:ring-2
              transition-all duration-150 resize-none disabled:opacity-50
              disabled:cursor-not-allowed leading-relaxed
              ${fieldErrors.body
                ? 'border-rose-500/60 focus:ring-rose-500/20 focus:border-rose-500/60'
                : 'border-slate-600/50 focus:ring-indigo-500/30 focus:border-indigo-500/60 hover:border-slate-500/60'
              }
            `}
          />
          {fieldErrors.body && (
            <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
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
            bg-gradient-to-r from-indigo-600 to-purple-600
            hover:from-indigo-500 hover:to-purple-500
            disabled:from-slate-600 disabled:to-slate-700
            text-white font-semibold py-3.5 px-6 rounded-xl
            transition-all duration-200
            flex items-center justify-center gap-3
            shadow-lg shadow-indigo-500/25
            hover:shadow-indigo-500/40 hover:-translate-y-0.5
            active:translate-y-0 active:shadow-indigo-500/20
            disabled:cursor-not-allowed disabled:transform-none
            disabled:shadow-none
          "
        >
          {loading ? (
            <>
              <IconSpinner />
              <span>Analyzing with GPT-4o-mini...</span>
            </>
          ) : (
            <>
              <IconBolt />
              <span>Analyze Email</span>
            </>
          )}
        </button>

        {loading && (
          <p className="text-center text-slate-400 text-xs mt-3 animate-pulse">
            Running grammar check and generating subject suggestions in parallel...
          </p>
        )}
      </div>
    </form>
  )
}

export default EmailForm

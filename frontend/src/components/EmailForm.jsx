/**
 * EmailForm component for MailMuse
 *
 * Fixes:
 *  #16 — Added noValidate to <form> to suppress native browser tooltips
 *  #17 — Error state cleared on submit
 *  Redesigned into a premium rounded-3xl white card with Manrope typography and Lucide icons.
 */

import React, { useState } from 'react'
import { WandSparkles, RotateCcw, Loader2 } from 'lucide-react'
import { checkEmail } from '../services/api.js'

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
    <form onSubmit={handleSubmit} noValidate className="max-w-3xl mx-auto w-full">
      <div className="premium-card rounded-[24px] p-8 md:p-10 glow-lavender transition-all duration-300">
        {/* Form Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-slate-800 font-extrabold text-xl tracking-tight">Compose Email</h2>
            <p className="text-slate-400 text-xs mt-1">
              Refining grammar, tone, and subject alternatives with Gemini intelligence
            </p>
          </div>
          {hasResults && (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#7C6CF6] transition-colors duration-150 px-3.5 py-2 rounded-xl bg-slate-100/80 hover:bg-indigo-50/50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Draft
            </button>
          )}
        </div>

        {/* Subject Input */}
        <div className="mb-6">
          <label htmlFor="email-subject" className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-2.5">
            Subject Line <span className="text-rose-400 font-bold">*</span>
          </label>
          <input
            id="email-subject"
            type="text"
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value)
              clearFieldError('subject')
            }}
            placeholder="e.g. Q3 product review or partnership proposal"
            maxLength={200}
            disabled={loading}
            autoComplete="off"
            className={`
              w-full bg-[#FAFBFD] border rounded-2xl px-4.5 py-3.5 text-slate-800
              placeholder-slate-400 text-sm focus:outline-none focus:ring-2
              transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed
              ${fieldErrors.subject
                ? 'border-rose-300 focus:ring-rose-100 focus:border-[#EF4444]'
                : 'border-slate-200 focus:ring-[#7C6CF6]/15 focus:border-[#7C6CF6] hover:border-slate-300'
              }
            `}
          />
          {fieldErrors.subject && (
            <p className="mt-2 text-xs text-[#EF4444] flex items-center gap-1.5 font-semibold">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {fieldErrors.subject}
            </p>
          )}
        </div>

        {/* Body Textarea */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2.5">
            <label htmlFor="email-body" className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest">
              Email Body <span className="text-rose-400 font-bold">*</span>
            </label>
            <span className={`text-xs font-bold tabular-nums ${isNearLimit ? 'text-[#F59E0B]' : 'text-slate-400'}`}>
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
            placeholder="Paste your email draft here. MailMuse will scan for spelling and grammatical errors, evaluate clarity, and suggest stylistic improvements..."
            maxLength={5000}
            rows={9}
            disabled={loading}
            className={`
              w-full bg-[#FAFBFD] border rounded-2xl px-4.5 py-3.5 text-slate-800
              placeholder-slate-400 text-sm focus:outline-none focus:ring-2
              transition-all duration-150 resize-none disabled:opacity-60
              disabled:cursor-not-allowed leading-relaxed font-sans
              ${fieldErrors.body
                ? 'border-rose-300 focus:ring-rose-100 focus:border-[#EF4444]'
                : 'border-slate-200 focus:ring-[#7C6CF6]/15 focus:border-[#7C6CF6] hover:border-slate-300'
              }
            `}
          />
          {fieldErrors.body && (
            <p className="mt-2 text-xs text-[#EF4444] flex items-center gap-1.5 font-semibold">
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
            bg-gradient-to-r from-[#7C6CF6] to-[#A78BFA]
            hover:from-[#6b5ae4] hover:to-[#9679f7]
            disabled:from-slate-300 disabled:to-slate-400
            text-white font-extrabold py-4 px-6 rounded-2xl
            transition-all duration-200
            flex items-center justify-center gap-2.5
            shadow-md shadow-indigo-100
            hover:shadow-lg hover:shadow-indigo-200/50 hover:-translate-y-0.5
            active:translate-y-0 active:shadow-md
            disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
          "
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing your email...</span>
            </>
          ) : (
            <>
              <WandSparkles className="w-5 h-5" />
              <span>Analyze Email</span>
            </>
          )}
        </button>

        {loading && (
          <p className="text-center text-slate-400 text-[11px] mt-3.5 animate-pulse font-medium">
            Computing readability scores, editing grammar, and crafting high-impact subject lines...
          </p>
        )}
      </div>
    </form>
  )
}

export default EmailForm

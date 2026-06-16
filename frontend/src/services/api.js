/**
 * Axios API client for the AI Email Content Checker backend.
 *
 * Fix #14: Added fallback 'http://localhost:8000' so that requests don't
 * silently target `undefined/api/v1/check` when VITE_API_URL is not set
 * in the local .env file during development.
 */

import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Check email content for grammar issues and generate improved subject lines.
 *
 * @param {string} subject - The email subject line
 * @param {string} body    - The email body content
 * @returns {Promise<{
 *   corrected_body: string,
 *   grammar_issues: Array<{original: string, corrected: string}>,
 *   improved_subjects: Array<{subject: string, score: number}>
 * }>}
 */
export async function checkEmail(subject, body) {
  const response = await apiClient.post('/api/v1/check', { subject, body })
  return response.data
}

export default apiClient

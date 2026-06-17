# EmailIQ — AI Email Content Checker (Phase 1)

An AI-powered web application that analyzes email drafts for grammar errors and generates optimized subject lines using **GPT-4o-mini**.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 · Vite 5 · Tailwind CSS 3 · Axios |
| Backend | FastAPI · Python 3.11 · Pydantic v2 · pydantic-settings |
| AI | OpenAI GPT-4o-mini (`openai` SDK v1.x) |
| Deployment | Vercel (frontend) · Render (backend) |

---

## Project Structure

```
ai-email-content-checker/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                    # FastAPI app factory, CORS, lifespan
│   │   ├── api/v1/
│   │   │   ├── router.py              # v1 APIRouter
│   │   │   └── routes/check.py        # POST /api/v1/check
│   │   ├── services/ai/
│   │   │   ├── base.py                # AsyncOpenAI singleton
│   │   │   ├── grammar.py             # Grammar correction service
│   │   │   └── subject.py             # Subject generation service
│   │   ├── schemas/
│   │   │   ├── request.py             # EmailCheckRequest
│   │   │   └── response.py            # EmailCheckResponse
│   │   └── core/config.py             # pydantic-settings config
│   ├── requirements.txt
│   ├── .env.example
│   └── render.yaml
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── vercel.json
    ├── .env.example
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── components/
        │   ├── EmailForm.jsx
        │   └── ResultsPanel.jsx
        └── services/api.js
```

---

## Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **OpenAI API key** with access to `gpt-4o-mini`

---


## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | ✅ | Your OpenAI API key |
| `MODEL_NAME` | Optional | AI model (default: `gpt-4o-mini`) |
| `ALLOWED_ORIGINS` | ✅ | Comma-separated list of allowed CORS origins |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | ✅ | Backend URL (no trailing slash) |

> **Note:** Vite only exposes variables prefixed with `VITE_` to the browser.

---

## API Reference

### `POST /api/v1/check`

**Request:**
```json
{
  "subject": "Meeting update",
  "body": "We has completed the task yesterday."
}
```

**Response `200 OK`:**
```json
{
  "corrected_body": "We completed the task yesterday.",
  "grammar_issues": [
    { "original": "We has", "corrected": "We completed" }
  ],
  "improved_subjects": [
    { "subject": "Project Completion Update", "score": 95 },
    { "subject": "Task Completion Summary", "score": 91 },
    { "subject": "Project Status Update", "score": 88 }
  ]
}
```

### `GET /health`

```json
{ "status": "healthy" }
```

---

## Deployment

### Backend → Render

### Frontend → Vercel

### Post-deployment: Update CORS

After deploying both services:
1. Copy your Vercel frontend URL (e.g., `https://my-app.vercel.app`)
2. In Render dashboard → your backend service → **Environment**
3. Update `ALLOWED_ORIGINS` to include your Vercel URL
4. Render will automatically redeploy

---

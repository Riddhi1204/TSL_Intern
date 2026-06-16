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

## Local Development Setup

### 1. Clone and enter the project

```bash
git clone https://github.com/your-username/ai-email-content-checker.git
cd ai-email-content-checker
```

### 2. Backend setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and set your OPENAI_API_KEY
```

### 3. Run the backend

```bash
# From inside the backend/ directory (with venv active)
uvicorn app.main:app --reload --port 8000
```

API is now running at: http://localhost:8000  
Swagger docs: http://localhost:8000/docs

### 4. Frontend setup

```bash
# In a new terminal, from the project root:
cd frontend
npm install

# Configure environment variables
cp .env.example .env
# .env already has: VITE_API_URL=http://localhost:8000
```

### 5. Run the frontend

```bash
npm run dev
```

App is now running at: http://localhost:5173

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

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → **New** → **Blueprint**
3. Connect your GitHub repository
4. Render will detect `render.yaml` automatically
5. In the Render dashboard, set the following environment variables as **Secret**:
   - `OPENAI_API_KEY` — your OpenAI key
   - `ALLOWED_ORIGINS` — your Vercel frontend URL (e.g., `https://my-app.vercel.app`)
6. Deploy — the service will be live at `https://your-service.onrender.com`

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repository
3. Set **Root Directory** to `frontend`
4. Vercel detects Vite automatically via `vercel.json`
5. Add environment variable:
   - `VITE_API_URL` = `https://your-service.onrender.com`
6. Deploy

### Post-deployment: Update CORS

After deploying both services:
1. Copy your Vercel frontend URL (e.g., `https://my-app.vercel.app`)
2. In Render dashboard → your backend service → **Environment**
3. Update `ALLOWED_ORIGINS` to include your Vercel URL
4. Render will automatically redeploy

---

## Build for Production

```bash
# Frontend production build
cd frontend
npm run build
# Output in frontend/dist/
```

---

## Key Architecture Decisions

| Decision | Reason |
|----------|--------|
| `asyncio.gather()` with `return_exceptions=True` | Grammar + subject calls run in parallel, cutting response time ~50% |
| `response_format={"type":"json_object"}` | Forces GPT to return valid JSON — eliminates parse failures |
| Module-level `AsyncOpenAI` singleton | Prevents connection pool exhaustion from creating new clients per request |
| `pydantic-settings` | Type-safe, validated config from `.env` with zero boilerplate |
| Lifespan context manager | FastAPI ≥ 0.93 modern startup/shutdown pattern |

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/c8298176-d21f-4213-8b50-848b63dfacd2

## Project Structure

```text
healthcare system/
├── frontend/    # React + Vite + Express UI application
└── backend/     # Python FastAPI backend service
```

## Run Locally

### Frontend (React + Vite)
1. Navigate to the frontend directory:
   `cd frontend`
2. Install dependencies:
   `npm install`
3. Set your environment variables in `frontend/.env` (see `frontend/.env.example`)
4. Run the development server:
   `npm run dev`

### Backend (Python FastAPI)
1. Navigate to the backend directory:
   `cd backend`
2. Set up virtual environment and install requirements:
   `pip install -r requirements.txt`
3. Run FastAPI backend:
   `uvicorn app.main:app --reload`


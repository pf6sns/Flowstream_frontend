# IT Automation Frontend - Backend Integration Guide

## Overview

This frontend application connects to two backend services:
1. **ServiceNow Backend** (Port 8001) - Handles email polling, ServiceNow ticket operations, and workflow automation
2. **Jira Backend** (Port 8000) - Handles Jira issue tracking and auto-assignment

## Setup Instructions

### 1. Configure Environment Variables

Copy the example environment file:
```bash
cp .env.local.example .env.local
```

Update the backend URLs in `.env.local`:
```env
NEXT_PUBLIC_SERVICENOW_BEND_URL=http://localhost:8001
NEXT_PUBLIC_JIRA_BEND_URL=http://localhost:8000
```

### 2. Start Backend Services

#### ServiceNow Backend
```bash
cd ../ServiceNow_Bend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn main:app --reload --port 8001
```

#### Jira Backend
```bash
cd ../Jira_Bend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn main:app --reload --port 8000
```

### 3. Start Frontend
```bash
npm run dev
```

## Features

### Real-Time Data Fetching

The frontend now fetches **real data** from:

1. **ServiceNow Tickets**
   - Endpoint: `http://localhost:8001/servicenow/tickets`
   - Fetches all incidents from your ServiceNow instance
   - Displays ticket number, description, status, priority, category, assignee

2. **Jira Issues**
   - Endpoint: `http://localhost:8000/jira/issues`
   - Fetches all issues from your Jira project
   - Displays issue key, summary, status, priority, assignee

3. **Email-Triggered Workflows**
   - The ServiceNow backend polls Gmail every minute
   - Automatically creates tickets and Jira issues from emails
   - Frontend can trigger manual sync via "Sync Emails & Start Workflows" button

### Sync Functionality

#### Sync Old Tickets
Click "Sync Old Tickets" on the Tickets page to:
- Fetch all existing tickets from ServiceNow
- Fetch all existing issues from Jira
- Import them into the local database
- Display them in the tickets table

#### Sync Emails
Click "Sync Emails & Start Workflows" on the Workflows page to:
- Trigger the ServiceNow backend to check Gmail
- Process any new emails
- Create tickets and workflows automatically

## API Endpoints

### ServiceNow Backend (Port 8001)

- `GET /servicenow/tickets` - Get all tickets
- `GET /servicenow/tickets/{ticket_number}` - Get specific ticket
- `POST /trigger-manual` - Manually trigger email check and workflow
- `GET /health` - Health check

### Jira Backend (Port 8000)

- `GET /jira/issues` - Get all issues
- `GET /jira/issues/{issue_key}` - Get specific issue
- `POST /jira/auto-assign` - Create and auto-assign new issue
- `GET /health` - Health check

## Troubleshooting

### Backend Not Responding
1. Ensure both backend services are running
2. Check the ports are correct (8001 for ServiceNow, 8000 for Jira)
3. Verify `.env.local` has the correct URLs

### No Data Showing
1. Click "Sync Old Tickets" to import existing data
2. Check backend logs for errors
3. Verify ServiceNow and Jira credentials in backend `.env` files

### CORS Errors
The backend services should have CORS enabled. If you see CORS errors, add this to the backend main.py:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Architecture

```
Frontend (Next.js - Port 3000)
    ↓
    ├─→ ServiceNow Backend (FastAPI - Port 8001)
    │       ├─→ Gmail API (Email polling)
    │       ├─→ ServiceNow API (Ticket management)
    │       └─→ Groq AI (Email classification)
    │
    └─→ Jira Backend (FastAPI - Port 8000)
            └─→ Jira API (Issue management)
```

All data flows through the backend services to ensure proper authentication and security.

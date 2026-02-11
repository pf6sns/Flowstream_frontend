# OrchestrAI SaaS - Setup Guide

## ✅ What's Been Created

### 1. **Tailwind Configuration**
- ✅ Brand colors configured in `tailwind.config.ts`
- ✅ Colors: B50, B75, B100, B200, Primary (#0065ff), B400, B500
- ✅ Text color: #242424

### 2. **Database Setup**
- ✅ MongoDB connection utility (`lib/mongodb.ts`)
- ✅ Database models/types (`lib/db/models.ts`)
- ✅ Collections helper (`lib/db/collections.ts`)
- ✅ Encryption utility for sensitive data (`lib/encryption.ts`)

### 3. **Authentication**
- ✅ JWT token generation/verification (`lib/auth.ts`)
- ✅ Login API route (`app/api/auth/login/route.ts`)
- ✅ Register API route (`app/api/auth/register/route.ts`)
- ✅ Logout API route (`app/api/auth/logout/route.ts`)
- ✅ Login page (`app/login/page.tsx`)

### 4. **API Routes**
- ✅ Companies API (`app/api/companies/route.ts`)
- ✅ Integrations API (`app/api/integrations/route.ts`)
- ✅ Workflows API (`app/api/workflows/route.ts`)

### 5. **Frontend Pages**
- ✅ Dashboard layout with sidebar (`app/dashboard/layout.tsx`)
- ✅ Dashboard home page (`app/dashboard/page.tsx`)
- ✅ Login page (`app/login/page.tsx`)

### 6. **Components**
- ✅ Button component (`components/ui/Button.tsx`)
- ✅ Card component (`components/ui/Card.tsx`)
- ✅ Sidebar component (`components/layout/Sidebar.tsx`)

### 7. **Utilities**
- ✅ Utility functions (`lib/utils.ts`)

## 📋 Next Steps to Complete

### Immediate Setup:
1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Environment Variables**
   - Copy `.env.example` to `.env.local`
   - Add your MongoDB connection string
   - Generate JWT_SECRET and ENCRYPTION_KEY

3. **Set Up MongoDB**
   - Create MongoDB database
   - Collections will be created automatically on first use

### Pages to Create:
1. **Landing Page** (`app/page.tsx`)
   - Update existing page with OrchestrAI branding
   - Add "Request Demo" form

2. **Onboarding Wizard** (`app/onboarding/page.tsx`)
   - Multi-step form for company setup
   - Integration configuration steps

3. **Dashboard Pages:**
   - `app/dashboard/workflows/page.tsx` - Workflows list
   - `app/dashboard/workflows/[id]/page.tsx` - Workflow detail
   - `app/dashboard/tickets/page.tsx` - Tickets list
   - `app/dashboard/integrations/page.tsx` - Integrations setup
   - `app/dashboard/settings/page.tsx` - Settings

### Components to Create:
1. **UI Components:**
   - Input.tsx
   - Select.tsx
   - Modal.tsx
   - Toast.tsx
   - Loading.tsx

2. **Dashboard Components:**
   - StatsCard.tsx
   - WorkflowVisualizer.tsx
   - ActivityTimeline.tsx
   - IntegrationCard.tsx
   - ConnectionTest.tsx

3. **Layout Components:**
   - Header.tsx (with user menu)
   - Footer.tsx

### Features to Implement:
1. **Real-time Updates**
   - WebSocket or Server-Sent Events for workflow updates
   - Live dashboard refresh

2. **Integration Testing**
   - Test connection buttons for each integration
   - Status indicators

3. **Workflow Visualization**
   - Interactive flow diagram
   - Step-by-step progress tracking

4. **Activity Logging**
   - Track all user actions
   - Display in activity feed

## 🎨 Design System

### Colors (Tailwind Classes):
- `bg-brand` / `text-brand` - Primary brand color
- `bg-brand-50` - Light background
- `bg-brand-100` - Secondary buttons
- `bg-brand-200` - Active states
- `bg-brand-400` - Hover states
- `bg-brand-500` - Dark mode primary
- `text-text` - Primary text color

### Usage Example:
```tsx
<button className="bg-brand text-white hover:bg-brand-400">
  Click me
</button>
```

## 🔗 Integration with Backend Services

The frontend will communicate with:
- **ServiceNow_Bend**: `http://localhost:8001`
- **Jira_Bend**: `http://localhost:8000`

These URLs should be configured in `.env.local`:
```
NEXT_PUBLIC_SERVICENOW_BEND_URL=http://localhost:8001
NEXT_PUBLIC_JIRA_BEND_URL=http://localhost:8000
```

## 📝 Database Collections

The following collections will be created automatically:
- `companies`
- `users`
- `company_integrations`
- `workflows`
- `tickets`
- `activity_logs`

## 🔐 Security Notes

1. **Encryption Key**: Generate a secure 32-byte hex key for encryption
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **JWT Secret**: Use a strong random string for JWT_SECRET

3. **MongoDB**: Use connection string with authentication
   ```
   MONGODB_URI=mongodb://username:password@host:port/database
   ```

## 🚀 Running the Application

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

The application will be available at `http://localhost:3000`

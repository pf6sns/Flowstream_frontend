# OrchestrAI SaaS Application - File Structure

## 📁 Project Structure

```
it_frontend/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes (Backend)
│   │   ├── auth/
│   │   │   ├── login/route.ts   # POST /api/auth/login
│   │   │   └── register/route.ts # POST /api/auth/register
│   │   ├── companies/
│   │   │   └── route.ts         # GET/POST /api/companies
│   │   ├── integrations/
│   │   │   └── route.ts         # GET/POST /api/integrations
│   │   └── workflows/
│   │       └── route.ts         # GET /api/workflows
│   ├── dashboard/                # Protected dashboard pages
│   │   ├── layout.tsx            # Dashboard layout with sidebar
│   │   ├── page.tsx              # Main dashboard
│   │   ├── workflows/
│   │   │   └── page.tsx          # Workflows list page
│   │   ├── tickets/
│   │   │   └── page.tsx          # Tickets page
│   │   ├── integrations/
│   │   │   └── page.tsx          # Integrations setup page
│   │   └── settings/
│   │       └── page.tsx           # Settings page
│   ├── login/
│   │   └── page.tsx               # Login page
│   ├── onboarding/
│   │   └── page.tsx               # Onboarding wizard
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Landing page (home)
│   └── globals.css                # Global styles + Tailwind
│
├── components/                    # React components
│   ├── ui/                        # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── ...
│   ├── layout/                    # Layout components
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── dashboard/                 # Dashboard-specific components
│   │   ├── StatsCard.tsx
│   │   ├── WorkflowVisualizer.tsx
│   │   └── ActivityTimeline.tsx
│   └── integrations/              # Integration components
│       ├── IntegrationCard.tsx
│       └── ConnectionTest.tsx
│
├── lib/                           # Utility libraries
│   ├── mongodb.ts                 # MongoDB connection
│   ├── auth.ts                    # Authentication utilities
│   ├── encryption.ts              # Encryption for sensitive data
│   └── db/                        # Database utilities
│       ├── models.ts              # TypeScript interfaces
│       └── collections.ts        # MongoDB collections helper
│
├── public/                        # Static assets
│   ├── images/
│   └── icons/
│
├── .env.local                     # Environment variables (not in git)
├── .env.example                   # Example env file
├── tailwind.config.ts             # Tailwind configuration
├── next.config.ts                 # Next.js configuration
├── tsconfig.json                  # TypeScript configuration
└── package.json                   # Dependencies
```

## 🎨 Color Scheme

The application uses the following brand colors (defined in `tailwind.config.ts`):

| Token       | Hex       | Usage                          |
| ----------- | --------- | ------------------------------ |
| **B50**     | `#e6f0ff` | Background / hover light       |
| **B75**     | `#96c0ff` | Soft highlight / badges        |
| **B100**    | `#6ba6ff` | Secondary buttons              |
| **B200**    | `#2b7fff` | Active state / links           |
| **Primary** | `#0065ff` | Main brand button              |
| **B400**    | `#0047b3` | Hover primary                  |
| **B500**    | `#003e9c` | Pressed / dark mode primary    |
| **Text**    | `#242424` | Primary text color             |

## 🗄️ Database Schema

### Collections:

1. **companies** - Company information
2. **users** - User accounts (admin/hr/viewer)
3. **company_integrations** - Encrypted integration credentials
4. **workflows** - Workflow execution records
5. **tickets** - Ticket information
6. **activity_logs** - Activity tracking

## 🔐 Security

- **JWT Authentication**: Tokens stored in httpOnly cookies
- **Password Hashing**: bcryptjs with salt rounds
- **Data Encryption**: AES-256-CBC for sensitive credentials
- **Role-Based Access**: admin, hr, viewer roles

## 🚀 Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your MongoDB URI and secrets
```

3. Run development server:
```bash
npm run dev
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Companies
- `GET /api/companies` - Get companies
- `POST /api/companies` - Create company

### Integrations
- `GET /api/integrations` - Get integrations
- `POST /api/integrations` - Create/update integration

### Workflows
- `GET /api/workflows` - Get workflows with filters

## 🎯 Next Steps

1. Create remaining dashboard pages
2. Implement workflow visualization
3. Add real-time updates (WebSocket/SSE)
4. Create onboarding wizard
5. Add integration testing pages
6. Implement activity logging
7. Add analytics/reporting

# Complete File Structure

```
it_frontend/
│
├── 📁 app/                                    # Next.js App Router
│   ├── 📁 api/                                # Backend API Routes
│   │   ├── 📁 auth/
│   │   │   ├── 📁 login/
│   │   │   │   └── route.ts                  ✅ POST /api/auth/login
│   │   │   ├── 📁 register/
│   │   │   │   └── route.ts                  ✅ POST /api/auth/register
│   │   │   └── 📁 logout/
│   │   │       └── route.ts                  ✅ POST /api/auth/logout
│   │   ├── 📁 companies/
│   │   │   └── route.ts                      ✅ GET/POST /api/companies
│   │   ├── 📁 integrations/
│   │   │   └── route.ts                      ✅ GET/POST /api/integrations
│   │   └── 📁 workflows/
│   │       └── route.ts                      ✅ GET /api/workflows
│   │
│   ├── 📁 dashboard/                          # Protected Dashboard Pages
│   │   ├── layout.tsx                        ✅ Dashboard layout with sidebar
│   │   ├── page.tsx                          ✅ Main dashboard (home)
│   │   ├── 📁 workflows/                     # ⏳ To be created
│   │   │   ├── page.tsx                      # Workflows list
│   │   │   └── 📁 [id]/
│   │   │       └── page.tsx                  # Workflow detail
│   │   ├── 📁 tickets/                       # ⏳ To be created
│   │   │   └── page.tsx                      # Tickets list
│   │   ├── 📁 integrations/                 # ⏳ To be created
│   │   │   └── page.tsx                      # Integrations setup
│   │   └── 📁 settings/                      # ⏳ To be created
│   │       └── page.tsx                      # Settings page
│   │
│   ├── 📁 login/
│   │   └── page.tsx                          ✅ Login page
│   │
│   ├── 📁 onboarding/                        # ⏳ To be created
│   │   └── page.tsx                          # Onboarding wizard
│   │
│   ├── layout.tsx                             ✅ Root layout
│   ├── page.tsx                              ⏳ Landing page (needs update)
│   └── globals.css                           ✅ Global styles + Tailwind config
│
├── 📁 components/                             # React Components
│   ├── 📁 ui/                                # Reusable UI Components
│   │   ├── Button.tsx                        ✅ Button component
│   │   ├── Card.tsx                          ✅ Card component
│   │   ├── Input.tsx                         # ⏳ To be created
│   │   ├── Select.tsx                        # ⏳ To be created
│   │   ├── Modal.tsx                         # ⏳ To be created
│   │   └── Toast.tsx                         # ⏳ To be created
│   │
│   ├── 📁 layout/                            # Layout Components
│   │   ├── Sidebar.tsx                       ✅ Sidebar navigation
│   │   ├── Header.tsx                        # ⏳ To be created
│   │   └── Footer.tsx                        # ⏳ To be created
│   │
│   ├── 📁 dashboard/                         # Dashboard Components
│   │   ├── StatsCard.tsx                     # ⏳ To be created
│   │   ├── WorkflowVisualizer.tsx            # ⏳ To be created
│   │   └── ActivityTimeline.tsx              # ⏳ To be created
│   │
│   └── 📁 integrations/                      # Integration Components
│       ├── IntegrationCard.tsx               # ⏳ To be created
│       └── ConnectionTest.tsx                 # ⏳ To be created
│
├── 📁 lib/                                    # Utility Libraries
│   ├── mongodb.ts                             ✅ MongoDB connection
│   ├── auth.ts                                ✅ JWT & password utilities
│   ├── encryption.ts                          ✅ Encryption utilities
│   ├── utils.ts                               ✅ General utilities
│   └── 📁 db/                                 # Database Utilities
│       ├── models.ts                          ✅ TypeScript interfaces
│       └── collections.ts                     ✅ MongoDB collections helper
│
├── 📁 public/                                 # Static Assets
│   ├── 📁 images/                            # ⏳ Add images
│   └── 📁 icons/                             # ⏳ Add icons
│
├── .env.local                                 # ⏳ Create from .env.example
├── .env.example                               ✅ Example env file
├── tailwind.config.ts                         ✅ Tailwind config with brand colors
├── next.config.ts                             ✅ Next.js config
├── tsconfig.json                              ✅ TypeScript config
├── package.json                               ✅ Updated with dependencies
├── STRUCTURE.md                               ✅ Structure documentation
├── README_SETUP.md                            ✅ Setup guide
└── FILE_STRUCTURE.md                          ✅ This file

```

## Legend
- ✅ = Created and ready
- ⏳ = To be created/implemented

## Color Usage in Tailwind

All brand colors are available as Tailwind classes:

```tsx
// Backgrounds
<div className="bg-brand">Primary button</div>
<div className="bg-brand-50">Light background</div>
<div className="bg-brand-100">Secondary button</div>
<div className="bg-brand-200">Active state</div>
<div className="bg-brand-400">Hover state</div>
<div className="bg-brand-500">Dark mode</div>

// Text
<p className="text-brand">Brand colored text</p>
<p className="text-text">Primary text</p>

// Borders
<div className="border-brand">Brand border</div>
```

## Database Collections

Collections are created automatically when first used:
- `companies` - Company information
- `users` - User accounts
- `company_integrations` - Encrypted integration configs
- `workflows` - Workflow execution records
- `tickets` - Ticket information
- `activity_logs` - Activity tracking

## Next Steps

1. Run `npm install` to install dependencies
2. Create `.env.local` from `.env.example`
3. Set up MongoDB connection
4. Start building remaining pages and components

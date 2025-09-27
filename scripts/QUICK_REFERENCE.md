# Quick Reference Card

Fast access to common commands and information.

## 🚀 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Run linter
npm run lint
```

## 🧪 Testing Commands

```bash
# Run all Playwright tests
npm run test

# Run with UI (interactive)
npm run test:ui

# Debug mode
npm run test:debug
```

## 🐳 Docker Commands

```bash
# Build Docker image
npm run docker:build

# Run container
npm run docker:run

# Start with docker-compose
npm run docker:up

# Stop docker-compose
npm run docker:down
```

## 🗄️ Database Commands

```bash
# Setup guide
npm run db:setup

# View full setup instructions
npm run db:help

# Migration reminder
npm run db:migrate

# Seed exercises reminder
npm run db:seed-exercises

# Seed sample data reminder
npm run db:seed-data
```

## 📁 Important Files

| File | Purpose |
|------|---------|
| `.env.local` | Your environment variables (not in git) |
| `.env.example` | Template for environment variables |
| `supabase/migrations/001_initial_schema.sql` | Main database schema |
| `scripts/seed-exercises.sql` | 13 sciatica exercises |
| `scripts/seed-sample-data.sql` | Sample data for testing |
| `scripts/SUPABASE_SETUP_GUIDE.md` | Detailed Supabase setup |

## 🔗 Quick Links

### Local
- App: http://localhost:3000
- Dashboard: http://localhost:3000/dashboard

### Supabase
- Dashboard: https://app.supabase.com
- SQL Editor: https://app.supabase.com/project/YOUR_PROJECT/sql
- Table Editor: https://app.supabase.com/project/YOUR_PROJECT/editor
- Storage: https://app.supabase.com/project/YOUR_PROJECT/storage/buckets

### Documentation
- Next.js: https://nextjs.org/docs
- Tailwind: https://tailwindcss.com/docs
- Supabase: https://supabase.com/docs
- OpenAI: https://platform.openai.com/docs

## 📊 Database Tables

```sql
-- Core tracking
daily_logs          -- Pain, energy, mood
exercise_sessions   -- Workout history
alcohol_logs        -- Drinks tracking
spending_logs       -- Financial tracking
goals              -- Goal management

-- Reference data
exercises          -- Exercise library
health_profile     -- User health info

-- AI features
patterns           -- AI-discovered patterns
insights           -- Recommendations
interventions      -- Predictive alerts
coach_conversations -- AI chat history

-- Related
goal_sessions      -- Work tracking
```

## 🎨 Component Structure

```
components/
├── ui/               # Reusable UI (7 components)
│   ├── premium-card.tsx
│   ├── metric-display.tsx
│   ├── progress-ring.tsx
│   ├── button.tsx
│   ├── slider.tsx
│   ├── input.tsx
│   └── skeleton.tsx
├── dashboard/        # Dashboard specific
├── exercises/        # Exercise components
├── tracking/         # Tracking components
├── charts/           # Data visualization
└── ai/              # AI components
```

## 🎯 Next Development Tasks

### Phase 2 - Core Tracking
- [ ] Pain tracking module
- [ ] Exercise player with timer
- [ ] Alcohol logging
- [ ] Spending tracker
- [ ] Goals management

### Phase 3 - AI Integration
- [ ] OpenAI setup
- [ ] Exercise generation
- [ ] Pattern analysis
- [ ] AI coach chat
- [ ] Predictive interventions

## 🐛 Common Issues & Solutions

### Port 3000 in use
```bash
PORT=3001 npm run dev
```

### Environment variables not working
```bash
# Check file exists
ls .env.local

# Restart dev server
npm run dev
```

### Database connection issues
1. Check Supabase project is active
2. Verify credentials in `.env.local`
3. Make sure migration has been run

### Build errors
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

## 📈 Project Status

**Current Phase**: 1 ✅ Complete
**Next Phase**: 2 🚧 Ready to start

**Phase 1 Complete:**
- ✅ Project setup
- ✅ Design system
- ✅ Core UI components (7)
- ✅ Database schema
- ✅ Dashboard page
- ✅ Docker & Playwright
- ✅ Comprehensive docs

**Ready to Use:**
- Full development environment
- Database schema with migrations
- Sample data scripts
- Testing infrastructure
- Deployment configuration

## 🎓 Learning Resources

### Tutorials
- [Next.js App Router](https://nextjs.org/docs/app)
- [Tailwind CSS](https://tailwindcss.com/docs/utility-first)
- [Supabase Quick Start](https://supabase.com/docs/guides/getting-started)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

### Key Concepts
- **Server Components**: Default in Next.js 14
- **Client Components**: Use `'use client'` directive
- **RLS**: Row Level Security in Supabase
- **Zustand**: Simple state management
- **TanStack Query**: Server state caching

## 💡 Pro Tips

1. **Use TypeScript**: All types are defined in `lib/types.ts`
2. **Reuse Components**: Check `components/ui/` first
3. **Follow PRD**: Detailed specs in `prd.md`
4. **Test Often**: Use `npm run test:ui` for visual testing
5. **Check Logs**: Use `console.log` or Vercel/Supabase dashboards
6. **Git Commit Often**: Small, focused commits are best

## 🆘 Get Help

### Documentation
- `README.md` - Main documentation
- `QUICK_START.md` - 5-minute setup
- `PROJECT_SUMMARY.md` - Complete overview
- `DEVELOPMENT_CHECKLIST.md` - Task tracking
- `scripts/SUPABASE_SETUP_GUIDE.md` - Database setup

### Community
- Supabase Discord: https://discord.supabase.com
- Next.js Discord: https://nextjs.org/discord

---

**Quick Tip**: Bookmark this file for fast reference! 📖
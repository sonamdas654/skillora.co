# Skilloura — Smart Digital Services, Delivered with Skill.

Full-stack personal digital agency website built from the Skilloura master blueprint.
Next.js 16 + TypeScript + Tailwind v4 + Framer Motion + React Three Fiber (3D hero) +
Prisma (SQLite dev / PostgreSQL prod) + JWT admin auth.

## Run locally

```bash
npm install
npx prisma db push   # creates prisma/dev.db
npm run dev          # http://localhost:3000
```

## Admin dashboard

- URL: http://localhost:3000/admin
- Login: values of `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`
  (default: sonamdasdj00@gmail.com / Skilloura@2026 — **change password before launch**)
- The admin user is auto-created on first login.

## Before going live (must change)

1. `NEXT_PUBLIC_WHATSAPP_NUMBER` in `.env` — your real WhatsApp number (e.g. 919876543210)
2. `ADMIN_PASSWORD` and `JWT_SECRET` — strong values
3. `NEXT_PUBLIC_SITE_URL` — https://skilloura.com
4. `RESEND_API_KEY` + `EMAIL_FROM` — for real email notifications (free at resend.com);
   without it, emails are logged to server console only
5. Database — switch `prisma/schema.prisma` provider to `postgresql` and set
   `DATABASE_URL` (Neon/Supabase free tier works), then `npx prisma db push`
6. File storage — `uploads/` folder works on a VPS; on Vercel use S3/Cloudinary

## Structure

- `lib/services.ts` — all 9 service categories, packages, dynamic form fields (edit prices here)
- `lib/portfolio.ts` — demo projects (replace with real client work as it completes)
- `lib/blog.ts` — blog articles
- `lib/policies.ts` — 5 policy pages content
- `app/start-project` — 6-step smart requirement form
- `app/admin` — lead management dashboard
- `prisma/schema.prisma` — full business schema (leads, quotes, invoices, projects…)

## Client flow

Visitor → service page → smart form (service-wise questions) → files upload →
lead scored (High/Medium/Low) → admin email + client confirmation → WhatsApp follow-up →
admin dashboard: status, notes, files, filters.

<!-- auto-deploy test 2026-07-07 -->

# Daily Group Report

Mobile-first field visit tracker. Log customers, start one report per day, and record how much money was taken and left with each visit.

## Stack

Vite, React, TypeScript, Tailwind CSS, shadcn/ui, React Router, TanStack Query, Supabase, react-hook-form, Zod.

## Run locally

```bash
npm install
cp .env.example .env
# set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY
npm run dev
```

The app expects an existing Supabase project with `profiles`, `customers`, `daily_reports`, `visits`, and `settings` tables plus RLS. Sign in with email/password (`signInWithPassword`). There is no sign-up screen. Create the user in the Supabase dashboard.

## Language

Arabic and Kurdish (Sorani / کوردی). Switch on the login screen or in Settings. The UI is right-to-left.

## Add to iPhone / Android home screen

Open the app in the phone browser (Safari on iPhone, Chrome on Android):

- **iPhone:** Share → Add to Home Screen
- **Android:** menu ⋮ → Add to Home screen / Install app

HTTPS (or localhost) is required for install. Settings also shows these steps.

## IQD amounts

When base currency is IQD, amount fields accept leading digits only and show a fixed `,000` suffix. Typing `100` stores `100000` and displays `100,000 IQD`.

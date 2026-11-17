# aio-cus

Expo and React Native starter app using TypeScript, Expo Router, and a light/dark theme.

## Requirements

- Node.js LTS
- npm
- Expo Go on a device, or an iOS Simulator / Android Emulator

## Getting started

```sh
npm install
npm start
```

Scan the QR code with Expo Go, or press `i` / `a` in the terminal to open an available simulator or emulator. You can also run the platform-specific scripts:

```sh
npm run ios
npm run android
npm run web
```

## Checks

```sh
npm run lint
npm run typecheck
```

## Project structure

- `app/` — Expo Router routes, layouts, tabs, and modal
- `components/` — reusable themed UI and hooks
- `constants/` — shared app constants such as theme colors
- `assets/` — app icons, splash art, and fonts
- `database/` — SQL functions used by Supabase RPC calls
- `app.json` — Expo app identity and platform configuration

Add native dependencies with `npx expo install <package>` to select a version compatible with the installed Expo SDK.

## Supabase Google sign-in

Create a `.env.local` file in the project root and set your Supabase project URL and anon key:

```sh
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

In the Supabase Dashboard, enable Google under **Authentication → Providers** and configure the Google OAuth client. Add `aiocus://login` to the Supabase **Authentication → URL Configuration → Redirect URLs** allow list for native sign-in. For web, also allow the local app URL (for example, `http://localhost:8081/**`) and your deployed app URL. Configure the Supabase callback URL shown in the Google provider settings in your Google OAuth client.

The login screen uses Supabase Auth's Google OAuth flow and restores its persisted session. If **Allow new users to sign up** is disabled, users whose Google account has not already been registered see a message asking them to contact an administrator. Restart Expo after changing environment variables.

## Supabase order summaries

The dashboard loads the selected sender's order counts with one Supabase RPC call. Before using the summary cards, run [`database/sender-order-stats.sql`](./database/sender-order-stats.sql) in the Supabase SQL Editor.

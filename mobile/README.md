# Maple app (React Native + Expo)

One app for Android, iOS and web. Each role signs in to its own home:
students get **My Learning**, teachers **My Classroom**, parents **My Children**,
school leaders the **School Command Centre** and Maple staff the **Platform
Command Centre**.

The app talks only to the Go API (`../api`). Screens for modules still served by
Django call the same `/api/v1/...` paths, and the Go service forwards them.

## What works now

- Sign in with email and password (existing Maple accounts work unchanged)
- The session survives restarts: the refresh token is kept in the iOS Keychain /
  Android Keystore (`expo-secure-store`), and in the tab's session storage on web
- Expired access tokens refresh automatically, once, even with several requests in flight
- Signing out revokes the refresh token on the server
- Role-based home with the user's schools, and, for parents, only children whose
  guardian link the school has approved

## Layout

```
src/app/                 routes (Expo Router)
  _layout.tsx            providers + guards: signed-out users only see sign-in
  sign-in.tsx
  (app)/                 signed-in screens
src/lib/api/             typed client; schema.d.ts is generated from ../openapi/maple.yaml
src/lib/auth/            session (tokens, refresh), secure token storage, auth context
src/lib/roles.ts         what each role sees first
src/constants/theme.ts   colours and spacing tokens (light and dark)
```

## Running locally

Start Django and the Go API first (see `../api/README.md`), then:

```bash
cd mobile
npm install
npx expo start          # press w for web, or open in a development build
```

The app calls `http://localhost:8080` by default. On a phone, set
`EXPO_PUBLIC_API_URL` to your computer's address, for example
`EXPO_PUBLIC_API_URL=http://192.168.1.20:8080 npx expo start`, and add the
app's web origin to the API's `CORS_ORIGINS` if you use web.

## Checks

```bash
npm test             # Jest
npm run typecheck    # TypeScript
npx expo lint
npm run api:types    # regenerate src/lib/api/schema.d.ts after changing the OpenAPI file
```

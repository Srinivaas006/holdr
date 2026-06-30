# Vaultbox

A personal file vault built with React, Firebase, and Supabase. Sign up,
log in, upload files, download them, delete them. Files are organised
into per-user folders.

Auth and file metadata run on Firebase (Auth + Firestore). The actual
file bytes are stored on Supabase Storage, because Firebase Cloud
Storage now requires a paid Blaze plan with a card on file, even for
free-tier usage. Supabase Storage stays free with no card.

## 1. Create a Firebase project (Auth + Firestore)

1. Go to https://console.firebase.google.com and create a new project.
2. Authentication -> Sign-in method -> enable Email/Password.
3. Firestore Database -> Create database -> start in test mode for now.
4. Project settings -> Add app -> Web -> copy the config values.

## 2. Create a Supabase project (Storage)

1. Go to https://supabase.com and create a free account, no card needed.
2. Create a new project, pick a region close to you, set a database
   password (you won't need it for this app, Supabase asks anyway).
3. Project Settings -> API -> copy the Project URL and the anon public
   key.
4. SQL Editor -> paste the contents of `supabase_storage_policies.sql`
   from this project and run it. This creates the storage bucket and
   the access rules for it.

## 3. Configure the project

Copy `.env.example` to `.env` and fill in the Firebase values from step 1
and the Supabase values from step 2:

```
cp .env.example .env
```

## 4. Install and run

```
npm install
npm run dev
```

Open the printed localhost address. Create an account, log in, and try
uploading a file.

## 5. Lock down Firestore rules

Once it works, replace the default test-mode rules with the ones already
written for you in `firestore.rules`. In the Firebase console, paste its
contents into Firestore Database -> Rules and publish. This is what
keeps one user's file records invisible to another user.

## 6. Deploy

```
npm run build
firebase deploy
```

You'll get a free `yourproject.web.app` link. Supabase needs no
deployment step, it's already a hosted service.

## A note on storage access control

Supabase's row-level security normally checks `auth.uid()`, which is
tied to a Supabase-issued login. This project authenticates through
Firebase instead, so Supabase has no way to know which Firebase user is
making a request. The policies in `supabase_storage_policies.sql` open
the bucket to any request carrying the anon key, and rely on the app
itself, through Firestore's rules, to only ever show or link to files
that belong to the signed-in user. This is fine for a student project
or demo. For a production system, the proper fix is to mint a Supabase-
compatible JWT from a small backend function after Firebase login, so
Supabase's own RLS can check identity directly.

## Project layout

```
src/
  firebase/config.js       Firebase initialization, Auth + Firestore
  supabase/config.js       Supabase client, used for Storage only
  context/AuthContext.jsx  Sign up, log in, log out, current user
  utils/storageHelpers.js  Upload, list, delete, format file sizes
  utils/otpAuth.js         Placeholder for email OTP login, wire up later
  pages/Landing.jsx        Public homepage
  pages/Login.jsx          Email and password login
  pages/Signup.jsx         Email and password signup
  pages/Dashboard.jsx      The vault itself
  components/              Navbar, upload zone, file list, file row
  styles/                  Plain CSS, no framework
```

## Adding OTP login later

`src/utils/otpAuth.js` has two empty functions, `sendOtp` and `verifyOtp`,
ready for you to wire up to a backend or a Cloud Function that emails a
one-time code and checks it against what the user types in.

## Notes

- No credit card is required anywhere in this setup.
- Supabase free tier covers 1 GB storage and 2 GB bandwidth a month,
  which is far more than a student project will use.
- Firebase Auth and Firestore stay on the no-card Spark plan; only
  Cloud Storage was the part that started requiring billing.

---
description: Complete Firebase Setup Guide for Book Exchange App
---

# Firebase Setup Guide

Follow these steps to fully configure Firebase for your application.

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and name it `book-exchange` (or similar).
3. Disable Google Analytics (optional, for simplicity).
4. Click **Create project**.

## 2. Register Web App

1. In the Project Overview, click the **Web** icon (`</>`).
2. Register app with nickname `Book Exchange Web`.
3. **Copy the `firebaseConfig` object keys** (apiKey, authDomain, etc.) and paste them into your `.env.local` file:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   ```

## 3. Enable Authentication

1. Go to **Build > Authentication**.
2. Click **Get Started**.
3. Select **Email/Password** provider.
4. Enable **Email/Password** and click **Save**.

## 4. Create Firestore Database

1. Go to **Build > Firestore Database**.
2. Click **Create Database**.
3. Select a location (e.g., `nam5` or closest to you).
4. Start in **Test mode** (we will update rules later).
5. Click **Create**.

## 5. Enable Storage

1. Go to **Build > Storage**.
2. Click **Get Started**.
3. Start in **Test mode**.
4. Click **Done**.

## 6. Configure Storage CORS (Critical for Image Uploads)

You need to allow your app to upload images to the bucket.

1. Open [Google Cloud Console](https://console.cloud.google.com/) for your project.
2. Activate **Cloud Shell** (top right terminal icon).
3. Upload the `cors.json` file from your project root (or create it in the shell):
   ```json
   [
     {
       "origin": [
         "http://localhost:3000",
         "https://your-production-domain.com"
       ],
       "method": ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"],
       "responseHeader": [
         "Content-Type",
         "Authorization",
         "Content-Length",
         "User-Agent",
         "x-goog-resumable"
       ],
       "maxAgeSeconds": 3600
     }
   ]
   ```
4. Run this command in Cloud Shell (replace `YOUR_BUCKET_NAME` with the one from Storage tab, e.g., `project-id.firebasestorage.app`):
   ```bash
   gsutil cors set cors.json gs://YOUR_BUCKET_NAME
   ```

## 7. Deploy Security Rules (Optional but Recommended)

If you have `firebase-tools` installed (`npm install -g firebase-tools`):

1. Login: `firebase login`
2. Initialize (if not done): `firebase init` (select Firestore and Storage, use existing files).
3. Deploy rules:
   ```bash
   firebase deploy --only firestore:rules,storage
   ```

Alternatively, copy the content of `firestore.rules` and `storage.rules` from your project and paste them into the **Rules** tab of Firestore and Storage in the Console.

## 8. Verify Setup

1. Run your app: `npm run dev`.
2. Go to `/signup` and create an account.
3. Check Firestore **users** collection to see the new document.

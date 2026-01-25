# Book Exchange App

A modern, PWA-enabled platform for buying, selling, and exchanging used books. Built with Next.js, Firebase, and Tailwind CSS.

## Features

- **Browse & Search**: Explore a wide collection of pre-loved books.
- **Buy & Sell**: List your old books and buy new ones with a credit-based system.
- **PWA Support**: Install the app on your device for a native-like experience.
- **Swipe Navigation**: Smooth gestures to navigate between Home, Explore, Dashboard, and Account.
- **Admin Dashboard**: Manage users, approve listings, and monitor platform stats.
- **Responsive Design**: Optimized for both mobile and desktop.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Firebase (Auth, Firestore, Storage, Messaging)
- **PWA**: Custom PWA implementation with Service Workers

## Getting Started

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Saheb142003/Book-Reselling-App.git
   cd Book-Reselling-App
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory and add your Firebase config:

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server:**

   ```bash
   npm run dev
   ```

5. **Open the app:**
   Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

The app is ready to be deployed on Vercel.

1. Push your code to GitHub.
2. Import the project in Vercel.
3. Add the environment variables in the Vercel dashboard.
4. Deploy!

## License

This project is licensed under the MIT License.

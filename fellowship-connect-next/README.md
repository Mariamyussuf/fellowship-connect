This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Database Setup

To set up the Firestore database:

1. **Enable Firestore API**
   Visit [Firestore API enablement page](https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=buccf-connect) and enable the API. Wait 5-10 minutes for changes to propagate.

2. **Initialize database structure:**
   ```bash
   npm run db:init
   ```

3. **Set up roles and permissions:**
   ```bash
   npm run db:setup-roles
   ```

4. **Configure application settings:**
   ```bash
   npm run db:setup-config
   ```

5. **Complete database setup:**
   ```bash
   npm run db:setup
   ```

6. **Seed with sample data (development only):**
   ```bash
   npm run db:seed
   ```

For detailed database setup instructions, see [DATABASE_SETUP.md](docs/DATABASE_SETUP.md).
For next steps after enabling the API, see [NEXT_STEPS.md](docs/NEXT_STEPS.md).

## Environment Variables

Create a `.env.local` file with your Firebase configuration:

```env
# Firebase Configuration (Client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin Configuration (Server-side)
# For development only - in production, set these in Vercel environment variables
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
```

To get the Firebase Admin credentials:
1. Go to Firebase Console > Project Settings > Service Accounts
2. Click "Generate new private key"
3. Copy the private key and client email from the downloaded JSON file

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
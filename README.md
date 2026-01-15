# Split Expense Tracker

A modern, beautiful split expense tracker built with Next.js, Firebase, Tailwind CSS, and Font Awesome.

## Features

- 🎨 **Modern UI** - Beautiful glassmorphism design with vibrant gradients
- 👥 **Group Management** - Create and manage expense groups
- 💰 **Expense Tracking** - Track shared expenses with ease
- 📊 **Balance Calculation** - Automatic balance calculations
- 🔥 **Firebase Backend** - Real-time data synchronization
- 📱 **Responsive Design** - Works perfectly on all devices

## Tech Stack

- **Framework**: Next.js 16 with TypeScript
- **Styling**: Tailwind CSS 4
- **Icons**: Font Awesome
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Firebase project (create one at [Firebase Console](https://console.firebase.google.com/))

### Installation

1. **Clone the repository** (or navigate to the project directory)

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Firebase**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or select an existing one
   - Enable Firestore Database
   - Enable Authentication (Email/Password)
   - Go to Project Settings > General
   - Scroll down to "Your apps" and click the web icon (</>)
   - Register your app and copy the Firebase configuration

4. **Configure environment variables**:
   - Copy `.env.example` to `.env.local`:
     ```bash
     cp .env.example .env.local
     ```
   - Edit `.env.local` and replace the placeholder values with your Firebase configuration:
     ```
     NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
     NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
     ```

5. **Run the development server**:
   ```bash
   npm run dev
   ```

6. **Open your browser** and navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── page.tsx           # Landing page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── lib/                   # Utility functions
│   └── firebase.ts        # Firebase configuration
├── types/                 # TypeScript type definitions
│   └── index.ts          # App types
├── public/               # Static assets
└── .env.example          # Environment variables template
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Firebase Setup

### Firestore Collections

The app uses the following Firestore collections:

- **users** - User profiles
- **groups** - Expense groups
- **expenses** - Individual expenses
- **settlements** - Payment settlements

### Security Rules

Make sure to set up proper Firestore security rules in the Firebase Console.

## Design Features

- **Glassmorphism** - Modern glass-like UI elements
- **Gradient Text** - Eye-catching gradient text effects
- **Smooth Animations** - Floating elements and hover effects
- **Custom Scrollbar** - Styled scrollbar matching the theme
- **Responsive Layout** - Mobile-first design approach

## Next Steps

1. Set up Firebase configuration
2. Create dashboard page for managing groups
3. Implement expense tracking functionality
4. Add user authentication
5. Build settlement calculation logic

## Contributing

Feel free to contribute to this project by submitting issues or pull requests.

## License

MIT License

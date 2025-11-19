# Blacklist Management System

A modern, responsive web application for managing blacklist entries with agency approval workflow. Built with React, TypeScript, Firebase, and Tailwind CSS.

## Features

- 🔐 **Authentication System**
  - Email/password authentication via Firebase Auth
  - Role-based access control (Admin & Agency)
  - Separate admin login with password protection

- 👥 **Agency Management**
  - Agency registration with approval workflow
  - Admin dashboard to approve/reject agencies
  - Agency profile pages

- 📋 **Blacklist Management**
  - Search blacklist entries by name or ID
  - Add new blacklist entries with document uploads
  - Detailed entry views with all information
  - Document storage via Firebase Storage

- 🎨 **Modern UI/UX**
  - Fully responsive design (mobile-first)
  - Clean and modern interface with Tailwind CSS
  - Loading states and error handling
  - Intuitive navigation

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Forms**: React Hook Form
- **Backend**: Firebase (Auth, Firestore, Storage)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password), Firestore Database, and Storage
3. Copy your Firebase config and update `src/services/firebase.ts`

### 3. Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    match /agencies/{agencyId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    match /blacklist/{entryId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
  }
}
```

### 4. Create Admin User

1. Sign up as an agency
2. In Firebase Console > Firestore, find the user document
3. Change `role` from `'agency'` to `'admin'`

**Admin Login Code**: `ADMIN2025` (configurable in `src/pages/AdminLoginPage.tsx`)

### 5. Run the App

```bash
npm run dev
```

## Project Structure

```
src/
├── components/       # Reusable UI components
├── contexts/         # React contexts (Auth)
├── hooks/           # Custom hooks
├── pages/           # Page components
├── services/        # Firebase services
├── types/           # TypeScript types
└── utils/           # Utility functions
```

## Usage

### For Agencies
1. Sign up and wait for admin approval
2. Search blacklisted individuals by name/ID
3. Add new blacklist entries with documents

### For Admins
1. Login with admin code
2. Approve/reject agency registrations
3. Monitor all blacklist entries

## License

MIT

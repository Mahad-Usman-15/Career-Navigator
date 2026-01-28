# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Career Navigator is a Next.js 16.1.5 application designed to help students and recent graduates with career decision-making through AI-powered recommendations and skill gap analysis. The application collects user data via interactive forms and assessments, then provides personalized career guidance and roadmap suggestions.

## Tech Stack

- **Framework**: Next.js 16.1.5 (App Router)
- **Language**: JavaScript/JSX
- **Styling**: Tailwind CSS with custom CSS variables
- **UI Components**: shadcn/ui with New York styling
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Authentication**: Clerk for Next.js
- **Form Handling**: React Hook Form with Zod validation
- **Charts**: Recharts
- **Date Handling**: date-fns
- **Database**: MongoDB (NoSQL for storing user profiles, test results, and recommendations)

## Project Structure

```
├── app/                      # Next.js App Router structure
│   ├── home/                 # Main home page components
│   ├── layout.js            # Root layout with fonts and global CSS
│   └── page.js              # Main page wrapper
├── components/              # Business logic components
│   ├── ui/                  # Reusable UI components (shadcn/ui)
│   └── navbar.jsx           # Navigation component
├── lib/utils.js             # Utility functions
├── hooks/use-mobile.js      # Mobile detection hook
├── public/                  # Static assets
└── proxy.js                 # Clerk authentication middleware
```

## Key Features

1. **Responsive Navigation**: Mobile-friendly navigation with authentication support
2. **Career Guidance**: Interactive sections for career path recommendations
3. **Skill Gap Analysis**: Comparison tools between user skills and job requirements
4. **Animated UI**: Motion components using Framer Motion
5. **Authentication**: Protected routes using Clerk middleware

## Authentication & Security

- Clerk integration for authentication
- Route protection for `/skills/*` and `/forum/*` routes via `proxy.js`
- Middleware configured in `proxy.js` with route matcher

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint the codebase
npm run lint
```

## Key Files & Configuration

- `package.json`: Contains all dependencies including Clerk, Radix UI, Tailwind CSS, and Framer Motion
- `proxy.js`: Clerk middleware for route protection
- `app/layout.js`: Root layout configuration
- `app/home/page.jsx`: Main page composition
- `components/`: Custom components including navigation, hero section, and feature sections
- `components/ui/`: Reusable UI components based on shadcn/ui

## Styling Approach

- Tailwind CSS with custom theme variables
- CSS custom properties for dark/light mode
- Gradient backgrounds and glassmorphism effects
- Responsive design with mobile-first approach
- Custom animations and transitions via Framer Motion

## Important Notes

- All protected routes are defined in `proxy.js` using `createRouteMatcher`
- The application uses the App Router structure with client-side rendering
- Component library follows shadcn/ui patterns with custom styling
- Animations are implemented using Framer Motion for enhanced UX
- Form handling uses React Hook Form with Zod validation
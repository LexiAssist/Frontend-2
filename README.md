# LexiAssist Frontend

Modern Next.js frontend for the LexiAssist AI-powered learning platform.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **UI Components:** Radix UI + shadcn/ui
- **State Management:** Zustand
- **Data Fetching:** TanStack Query (React Query)
- **Forms:** React Hook Form + Zod
- **Animations:** Framer Motion
- **Icons:** Lucide React

## Features

### Authentication
- ✅ Registration with email verification
- ✅ Login with JWT tokens
- ✅ Automatic token refresh
- ✅ Password reset flow
- ✅ Session management
- ✅ Social login UI (Google, LinkedIn)

### Dashboard
- ✅ Study statistics (streak, time, quizzes, materials)
- ✅ Learning tools grid
- ✅ Quick actions
- ✅ Recent activity
- ✅ Responsive design

### Learning Tools
- ✅ **Chat Assistant:** AI-powered study buddy
- ✅ **Quizzes:** Create, take, and AI-generate quizzes
- ✅ **Flashcards:** Create decks and AI-generate cards
- ✅ **Reading Assistant:** PDF analysis with summaries
- ✅ **Text-to-Speech:** Convert text to audio
- ✅ **Writing Assistant:** Speech-to-text with note generation

### Content Management
- ✅ Courses (CRUD operations)
- ✅ Materials (upload and manage)
- ✅ Quiz attempts and grading
- ✅ Flashcard decks

### Analytics
- ✅ Study streak tracking
- ✅ Study time statistics
- ✅ Quiz performance
- ✅ Topic mastery
- ✅ Learning goals

## Project Structure

```
Frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth pages (login, register, etc.)
│   │   ├── (main)/            # Protected pages (dashboard, features)
│   │   ├── api/               # API routes (proxies to backend)
│   │   └── page.tsx           # Landing page
│   ├── components/            # React components
│   │   ├── ui/                # shadcn/ui components
│   │   ├── auth/              # Auth-specific components
│   │   ├── landing/           # Landing page components
│   │   └── illustrations/     # SVG illustrations
│   ├── hooks/                 # Custom React hooks
│   │   ├── useAuth.ts         # Authentication hooks
│   │   ├── useCourses.ts      # Course management
│   │   ├── useQuizzes.ts      # Quiz management
│   │   ├── useFlashcards.ts   # Flashcard management
│   │   ├── useAI.ts           # AI features
│   │   └── useAnalytics.ts    # Analytics hooks
│   ├── services/              # API service layer
│   │   ├── api.ts             # API functions
│   │   ├── http.ts            # HTTP client (Axios)
│   │   └── mockApi.ts         # Mock data for development
│   ├── store/                 # Zustand stores
│   │   └── authStore.ts       # Authentication state
│   ├── types/                 # TypeScript types
│   │   └── index.ts           # Shared types
│   ├── lib/                   # Utilities
│   │   └── utils.ts           # Helper functions
│   └── env.ts                 # Environment configuration
├── public/                    # Static assets
│   ├── images/                # Images
│   └── icon/                  # Icons (798 SVG files)
├── .env.local                 # Environment variables
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend services running (see root README)

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.local .env.local

# Update environment variables
# Edit .env.local with your backend URL
```

### Environment Variables

Create `.env.local`:

```env
# Backend API Gateway URL
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:8080

# AI Proxy URL (optional, for direct AI service access)
NEXT_PUBLIC_API_PROXY_URL=http://localhost:5005

# Mock Mode (set to 'false' to use real backend)
NEXT_PUBLIC_USE_MOCK_API=false

# Database (for Prisma, if using direct DB access)
DATABASE_URL=postgres://lexiassist:lexiassist_secret@localhost:5432/lexiassist
```

### Development

```bash
# Start development server
npm run dev

# Open browser to http://localhost:3000
```

### Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Linting

```bash
# Run ESLint
npm run lint
```

## API Integration

### Authentication Flow

```typescript
import { useAuth } from '@/hooks/useAuth';

function LoginPage() {
  const { login, isLoading } = useAuth();
  
  const handleSubmit = async (email: string, password: string) => {
    try {
      await login({ email, password });
      // Redirects to /dashboard on success
    } catch (error) {
      // Error handling
    }
  };
}
```

### Data Fetching

```typescript
import { useCourses } from '@/hooks/useCourses';

function CoursesPage() {
  const { data: courses, isLoading, error } = useCourses();
  
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  
  return <CourseList courses={courses} />;
}
```

### API Calls

```typescript
import { courseApi } from '@/services/api';

// Create course
const course = await courseApi.create({
  name: 'Machine Learning 101',
  description: 'Introduction to ML',
  color: '#3B82F6'
});

// Get courses
const courses = await courseApi.getAll();

// Update course
await courseApi.update(courseId, { name: 'Updated Name' });

// Delete course
await courseApi.delete(courseId);
```

## State Management

### Auth Store (Zustand)

```typescript
import { useAuthStore } from '@/store/authStore';

function Component() {
  const { user, isAuthenticated, login, logout } = useAuthStore();
  
  // Access user data
  console.log(user?.email);
  
  // Check auth status
  if (!isAuthenticated) {
    // Redirect to login
  }
}
```

### React Query

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetch data
const { data, isLoading } = useQuery({
  queryKey: ['courses'],
  queryFn: () => courseApi.getAll()
});

// Mutate data
const { mutate: createCourse } = useMutation({
  mutationFn: courseApi.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['courses'] });
  }
});
```

## Styling

### Tailwind CSS

```tsx
// Use Tailwind utility classes
<div className="flex items-center gap-4 p-6 rounded-lg bg-white shadow-md">
  <h1 className="text-2xl font-bold text-gray-900">Title</h1>
</div>
```

### Custom Colors

```css
/* Primary color: #377749 (green) */
/* Secondary color: #df7361 (coral) */
/* Background: #ECF3EE (light green) */
```

### Responsive Design

```tsx
// Mobile-first approach
<div className="w-full md:w-1/2 lg:w-1/3">
  {/* Content */}
</div>
```

## Components

### UI Components (shadcn/ui)

```tsx
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

<Button variant="primary" size="lg">
  Click Me
</Button>
```

### Custom Components

```tsx
import { FeatureHeader } from '@/components/FeatureHeader';
import { LoadingState } from '@/components/LoadingState';
import { EmptyState } from '@/components/EmptyState';
```

## Routing

### App Router Structure

```
app/
├── (auth)/              # Auth layout (no sidebar)
│   ├── login/
│   ├── register/
│   └── verify-email/
├── (main)/              # Main layout (with sidebar)
│   ├── dashboard/
│   ├── chat-assistant/
│   ├── quizzes/
│   └── flashcards/
└── page.tsx             # Landing page
```

### Navigation

```tsx
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Link component
<Link href="/dashboard">Dashboard</Link>

// Programmatic navigation
const router = useRouter();
router.push('/dashboard');
```

## Error Handling

### API Errors

```typescript
try {
  await authApi.login(email, password);
} catch (error) {
  // Error is already parsed in api.ts
  toast.error(error.message || 'Login failed');
}
```

### Error Boundaries

```tsx
// app/error.tsx
'use client';

export default function Error({ error, reset }: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

## Performance

### Code Splitting

```tsx
import dynamic from 'next/dynamic';

// Lazy load components
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSpinner />
});
```

### Image Optimization

```tsx
import Image from 'next/image';

<Image
  src="/images/logo.svg"
  alt="Logo"
  width={200}
  height={50}
  priority // For above-the-fold images
/>
```

## Testing

### Unit Tests

```bash
# Run tests (if configured)
npm run test
```

### E2E Tests

```bash
# Run E2E tests (if configured)
npm run test:e2e
```

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

```bash
# Build Docker image
docker build -t lexiassist-frontend .

# Run container
docker run -p 3000:3000 lexiassist-frontend
```

### Environment Variables

Set these in your deployment platform:
- `NEXT_PUBLIC_API_GATEWAY_URL`
- `NEXT_PUBLIC_AI_PROXY_URL`
- `DATABASE_URL` (if using Prisma)

## Troubleshooting

### Issue: API calls fail with CORS error

**Solution:** Check backend `ALLOWED_ORIGINS` includes frontend URL

### Issue: 401 Unauthorized

**Solution:** Check token in sessionStorage, try logout/login

### Issue: Styles not loading

**Solution:** Clear `.next` cache and rebuild

```bash
rm -rf .next
npm run dev
```

### Issue: TypeScript errors

**Solution:** Regenerate types

```bash
npm run db:generate  # If using Prisma
```

## Contributing

1. Create a feature branch
2. Make changes
3. Run linter: `npm run lint`
4. Test changes
5. Submit pull request

## License

Proprietary - LexiAssist

## Support

For issues or questions:
- Check `FRONTEND_BACKEND_INTEGRATION.md`
- Review `API_DOCUMENTATION.md`
- Check browser console for errors
- Review backend logs

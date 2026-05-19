import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Icon } from "@/components/Icon";
import { Search, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-slate-100">
          <Search className="h-12 w-12 text-slate-400" />
        </div>
        
        <h1 className="mt-6 text-6xl font-bold text-slate-900">404</h1>
        
        <h2 className="mt-4 text-2xl font-semibold text-slate-900">
          Page Not Found
        </h2>
        
        <p className="mt-3 max-w-md text-slate-600">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been
          moved, deleted, or never existed.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/dashboard">
            <Button leftIcon={<Home size={18} />}>
              Go to Dashboard
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

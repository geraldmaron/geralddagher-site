import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="text-center space-y-8 max-w-md">

        {/* Large 404 */}
        <div className="relative">
          <p className="text-[120px] sm:text-[160px] font-bold leading-none tracking-tight select-none bg-gradient-to-b from-foreground/12 to-transparent bg-clip-text text-transparent">
            404
          </p>
          <p className="absolute inset-0 flex items-center justify-center text-5xl sm:text-7xl font-bold tracking-tight text-primary">
            404
          </p>
        </div>

        <div className="space-y-3">
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
            Page not found
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The page you&#39;re looking for doesn&#39;t exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Home className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}

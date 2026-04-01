import Link from "next/link";
import { Mountain, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="text-center px-4">
        <Mountain className="w-20 h-20 text-night/10 mx-auto mb-6" />
        <h1 className="text-6xl font-extrabold text-night/20 mb-2">404</h1>
        <h2 className="text-2xl font-bold text-night mb-3">Trail Not Found</h2>
        <p className="text-night/50 mb-8 max-w-md mx-auto">
          Looks like you wandered off the beaten path. The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-forest text-white font-semibold hover:bg-forest-light transition-colors"
          >
            Back to Home <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-night font-semibold hover:bg-cream-dark transition-colors border border-cream-dark"
          >
            Explore Parks
          </Link>
        </div>
      </div>
    </div>
  );
}

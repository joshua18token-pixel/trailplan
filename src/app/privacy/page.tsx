"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/" className="flex items-center gap-1.5 text-night/40 text-sm mb-6 hover:text-night transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <h1 className="text-3xl font-bold text-night mb-2">Privacy Policy</h1>
        <p className="text-night/50 mb-8">Last updated: April 1, 2026</p>

        <div className="prose prose-night max-w-none space-y-6 text-night/70">
          <section>
            <h2 className="text-xl font-bold text-night">1. Information We Collect</h2>
            <p><strong>Account Information:</strong> When you create an account, we collect your email address and display name.</p>
            <p><strong>Trip Data:</strong> Itineraries, park selections, and trip preferences you create are stored to provide our service.</p>
            <p><strong>Photos & Content:</strong> Photos you upload and comments you post are stored on our servers.</p>
            <p><strong>Usage Data:</strong> We collect basic analytics about how you use ParkPlan to improve our service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-night">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide and maintain ParkPlan services</li>
              <li>To save and display your trips, photos, and community posts</li>
              <li>To send you important service updates</li>
              <li>To improve our platform based on usage patterns</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-night">3. Data Storage</h2>
            <p>Your data is stored securely using Supabase (hosted on AWS) in the United States. We use encryption in transit (TLS) and at rest.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-night">4. Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Supabase</strong> — Database and authentication</li>
              <li><strong>Vercel</strong> — Hosting and deployment</li>
              <li><strong>National Park Service API</strong> — Park information</li>
              <li><strong>OpenStreetMap/Nominatim</strong> — Park location data</li>
              <li><strong>Stripe</strong> — Payment processing (for Pro subscriptions)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-night">5. Your Rights</h2>
            <p>You can:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your data through your account</li>
              <li>Delete your account and associated data</li>
              <li>Export your trip data</li>
              <li>Opt out of non-essential communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-night">6. Cookies</h2>
            <p>We use essential cookies for authentication and session management. We do not use tracking cookies for advertising.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-night">7. Children&apos;s Privacy</h2>
            <p>ParkPlan is not intended for children under 13. We do not knowingly collect data from children under 13.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-night">8. Changes to This Policy</h2>
            <p>We may update this policy from time to time. We&apos;ll notify you of significant changes via email or in-app notification.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-night">9. Contact Us</h2>
            <p>Questions about this policy? Email us at <a href="mailto:support@parkplan.io" className="text-forest hover:underline">support@parkplan.io</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}

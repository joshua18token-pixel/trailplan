"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/" className="flex items-center gap-1.5 text-night/40 text-sm mb-6 hover:text-night transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <h1 className="text-3xl font-bold text-night mb-2">Terms of Service</h1>
        <p className="text-night/50 mb-8">Last updated: April 1, 2026</p>

        <div className="prose prose-night max-w-none space-y-6 text-night/70">
          <section>
            <h2 className="text-xl font-bold text-night">1. Acceptance of Terms</h2>
            <p>By using ParkPlan (&ldquo;the Service&rdquo;), you agree to these Terms of Service. If you do not agree, please do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-night">2. Description of Service</h2>
            <p>ParkPlan is a trip planning platform for national parks, state parks, and other outdoor recreation areas. We provide itinerary building, community features, and park information to help you plan your adventures.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-night">3. User Accounts</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You must provide accurate information when creating an account</li>
              <li>You are responsible for maintaining the security of your account</li>
              <li>You must be at least 13 years old to use ParkPlan</li>
              <li>One person or entity may not have multiple accounts</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-night">4. User Content</h2>
            <p>You retain ownership of content you post (photos, comments, trip plans). By posting, you grant ParkPlan a non-exclusive license to display your content on the platform.</p>
            <p>You agree not to post content that is:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Illegal, harmful, or harassing</li>
              <li>Spam or commercial advertising</li>
              <li>Infringing on others&apos; intellectual property</li>
              <li>Misleading or intentionally false</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-night">5. Pro Subscription</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Pro features are available through paid subscription</li>
              <li>Payments are processed securely through Stripe</li>
              <li>Subscriptions auto-renew unless cancelled</li>
              <li>Refunds are available within 30 days of purchase</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-night">6. Disclaimer</h2>
            <p>ParkPlan provides park information for planning purposes only. We are not affiliated with the National Park Service or any state park system. Always verify park conditions, fees, and reservations directly with the managing authority before your trip.</p>
            <p><strong>Trail and activity information may not be current.</strong> Conditions change — check official sources before visiting.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-night">7. Limitation of Liability</h2>
            <p>ParkPlan is provided &ldquo;as is&rdquo; without warranty. We are not liable for any damages arising from your use of the Service, including but not limited to inaccurate park information, trip disruptions, or data loss.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-night">8. Moderation</h2>
            <p>We reserve the right to remove content and suspend accounts that violate these terms. Moderators may pin, edit, or remove community content to maintain quality.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-night">9. Changes to Terms</h2>
            <p>We may update these terms. Continued use of ParkPlan after changes constitutes acceptance of the new terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-night">10. Contact</h2>
            <p>Questions? Email us at <a href="mailto:support@parkplan.io" className="text-forest hover:underline">support@parkplan.io</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}

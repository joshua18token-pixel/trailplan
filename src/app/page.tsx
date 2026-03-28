import { Search, MapPin, CalendarDays, Compass, ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import ParkCard from "@/components/ParkCard";
import { parks, getActivityCountForPark } from "@/data/mockData";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1472396961693-142e6e269027?w=1600&q=80"
            alt="Mountain landscape"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-night/70 via-forest/50 to-sunset/30" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 sm:py-40">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur rounded-full px-4 py-2 text-white/90 text-sm mb-6">
              <Star className="w-4 h-4 text-sunset-light" />
              Trusted by 50,000+ outdoor enthusiasts
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight">
              Plan Your Perfect{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sunset-light to-sunset">
                Outdoor Adventure
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-white/80 max-w-xl leading-relaxed">
              Discover trails, build itineraries, manage permits — all in one place. Stop juggling 10 tabs and start exploring.
            </p>

            {/* Search Bar */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-night/40" />
                <input
                  type="text"
                  placeholder="Search parks, trails, activities..."
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/95 backdrop-blur text-night placeholder:text-night/40 focus:outline-none focus:ring-2 focus:ring-sunset shadow-lg text-base"
                />
              </div>
              <Link
                href="/explore"
                className="px-8 py-4 rounded-xl bg-sunset hover:bg-sunset-light text-white font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                Explore
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-night">
              How It Works
            </h2>
            <p className="mt-3 text-night/60 text-lg">Three steps to your dream trip</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Compass className="w-8 h-8" />,
                title: "Discover",
                desc: "Browse parks, trails, and activities matched to your skill level and interests.",
                color: "bg-forest/10 text-forest",
              },
              {
                icon: <CalendarDays className="w-8 h-8" />,
                title: "Plan",
                desc: "Build a day-by-day itinerary with drag-and-drop. We handle permits and logistics.",
                color: "bg-sunset/10 text-sunset",
              },
              {
                icon: <MapPin className="w-8 h-8" />,
                title: "Explore",
                desc: "Hit the trail with offline maps, real-time alerts, and all your info in one place.",
                color: "bg-lake/10 text-lake",
              },
            ].map((step) => (
              <div
                key={step.title}
                className="text-center p-8 rounded-2xl hover:bg-cream transition-colors duration-300"
              >
                <div
                  className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center mx-auto mb-5`}
                >
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-night mb-2">{step.title}</h3>
                <p className="text-night/60 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Parks */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-night">
                Popular Parks
              </h2>
              <p className="mt-2 text-night/60 text-lg">Start your adventure at America&apos;s finest</p>
            </div>
            <Link
              href="/explore"
              className="hidden sm:flex items-center gap-2 text-forest font-semibold hover:gap-3 transition-all"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {parks.map((park) => (
              <ParkCard
                key={park.id}
                park={park}
                activityCount={getActivityCountForPark(park.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-forest to-night">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white">
            Ready for your next adventure?
          </h2>
          <p className="mt-4 text-lg text-white/70 max-w-xl mx-auto">
            Join thousands of outdoor enthusiasts who plan smarter and explore further with TrailPlan.
          </p>
          <Link
            href="/trip/new"
            className="inline-flex items-center gap-2 mt-8 px-10 py-4 rounded-xl bg-sunset hover:bg-sunset-light text-white font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:scale-105"
          >
            Start Planning — It&apos;s Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-night text-white/50 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2025 TrailPlan. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">About</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

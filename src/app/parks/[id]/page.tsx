"use client";

import { use, useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  ArrowLeft, MapPin, Calendar, Mountain, TreePine, Star,
  ChevronRight, ThumbsUp, Users, Clock, ExternalLink,
  Globe, DollarSign, Navigation, Loader2, Send, ImageIcon, X,
} from "lucide-react";

interface ParkData {
  id: string;
  name: string;
  fullName: string;
  type: string;
  state: string;
  description: string;
  coordinates: { lat: number; lng: number };
  activities: string[];
  bestSeason: string;
  image?: string;
}

interface CommunityTrip {
  id: number;
  title: string;
  author_name: string;
  description: string;
  duration_days: number;
  difficulty: string;
  vote_count: number;
  tags: string[];
  cover_image: string;
}

interface Comment {
  id: string;
  content: string;
  photo_url?: string;
  pinned: boolean;
  like_count: number;
  created_at: string;
  profiles: {
    display_name: string;
    avatar_url?: string;
  };
}

interface Photo {
  id: string;
  photo_url: string;
  caption?: string;
  created_at: string;
  profiles: {
    display_name: string;
    avatar_url?: string;
  };
}

const activityEmoji: Record<string, string> = {
  hiking: "🥾", biking: "🚴", fishing: "🎣", kayaking: "🛶", sightseeing: "📸",
  camping: "⛺", "wildlife watching": "🦌", "wildlife viewing": "🦌", "horseback riding": "🐴",
  "rock climbing": "🧗", climbing: "🧗", swimming: "🏊", snorkeling: "🤿",
  canoeing: "🛶", boating: "⛵", photography: "📷", rafting: "🚣",
  "tide pooling": "🦀", canyoneering: "🏔️",
};

const typeLabels: Record<string, string> = {
  national_park: "National Park",
  state_park: "State Park",
  national_forest: "National Forest",
  recreation_area: "Recreation Area",
  monument: "National Monument",
};

const typeBadgeColors: Record<string, string> = {
  national_park: "bg-forest/10 text-forest",
  state_park: "bg-lake/10 text-lake",
  national_forest: "bg-trail/10 text-trail",
  recreation_area: "bg-sunset/10 text-sunset",
  monument: "bg-gold/10 text-gold",
};

export default function ParkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const [park, setPark] = useState<ParkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [communityTrips, setCommunityTrips] = useState<CommunityTrip[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "photos" | "discussion" | "trips">("overview");
  
  // User role
  const [userRole, setUserRole] = useState<string>("user");
  const isMod = userRole === "moderator" || userRole === "super_admin";

  // Discussion state
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentPhoto, setCommentPhoto] = useState<File | null>(null);
  const [posting, setPosting] = useState(false);
  const heroInputRef = useRef<HTMLInputElement>(null);
  
  // Photo gallery state
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const commentPhotoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadPark() {
      try {
        const res = await fetch(`/api/parks/search?q=${encodeURIComponent(id)}`);
        const data = await res.json();
        if (data.results?.length > 0) {
          setPark(data.results[0]);
        }
      } catch {}
      setLoading(false);
    }
    loadPark();

    // Load community trips (mock for now — will be from Supabase)
    setCommunityTrips([
      {
        id: 1,
        title: "Ultimate 7-Day Adventure",
        author_name: "TrailBlazer_Mike",
        description: "A week-long deep dive with the best trails, camping spots, and hidden gems.",
        duration_days: 7,
        difficulty: "Moderate",
        vote_count: 47,
        tags: ["multi-day", "camping", "photography"],
        cover_image: "",
      },
      {
        id: 2,
        title: "Weekend Family Trip",
        author_name: "OutdoorMom_Sarah",
        description: "Kid-friendly itinerary with easy trails, scenic drives, and great picnic spots.",
        duration_days: 3,
        difficulty: "Easy",
        vote_count: 32,
        tags: ["family", "easy", "scenic"],
        cover_image: "",
      },
      {
        id: 3,
        title: "Photography Tour",
        author_name: "NatureLens_Pro",
        description: "Hit all the best viewpoints at golden hour. Sunrise and sunset schedules included.",
        duration_days: 4,
        difficulty: "Easy",
        vote_count: 28,
        tags: ["photography", "scenic", "sunrise"],
        cover_image: "",
      },
      {
        id: 4,
        title: "Extreme Trails Challenge",
        author_name: "SummitSeeker",
        description: "The hardest trails and biggest elevation gains. Not for beginners!",
        duration_days: 5,
        difficulty: "Hard",
        vote_count: 19,
        tags: ["advanced", "climbing", "backcountry"],
        cover_image: "",
      },
    ]);
  }, [id]);

  // Load comments, photos, and user role once when park is loaded
  useEffect(() => {
    if (park?.id) {
      loadComments();
      loadPhotos();
    }
  }, [park?.id]);

  // Load user role
  useEffect(() => {
    if (!user) { setUserRole("user"); return; }
    (async () => {
      const { supabase } = await import("@/lib/supabase");
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      setUserRole(data?.role || "user");
    })();
  }, [user]);

  async function loadComments() {
    try {
      const res = await fetch(`/api/parks/${id}/comments`);
      const data = await res.json();
      setComments(data.comments || []);
    } catch {}
  }

  async function loadPhotos() {
    try {
      const res = await fetch(`/api/parks/${id}/photos`);
      const data = await res.json();
      setPhotos(data.photos || []);
    } catch {}
  }

  async function handlePostComment() {
    if (!newComment.trim() || !user || posting) return;
    
    setPosting(true);
    try {
      // Import supabase client
      const { supabase } = await import("@/lib/supabase");
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert("Please sign in again");
        setPosting(false);
        return;
      }

      let photoUrl = null;
      
      // Upload photo if attached
      if (commentPhoto) {
        const formData = new FormData();
        formData.append("file", commentPhoto);
        const uploadRes = await fetch(`/api/parks/${id}/photos`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: formData,
        });
        const uploadData = await uploadRes.json();
        photoUrl = uploadData.photo?.photo_url;
      }

      // Post comment
      const res = await fetch(`/api/parks/${id}/comments`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ content: newComment, photo_url: photoUrl }),
      });

      if (res.ok) {
        setNewComment("");
        setCommentPhoto(null);
        loadComments();
        if (photoUrl) loadPhotos();
      } else {
        const error = await res.json();
        console.error("Post failed:", error);
        alert("Failed to post: " + (error.details || error.error));
      }
    } catch (err) {
      console.error("Error posting:", err);
    }
    setPosting(false);
  }

  async function handleUploadPhoto(file: File, caption?: string) {
    if (!user || uploadingPhoto) return;
    
    setUploadingPhoto(true);
    try {
      const { supabase } = await import("@/lib/supabase");
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert("Please sign in again");
        setUploadingPhoto(false);
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      if (caption) formData.append("caption", caption);

      const res = await fetch(`/api/parks/${id}/photos`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      if (res.ok) {
        loadPhotos();
      }
    } catch {}
    setUploadingPhoto(false);
  }

  async function handleUploadHero(file: File) {
    if (!user || !isMod) return;
    
    try {
      const { supabase } = await import("@/lib/supabase");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/parks/${id}/hero`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${session.access_token}` },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setPark(prev => prev ? { ...prev, image: data.hero_image } : prev);
      } else {
        const err = await res.json();
        alert("Failed to upload: " + err.error);
      }
    } catch {}
  }

  async function handlePinComment(commentId: string, pinned: boolean) {
    if (!user || !isMod) return;
    
    try {
      const { supabase } = await import("@/lib/supabase");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await fetch(`/api/parks/comments/${commentId}/moderate`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ pinned }),
      });
      loadComments();
    } catch {}
  }

  async function handleDeleteComment(commentId: string) {
    if (!user || !isMod) return;
    if (!confirm("Delete this comment?")) return;
    
    try {
      const { supabase } = await import("@/lib/supabase");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await fetch(`/api/parks/comments/${commentId}/moderate`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${session.access_token}` },
      });
      loadComments();
    } catch {}
  }

  async function handleLikeComment(commentId: string) {
    if (!user) return;
    
    try {
      const { supabase } = await import("@/lib/supabase");
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;

      await fetch(`/api/parks/comments/${commentId}/like`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
        },
      });
      loadComments();
    } catch {}
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-forest" />
      </div>
    );
  }

  if (!park) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <Mountain className="w-16 h-16 text-night/10 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-night mb-2">Park Not Found</h1>
          <p className="text-night/50 mb-6">We couldn&apos;t find this park. Try searching for it.</p>
          <Link href="/explore" className="px-6 py-3 rounded-xl bg-forest text-white font-medium">
            Explore Parks
          </Link>
        </div>
      </div>
    );
  }

  const googleMapsUrl = `https://www.google.com/maps/@${park.coordinates.lat},${park.coordinates.lng},12z`;
  const officialSiteUrl = `https://www.google.com/search?q=${encodeURIComponent(park.fullName + " official site")}`;
  const isNational = park.type === "national_park";

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden bg-night">
        {park.image && park.image.trim() ? (
          <img 
            src={park.image} 
            alt={park.fullName} 
            className="w-full h-full object-cover opacity-80"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}
        <div className={`w-full h-full bg-gradient-to-br from-forest/80 to-night items-center justify-center ${park.image && park.image.trim() ? 'hidden' : 'flex'}`}>
          <Mountain className="w-24 h-24 text-white/20" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Moderator: Upload Hero Image */}
        {isMod && (
          <div className="absolute top-4 right-4 z-10">
            <input 
              ref={heroInputRef}
              type="file" 
              accept="image/*" 
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUploadHero(file);
              }}
            />
            <button
              onClick={() => heroInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 backdrop-blur text-white text-sm font-medium hover:bg-white/30 transition-colors"
            >
              <ImageIcon className="w-4 h-4" /> Change Cover
            </button>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <div className="max-w-5xl mx-auto">
            <Link href="/explore" className="flex items-center gap-1.5 text-white/60 text-sm mb-3 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Explore
            </Link>
            <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-2 ${typeBadgeColors[park.type] || "bg-white/20 text-white"}`}>
              {typeLabels[park.type] || park.type.replace(/_/g, " ")}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">{park.fullName}</h1>
            <div className="flex items-center gap-4 mt-2 text-white/70 text-sm">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{park.state}</span>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{park.bestSeason}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex-1 py-4 px-6 font-medium transition-colors ${activeTab === "overview" ? "text-forest border-b-2 border-forest bg-forest/5" : "text-night/40 hover:text-night/60"}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("photos")}
              className={`flex-1 py-4 px-6 font-medium transition-colors ${activeTab === "photos" ? "text-forest border-b-2 border-forest bg-forest/5" : "text-night/40 hover:text-night/60"}`}
            >
              Photos
            </button>
            <button
              onClick={() => setActiveTab("discussion")}
              className={`flex-1 py-4 px-6 font-medium transition-colors ${activeTab === "discussion" ? "text-forest border-b-2 border-forest bg-forest/5" : "text-night/40 hover:text-night/60"}`}
            >
              Discussion
            </button>
            <button
              onClick={() => setActiveTab("trips")}
              className={`flex-1 py-4 px-6 font-medium transition-colors ${activeTab === "trips" ? "text-forest border-b-2 border-forest bg-forest/5" : "text-night/40 hover:text-night/60"}`}
            >
              Community Trips
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {activeTab === "overview" && (
              <>
            {/* Description */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-night mb-3">About the Park</h2>
              <p className="text-night/70 leading-relaxed">{park.description}</p>
              <div className="flex items-center gap-3 mt-4">
                <a href={officialSiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-forest hover:underline">
                  <Globe className="w-4 h-4" /> Official Website <ExternalLink className="w-3 h-3" />
                </a>
                <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-lake hover:underline">
                  <Navigation className="w-4 h-4" /> View on Maps <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Activities */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-night mb-4">Activities</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {park.activities.map((activity) => (
                  <div key={activity} className="flex items-center gap-3 p-3 rounded-xl bg-cream hover:bg-cream-dark transition-colors">
                    <span className="text-2xl">{activityEmoji[activity] || "🏞️"}</span>
                    <span className="font-medium text-night capitalize">{activity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Entry Fees Quick Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-night mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-sunset" /> Entry Fees
              </h2>
              {isNational ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-cream">
                    <span className="text-sm text-night/70">Vehicle (7-day pass)</span>
                    <span className="font-bold text-night">$30 – $35</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-cream">
                    <span className="text-sm text-night/70">Per person (walk-in)</span>
                    <span className="font-bold text-night">$15 – $20</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-cream">
                    <span className="text-sm text-night/70">Children under 16</span>
                    <span className="font-bold text-forest">Free</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-forest/5">
                    <span className="text-sm text-forest font-medium">America the Beautiful Pass</span>
                    <span className="font-bold text-forest">$80/year</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-cream">
                    <span className="text-sm text-night/70">Vehicle entry</span>
                    <span className="font-bold text-night">$4 – $6</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-cream">
                    <span className="text-sm text-night/70">Pedestrian / Cyclist</span>
                    <span className="font-bold text-night">$2 – $4</span>
                  </div>
                  <p className="text-xs text-night/40">Fees vary by park. Check the official website for exact pricing.</p>
                </div>
              )}
            </div>

              </>
            )}

            {/* Photos Tab */}
            {activeTab === "photos" && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-night">Photo Gallery</h2>
                  {user ? (
                    <>
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/*" 
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadPhoto(file);
                        }}
                      />
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingPhoto}
                        className="px-4 py-2 rounded-lg bg-forest text-white text-sm font-medium hover:bg-forest-light transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        <ImageIcon className="w-4 h-4" />
                        {uploadingPhoto ? "Uploading..." : "+ Add Photos"}
                      </button>
                    </>
                  ) : (
                    <Link href="/profile" className="px-4 py-2 rounded-lg bg-gray-100 text-night/50 text-sm font-medium">
                      Sign in to upload
                    </Link>
                  )}
                </div>
                {photos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {photos.map((photo) => (
                      <div key={photo.id} className="aspect-square rounded-xl bg-cream hover:opacity-90 transition-opacity cursor-pointer overflow-hidden group relative">
                        <img src={photo.photo_url} alt={photo.caption || "Park photo"} className="w-full h-full object-cover" />
                        {photo.caption && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {photo.caption}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-night/30">
                    <ImageIcon className="w-16 h-16 mx-auto mb-3 text-night/10" />
                    <p className="text-sm">No photos yet. Be the first to share!</p>
                  </div>
                )}
              </div>
            )}

            {/* Discussion Tab */}
            {activeTab === "discussion" && (
              <div className="space-y-4">
                {user && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-night mb-4">Start a Discussion</h2>
                    <textarea 
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-forest resize-none"
                      rows={3}
                      placeholder="Share your experience, ask questions, or give tips..."
                    />
                    {commentPhoto && (
                      <div className="mt-3 relative inline-block">
                        <img 
                          src={URL.createObjectURL(commentPhoto)} 
                          alt="Attachment preview" 
                          className="h-20 rounded-lg"
                        />
                        <button
                          onClick={() => setCommentPhoto(null)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-3">
                      <input 
                        ref={commentPhotoInputRef}
                        type="file" 
                        accept="image/*" 
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setCommentPhoto(file);
                        }}
                      />
                      <button
                        onClick={() => commentPhotoInputRef.current?.click()}
                        className="px-4 py-2 rounded-lg bg-gray-100 text-night/60 font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
                      >
                        <ImageIcon className="w-4 h-4" />
                        Add Photo
                      </button>
                      <button 
                        onClick={handlePostComment}
                        disabled={!newComment.trim() || posting}
                        className="px-6 py-2 rounded-lg bg-forest text-white font-medium hover:bg-forest-light transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        {posting ? "Posting..." : "Post"}
                      </button>
                    </div>
                  </div>
                )}

                {!user && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
                    <p className="text-night/60 mb-4">Sign in to join the discussion</p>
                    <Link href="/profile" className="inline-block px-6 py-2 rounded-lg bg-forest text-white font-medium hover:bg-forest-light transition-colors">
                      Sign In
                    </Link>
                  </div>
                )}

                {/* Discussion Posts */}
                {comments.length > 0 ? comments.map((comment) => (
                  <div key={comment.id} className={`bg-white rounded-2xl p-6 shadow-sm ${comment.pinned ? "border-2 border-sunset" : ""}`}>
                    {comment.pinned && (
                      <div className="flex items-center gap-1.5 text-sunset text-xs font-bold mb-2">
                        <span className="text-lg">📌</span> PINNED BY MODERATOR
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-forest/10 flex items-center justify-center text-forest font-bold flex-shrink-0">
                        {comment.profiles.display_name[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-night">{comment.profiles.display_name}</span>
                          <span className="text-xs text-night/40">{new Date(comment.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-night/70 mt-2">{comment.content}</p>
                        {comment.photo_url && (
                          <img src={comment.photo_url} alt="Comment photo" className="mt-3 max-w-sm rounded-xl" />
                        )}
                        <div className="flex items-center gap-4 mt-3 text-sm text-night/40">
                          <button 
                            onClick={() => handleLikeComment(comment.id)}
                            disabled={!user}
                            className="hover:text-forest transition-colors disabled:opacity-50"
                          >
                            👍 {comment.like_count}
                          </button>
                          {isMod && (
                            <>
                              <button
                                onClick={() => handlePinComment(comment.id, !comment.pinned)}
                                className="hover:text-sunset transition-colors"
                              >
                                📌 {comment.pinned ? "Unpin" : "Pin"}
                              </button>
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="hover:text-red-500 transition-colors"
                              >
                                🗑️ Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="bg-white rounded-2xl p-12 shadow-sm text-center text-night/30">
                    <p>No discussions yet. Be the first to share!</p>
                  </div>
                )}
              </div>
            )}

            {/* Community Trips Tab */}
            {activeTab === "trips" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-night flex items-center gap-2">
                    <Users className="w-5 h-5 text-sunset" /> Community Trips
                  </h2>
                  <Link href="/community" className="text-sm text-forest hover:underline">View all →</Link>
                </div>
                <div className="space-y-3">
                  {communityTrips.sort((a, b) => b.vote_count - a.vote_count).map((trip, i) => (
                    <div key={trip.id} className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all border border-cream-dark">
                      <div className="flex items-start gap-4">
                        {/* Rank + Votes */}
                        <div className="flex flex-col items-center gap-1 min-w-[48px]">
                          <span className="text-xs font-bold text-night/30">#{i + 1}</span>
                          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-forest/10 text-forest">
                            <ThumbsUp className="w-3 h-3" />
                            <span className="text-xs font-bold">{trip.vote_count}</span>
                          </div>
                        </div>
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-night text-sm sm:text-base">{trip.title}</h3>
                          <p className="text-xs text-night/40 mt-0.5">by {trip.author_name} · {trip.duration_days} days · {trip.difficulty}</p>
                          <p className="text-sm text-night/60 mt-1.5 line-clamp-2">{trip.description}</p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {trip.tags.map((tag) => (
                              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-cream text-night/50">#{tag}</span>
                            ))}
                          </div>
                        </div>
                        {/* Action */}
                        <Link
                          href={`/community/${trip.id}`}
                          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-cream text-night/50 hover:bg-forest/10 hover:text-forest transition-colors text-xs font-medium flex-shrink-0"
                        >
                          View <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Plan Your Trip CTA */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-forest/20">
              <h3 className="font-bold text-night text-lg mb-2">Plan Your Trip</h3>
              <p className="text-sm text-night/50 mb-4">Create a personalized itinerary for {park.fullName} in minutes.</p>
              <Link
                href={`/trip/new?park=${park.id}`}
                className="block w-full py-3.5 rounded-xl bg-forest text-white text-center font-semibold text-base hover:bg-forest-light transition-colors shadow-lg shadow-forest/20"
              >
                🗺️ Start Planning
              </Link>
              <p className="text-xs text-night/30 text-center mt-3">Free · No account needed</p>
            </div>

            {/* Quick Facts */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-night mb-4">Quick Facts</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-forest flex-shrink-0" />
                  <div>
                    <p className="text-xs text-night/40">Location</p>
                    <p className="text-sm font-medium text-night">{park.state}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-sunset flex-shrink-0" />
                  <div>
                    <p className="text-xs text-night/40">Best Season</p>
                    <p className="text-sm font-medium text-night">{park.bestSeason}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <TreePine className="w-4 h-4 text-trail flex-shrink-0" />
                  <div>
                    <p className="text-xs text-night/40">Activities</p>
                    <p className="text-sm font-medium text-night">{park.activities.length} available</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="w-4 h-4 text-gold flex-shrink-0" />
                  <div>
                    <p className="text-xs text-night/40">Type</p>
                    <p className="text-sm font-medium text-night">{typeLabels[park.type] || park.type}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Coordinates / Map Link */}
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all border border-cream-dark group"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-lake/10 flex items-center justify-center group-hover:bg-lake/20 transition-colors">
                  <Navigation className="w-6 h-6 text-lake" />
                </div>
                <div>
                  <p className="text-sm font-medium text-night group-hover:text-lake transition-colors">View on Google Maps</p>
                  <p className="text-xs text-night/40">{park.coordinates.lat.toFixed(4)}°N, {Math.abs(park.coordinates.lng).toFixed(4)}°W</p>
                </div>
                <ExternalLink className="w-4 h-4 text-night/20 ml-auto group-hover:text-lake transition-colors" />
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

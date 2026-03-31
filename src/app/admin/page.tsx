"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import {
  Shield, Users, UserPlus, ArrowLeft, Crown, ChevronDown,
  Trash2, Loader2, Check, X,
} from "lucide-react";

interface UserProfile {
  id: string;
  display_name: string;
  email: string;
  role: string;
  created_at: string;
}

export default function AdminPage() {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string>("user");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoteEmail, setPromoteEmail] = useState("");
  const [promoting, setPromoting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      setUserRole(data?.role || "user");
    })();
  }, [user]);

  useEffect(() => {
    if (userRole !== "super_admin") return;
    loadUsers();
  }, [userRole]);

  async function loadUsers() {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("role", { ascending: true })
      .order("created_at", { ascending: false });
    setUsers(data || []);
    setLoading(false);
  }

  async function handlePromote() {
    if (!promoteEmail.trim() || promoting) return;
    setPromoting(true);
    setMessage(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/admin/promote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ email: promoteEmail, role: "moderator" }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: `${data.user.display_name} promoted to moderator!` });
        setPromoteEmail("");
        loadUsers();
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to promote user" });
    }
    setPromoting(false);
  }

  async function handleDemote(userId: string) {
    if (!confirm("Remove moderator access?")) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const targetUser = users.find(u => u.id === userId);
      if (!targetUser) return;

      await fetch("/api/admin/promote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ email: targetUser.email, role: "user" }),
      });
      loadUsers();
    } catch {}
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-night/10 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-night mb-2">Admin Access Required</h1>
          <p className="text-night/50 mb-6">Please sign in to access the admin panel.</p>
          <Link href="/profile" className="px-6 py-3 rounded-xl bg-forest text-white font-medium">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (userRole !== "super_admin") {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-200 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-night mb-2">Access Denied</h1>
          <p className="text-night/50 mb-6">Only super admins can access this page.</p>
          <Link href="/" className="px-6 py-3 rounded-xl bg-forest text-white font-medium">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const roleIcon = (role: string) => {
    if (role === "super_admin") return <Crown className="w-4 h-4 text-gold" />;
    if (role === "moderator") return <Shield className="w-4 h-4 text-forest" />;
    return <Users className="w-4 h-4 text-night/30" />;
  };

  const roleBadge = (role: string) => {
    if (role === "super_admin") return "bg-gold/10 text-gold border-gold/20";
    if (role === "moderator") return "bg-forest/10 text-forest border-forest/20";
    return "bg-gray-100 text-night/50 border-gray-200";
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/" className="flex items-center gap-1.5 text-night/40 text-sm mb-6 hover:text-night transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center">
            <Crown className="w-6 h-6 text-gold" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-night">Admin Panel</h1>
            <p className="text-sm text-night/50">Manage moderators and site settings</p>
          </div>
        </div>

        {/* Promote User */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="text-lg font-bold text-night mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-forest" /> Promote User to Moderator
          </h2>
          <div className="flex gap-3">
            <input
              type="email"
              value={promoteEmail}
              onChange={(e) => setPromoteEmail(e.target.value)}
              placeholder="Enter user email..."
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-forest"
              onKeyDown={(e) => e.key === "Enter" && handlePromote()}
            />
            <button
              onClick={handlePromote}
              disabled={!promoteEmail.trim() || promoting}
              className="px-6 py-3 rounded-xl bg-forest text-white font-medium hover:bg-forest-light transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {promoting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
              Promote
            </button>
          </div>
          {message && (
            <div className={`mt-3 flex items-center gap-2 text-sm ${message.type === "success" ? "text-forest" : "text-red-500"}`}>
              {message.type === "success" ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
              {message.text}
            </div>
          )}
        </div>

        {/* Users List */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-night mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-lake" /> All Users
          </h2>
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-forest mx-auto" />
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-4 rounded-xl bg-cream hover:bg-cream-dark transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-forest/10 flex items-center justify-center text-forest font-bold">
                      {u.display_name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="font-medium text-night">{u.display_name || "Unknown"}</p>
                      <p className="text-xs text-night/40">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${roleBadge(u.role)}`}>
                      {roleIcon(u.role)}
                      {u.role === "super_admin" ? "Super Admin" : u.role === "moderator" ? "Moderator" : "User"}
                    </span>
                    {u.role === "moderator" && (
                      <button
                        onClick={() => handleDemote(u.id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-night/30 hover:text-red-500 transition-colors"
                        title="Remove moderator"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

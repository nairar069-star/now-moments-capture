import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  handle: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  is_pro: boolean;
};

type AuthValue = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isPro: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (id: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("id, handle, display_name, bio, avatar_url, is_pro")
      .eq("id", id)
      .maybeSingle();
    setProfile((data as Profile | null) ?? null);
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      if (nextUser) {
        setTimeout(() => void loadProfile(nextUser.id), 0);
      } else {
        setProfile(null);
      }
    });

    void supabase.auth.getSession().then(async ({ data }) => {
      const nextUser = data.session?.user ?? null;
      setUser(nextUser);
      if (nextUser) await loadProfile(nextUser.id);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user.id);
  }, [user, loadProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  const value = useMemo<AuthValue>(
    () => ({ user, profile, loading, isPro: Boolean(profile?.is_pro), refreshProfile, signOut }),
    [user, profile, loading, refreshProfile, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

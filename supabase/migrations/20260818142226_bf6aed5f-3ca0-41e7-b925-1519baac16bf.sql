
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  handle text NOT NULL UNIQUE,
  display_name text NOT NULL DEFAULT 'Someone',
  bio text NOT NULL DEFAULT '',
  avatar_url text,
  is_pro boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.follows (
  follower_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, following_id)
);
GRANT SELECT, INSERT, DELETE ON public.follows TO authenticated;
GRANT SELECT ON public.follows TO anon;
GRANT ALL ON public.follows TO service_role;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "follows_select_all" ON public.follows FOR SELECT USING (true);
CREATE POLICY "follows_insert_own" ON public.follows FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id AND follower_id <> following_id);
CREATE POLICY "follows_delete_own" ON public.follows FOR DELETE TO authenticated USING (auth.uid() = follower_id);

CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  time_label text NOT NULL DEFAULT 'Today',
  blurb text NOT NULL DEFAULT '',
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT SELECT ON public.events TO anon;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events_select_all" ON public.events FOR SELECT USING (true);
CREATE POLICY "events_insert_pro" ON public.events FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_pro));
CREATE POLICY "events_update_own" ON public.events FOR UPDATE TO authenticated USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);
CREATE POLICY "events_delete_own" ON public.events FOR DELETE TO authenticated USING (auth.uid() = created_by);

CREATE TABLE public.nows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  photo_url text NOT NULL,
  video_url text,
  selfie_url text,
  caption text,
  place text,
  visibility text NOT NULL DEFAULT 'friends',
  once boolean NOT NULL DEFAULT false,
  collaborators text[] NOT NULL DEFAULT '{}',
  event_id uuid REFERENCES public.events(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nows TO authenticated;
GRANT SELECT ON public.nows TO anon;
GRANT ALL ON public.nows TO service_role;
ALTER TABLE public.nows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nows_select_public" ON public.nows FOR SELECT USING (visibility = 'public');
CREATE POLICY "nows_select_friends" ON public.nows FOR SELECT TO authenticated USING (visibility = 'friends');
CREATE POLICY "nows_select_own" ON public.nows FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "nows_insert_own" ON public.nows FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "nows_update_own" ON public.nows FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "nows_delete_own" ON public.nows FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, handle, display_name)
  VALUES (
    NEW.id,
    lower(coalesce(nullif(split_part(NEW.email, '@', 1), ''), 'user')) || '_' || substr(NEW.id::text, 1, 4),
    coalesce(NEW.raw_user_meta_data->>'display_name', split_part(coalesce(NEW.email, 'someone'), '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE POLICY "media_read" ON storage.objects FOR SELECT USING (bucket_id IN ('avatars', 'nows'));
CREATE POLICY "media_insert_own" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('avatars', 'nows') AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "media_update_own" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id IN ('avatars', 'nows') AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "media_delete_own" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id IN ('avatars', 'nows') AND (storage.foldername(name))[1] = auth.uid()::text);

INSERT INTO public.events (title, time_label, blurb) VALUES
  ('EVERYONE, LOOK UP', 'Tonight 20:00', 'One shot of the sky, wherever you are.'),
  ('COFFEE AT THE SAME MINUTE', 'Tomorrow 09:00', 'Whatever you are drinking, right then.'),
  ('LAST LIGHT', 'Friday 17:45', 'Golden hour, everywhere at once.');

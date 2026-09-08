-- ==========================================================
-- Hi Los Geht (HLG) Heavy Machinery Platform
-- Batch 2: Supabase Custom JWT Claims, RBAC & RLS Policies
-- ==========================================================

-- Create standard Supabase roles if not exists
DO $$ BEGIN
    CREATE ROLE anon NOLOGIN;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE ROLE authenticated NOLOGIN;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE ROLE service_role NOLOGIN;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Ensure auth schema and helpers exist for Supabase compatibility
CREATE SCHEMA IF NOT EXISTS auth;

CREATE OR REPLACE FUNCTION auth.uid()
RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION auth.jwt()
RETURNS JSONB AS $$
BEGIN
    RETURN NULLIF(current_setting('request.jwt.claims', true), '')::jsonb;
EXCEPTION WHEN OTHERS THEN
    RETURN '{}'::jsonb;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION auth.role()
RETURNS TEXT AS $$
BEGIN
    RETURN COALESCE(current_setting('request.jwt.claim.role', true), 'anon');
EXCEPTION WHEN OTHERS THEN
    RETURN 'anon';
END;
$$ LANGUAGE plpgsql STABLE;

-- User Roles lookup table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- Ensure profiles sync to user_roles
CREATE OR REPLACE FUNCTION public.sync_profile_role()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, NEW.role)
    ON CONFLICT (user_id, role) DO UPDATE SET role = EXCLUDED.role;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_profile_role ON public.profiles;
CREATE TRIGGER trg_sync_profile_role
AFTER INSERT OR UPDATE OF role ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.sync_profile_role();

-- Custom Access Token Hook for Supabase Auth JWT enrichment
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event JSONB)
RETURNS JSONB AS $$
DECLARE
    claims JSONB;
    user_role_val TEXT;
BEGIN
    -- Fetch the user role from profiles
    SELECT role::TEXT INTO user_role_val
    FROM public.profiles
    WHERE id = (event->>'user_id')::UUID;

    claims := event->'claims';

    IF user_role_val IS NOT NULL THEN
        claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role_val));
    ELSE
        claims := jsonb_set(claims, '{user_role}', '"CLIENT"'::jsonb);
    END IF;

    event := jsonb_set(event, '{claims}', claims);
    RETURN event;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Authorization helper function
CREATE OR REPLACE FUNCTION public.authorize(requested_role user_role)
RETURNS BOOLEAN AS $$
DECLARE
    jwt_role TEXT;
BEGIN
    -- Read from auth.jwt() ->> 'user_role'
    jwt_role := COALESCE(
        auth.jwt() ->> 'user_role',
        (auth.jwt() -> 'app_metadata' ->> 'role')
    );

    IF jwt_role = 'ADMIN' THEN
        RETURN TRUE;
    END IF;

    IF jwt_role = requested_role::TEXT THEN
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Enable Row Level Security (RLS) on all core tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.physical_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_tasks ENABLE ROW LEVEL SECURITY;

-- Grant permissions to authenticated, anon, and service_role
GRANT USAGE ON SCHEMA public, auth TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT INSERT ON public.reservations TO anon;

-- 1. Profiles Policies
DROP POLICY IF EXISTS "Public can view own profile or Admin full access" ON public.profiles;
CREATE POLICY "Public can view own profile or Admin full access" ON public.profiles
FOR ALL USING (
    auth.uid() = id OR public.authorize('ADMIN') OR auth.role() = 'service_role'
);

-- 2. Physical Assets Policies
DROP POLICY IF EXISTS "Public can view physical assets" ON public.physical_assets;
CREATE POLICY "Public can view physical assets" ON public.physical_assets
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage physical assets" ON public.physical_assets;
CREATE POLICY "Admins can manage physical assets" ON public.physical_assets
FOR ALL USING (
    public.authorize('ADMIN') OR auth.role() = 'service_role'
);

-- 3. Reservations Policies
DROP POLICY IF EXISTS "Anyone can insert reservation inquiries" ON public.reservations;
CREATE POLICY "Anyone can insert reservation inquiries" ON public.reservations
FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Clients can view own reservations, Admins full access" ON public.reservations;
CREATE POLICY "Clients can view own reservations, Admins full access" ON public.reservations
FOR SELECT USING (
    customer_id = auth.uid() OR public.authorize('ADMIN') OR auth.role() = 'service_role'
);

DROP POLICY IF EXISTS "Admins can update reservations" ON public.reservations;
CREATE POLICY "Admins can update reservations" ON public.reservations
FOR UPDATE USING (
    public.authorize('ADMIN') OR auth.role() = 'service_role'
);

-- 4. Staff Logs Policies
DROP POLICY IF EXISTS "Staff can insert logs and view own, Admin full access" ON public.staff_logs;
CREATE POLICY "Staff can insert logs and view own, Admin full access" ON public.staff_logs
FOR ALL USING (
    staff_id = auth.uid() OR public.authorize('ADMIN') OR auth.role() = 'service_role'
);

-- 5. Staff Tasks & Maintenance Policies
DROP POLICY IF EXISTS "Staff can view assigned tasks, Admin full access" ON public.staff_tasks;
CREATE POLICY "Staff can view assigned tasks, Admin full access" ON public.staff_tasks
FOR ALL USING (
    assigned_to = auth.uid() OR public.authorize('ADMIN') OR auth.role() = 'service_role'
);

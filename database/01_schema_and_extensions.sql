-- ==========================================================
-- Hi Los Geht (HLG) Heavy Machinery Platform
-- Batch 1: Schema, Extensions, Tables & Constraints
-- ==========================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- Enum Types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('ADMIN', 'OPERATOR', 'CLIENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE account_status AS ENUM ('PENDING_SETUP', 'ACTIVE', 'SUSPENDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE equipment_status AS ENUM ('AVAILABLE', 'BOOKED', 'MAINTENANCE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE reservation_status AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE contact_pref AS ENUM ('EMAIL', 'WHATSAPP');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone_number TEXT,
    role user_role NOT NULL DEFAULT 'CLIENT',
    account_status account_status NOT NULL DEFAULT 'ACTIVE',
    onboarding_token TEXT,
    password_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Physical Assets (Equipment) Table
CREATE TABLE IF NOT EXISTS public.physical_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    model TEXT NOT NULL,
    daily_rate NUMERIC(12, 2) NOT NULL,
    status equipment_status NOT NULL DEFAULT 'AVAILABLE',
    image_url TEXT,
    current_hour_meter NUMERIC(10, 1) NOT NULL DEFAULT 0.0,
    telemetry_api_id TEXT,
    specs JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Reservations Table with GiST Overlap Exclusion Constraint
CREATE TABLE IF NOT EXISTS public.reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    physical_asset_id UUID NOT NULL REFERENCES public.physical_assets(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    booking_period TSTZRANGE NOT NULL,
    daily_rate NUMERIC(12, 2) NOT NULL,
    total_amount NUMERIC(12, 2),
    status reservation_status NOT NULL DEFAULT 'PENDING',
    preferred_contact contact_pref NOT NULL DEFAULT 'WHATSAPP',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add GiST Exclusion Constraint to prevent double bookings on active reservations
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'no_overlapping_reservations'
    ) THEN
        ALTER TABLE public.reservations 
        ADD CONSTRAINT no_overlapping_reservations
        EXCLUDE USING gist (
            physical_asset_id WITH =,
            booking_period WITH &&
        )
        WHERE (status != 'CANCELLED');
    END IF;
END $$;

-- 4. Staff Logs Table
CREATE TABLE IF NOT EXISTS public.staff_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    equipment_id UUID NOT NULL REFERENCES public.physical_assets(id) ON DELETE CASCADE,
    start_meter NUMERIC(10, 1) NOT NULL,
    end_meter NUMERIC(10, 1) NOT NULL,
    work_description TEXT NOT NULL,
    fuel_amount NUMERIC(10, 2) DEFAULT 0.0,
    fuel_proof_image TEXT,
    materials_received TEXT,
    materials_proof_image TEXT,
    date_submitted TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Maintenance Triggers & Staff Tasks
CREATE TABLE IF NOT EXISTS public.maintenance_triggers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID NOT NULL REFERENCES public.physical_assets(id) ON DELETE CASCADE,
    threshold_hours NUMERIC(10, 1) NOT NULL,
    service_description TEXT NOT NULL,
    last_triggered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.staff_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    equipment_id UUID REFERENCES public.physical_assets(id) ON DELETE CASCADE,
    task_type TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'NORMAL', -- 'LOW', 'NORMAL', 'HIGH', 'CRITICAL'
    status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'IN_PROGRESS', 'COMPLETED'
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

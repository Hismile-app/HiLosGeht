-- ==========================================================
-- Hi Los Geht (HLG) Heavy Machinery Platform
-- Migration 05: System Settings, Tasks Enhancements & Check Constraints
-- ==========================================================

-- 1. System Settings Key-Value Table
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed Default Quarry Operations Configuration
INSERT INTO public.system_settings (key, value, description)
VALUES
(
    'dispatch_hotlines',
    '{"primary_phone": "0717 186396", "backup_phone": "0748866823", "international_primary": "+254717186396", "international_backup": "+254748866823"}'::jsonb,
    'Central quarry operations and emergency dispatch phone numbers in Meru'
),
(
    'notification_channels',
    '{"support_email": "hilosgehtinfo@gmail.com", "dev_email": "kbrian1237@gmail.com", "alert_on_breakdown": true}'::jsonb,
    'Administrative email channels for fleet breakdown alerts and client inquiries'
),
(
    'operational_parameters',
    '{"fuel_price_kes_per_liter": 180.00, "pm_interval_hours": 500.0, "max_continuous_shift_hours": 14.0, "normal_fuel_burn_threshold_lph": 30.0}'::jsonb,
    'Commercial diesel pricing and baseline telematics service trigger parameters'
)
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    updated_at = NOW();

-- 2. Add Meter Integrity Check Constraint to staff_logs
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_end_meter_gte_start_meter'
    ) THEN
        ALTER TABLE public.staff_logs
        ADD CONSTRAINT chk_end_meter_gte_start_meter
        CHECK (end_meter >= start_meter);
    END IF;
END $$;

-- 3. Add Voucher Verification Status to staff_logs
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'staff_logs' 
          AND column_name = 'verification_status'
    ) THEN
        ALTER TABLE public.staff_logs
        ADD COLUMN verification_status TEXT NOT NULL DEFAULT 'PENDING'; -- 'PENDING', 'APPROVED', 'REJECTED'
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'staff_logs' 
          AND column_name = 'audit_notes'
    ) THEN
        ALTER TABLE public.staff_logs
        ADD COLUMN audit_notes TEXT;
    END IF;
END $$;

-- 4. Enable RLS on system_settings
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.system_settings TO authenticated, service_role;
GRANT SELECT ON public.system_settings TO anon;

DROP POLICY IF EXISTS "Public can view system settings" ON public.system_settings;
CREATE POLICY "Public can view system settings" ON public.system_settings
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage system settings" ON public.system_settings;
CREATE POLICY "Admins can manage system settings" ON public.system_settings
FOR ALL USING (
    public.authorize('ADMIN') OR auth.role() = 'service_role'
);

-- 5. Helpful index on staff_logs and reservations for high-speed dashboard analytics
CREATE INDEX IF NOT EXISTS idx_staff_logs_date ON public.staff_logs (date_submitted DESC);
CREATE INDEX IF NOT EXISTS idx_staff_logs_equipment ON public.staff_logs (equipment_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations (status);
CREATE INDEX IF NOT EXISTS idx_physical_assets_status ON public.physical_assets (status);

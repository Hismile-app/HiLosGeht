-- Migration: Add Machine Meter Reading Proof Images to staff_logs
-- Enables mobile operators and staff to attach photographic proof of hour meter gauges

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'staff_logs' 
          AND column_name = 'start_meter_proof_image'
    ) THEN
        ALTER TABLE public.staff_logs
        ADD COLUMN start_meter_proof_image TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'staff_logs' 
          AND column_name = 'end_meter_proof_image'
    ) THEN
        ALTER TABLE public.staff_logs
        ADD COLUMN end_meter_proof_image TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'staff_logs' 
          AND column_name = 'meter_proof_image'
    ) THEN
        ALTER TABLE public.staff_logs
        ADD COLUMN meter_proof_image TEXT;
    END IF;
END $$;

-- Update existing logs with sample meter proof images where appropriate for realistic demo
UPDATE public.staff_logs
SET 
  meter_proof_image = '/images/equipment/excavator.jpg',
  end_meter_proof_image = '/images/equipment/excavator.jpg'
WHERE meter_proof_image IS NULL AND fuel_proof_image IS NOT NULL;

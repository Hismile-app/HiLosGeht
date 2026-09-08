-- ==========================================================
-- Hi Los Geht (HLG) Heavy Machinery Platform
-- Batch 10: Telematics & Preventive Maintenance Triggers
-- ==========================================================

CREATE OR REPLACE FUNCTION public.check_maintenance_limits()
RETURNS TRIGGER AS $$
DECLARE
    trigger_record RECORD;
BEGIN
    -- Check if current_hour_meter has increased
    IF NEW.current_hour_meter > OLD.current_hour_meter THEN
        -- Loop through maintenance triggers defined for this equipment
        FOR trigger_record IN 
            SELECT * FROM public.maintenance_triggers 
            WHERE equipment_id = NEW.id 
              AND NEW.current_hour_meter >= threshold_hours
              AND (last_triggered_at IS NULL OR last_triggered_at < (NOW() - INTERVAL '7 days'))
        LOOP
            -- Auto-generate a high-priority Preventive Maintenance Check task
            INSERT INTO public.staff_tasks (
                equipment_id,
                task_type,
                priority,
                status,
                description
            )
            VALUES (
                NEW.id,
                'PREVENTIVE_MAINTENANCE',
                'HIGH',
                'PENDING',
                'Automated Preventive Maintenance Alert: ' || NEW.name || ' has reached ' || NEW.current_hour_meter || ' engine hours (Limit: ' || trigger_record.threshold_hours || ' hrs). Action: ' || trigger_record.service_description
            );

            -- Update last_triggered_at
            UPDATE public.maintenance_triggers
            SET last_triggered_at = NOW()
            WHERE id = trigger_record.id;
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_evaluate_maintenance_limits ON public.physical_assets;
CREATE TRIGGER trg_evaluate_maintenance_limits
AFTER UPDATE OF current_hour_meter ON public.physical_assets
FOR EACH ROW
EXECUTE FUNCTION public.check_maintenance_limits();

-- ==========================================================
-- Hi Los Geht (HLG) Heavy Machinery Platform
-- Migration 06: Dynamic Service Categories, Regions & Materials
-- ==========================================================

INSERT INTO public.system_settings (key, value, description)
VALUES
(
    'service_categories',
    '["Quarry & Foundation Mass Excavation", "Road Grading & Sub-base Compaction", "Agricultural Water Dam Construction", "General Heavy Fleet Inquiry & Consultation"]'::jsonb,
    'Configurable operational scopes and service inquiry categories'
),
(
    'operational_regions',
    '["Meru Town & Municipal Hub", "Nkubu & Imenti South", "Maua & Nyambene / Igembe", "Timau & Buuri Corridor", "Isiolo County / Northern Corridor", "Tharaka Nithi County / Chuka", "Embu County & Mt. Kenya East", "Other East Africa Region"]'::jsonb,
    'Geographic deployment zones and quarry logistics regions across Mount Kenya & East Africa'
),
(
    'quarry_materials',
    '["Machine-cut Stone Blocks (9x9)", "Machine-cut Stone Blocks (6x9)", "Ballast (3/4 Inch Aggregate)", "Quarry Dust", "Hardcore Foundation Rock", "Murram Sub-base"]'::jsonb,
    'Verified quarry yield materials and site dispatch stock'
)
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    updated_at = NOW();

-- ==========================================================
-- Hi Los Geht (HLG) Heavy Machinery Platform
-- Batch 1 & 2: Seed Data for Machinery Fleet & Users
-- ==========================================================

-- Seed Initial Machinery Fleet
INSERT INTO public.physical_assets (id, name, category, model, daily_rate, status, image_url, current_hour_meter, telemetry_api_id, specs)
VALUES 
(
    '11111111-1111-1111-1111-111111111101',
    'Komatsu PC-200 Heavy Excavator',
    'Excavator',
    'Komatsu PC-200',
    45000.00,
    'AVAILABLE',
    '/images/equipment/komatsu_pc200.png',
    342.5,
    'KOM-PC200-KE-001',
    '{"engine_power": "110 kW / 148 HP", "operating_weight": "20,500 kg", "bucket_capacity": "1.0 m3", "max_dig_depth": "6.62 m", "fuel_capacity": "400 L"}'::jsonb
),
(
    '11111111-1111-1111-1111-111111111102',
    'Komatsu D155AX-8 Crawler Dozer',
    'Dozer',
    'Komatsu D155AX-8',
    65000.00,
    'AVAILABLE',
    '/images/equipment/komatsu_d155ax8.png',
    490.0,
    'KOM-D155-KE-002',
    '{"engine_power": "268 kW / 360 HP", "operating_weight": "41,200 kg", "blade_capacity": "9.4 m3", "transmission": "Automatic with Lockup", "ground_pressure": "84.3 kPa"}'::jsonb
),
(
    '11111111-1111-1111-1111-111111111103',
    'JCB 3DXPLUS Backhoe Loader',
    'Backhoe',
    'JCB 3DXPLUS',
    28000.00,
    'AVAILABLE',
    '/images/equipment/jcb_3dxplus.png',
    128.0,
    'JCB-3DXP-KE-003',
    '{"engine_power": "55 kW / 74 HP", "operating_weight": "7,460 kg", "loader_capacity": "1.1 m3", "backhoe_depth": "4.77 m", "telematics": "JCB LiveLink Ready"}'::jsonb
),
(
    '11111111-1111-1111-1111-111111111104',
    'Shantui SL60W-2 Heavy Wheel Loader',
    'Wheel Loader',
    'Shantui SL60W-2',
    38000.00,
    'AVAILABLE',
    '/images/equipment/shantui_sl60w2.png',
    215.4,
    'SHN-SL60-KE-004',
    '{"rated_load": "6,000 kg", "operating_weight": "21,000 kg", "bucket_capacity": "3.5 m3", "dumping_height": "3,180 mm", "engine_power": "178 kW"}'::jsonb
),
(
    '11111111-1111-1111-1111-111111111105',
    'Shantui SG18-3 Motor Grader',
    'Grader',
    'Shantui SG18-3',
    42000.00,
    'AVAILABLE',
    '/images/equipment/shantui_sg183.png',
    175.0,
    'SHN-SG18-KE-005',
    '{"engine_power": "132 kW / 180 HP", "operating_weight": "16,200 kg", "blade_width": "3,965 mm", "max_speed": "38 km/h", "articulated_frame": "Yes"}'::jsonb
),
(
    '11111111-1111-1111-1111-111111111106',
    'XCMG XS163J Vibratory Compactor Roller',
    'Roller',
    'XCMG XS163J',
    32000.00,
    'AVAILABLE',
    '/images/equipment/xcmg_xs163j.png',
    95.2,
    'XCM-XS16-KE-006',
    '{"operating_weight": "16,000 kg", "drum_width": "2,130 mm", "vibration_frequency": "28/33 Hz", "centrifugal_force": "290/190 kN", "engine_power": "103 kW"}'::jsonb
),
(
    '11111111-1111-1111-1111-111111111107',
    'Isuzu FVZ 34 Heavy Tipper Truck (15 Ton)',
    'Tipper',
    'Isuzu FVZ 34',
    24000.00,
    'AVAILABLE',
    '/images/equipment/isuzu_fvz34.png',
    512.8,
    'ISZ-FVZ34-KE-007',
    '{"payload_capacity": "15,000 kg (15 Ton)", "gross_vehicle_mass": "26,000 kg", "engine_displacement": "7,790 cc", "power_output": "280 HP", "tipping_body": "Heavy Duty Box"}'::jsonb
),
(
    '11111111-1111-1111-1111-111111111108',
    'Heavy Lowbed Semi-Trailer (Machinery Haulage)',
    'Lowbed',
    'HLG Heavy Lowbed 60T',
    50000.00,
    'AVAILABLE',
    '/images/equipment/lowbed_trailer.png',
    420.0,
    'HLG-LOWB-KE-008',
    '{"haulage_capacity": "60,000 kg (60 Ton)", "axles": "3-Axle Heavy Duty", "deck_length": "12.5 m", "ramps": "Hydraulic Folding Ramps", "purpose": "Excavator/Dozer Site Transport"}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    model = EXCLUDED.model,
    daily_rate = EXCLUDED.daily_rate,
    status = EXCLUDED.status,
    image_url = EXCLUDED.image_url,
    current_hour_meter = EXCLUDED.current_hour_meter,
    telemetry_api_id = EXCLUDED.telemetry_api_id,
    specs = EXCLUDED.specs;

-- Seed Initial Maintenance Trigger Limits
INSERT INTO public.maintenance_triggers (equipment_id, threshold_hours, service_description)
VALUES
('11111111-1111-1111-1111-111111111101', 500.0, '500-Hour Hydraulic Oil Filter & Engine Valve Inspection'),
('11111111-1111-1111-1111-111111111102', 500.0, '500-Hour Final Drive Lubrication & Track Tension Check'),
('11111111-1111-1111-1111-111111111103', 250.0, '250-Hour Greasing & Transmission Fluid Level Service'),
('11111111-1111-1111-1111-111111111107', 500.0, '500-Hour Brake Liner, Differential & Turbocharger Inspection')
ON CONFLICT DO NOTHING;

-- Seed Default Admin and Operator Profiles
INSERT INTO public.profiles (id, full_name, email, phone_number, role, account_status)
VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'HLG Admin Dispatcher',
    'hilosgehtinfo@gmail.com',
    '+254717186396',
    'ADMIN',
    'ACTIVE'
),
(
    '00000000-0000-0000-0000-000000000002',
    'Brian K. (Lead Operator - Meru Quarry)',
    'kbrian1237@gmail.com',
    '+254748866823',
    'OPERATOR',
    'ACTIVE'
)
ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone_number = EXCLUDED.phone_number,
    role = EXCLUDED.role,
    account_status = EXCLUDED.account_status;

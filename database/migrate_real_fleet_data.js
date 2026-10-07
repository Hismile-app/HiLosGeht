const path = require('path');
const dotenv = require('dotenv');
const crypto = require('crypto');
const { Pool } = require('pg');
const { list, get, put } = require('@vercel/blob');

dotenv.config({ path: path.resolve(__dirname, '../client/.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5433', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'HiLosGeht123',
  database: process.env.DB_NAME || 'postgres',
});

// Real users
const REAL_PROFILES = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    full_name: 'HLG Admin Dispatcher',
    email: 'hilosgehtinfo@gmail.com',
    phone_number: '+254717186396',
    role: 'ADMIN',
    account_status: 'ACTIVE',
    password_hash: '1a39ea17ac8b37f6fc158e8ecfa679dcb262a9857e042bb0700b8e83235e2775', // Admin 321
    created_at: '2026-09-01T00:00:00Z',
    avatar_url: '/avatars/avatar-4.svg',
  },
  {
    id: '90bb2eaa-fc49-4d08-bc01-bf401124ce74',
    full_name: 'kb 1445 testor operator',
    email: 'kbrian1445@gmail.com',
    phone_number: '0788183496',
    role: 'OPERATOR',
    account_status: 'ACTIVE',
    password_hash: '481a48e9647afdc33c07b964725d23ba6fcd57df0f3ecc921c8d0e49d0fb0bbf', // 0788183496
    created_at: '2026-10-07T12:00:00Z',
    avatar_url: '/avatars/avatar-5.svg',
  },
  {
    id: '22222222-2222-2222-2222-222222222201',
    full_name: 'Joseph Mbogo',
    email: 'joseph.mbogo@hilosgeht.co.ke',
    phone_number: '0728803790',
    role: 'OPERATOR',
    account_status: 'ACTIVE',
    password_hash: crypto.createHash('sha256').update('0728803790').digest('hex'),
    created_at: '2026-09-05T00:00:00Z',
    avatar_url: '/avatars/avatar-1.svg',
  },
  {
    id: '22222222-2222-2222-2222-222222222202',
    full_name: 'Fredrick Mutuma',
    email: 'fredrick.mutuma@hilosgeht.co.ke',
    phone_number: '0717186396',
    role: 'OPERATOR',
    account_status: 'ACTIVE',
    password_hash: crypto.createHash('sha256').update('0717186396').digest('hex'),
    created_at: '2026-08-19T00:00:00Z',
    avatar_url: '/avatars/avatar-2.svg',
  },
  {
    id: '22222222-2222-2222-2222-222222222203',
    full_name: 'Felix Maore',
    email: 'felix.maore@hilosgeht.co.ke',
    phone_number: '0729139178',
    role: 'OPERATOR',
    account_status: 'ACTIVE',
    password_hash: crypto.createHash('sha256').update('0729139178').digest('hex'),
    created_at: '2026-08-19T00:00:00Z',
    avatar_url: '/avatars/avatar-3.svg',
  },
];

// Equipment IDs
const MACH_A_ID = '11111111-1111-1111-1111-111111111103'; // Machine A (Joseph) - JCB 3654401
const MACH_B_ID = '11111111-1111-1111-1111-111111111109'; // Machine B (Freddy) - JCB 3654406
const DOZER_ID  = '11111111-1111-1111-1111-111111111102'; // Komatsu D155AX-8 Crawler Dozer (Felix)

// Real logs from operations
const REAL_LOGS = [
  // Sep 18
  {
    id: 'log-20260918-fred',
    staff_id: '22222222-2222-2222-2222-222222222202',
    staff_name: 'Fredrick Mutuma',
    staff_email: 'fredrick.mutuma@hilosgeht.co.ke',
    equipment_id: MACH_B_ID,
    equipment_name: 'JCB 3DX Backhoe Loader (Machine B)',
    equipment_model: 'JCB 3DX - 3654406',
    equipment_category: 'Backhoe',
    start_meter: 140.0,
    end_meter: 146.0,
    hours_worked: 6.0,
    fuel_amount: 61.7,
    start_fuel_reading: 61.7,
    end_fuel_reading: null,
    work_description: 'Daily backhoe operations - 6 hrs worked, 61.7 litres fuel logged',
    date_submitted: '2026-09-18T18:00:00Z',
    verification_status: 'APPROVED',
  },
  {
    id: 'log-20260918-joseph',
    staff_id: '22222222-2222-2222-2222-222222222201',
    staff_name: 'Joseph Mbogo',
    staff_email: 'joseph.mbogo@hilosgeht.co.ke',
    equipment_id: MACH_A_ID,
    equipment_name: 'JCB 3DX Backhoe Loader (Machine A)',
    equipment_model: 'JCB 3DX - 3654401',
    equipment_category: 'Backhoe',
    start_meter: 198.0,
    end_meter: 202.0,
    hours_worked: 4.0,
    fuel_amount: 0,
    start_fuel_reading: null,
    end_fuel_reading: null,
    work_description: 'Site operations - 4 hrs worked',
    date_submitted: '2026-09-18T17:57:00Z',
    verification_status: 'APPROVED',
  },

  // Sep 19
  {
    id: 'log-20260919-joseph',
    staff_id: '22222222-2222-2222-2222-222222222201',
    staff_name: 'Joseph Mbogo',
    staff_email: 'joseph.mbogo@hilosgeht.co.ke',
    equipment_id: MACH_A_ID,
    equipment_name: 'JCB 3DX Backhoe Loader (Machine A)',
    equipment_model: 'JCB 3DX - 3654401',
    equipment_category: 'Backhoe',
    start_meter: 202.0,
    end_meter: 209.0,
    hours_worked: 7.0,
    fuel_amount: 0,
    start_fuel_reading: null,
    end_fuel_reading: null,
    work_description: 'Site excavation - 7 hrs worked',
    date_submitted: '2026-09-19T18:02:00Z',
    verification_status: 'APPROVED',
  },
  {
    id: 'log-20260919-fred',
    staff_id: '22222222-2222-2222-2222-222222222202',
    staff_name: 'Fredrick Mutuma',
    staff_email: 'fredrick.mutuma@hilosgeht.co.ke',
    equipment_id: MACH_B_ID,
    equipment_name: 'JCB 3DX Backhoe Loader (Machine B)',
    equipment_model: 'JCB 3DX - 3654406',
    equipment_category: 'Backhoe',
    start_meter: 146.0,
    end_meter: 152.0,
    hours_worked: 6.0,
    fuel_amount: 0,
    start_fuel_reading: null,
    end_fuel_reading: null,
    work_description: 'Trenching operations - 6 hrs worked',
    date_submitted: '2026-09-19T17:30:00Z',
    verification_status: 'APPROVED',
  },

  // Sep 20
  {
    id: 'log-20260920-fred',
    staff_id: '22222222-2222-2222-2222-222222222202',
    staff_name: 'Fredrick Mutuma',
    staff_email: 'fredrick.mutuma@hilosgeht.co.ke',
    equipment_id: MACH_B_ID,
    equipment_name: 'JCB 3DX Backhoe Loader (Machine B)',
    equipment_model: 'JCB 3DX - 3654406',
    equipment_category: 'Backhoe',
    start_meter: 152.0,
    end_meter: 154.5,
    hours_worked: 2.5,
    fuel_amount: 0,
    start_fuel_reading: 83.3,
    end_fuel_reading: 85.8,
    work_description: 'Backhoe operations - 2 hrs 30 mins, start fuel 83.3L, end fuel 85.8L',
    date_submitted: '2026-09-20T18:05:00Z',
    verification_status: 'APPROVED',
  },
  {
    id: 'log-20260920-joseph',
    staff_id: '22222222-2222-2222-2222-222222222201',
    staff_name: 'Joseph Mbogo',
    staff_email: 'joseph.mbogo@hilosgeht.co.ke',
    equipment_id: MACH_A_ID,
    equipment_name: 'JCB 3DX Backhoe Loader (Machine A)',
    equipment_model: 'JCB 3DX - 3654401',
    equipment_category: 'Backhoe',
    start_meter: 209.0,
    end_meter: 216.0,
    hours_worked: 7.0,
    fuel_amount: 0,
    start_fuel_reading: 220.2,
    end_fuel_reading: 227.2,
    work_description: 'Foundation digging - 7 hrs worked, start fuel 220.2L, end fuel 227.2L',
    date_submitted: '2026-09-20T18:45:00Z',
    verification_status: 'APPROVED',
  },

  // Sep 22
  {
    id: 'log-20260922-fred',
    staff_id: '22222222-2222-2222-2222-222222222202',
    staff_name: 'Fredrick Mutuma',
    staff_email: 'fredrick.mutuma@hilosgeht.co.ke',
    equipment_id: MACH_B_ID,
    equipment_name: 'JCB 3DX Backhoe Loader (Machine B)',
    equipment_model: 'JCB 3DX - 3654406',
    equipment_category: 'Backhoe',
    start_meter: 154.5,
    end_meter: 160.5,
    hours_worked: 6.0,
    fuel_amount: 0,
    start_fuel_reading: 94.3,
    end_fuel_reading: null,
    work_description: 'Site leveling - 6 hrs worked, start fuel 94.3L',
    date_submitted: '2026-09-22T17:32:00Z',
    verification_status: 'APPROVED',
  },
  {
    id: 'log-20260922-joseph',
    staff_id: '22222222-2222-2222-2222-222222222201',
    staff_name: 'Joseph Mbogo',
    staff_email: 'joseph.mbogo@hilosgeht.co.ke',
    equipment_id: MACH_A_ID,
    equipment_name: 'JCB 3DX Backhoe Loader (Machine A)',
    equipment_model: 'JCB 3DX - 3654401',
    equipment_category: 'Backhoe',
    start_meter: 216.0,
    end_meter: 220.5,
    hours_worked: 4.5,
    fuel_amount: 0,
    start_fuel_reading: 232.7,
    end_fuel_reading: 233.3,
    work_description: 'Backhoe clearing - 4.5 hrs worked, start fuel 232.7L, end fuel 233.3L',
    date_submitted: '2026-09-22T17:18:00Z',
    verification_status: 'APPROVED',
  },

  // Sep 23
  {
    id: 'log-20260923-joseph',
    staff_id: '22222222-2222-2222-2222-222222222201',
    staff_name: 'Joseph Mbogo',
    staff_email: 'joseph.mbogo@hilosgeht.co.ke',
    equipment_id: MACH_A_ID,
    equipment_name: 'JCB 3DX Backhoe Loader (Machine A)',
    equipment_model: 'JCB 3DX - 3654401',
    equipment_category: 'Backhoe',
    start_meter: 220.5,
    end_meter: 228.5,
    hours_worked: 8.0,
    fuel_amount: 0,
    start_fuel_reading: 237.6,
    end_fuel_reading: 245.6,
    work_description: 'Loading and site works - 8 hrs worked, start fuel 237.6L, end fuel 245.6L',
    date_submitted: '2026-09-23T18:51:00Z',
    verification_status: 'APPROVED',
  },
  {
    id: 'log-20260923-fred',
    staff_id: '22222222-2222-2222-2222-222222222202',
    staff_name: 'Fredrick Mutuma',
    staff_email: 'fredrick.mutuma@hilosgeht.co.ke',
    equipment_id: MACH_B_ID,
    equipment_name: 'JCB 3DX Backhoe Loader (Machine B)',
    equipment_model: 'JCB 3DX - 3654406',
    equipment_category: 'Backhoe',
    start_meter: 160.5,
    end_meter: 168.5,
    hours_worked: 8.0,
    fuel_amount: 0,
    start_fuel_reading: null,
    end_fuel_reading: null,
    work_description: 'Full day shift - job billed per day rate',
    date_submitted: '2026-09-23T19:29:00Z',
    verification_status: 'APPROVED',
  },

  // Sep 25
  {
    id: 'log-20260925-joseph',
    staff_id: '22222222-2222-2222-2222-222222222201',
    staff_name: 'Joseph Mbogo',
    staff_email: 'joseph.mbogo@hilosgeht.co.ke',
    equipment_id: MACH_A_ID,
    equipment_name: 'JCB 3DX Backhoe Loader (Machine A)',
    equipment_model: 'JCB 3DX - 3654401',
    equipment_category: 'Backhoe',
    start_meter: 228.5,
    end_meter: 236.5,
    hours_worked: 8.0,
    fuel_amount: 0,
    start_fuel_reading: 245.6,
    end_fuel_reading: null,
    work_description: 'Site ground clearing - 8 hrs, start fuel 245.6L',
    date_submitted: '2026-09-25T18:00:00Z',
    verification_status: 'APPROVED',
  },

  // Sep 26
  {
    id: 'log-20260926-joseph',
    staff_id: '22222222-2222-2222-2222-222222222201',
    staff_name: 'Joseph Mbogo',
    staff_email: 'joseph.mbogo@hilosgeht.co.ke',
    equipment_id: MACH_A_ID,
    equipment_name: 'JCB 3DX Backhoe Loader (Machine A)',
    equipment_model: 'JCB 3DX - 3654401',
    equipment_category: 'Backhoe',
    start_meter: 236.5,
    end_meter: 244.5,
    hours_worked: 8.0,
    fuel_amount: 0,
    start_fuel_reading: 266.0,
    end_fuel_reading: 276.8,
    work_description: 'Daily shift (10 hrs deployed / 8.0 hrs worked) - start reading 266L, end 276.8L',
    date_submitted: '2026-09-26T19:47:00Z',
    verification_status: 'APPROVED',
  },
  {
    id: 'log-20260926-fred',
    staff_id: '22222222-2222-2222-2222-222222222202',
    staff_name: 'Fredrick Mutuma',
    staff_email: 'fredrick.mutuma@hilosgeht.co.ke',
    equipment_id: MACH_B_ID,
    equipment_name: 'JCB 3DX Backhoe Loader (Machine B)',
    equipment_model: 'JCB 3DX - 3654406',
    equipment_category: 'Backhoe',
    start_meter: 168.5,
    end_meter: 170.5,
    hours_worked: 2.0,
    fuel_amount: 0,
    start_fuel_reading: 121.4,
    end_fuel_reading: 123.5,
    work_description: 'Site operations - 2 hrs worked, start fuel 121.4L, end fuel 123.5L',
    date_submitted: '2026-09-26T20:29:00Z',
    verification_status: 'APPROVED',
  },

  // Sep 27 - Dozer campaign
  {
    id: 'log-20260927-dozer',
    staff_id: '22222222-2222-2222-2222-222222222203',
    staff_name: 'Felix Maore',
    staff_email: 'felix.maore@hilosgeht.co.ke',
    equipment_id: DOZER_ID,
    equipment_name: 'Komatsu D155AX-8 Crawler Dozer',
    equipment_model: 'Komatsu D155AX-8',
    equipment_category: 'Dozer',
    start_meter: 457.4,
    end_meter: 462.4,
    hours_worked: 5.0,
    fuel_amount: 0,
    work_description: 'Dozer bulk earthmoving and clearing - 5.0 hrs',
    date_submitted: '2026-09-27T18:00:00Z',
    verification_status: 'APPROVED',
  },

  // Sep 28
  {
    id: 'log-20260928-joseph',
    staff_id: '22222222-2222-2222-2222-222222222201',
    staff_name: 'Joseph Mbogo',
    staff_email: 'joseph.mbogo@hilosgeht.co.ke',
    equipment_id: MACH_A_ID,
    equipment_name: 'JCB 3DX Backhoe Loader (Machine A)',
    equipment_model: 'JCB 3DX - 3654401',
    equipment_category: 'Backhoe',
    start_meter: 244.5,
    end_meter: 253.0,
    hours_worked: 8.5,
    fuel_amount: 0,
    start_fuel_reading: 278.0,
    end_fuel_reading: 286.5,
    work_description: 'Excavation and trenching - 8.5 hrs worked, start fuel 278.0L, end fuel 286.5L',
    date_submitted: '2026-09-28T19:42:00Z',
    verification_status: 'APPROVED',
  },
  {
    id: 'log-20260928-fred',
    staff_id: '22222222-2222-2222-2222-222222222202',
    staff_name: 'Fredrick Mutuma',
    staff_email: 'fredrick.mutuma@hilosgeht.co.ke',
    equipment_id: MACH_B_ID,
    equipment_name: 'JCB 3DX Backhoe Loader (Machine B)',
    equipment_model: 'JCB 3DX - 3654406',
    equipment_category: 'Backhoe',
    start_meter: 170.5,
    end_meter: 177.5,
    hours_worked: 7.0,
    fuel_amount: 0,
    work_description: 'Backhoe operations - 7 hrs worked',
    date_submitted: '2026-09-28T20:26:00Z',
    verification_status: 'APPROVED',
  },
  {
    id: 'log-20260928-dozer',
    staff_id: '22222222-2222-2222-2222-222222222203',
    staff_name: 'Felix Maore',
    staff_email: 'felix.maore@hilosgeht.co.ke',
    equipment_id: DOZER_ID,
    equipment_name: 'Komatsu D155AX-8 Crawler Dozer',
    equipment_model: 'Komatsu D155AX-8',
    equipment_category: 'Dozer',
    start_meter: 462.4,
    end_meter: 471.9,
    hours_worked: 9.5,
    fuel_amount: 0,
    work_description: 'Heavy dozer pushing and leveling - 9.5 hrs',
    date_submitted: '2026-09-28T18:30:00Z',
    verification_status: 'APPROVED',
  },

  // Sep 29 - Dozer
  {
    id: 'log-20260929-dozer',
    staff_id: '22222222-2222-2222-2222-222222222203',
    staff_name: 'Felix Maore',
    staff_email: 'felix.maore@hilosgeht.co.ke',
    equipment_id: DOZER_ID,
    equipment_name: 'Komatsu D155AX-8 Crawler Dozer',
    equipment_model: 'Komatsu D155AX-8',
    equipment_category: 'Dozer',
    start_meter: 471.9,
    end_meter: 477.7,
    hours_worked: 5.8,
    fuel_amount: 0,
    work_description: 'Dozer sub-base leveling - 5.8 hrs',
    date_submitted: '2026-09-29T18:00:00Z',
    verification_status: 'APPROVED',
  },

  // Sep 30
  {
    id: 'log-20260930-joseph',
    staff_id: '22222222-2222-2222-2222-222222222201',
    staff_name: 'Joseph Mbogo',
    staff_email: 'joseph.mbogo@hilosgeht.co.ke',
    equipment_id: MACH_A_ID,
    equipment_name: 'JCB 3DX Backhoe Loader (Machine A)',
    equipment_model: 'JCB 3DX - 3654401',
    equipment_category: 'Backhoe',
    start_meter: 253.0,
    end_meter: 258.0,
    hours_worked: 5.0,
    fuel_amount: 0,
    work_description: 'Site excavation - 5 hrs worked (allowances recorded)',
    date_submitted: '2026-09-30T19:53:00Z',
    verification_status: 'APPROVED',
  },
  {
    id: 'log-20260930-felix',
    staff_id: '22222222-2222-2222-2222-222222222203',
    staff_name: 'Felix Maore',
    staff_email: 'felix.maore@hilosgeht.co.ke',
    equipment_id: DOZER_ID,
    equipment_name: 'Komatsu D155AX-8 Crawler Dozer',
    equipment_model: 'Komatsu D155AX-8',
    equipment_category: 'Dozer',
    start_meter: 477.7,
    end_meter: 485.0,
    hours_worked: 7.3,
    fuel_amount: 0,
    work_description: 'Dozer clearing and earthmoving - 7.3 hrs worked',
    date_submitted: '2026-09-30T19:53:00Z',
    verification_status: 'APPROVED',
  },
  {
    id: 'log-20260930-fred',
    staff_id: '22222222-2222-2222-2222-222222222202',
    staff_name: 'Fredrick Mutuma',
    staff_email: 'fredrick.mutuma@hilosgeht.co.ke',
    equipment_id: MACH_B_ID,
    equipment_name: 'JCB 3DX Backhoe Loader (Machine B)',
    equipment_model: 'JCB 3DX - 3654406',
    equipment_category: 'Backhoe',
    start_meter: 177.5,
    end_meter: 186.0,
    hours_worked: 8.5,
    fuel_amount: 0,
    work_description: 'Backhoe operations - 8.5 hrs worked',
    date_submitted: '2026-09-30T19:53:00Z',
    verification_status: 'APPROVED',
  },

  // Oct 01
  {
    id: 'log-20261001-joseph',
    staff_id: '22222222-2222-2222-2222-222222222201',
    staff_name: 'Joseph Mbogo',
    staff_email: 'joseph.mbogo@hilosgeht.co.ke',
    equipment_id: MACH_A_ID,
    equipment_name: 'JCB 3DX Backhoe Loader (Machine A)',
    equipment_model: 'JCB 3DX - 3654401',
    equipment_category: 'Backhoe',
    start_meter: 258.0,
    end_meter: 260.0,
    hours_worked: 2.0,
    fuel_amount: 0,
    start_fuel_reading: 292.0,
    end_fuel_reading: 286.5,
    work_description: 'Mutuati site ground preparation - 2.0 hrs worked',
    date_submitted: '2026-10-01T11:38:00Z',
    verification_status: 'APPROVED',
  },
  {
    id: 'log-20261001-fred',
    staff_id: '22222222-2222-2222-2222-222222222202',
    staff_name: 'Fredrick Mutuma',
    staff_email: 'fredrick.mutuma@hilosgeht.co.ke',
    equipment_id: MACH_B_ID,
    equipment_name: 'JCB 3DX Backhoe Loader (Machine B)',
    equipment_model: 'JCB 3DX - 3654406',
    equipment_category: 'Backhoe',
    start_meter: 186.0,
    end_meter: 193.0,
    hours_worked: 7.0,
    fuel_amount: 0,
    work_description: "Fred's machine operations - 7 hrs logged",
    date_submitted: '2026-10-01T18:00:00Z',
    verification_status: 'APPROVED',
  },
  {
    id: 'log-20261001-dozer',
    staff_id: '22222222-2222-2222-2222-222222222203',
    staff_name: 'Felix Maore',
    staff_email: 'felix.maore@hilosgeht.co.ke',
    equipment_id: DOZER_ID,
    equipment_name: 'Komatsu D155AX-8 Crawler Dozer',
    equipment_model: 'Komatsu D155AX-8',
    equipment_category: 'Dozer',
    start_meter: 485.0,
    end_meter: 494.0,
    hours_worked: 9.0,
    fuel_amount: 0,
    work_description: 'Dozer site preparation and earthmoving - 9.0 hrs',
    date_submitted: '2026-10-01T18:00:00Z',
    verification_status: 'APPROVED',
  },

  // Oct 02
  {
    id: 'log-20261002-joseph',
    staff_id: '22222222-2222-2222-2222-222222222201',
    staff_name: 'Joseph Mbogo',
    staff_email: 'joseph.mbogo@hilosgeht.co.ke',
    equipment_id: MACH_A_ID,
    equipment_name: 'JCB 3DX Backhoe Loader (Machine A)',
    equipment_model: 'JCB 3DX - 3654401',
    equipment_category: 'Backhoe',
    start_meter: 260.0,
    end_meter: 266.2,
    hours_worked: 6.2,
    fuel_amount: 0,
    start_fuel_reading: 297.4,
    end_fuel_reading: 303.6,
    work_description: 'Ground clearing and loading - 6.2 hrs worked, start fuel 297.4L, end fuel 303.6L',
    date_submitted: '2026-10-02T19:01:00Z',
    verification_status: 'APPROVED',
  },

  // Oct 03
  {
    id: 'log-20261003-fred',
    staff_id: '22222222-2222-2222-2222-222222222202',
    staff_name: 'Fredrick Mutuma',
    staff_email: 'fredrick.mutuma@hilosgeht.co.ke',
    equipment_id: MACH_B_ID,
    equipment_name: 'JCB 3DX Backhoe Loader (Machine B)',
    equipment_model: 'JCB 3DX - 3654406',
    equipment_category: 'Backhoe',
    start_meter: 193.0,
    end_meter: 201.0,
    hours_worked: 8.0,
    fuel_amount: 0,
    work_description: 'Nchiru University site project - 8 hrs worked',
    date_submitted: '2026-10-03T10:11:00Z',
    verification_status: 'APPROVED',
  },

  // Oct 04
  {
    id: 'log-20261004-joseph',
    staff_id: '22222222-2222-2222-2222-222222222201',
    staff_name: 'Joseph Mbogo',
    staff_email: 'joseph.mbogo@hilosgeht.co.ke',
    equipment_id: MACH_A_ID,
    equipment_name: 'JCB 3DX Backhoe Loader (Machine A)',
    equipment_model: 'JCB 3DX - 3654401',
    equipment_category: 'Backhoe',
    start_meter: 266.2,
    end_meter: 278.2,
    hours_worked: 12.0,
    fuel_amount: 0,
    start_fuel_reading: null,
    end_fuel_reading: 304.1,
    work_description: 'Extended excavation shift - 12 hrs logged, end reading 304.1L',
    date_submitted: '2026-10-04T19:01:00Z',
    verification_status: 'APPROVED',
  },

  // Oct 05
  {
    id: 'log-20261005-joseph',
    staff_id: '22222222-2222-2222-2222-222222222201',
    staff_name: 'Joseph Mbogo',
    staff_email: 'joseph.mbogo@hilosgeht.co.ke',
    equipment_id: MACH_A_ID,
    equipment_name: 'JCB 3DX Backhoe Loader (Machine A)',
    equipment_model: 'JCB 3DX - 3654401',
    equipment_category: 'Backhoe',
    start_meter: 278.2,
    end_meter: 286.2,
    hours_worked: 8.0,
    fuel_amount: 0,
    work_description: 'General backhoe operations - 8 hrs worked',
    date_submitted: '2026-10-05T18:00:00Z',
    verification_status: 'APPROVED',
  },

  // Oct 07
  {
    id: 'log-20261007-joseph',
    staff_id: '22222222-2222-2222-2222-222222222201',
    staff_name: 'Joseph Mbogo',
    staff_email: 'joseph.mbogo@hilosgeht.co.ke',
    equipment_id: MACH_A_ID,
    equipment_name: 'JCB 3DX Backhoe Loader (Machine A)',
    equipment_model: 'JCB 3DX - 3654401',
    equipment_category: 'Backhoe',
    start_meter: 286.2,
    end_meter: 291.7,
    hours_worked: 5.5,
    fuel_amount: 53.67,
    start_fuel_reading: 337.3,
    end_fuel_reading: 345.0,
    work_description: 'Half-day operations (5.5 hrs, agreed half-day billing KSh 15,754). Fuel refilled: 53.67 L (KSh 12,002.22). End reading: 345.0 L',
    date_submitted: '2026-10-07T09:22:00Z',
    verification_status: 'APPROVED',
  },
];

async function main() {
  console.log('--- 1. UPDATING POSTGRESQL DATABASE ---');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // A. Clean up old logs, tasks, reservations
    console.log('Clearing old staff_logs, staff_tasks, and mock reservations...');
    await client.query('DELETE FROM public.staff_logs;');
    await client.query('DELETE FROM public.staff_tasks;');
    await client.query('DELETE FROM public.reservations;');

    // B. Clean up users - keep ONLY Admin and 0788183496 user
    console.log('Cleaning up old profiles (keeping Admin and 0788183496 user)...');
    await client.query(`
      DELETE FROM public.profiles
      WHERE email NOT IN ('hilosgehtinfo@gmail.com', 'kbrian1445@gmail.com')
        AND phone_number NOT IN ('+254717186396', '0788183496');
    `);

    // C. Upsert Real Equipment: Ensure Machine A and Machine B exist
    console.log('Ensuring Machine A and Machine B exist in physical_assets...');
    await client.query(`
      UPDATE public.physical_assets
      SET 
        name = 'JCB 3DX Backhoe Loader (Machine A)',
        model = 'JCB 3DX - 3654401',
        telemetry_api_id = 'JCB-3654401',
        current_hour_meter = 291.7,
        updated_at = NOW()
      WHERE id = $1;
    `, [MACH_A_ID]);

    // Insert Machine B if not present
    await client.query(`
      INSERT INTO public.physical_assets (
        id, name, category, model, daily_rate, status, image_url, current_hour_meter, telemetry_api_id, specs, created_at, updated_at
      ) VALUES (
        $1, 'JCB 3DX Backhoe Loader (Machine B)', 'Backhoe', 'JCB 3DX - 3654406', 25000.0, 'AVAILABLE',
        '/images/equipment/backhoe.jpg', 201.0, 'JCB-3654406',
        '{"engine_power":"55 kW / 74 HP","operating_weight":"7,460 kg","loader_capacity":"1.1 m³"}',
        NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        model = EXCLUDED.model,
        telemetry_api_id = EXCLUDED.telemetry_api_id,
        current_hour_meter = EXCLUDED.current_hour_meter,
        updated_at = NOW();
    `, [MACH_B_ID]);

    // D. Upsert real operator profiles
    console.log('Upserting real operator profiles (Joseph, Fredrick, Felix)...');
    for (const p of REAL_PROFILES) {
      await client.query(`
        INSERT INTO public.profiles (
          id, full_name, email, phone_number, role, account_status, password_hash, avatar_url, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          full_name = EXCLUDED.full_name,
          email = EXCLUDED.email,
          phone_number = EXCLUDED.phone_number,
          role = EXCLUDED.role,
          account_status = EXCLUDED.account_status,
          password_hash = EXCLUDED.password_hash,
          updated_at = NOW();
      `, [
        p.id,
        p.full_name,
        p.email,
        p.phone_number,
        p.role,
        p.account_status,
        p.password_hash,
        p.avatar_url || null,
        p.created_at,
      ]);
    }

    // E. Insert all real operator logs
    console.log(`Inserting ${REAL_LOGS.length} real operator logs into public.staff_logs...`);
    for (const l of REAL_LOGS) {
      await client.query(`
        INSERT INTO public.staff_logs (
          id, staff_id, equipment_id, start_meter, end_meter, fuel_amount,
          start_fuel_reading, end_fuel_reading, work_description, verification_status,
          date_submitted, created_at
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $10
        );
      `, [
        l.staff_id,
        l.equipment_id,
        l.start_meter,
        l.end_meter,
        l.fuel_amount || 0,
        l.start_fuel_reading || null,
        l.end_fuel_reading || null,
        l.work_description,
        l.verification_status,
        l.date_submitted,
      ]);
    }

    await client.query('COMMIT');
    console.log('✅ PostgreSQL database successfully updated!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ PostgreSQL update failed:', err);
    throw err;
  } finally {
    client.release();
  }

  // --- 2. UPDATE VERCEL BLOB STORAGE ---
  console.log('\n--- 2. UPDATING VERCEL BLOB PERSISTENT STORES ---');
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    console.warn('⚠️ No BLOB_READ_WRITE_TOKEN found, skipping Blob update');
    return;
  }

  // A. Save staff registry
  console.log('Saving cleaned staff registry to Vercel Blob (system/staff_registry.json)...');
  await put('system/staff_registry.json', JSON.stringify(REAL_PROFILES, null, 2), {
    access: 'private',
    token,
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  console.log('✅ system/staff_registry.json updated in Vercel Blob!');

  // B. Save staff logs
  console.log(`Saving ${REAL_LOGS.length} real logs to Vercel Blob (system/staff_logs.json)...`);
  await put('system/staff_logs.json', JSON.stringify(REAL_LOGS, null, 2), {
    access: 'private',
    token,
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  console.log('✅ system/staff_logs.json updated in Vercel Blob!');

  // C. Reset demo inquiries if present
  console.log('Clearing demo inquiries in Vercel Blob (system/inquiries.json)...');
  await put('system/inquiries.json', JSON.stringify([], null, 2), {
    access: 'private',
    token,
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  console.log('✅ system/inquiries.json reset in Vercel Blob!');

  console.log('\n🎉 ALL DATABASE AND BLOB UPDATES COMPLETED SUCCESSFULLY!');
}

main().then(() => pool.end()).catch(e => {
  console.error(e);
  pool.end();
});
